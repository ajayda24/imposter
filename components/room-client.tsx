'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { leaveRoom } from '@/lib/actions'
import { playSound } from '@/lib/sounds'
import type { Room, Player, Vote } from '@/lib/types'
import { LobbyView } from '@/components/lobby-view'
import { RoleRevealView } from '@/components/role-reveal-view'
import { PlayingView } from '@/components/playing-view'
import { VotingView } from '@/components/voting-view'
import { ResultsView } from '@/components/results-view'
import { User, LogOut } from 'lucide-react'

interface Props {
  initialRoom: Room
  initialPlayers: Player[]
  initialVotes: Vote[]
}

export function RoomClient({ initialRoom, initialPlayers, initialVotes }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [room, setRoom] = useState<Room>(initialRoom)
  const [players, setPlayers] = useState<Player[]>(initialPlayers)
  const [votes, setVotes] = useState<Vote[]>(initialVotes)
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [leaving, setLeaving] = useState(false)

  // Resolve session after hydration — URL param takes priority over localStorage.
  // hydrated gates all identity-dependent rendering so SSR and client HTML match.
  useEffect(() => {
    const urlPid = searchParams.get('pid')
    if (urlPid) {
      localStorage.setItem('playerId', urlPid)
      setMyPlayerId(urlPid)
    } else {
      setMyPlayerId(localStorage.getItem('playerId'))
    }
    setHydrated(true)
  }, [searchParams])

  const prevStatusRef = useRef(initialRoom.status)
  const roomIdRef = useRef(initialRoom.id)

  const fetchAll = useCallback(async () => {
    const supabase = createClient()
    const [{ data: r }, { data: p }, { data: v }] = await Promise.all([
      supabase.from('rooms').select().eq('id', roomIdRef.current).single(),
      supabase.from('players').select().eq('room_id', roomIdRef.current).order('created_at', { ascending: true }),
      supabase.from('votes').select().eq('room_id', roomIdRef.current),
    ])
    if (r) {
      if (r.status !== prevStatusRef.current) {
        const sounds: Record<string, string> = {
          role_reveal: 'start',
          voting: 'tick',
          results: 'win',
          lobby: 'click',
        }
        if (sounds[r.status]) playSound(sounds[r.status])
        prevStatusRef.current = r.status
      }
      setRoom(r)
    }
    if (p) setPlayers(p)
    if (v) setVotes(v)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    const rid = roomIdRef.current

    // Subscribe to all changes on the three tables filtered by room
    const channel = supabase
      .channel(`game-${rid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${rid}` }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${rid}` }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes', filter: `room_id=eq.${rid}` }, fetchAll)
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') fetchAll()
      })

    // Re-sync when tab regains focus (catches missed events while backgrounded)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchAll()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    // Poll every 5 seconds as a safety net in case realtime misses events
    const poll = setInterval(fetchAll, 5000)

    return () => {
      clearInterval(poll)
      document.removeEventListener('visibilitychange', handleVisibility)
      supabase.removeChannel(channel)
    }
  }, [fetchAll])

  async function handleLeave() {
    if (!myPlayerId) return
    setLeaving(true)
    try {
      await leaveRoom(myPlayerId, initialRoom.id)
      localStorage.removeItem('playerId')
      localStorage.removeItem('playerName')
      router.push('/')
    } catch {
      setLeaving(false)
    }
  }

  // Until hydrated, pass null/false so SSR and first client render match exactly
  const myPlayer = hydrated ? (players.find((p) => p.id === myPlayerId) ?? null) : null
  const isAdmin = hydrated ? (!!myPlayerId && room.admin_player_id === myPlayerId) : false

  // Only show active players (inactive = left/eliminated but still in DB)
  const activePlayers = players.filter((p) => p.is_active)
  const commonProps = { room, players: activePlayers, votes, myPlayer, isAdmin }

  return (
    <main className="min-h-dvh grid-bg flex flex-col items-center px-4 py-6 relative overflow-hidden">
      <div
        className="pointer-events-none fixed top-[-150px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)' }}
      />

      {/* Username + leave badge */}
      <div className="fixed top-3 right-3 z-50 flex items-center gap-2">
        {myPlayer && (
          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
            }}
          >
            <User className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{myPlayer.name}</span>
            {isAdmin && (
              <span
                className="ml-0.5 text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide"
                style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
              >
                host
              </span>
            )}
          </div>
        )}
        {room.status === 'lobby' && myPlayer && (
          <button
            onClick={handleLeave}
            disabled={leaving}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-95 hover:bg-destructive/20"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,0.4)' }}
            aria-label="Leave room"
          >
            <LogOut className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      <div className="w-full max-w-md flex flex-col gap-4 relative z-10">
        {/* Gate ALL view rendering until hydrated — prevents SSR/client identity mismatch */}
        {!hydrated ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <>
            {room.status === 'lobby'       && <LobbyView      {...commonProps} />}
            {room.status === 'role_reveal' && <RoleRevealView {...commonProps} />}
            {room.status === 'playing'     && <PlayingView    {...commonProps} />}
            {room.status === 'voting'      && <VotingView     {...commonProps} />}
            {room.status === 'results'     && <ResultsView    {...commonProps} />}
          </>
        )}
      </div>
    </main>
  )
}
