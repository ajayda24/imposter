'use server'
// v2 — clean exports: createRoom, joinRoom, startGame, advanceToPlaying, advanceToVoting,
// castVote, revealResults, nextWord, restartGame, toggleHint, leaveRoom

import { createClient } from '@/lib/supabase/server'
import { generateRoomCode, getRandomWord } from '@/lib/constants'

export async function createRoom(
  playerName: string,
  category: string,
  imposterCount: number
) {
  const supabase = await createClient()
  const code = generateRoomCode()
  const word = getRandomWord(category)

  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .insert({ code, category, word, imposter_count: imposterCount })
    .select()
    .single()

  if (roomError || !room) throw new Error(roomError?.message ?? 'Failed to create room')

  const { data: player, error: playerError } = await supabase
    .from('players')
    .insert({ room_id: room.id, name: playerName })
    .select()
    .single()

  if (playerError || !player) throw new Error(playerError?.message ?? 'Failed to create player')

  const { data: updatedRoom } = await supabase
    .from('rooms')
    .update({ admin_player_id: player.id })
    .eq('id', room.id)
    .select()
    .single()

  return { room: updatedRoom ?? { ...room, admin_player_id: player.id }, player }
}

export async function joinRoom(code: string, playerName: string) {
  const supabase = await createClient()

  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select()
    .eq('code', code.toUpperCase())
    .single()

  if (roomError || !room) throw new Error('Room not found')
  if (room.status !== 'lobby') throw new Error('Game already in progress')

  const { data: player, error: playerError } = await supabase
    .from('players')
    .insert({ room_id: room.id, name: playerName })
    .select()
    .single()

  if (playerError || !player) throw new Error(playerError?.message ?? 'Failed to join room')

  return { room, player }
}

export async function startGame(roomId: string) {
  const supabase = await createClient()

  const { data: room } = await supabase.from('rooms').select().eq('id', roomId).single()
  if (!room) throw new Error('Room not found')

  const { data: players } = await supabase
    .from('players')
    .select()
    .eq('room_id', roomId)
    .eq('is_active', true)

  if (!players || players.length < 3) throw new Error('Need at least 3 players')

  // Reset all imposter flags first
  await supabase.from('players').update({ is_imposter: false }).eq('room_id', roomId)

  // Shuffle and assign imposters
  const shuffled = [...players].sort(() => Math.random() - 0.5)
  const count = Math.max(1, Math.min(room.imposter_count, Math.floor(players.length / 2)))
  for (const p of shuffled.slice(0, count)) {
    await supabase.from('players').update({ is_imposter: true }).eq('id', p.id)
  }

  const word = getRandomWord(room.category)
  await supabase
    .from('rooms')
    .update({ status: 'role_reveal', word, current_round: 1 })
    .eq('id', roomId)
}

export async function advanceToPlaying(roomId: string) {
  const supabase = await createClient()
  await supabase.from('rooms').update({ status: 'playing' }).eq('id', roomId)
}

export async function advanceToVoting(roomId: string) {
  const supabase = await createClient()
  // Clear any previous votes for this round
  const { data: room } = await supabase.from('rooms').select('current_round').eq('id', roomId).single()
  if (room) {
    await supabase.from('votes').delete().eq('room_id', roomId).eq('round', room.current_round)
  }
  await supabase.from('rooms').update({ status: 'voting' }).eq('id', roomId)
}

export async function castVote(roomId: string, voterId: string, targetId: string | null, round: number) {
  const supabase = await createClient()
  const isNota = targetId === null
  const { error } = await supabase
    .from('votes')
    .upsert(
      { room_id: roomId, voter_id: voterId, target_id: isNota ? null : targetId, is_nota: isNota, round },
      { onConflict: 'room_id,voter_id,round' }
    )
  if (error) throw new Error(error.message)
}

/**
 * Scoring rules:
 *   correct vote (voted an imposter)      → +1 pt
 *   wrong vote   (voted a non-imposter)   → -1/3 pt
 *   NOTA         (target_id = 'NOTA')     →  0 pt
 *   no one voted any imposter             → each imposter +2 pts
 */
