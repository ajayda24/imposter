'use client'

import { useState } from 'react'
import { advanceToVoting, toggleHint } from '@/lib/actions'
import { getCategoryById, getWordEntry } from '@/lib/constants'
import { playSound } from '@/lib/sounds'
import type { GameViewProps } from '@/components/game-view-props'
import { Eye, EyeOff, MessageCircle, Vote, Swords, Shield, Lightbulb } from 'lucide-react'

export function PlayingView({ room, players, myPlayer, isAdmin }: GameViewProps) {
  const [loading, setLoading] = useState(false)
  const isImposter = myPlayer?.is_imposter ?? false
  const activePlayers = players.filter((p) => p.is_active)
  const category = getCategoryById(room.category)
  const wordEntry = !isImposter ? getWordEntry(room.category, room.word ?? '') : null

  async function handleVoting() {
    setLoading(true)
    playSound('tick')
    await advanceToVoting(room.id)
    setLoading(false)
  }

  async function handleToggleHint() {
    playSound('click')
    await toggleHint(room.id, !room.show_hint)
  }

  return (
    <div className="flex flex-col gap-4 fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-end pt-8">
        <div className="flex items-center gap-1.5 glass rounded-full px-3 py-1">
          <MessageCircle className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Discussion</span>
        </div>
      </div>

      {/* Role reminder */}
      <div
        className="rounded-2xl p-5 relative overflow-hidden"
        style={{
          background: isImposter
            ? 'linear-gradient(135deg, oklch(0.22 0.12 25) 0%, oklch(0.18 0.08 25) 100%)'
            : 'linear-gradient(135deg, oklch(0.18 0.1 170) 0%, oklch(0.14 0.07 170) 100%)',
          border: `1px solid ${isImposter ? 'var(--destructive)' : 'var(--accent)'}`,
          boxShadow: isImposter
            ? '0 0 30px color-mix(in srgb, var(--destructive) 20%, transparent)'
            : '0 0 30px color-mix(in srgb, var(--accent) 20%, transparent)',
        }}
      >
        <div
          className="pointer-events-none absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 -translate-y-6 translate-x-6"
          style={{ background: isImposter ? 'var(--destructive)' : 'var(--accent)' }}
        />
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: isImposter
                ? 'color-mix(in srgb, var(--destructive) 20%, transparent)'
                : 'color-mix(in srgb, var(--accent) 20%, transparent)',
            }}
          >
            {isImposter
              ? <Swords className="w-5 h-5" style={{ color: 'var(--destructive)' }} />
              : <Shield className="w-5 h-5" style={{ color: 'var(--accent)' }} />}
          </div>
          <div className="flex-1 min-w-0">
            {isImposter ? (
              <>
                <p className="font-black tracking-wide" style={{ color: 'var(--destructive)' }}>IMPOSTER</p>
                {room.show_hint && category ? (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Lightbulb className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                    <p className="text-xs text-muted-foreground truncate">{category.hint}</p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Blend in — no hint</p>
                )}
              </>
            ) : (
              <>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Your word</p>
                <p className="font-black text-2xl text-glow-accent" style={{ color: 'var(--accent)' }}>
                  {room.word}
                </p>
                {wordEntry?.imageUrl && (
                  <img
                    src={wordEntry.imageUrl}
                    alt={room.word ?? ''}
                    crossOrigin="anonymous"
                    className="mt-2 w-full max-h-40 object-cover rounded-xl"
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Active players */}
      <div className="glass rounded-2xl p-4">
        <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-3">
          Active Players ({activePlayers.length})
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {activePlayers.map((p) => (
            <div key={p.id} className="flex items-center gap-2 rounded-xl px-3 py-2.5 bg-secondary">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs"
                style={{ background: 'var(--muted)', color: 'var(--foreground)' }}
              >
                {p.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium truncate flex-1">{p.name}</span>
              {p.id === myPlayer?.id && (
                <span className="text-[10px] text-muted-foreground flex-shrink-0">you</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Admin controls */}
      {isAdmin && (
        <div className="glass rounded-2xl p-4 flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">Host Controls</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {room.show_hint
                ? <Eye className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                : <EyeOff className="w-4 h-4 text-muted-foreground" />}
              <p className="text-sm font-medium">Imposters can see hint</p>
            </div>
            <button
              onClick={handleToggleHint}
              className="relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0"
              style={{ background: room.show_hint ? 'var(--primary)' : 'var(--secondary)' }}
              aria-label="Toggle hint"
            >
              <span
                className="absolute top-0.5 w-5 h-5 rounded-full bg-foreground shadow-sm transition-all duration-300"
                style={{ left: room.show_hint ? '26px' : '2px' }}
              />
            </button>
          </div>
          <button
            className="w-full rounded-xl py-3.5 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 glow-primary"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
            onClick={handleVoting}
            disabled={loading}
          >
            <Vote className="w-4 h-4" />
            {loading ? 'Opening voting...' : 'Open Voting'}
          </button>
        </div>
      )}

      {!isAdmin && (
        <div className="glass rounded-2xl px-4 py-3.5 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            <p className="text-sm text-muted-foreground">Discuss — voting opens when host decides.</p>
          </div>
        </div>
      )}
    </div>
  )
}
