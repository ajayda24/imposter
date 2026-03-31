'use client'

import { useState } from 'react'
import { castVote, revealResults } from '@/lib/actions'
import { playSound } from '@/lib/sounds'
import type { GameViewProps } from '@/components/game-view-props'
import { CheckCircle2, AlertCircle, Vote, Minus } from 'lucide-react'

export function VotingView({ room, players, votes, myPlayer, isAdmin }: GameViewProps) {
  // null = nothing chosen, 'NOTA_SELECTED' = user picked NOTA, uuid string = player picked
  const [selectedId, setSelectedId] = useState<string | 'NOTA_SELECTED' | null>(null)
  const [loading, setLoading] = useState(false)
  const [revealing, setRevealing] = useState(false)

  const activePlayers = players.filter((p) => p.is_active)
  const myVote = votes.find((v) => v.voter_id === myPlayer?.id && v.round === room.current_round)
  const hasVoted = !!myVote
  const roundVotes = votes.filter((v) => v.round === room.current_round)
  const voteCount = roundVotes.length
  const allVoted = voteCount >= activePlayers.length
  const progress = activePlayers.length > 0 ? (voteCount / activePlayers.length) * 100 : 0

  // Tally only real player votes (exclude NOTA)
  const tallyMap: Record<string, number> = {}
  if (allVoted) {
    for (const v of roundVotes) {
      if (!v.is_nota && v.target_id) {
        tallyMap[v.target_id] = (tallyMap[v.target_id] ?? 0) + 1
      }
    }
  }
  const maxTally =
    allVoted && Object.keys(tallyMap).length > 0 ? Math.max(...Object.values(tallyMap)) : 0

  const amIImposter = myPlayer?.is_imposter === true
  const imposterIds = new Set(activePlayers.filter((p) => p.is_imposter).map((p) => p.id))
  const notaCount = roundVotes.filter((v) => v.is_nota).length

  async function handleVote() {
    if (selectedId === null || !myPlayer) return
    setLoading(true)
    try {
      // NOTA_SELECTED → null target_id; otherwise pass the player uuid
      const targetId = selectedId === 'NOTA_SELECTED' ? null : selectedId
      await castVote(room.id, myPlayer.id, targetId, room.current_round)
      playSound('vote')
    } finally {
      setLoading(false)
    }
  }

  async function handleReveal() {
    setRevealing(true)
    playSound('start')
    await revealResults(room.id)
    setRevealing(false)
  }

  const select = (id: string | 'NOTA_SELECTED') => {
    if (hasVoted) return
    setSelectedId((prev) => (prev === id ? null : id))
    playSound('tick')
  }

  const otherPlayers = activePlayers.filter((p) => p.id !== myPlayer?.id)

  return (
    <div className="flex flex-col gap-4 fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between pt-8">
        <h2 className="text-3xl font-black tracking-tight" style={{ color: 'var(--primary)' }}>
          VOTE
        </h2>
        <div
          className="glass rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider"
          style={{ color: allVoted ? 'var(--accent)' : 'var(--muted-foreground)' }}
        >
          {voteCount} / {activePlayers.length} voted
        </div>
      </div>

      {/* Scoring hint */}
      <div className="glass rounded-xl px-4 py-2.5 flex flex-col gap-0.5">
        {amIImposter ? (
          <p className="text-xs font-semibold" style={{ color: 'oklch(0.8 0.18 25)' }}>
            You are the imposter &mdash; mislead the group!
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Correct{' '}
            <span className="font-bold" style={{ color: 'var(--accent)' }}>+1</span>
            {'  \u00b7  '}
            Wrong{' '}
            <span className="font-bold" style={{ color: 'var(--destructive)' }}>&#8722;&#8531;</span>
            {'  \u00b7  '}
            NOTA <span className="font-bold text-muted-foreground">0</span>
          </p>
        )}
        <p className="text-[11px] text-muted-foreground opacity-70">
          {imposterIds.size > 1 ? 'Imposters get' : 'Imposter gets'} +2 if nobody votes them
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
        <div
          className="h-1.5 rounded-full transition-all duration-700"
          style={{
            width: `${progress}%`,
            background: allVoted ? 'var(--accent)' : 'var(--primary)',
          }}
        />
      </div>

      <p className="text-sm text-muted-foreground -mt-2">
        {hasVoted
          ? allVoted
            ? 'All votes are in!'
            : 'Vote cast — waiting for others...'
          : 'Who do you think is the imposter?'}
      </p>

      {/* Candidate list */}
      <div className="glass rounded-2xl p-3 flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground px-1 mb-1">
          Select a player
        </p>

        {otherPlayers.map((p) => {
          const tally = tallyMap[p.id] ?? 0
          const isLeader = allVoted && tally === maxTally && tally > 0
          const isSelected = selectedId === p.id
          const votedFor = !myVote?.is_nota && myVote?.target_id === p.id
          const isKnownImposter = amIImposter && imposterIds.has(p.id)

          return (
            <button
              key={p.id}
              disabled={hasVoted}
              onClick={() => select(p.id)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 border transition-all active:scale-[0.98]"
              style={{
                background: (hasVoted ? votedFor : isSelected)
                  ? 'color-mix(in srgb, var(--primary) 12%, var(--secondary))'
                  : 'var(--secondary)',
                borderColor: (hasVoted ? votedFor : isSelected) ? 'var(--primary)' : 'transparent',
                boxShadow:
                  isSelected && !hasVoted
                    ? '0 0 16px color-mix(in srgb, var(--primary) 25%, transparent)'
                    : undefined,
              }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm"
                style={{
                  background: isKnownImposter
                    ? 'color-mix(in srgb, var(--destructive) 30%, transparent)'
                    : isLeader
                    ? 'color-mix(in srgb, var(--destructive) 20%, transparent)'
                    : 'var(--muted)',
                  color: isKnownImposter || isLeader ? 'oklch(0.85 0.18 25)' : 'var(--foreground)',
                }}
              >
                {p.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-sm flex-1 text-left truncate">{p.name}</span>
              {isKnownImposter && !hasVoted && (
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide flex-shrink-0"
                  style={{
                    background: 'color-mix(in srgb, var(--destructive) 20%, transparent)',
                    color: 'oklch(0.85 0.18 25)',
                  }}
                >
                  imposter
                </span>
              )}
              <div className="flex items-center gap-2 flex-shrink-0">
                {allVoted && (
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: isLeader
                        ? 'color-mix(in srgb, var(--destructive) 20%, transparent)'
                        : 'var(--muted)',
                      color: isLeader ? 'var(--destructive)' : 'var(--muted-foreground)',
                    }}
                  >
                    {tally}
                  </span>
                )}
                {allVoted && isLeader && (
                  <AlertCircle className="w-4 h-4" style={{ color: 'var(--destructive)' }} />
                )}
                {!allVoted && hasVoted && votedFor && (
                  <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                )}
                {!hasVoted && isSelected && (
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--primary)' }} />
                )}
              </div>
            </button>
          )
        })}

        {/* NOTA option — shown before voting */}
        {!hasVoted && (
          <button
            onClick={() => select('NOTA_SELECTED')}
            className="flex items-center gap-3 rounded-xl px-4 py-3 border transition-all active:scale-[0.98] mt-1"
            style={{
              background:
                selectedId === 'NOTA_SELECTED'
                  ? 'color-mix(in srgb, var(--muted-foreground) 10%, var(--secondary))'
                  : 'var(--secondary)',
              borderColor: selectedId === 'NOTA_SELECTED' ? 'var(--muted-foreground)' : 'var(--border)',
              borderStyle: 'dashed',
            }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--muted)' }}
            >
              <Minus className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-muted-foreground">Not Ready to Vote</p>
              <p className="text-[11px] text-muted-foreground opacity-60">No point change</p>
            </div>
            {selectedId === 'NOTA_SELECTED' && (
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--muted-foreground)' }} />
            )}
          </button>
        )}

        {/* NOTA summary after all have voted */}
        {allVoted && notaCount > 0 && (
          <div
            className="flex items-center gap-3 rounded-xl px-4 py-2.5 mt-1"
            style={{ background: 'var(--secondary)', border: '1px dashed var(--border)' }}
          >
            <Minus className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground flex-1">Not Ready to Vote</span>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
            >
              {notaCount}
            </span>
          </div>
        )}
      </div>

      {/* Cast vote button */}
      {!hasVoted && myPlayer && (
        <button
          className="w-full rounded-2xl py-4 font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40"
          style={{
            background: selectedId !== null ? 'var(--primary)' : 'var(--secondary)',
            color: selectedId !== null ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
            boxShadow:
              selectedId !== null
                ? '0 0 20px color-mix(in srgb, var(--primary) 35%, transparent)'
                : undefined,
          }}
          onClick={handleVote}
          disabled={selectedId === null || loading}
        >
          <Vote className="w-5 h-5" />
          {loading
            ? 'Voting...'
            : selectedId === 'NOTA_SELECTED'
            ? 'Submit — Not Ready to Vote'
            : selectedId !== null
            ? `Vote for ${activePlayers.find((p) => p.id === selectedId)?.name}`
            : 'Select a player or NOTA'}
        </button>
      )}

      {/* Waiting confirmation */}
      {hasVoted && !allVoted && (
        <div className="glass rounded-2xl px-4 py-3.5 text-center">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            <p className="text-sm text-muted-foreground">
              {myVote?.is_nota
                ? 'You chose not to vote — waiting for others...'
                : 'Voted — waiting for others...'}
            </p>
          </div>
        </div>
      )}

      {/* Admin reveal — only when all have voted */}
      {allVoted && isAdmin && (
        <button
          className="w-full rounded-2xl py-4 font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-95"
          style={{
            background: 'var(--accent)',
            color: 'var(--accent-foreground)',
            boxShadow: '0 0 20px color-mix(in srgb, var(--accent) 35%, transparent)',
          }}
          onClick={handleReveal}
          disabled={revealing}
        >
          {revealing ? 'Revealing...' : 'Reveal Results'}
        </button>
      )}

      {allVoted && !isAdmin && (
        <div className="glass rounded-2xl px-4 py-3.5 text-center">
          <div className="flex items-center justify-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: 'var(--accent)' }}
            />
            <p className="text-sm text-muted-foreground">
              All votes in — host will reveal results...
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