export async function revealResults(roomId: string) {
  const supabase = await createClient()

  const { data: room } = await supabase.from('rooms').select().eq('id', roomId).single()
  if (!room) throw new Error('Room not found')

  const { data: votes } = await supabase
    .from('votes')
    .select()
    .eq('room_id', roomId)
    .eq('round', room.current_round)

  const { data: players } = await supabase
    .from('players')
    .select()
    .eq('room_id', roomId)
    .eq('is_active', true)

  if (!players || !votes) return

  const imposterIds = new Set(players.filter((p) => p.is_imposter).map((p) => p.id))

  // Check if anyone correctly voted for an imposter (excludes NOTA)
  const anyCorrectVote = votes.some((v) => !v.is_nota && v.target_id && imposterIds.has(v.target_id))

  const scoreMap = new Map<string, number>(players.map((p) => [p.id, p.score]))

  for (const vote of votes) {
    if (vote.is_nota || !vote.target_id) continue // NOTA → no change
    const voterId = vote.voter_id
    if (!scoreMap.has(voterId)) continue
    if (imposterIds.has(vote.target_id)) {
      scoreMap.set(voterId, (scoreMap.get(voterId) ?? 0) + 1)
    } else {
      const current = scoreMap.get(voterId) ?? 0
      scoreMap.set(voterId, Math.max(0, Math.round((current - 1 / 3) * 100) / 100))
    }
  }

  // If nobody voted an imposter, each imposter gets +2
  if (!anyCorrectVote) {
    for (const id of imposterIds) {
      scoreMap.set(id, (scoreMap.get(id) ?? 0) + 2)
    }
  }

  // Persist updated scores
  for (const [id, score] of scoreMap.entries()) {
    const original = players.find((p) => p.id === id)?.score ?? 0
    if (score !== original) {
      await supabase.from('players').update({ score }).eq('id', id)
    }
  }

  await supabase.from('rooms').update({ status: 'results' }).eq('id', roomId)
}

/**
 * Continue with the same room: new word, new roles, preserve scores.
 */
export async function nextWord(roomId: string) {
  const supabase = await createClient()

  const { data: room } = await supabase.from('rooms').select().eq('id', roomId).single()
  if (!room) throw new Error('Room not found')

  const { data: players } = await supabase
    .from('players')
    .select()
    .eq('room_id', roomId)
    .eq('is_active', true)

  if (!players || players.length < 3) throw new Error('Need at least 3 players')

  // Reset imposter flags and reassign
  await supabase.from('players').update({ is_imposter: false }).eq('room_id', roomId)
  const shuffled = [...players].sort(() => Math.random() - 0.5)
  const count = Math.max(1, Math.min(room.imposter_count, Math.floor(players.length / 2)))
  for (const p of shuffled.slice(0, count)) {
    await supabase.from('players').update({ is_imposter: true }).eq('id', p.id)
  }

  const word = getRandomWord(room.category)
  const nextRound = (room.current_round ?? 1) + 1
  await supabase
    .from('rooms')
    .update({ status: 'role_reveal', word, current_round: nextRound })
    .eq('id', roomId)
}

/**
 * Full restart: reset scores and go back to lobby.
 */
export async function restartGame(roomId: string) {
  const supabase = await createClient()
  await supabase
    .from('players')
    .update({ score: 0, is_active: true, is_imposter: false })
    .eq('room_id', roomId)
  await supabase.from('rooms').update({ status: 'lobby', current_round: 1 }).eq('id', roomId)
}

export async function toggleHint(roomId: string, show: boolean) {
  const supabase = await createClient()
  await supabase.from('rooms').update({ show_hint: show }).eq('id', roomId)
}

export async function leaveRoom(playerId: string, roomId: string) {
  const supabase = await createClient()

  await supabase.from('players').update({ is_active: false }).eq('id', playerId)

  const { data: room } = await supabase.from('rooms').select().eq('id', roomId).single()
  if (!room) return

  if (room.status === 'lobby') {
    const { data: remaining } = await supabase
      .from('players')
      .select()
      .eq('room_id', roomId)
      .eq('is_active', true)

    if (room.admin_player_id === playerId && remaining && remaining.length > 0) {
      await supabase
        .from('rooms')
        .update({ admin_player_id: remaining[0].id })
        .eq('id', roomId)
    }
  }
}

