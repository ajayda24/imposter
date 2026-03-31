'use client'

import { useState, useEffect } from 'react'
import { nextWord, restartGame } from '@/lib/actions'
import { playSound } from '@/lib/sounds'
import type { GameViewProps } from '@/components/game-view-props'
import { Trophy, Swords, RotateCcw, Crown, CheckCircle2, XCircle, ArrowRight, Minus } from 'lucide-react'


export function ResultsView({ room, players, votes, isAdmin, myPlayer }: GameViewProps) {
  const [loadingNext, setLoadingNext] = useState(false)
  const [loadingRestart, setLoadingRestart] = useState(false)

  const activePlayers = players.filter((p) => p.is_active)
  const sorted = [...activePlayers].sort((a, b) => b.score - a.score)
  const imposters = activePlayers.filter((p) => p.is_imposter)
  const imposterIds = new Set(imposters.map((p) => p.id))
  const roundVotes = votes.filter((v) => v.round === room.current_round)

  const correctVoterIds = new Set(
    roundVotes.filter((v) => !v.is_nota && v.target_id && imposterIds.has(v.target_id)).map((v) => v.voter_id)
  )
  const wrongVoterIds = new Set(
    roundVotes.filter((v) => !v.is_nota && v.target_id && !imposterIds.has(v.target_id)).map((v) => v.voter_id)
  )
  const notaVoterIds = new Set(
    roundVotes.filter((v) => v.is_nota).map((v) => v.voter_id)
  )
  const nobodyGuessedImposter = correctVoterIds.size === 0

  useEffect(() => {
    const t = setTimeout(() => playSound('win'), 300)
    return () => clearTimeout(t)
  }, [])

  async function handleNextWord() {
    setLoadingNext(true)
    playSound('start')
    await nextWord(room.id)
    setLoadingNext(false)
  }

  async function handleRestart() {
    setLoadingRestart(true)
    playSound('click')
    await restartGame(room.id)
    setLoadingRestart(false)
  }

  return (
    <div className="flex flex-col gap-4 fade-in-up">
      {/* Header */}
      <div className="text-center pt-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Trophy className="w-7 h-7" style={{ color: 'var(--primary)' }} />
        </div>
        <p className="text-xs text-muted-foreground uppercase tracking-[0.2em]">Round Complete</p>
        <h1 className="text-4xl font-black" style={{ color: 'var(--primary)' }}>RESULTS</h1>
      </div>

      {/* Imposter reveal */}
      <div
        className="rounded-2xl p-5 text-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, oklch(0.22 0.12 25) 0%, oklch(0.16 0.06 25) 100%)',
          border: '1px solid var(--destructive)',
          boxShadow: '0 0 40px color-mix(in srgb, var(--destructive) 20%, transparent)',
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{ background: 'radial-gradient(ellipse at center, var(--destructive) 0%, transparent 70%)' }}
        />
        <div className="flex items-center justify-center gap-2 mb-2">
          <Swords className="w-4 h-4" style={{ color: 'var(--destructive)' }} />
          <p className="text-xs uppercase tracking-[0.2em] font-semibold" style={{ color: 'var(--destructive)' }}>
            The Imposter{imposters.length > 1 ? 's were' : ' was'}
          </p>
        </div>

        {nobodyGuessedImposter && (
          <div
            className="inline-block rounded-lg px-3 py-1.5 mb-2"
            style={{
              background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
              border: '1px solid var(--accent)',
            }}
          >
            <p className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
              Nobody voted the imposter — {imposters.length > 1 ? 'imposters get' : 'imposter gets'} +2 pts!
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 justify-center mb-3">
          {imposters.map((p) => (
            <span key={p.id} className="font-black text-2xl" style={{ color: 'oklch(0.85 0.18 25)' }}>
              {p.name}
            </span>
          ))}
        </div>

        <div
          className="inline-block rounded-xl px-4 py-2 mb-3"
          style={{
            background: 'color-mix(in srgb, var(--primary) 15%, transparent)',
            border: '1px solid var(--primary)',
          }}
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">The word was</p>
          <p className="font-black text-xl" style={{ color: 'var(--primary)' }}>{room.word}</p>
        </div>

        {myPlayer && (
          <div
            className="inline-block rounded-lg px-3 py-1.5"
            style={{
              background: myPlayer.is_imposter
                ? nobodyGuessedImposter
                  ? 'color-mix(in srgb, var(--accent) 20%, transparent)'
                  : 'color-mix(in srgb, var(--destructive) 20%, transparent)'
                : correctVoterIds.has(myPlayer.id)
                  ? 'color-mix(in srgb, var(--accent) 20%, transparent)'
                  : notaVoterIds.has(myPlayer.id)
                    ? 'color-mix(in srgb, var(--muted) 20%, transparent)'
                    : 'color-mix(in srgb, var(--destructive) 15%, transparent)',
              border: `1px solid ${
                myPlayer.is_imposter
                  ? nobodyGuessedImposter ? 'var(--accent)' : 'var(--destructive)'
                  : correctVoterIds.has(myPlayer.id)
                    ? 'var(--accent)'
                    : notaVoterIds.has(myPlayer.id)
                      ? 'var(--border)'
                      : 'var(--destructive)'
              }`,
            }}
          >
            <p
              className="text-sm font-semibold"
              style={{
                color: myPlayer.is_imposter
                  ? nobodyGuessedImposter ? 'var(--accent)' : 'oklch(0.85 0.18 25)'
                  : correctVoterIds.has(myPlayer.id)
                    ? 'var(--accent)'
                    : wrongVoterIds.has(myPlayer.id)
                      ? 'oklch(0.75 0.18 25)'
                      : 'var(--muted-foreground)',
              }}
            >
              {myPlayer.is_imposter
                ? nobodyGuessedImposter
                  ? 'Nobody guessed you — +2 points!'
                  : 'You were caught!'
                : correctVoterIds.has(myPlayer.id)
                  ? '+1 point — correct vote!'
                  : notaVoterIds.has(myPlayer.id)
                    ? 'You chose NOTA — no change'
                    : '-\u2153 point — wrong vote'}
            </p>
          </div>
        )}
      </div>

      {/* Voting results */}
      <div className="glass rounded-2xl p-4 flex flex-col gap-2">
        <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-1">
          Voting Results
        </h3>
        {activePlayers.filter((p) => !p.is_imposter).map((p) => {
          const vote = roundVotes.find((v) => v.voter_id === p.id)
          const votedPlayer = activePlayers.find((a) => a.id === vote?.target_id)
          const correct = correctVoterIds.has(p.id)
          const isNota = vote?.is_nota === true
          const isWrong = wrongVoterIds.has(p.id)
          const isMe = p.id === myPlayer?.id
          return (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5"
              style={{ background: 'var(--secondary)' }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
                style={{ background: 'var(--muted)', color: 'var(--foreground)' }}
              >
                {p.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium flex-1 truncate">
                {p.name}
                {isMe && <span className="text-muted-foreground text-xs ml-1">(you)</span>}
              </span>
              <span className="text-xs text-muted-foreground truncate max-w-[90px]">
                {!vote ? '—' : isNota ? 'NOTA' : votedPlayer ? `voted ${votedPlayer.name}` : '—'}
              </span>
              {!vote
                ? <Minus className="w-4 h-4 flex-shrink-0 opacity-30" />
                : isNota
                  ? <Minus className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                  : correct
                    ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                    : isWrong
                      ? <XCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--destructive)' }} />
                      : <Minus className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
              }
            </div>
          )
        })}
      </div>

      {/* Leaderboard */}
      <div className="glass rounded-2xl p-4 flex flex-col gap-2">
        <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-1">Leaderboard</h3>
        {sorted.map((p, i) => {
          const isFirst = i === 0
          const isMe = p.id === myPlayer?.id
          return (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded-xl px-3 py-3"
              style={{
                background: isFirst
                  ? 'color-mix(in srgb, var(--primary) 12%, var(--secondary))'
                  : 'var(--secondary)',
                border: `1px solid ${isFirst ? 'color-mix(in srgb, var(--primary) 35%, transparent)' : 'transparent'}`,
              }}
            >
              <div className="w-7 text-center">
                {isFirst
                  ? <Crown className="w-4 h-4 mx-auto" style={{ color: 'var(--primary)' }} />
                  : <span className="text-sm font-bold text-muted-foreground">{i + 1}</span>}
              </div>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
                style={{
                  background: p.is_imposter
                    ? 'color-mix(in srgb, var(--destructive) 20%, transparent)'
                    : 'var(--muted)',
                  color: p.is_imposter ? 'oklch(0.8 0.18 25)' : 'var(--foreground)',
                }}
              >
                {p.name.charAt(0).toUpperCase()}
              </div>
              <span className="flex-1 font-medium text-sm truncate">
                {p.name}
                {isMe && <span className="text-muted-foreground text-xs ml-1">(you)</span>}
              </span>
              {p.is_imposter && (
                <span
                  className="text-xs rounded-full px-2 py-0.5 flex-shrink-0"
                  style={{
                    background: 'color-mix(in srgb, var(--destructive) 15%, transparent)',
                    color: 'oklch(0.8 0.18 25)',
                  }}
                >
                  imposter
                </span>
              )}
              <span
                className="font-black text-base flex-shrink-0"
                style={{ color: isFirst ? 'var(--primary)' : 'var(--foreground)' }}
              >
                {Number.isInteger(p.score) ? p.score : p.score.toFixed(2)}
                <span className="text-xs font-medium text-muted-foreground ml-0.5">
                  pt{p.score !== 1 ? 's' : ''}
                </span>
              </span>
            </div>
          )
        })}
      </div>

      {/* Admin actions */}
      {isAdmin ? (
        <div className="flex flex-col gap-2 pb-8">
          <button
            className="w-full rounded-2xl py-4 font-bold text-base flex items-center justify-center gap-2.5 transition-all active:scale-95"
            style={{
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
              boxShadow: '0 0 20px color-mix(in srgb, var(--primary) 35%, transparent)',
            }}
            onClick={handleNextWord}
            disabled={loadingNext}
          >
            <ArrowRight className="w-5 h-5" />
            {loadingNext ? 'Preparing...' : 'Next Word'}
          </button>
          <button
            className="w-full rounded-2xl py-3 font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 glass"
            onClick={handleRestart}
            disabled={loadingRestart}
          >
            <RotateCcw className="w-4 h-4" />
            {loadingRestart ? 'Resetting...' : 'Back to Lobby (reset scores)'}
          </button>
        </div>
      ) : (
        <div className="glass rounded-2xl px-4 py-3.5 text-center pb-8">
          <div className="flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            <p className="text-sm text-muted-foreground">Waiting for host...</p>
          </div>
        </div>
      )}
    </div>
  )
}
