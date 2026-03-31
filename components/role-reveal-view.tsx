'use client'

import { useState } from 'react'
import { advanceToPlaying, toggleHint } from '@/lib/actions'
import { getCategoryById } from '@/lib/constants'
import { playSound } from '@/lib/sounds'
import type { GameViewProps } from '@/components/game-view-props'
import { Eye, EyeOff, Shield, Swords, ChevronRight, Lightbulb } from 'lucide-react'

export function RoleRevealView({ room, myPlayer, isAdmin }: GameViewProps) {
  const [revealed, setRevealed] = useState(false)
  const [loading, setLoading] = useState(false)

  const isImposter = myPlayer?.is_imposter ?? false
  const category = getCategoryById(room.category)

  function handleReveal() {
    if (revealed) return
    setRevealed(true)
    playSound('reveal')
  }

  async function handleAdvance() {
    setLoading(true)
    await advanceToPlaying(room.id)
    setLoading(false)
  }

  async function handleToggleHint() {
    playSound('click')
    await toggleHint(room.id, !room.show_hint)
  }

  return (
    <div className="flex flex-col gap-4 fade-in-up">
      {/* Round badge */}
      <div className="flex items-center justify-between pt-8">
        <div className="glass rounded-full px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Round {room.current_round} / {room.total_rounds}
        </div>
        <div className="glass rounded-full px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {category?.label}
        </div>
      </div>

      {/* Role card */}
      <div className="text-center mb-1">
        <h2 className="text-2xl font-black tracking-tight">Tap to reveal</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Check your role privately</p>
      </div>

      <button
        onClick={handleReveal}
        className={`rounded-2xl p-6 text-center transition-all duration-500 select-none relative overflow-hidden ${
          !revealed ? 'active:scale-[0.97] cursor-pointer pulse-ring' : ''
        }`}
        style={{
          background: revealed
            ? isImposter
              ? 'linear-gradient(135deg, oklch(0.22 0.12 25) 0%, oklch(0.18 0.08 25) 100%)'
              : 'linear-gradient(135deg, oklch(0.18 0.1 170) 0%, oklch(0.14 0.07 170) 100%)'
            : 'var(--card)',
          border: `2px solid ${
            revealed
              ? isImposter ? 'var(--destructive)' : 'var(--accent)'
              : 'var(--border)'
          }`,
          boxShadow: revealed
            ? isImposter
              ? '0 0 40px color-mix(in srgb, var(--destructive) 30%, transparent)'
              : '0 0 40px color-mix(in srgb, var(--accent) 30%, transparent)'
            : undefined,
        }}
        disabled={revealed}
        aria-label={revealed ? 'Role revealed' : 'Tap to reveal your role'}
      >
        {!revealed ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="w-20 h-20 rounded-full glass flex items-center justify-center float">
              <Eye className="w-9 h-9 text-muted-foreground" />
            </div>
            <div>
              <p className="font-bold text-lg">Your role is hidden</p>
              <p className="text-sm text-muted-foreground mt-0.5">Tap to reveal — keep it secret!</p>
            </div>
          </div>
        ) : isImposter ? (
          <div className="flex flex-col items-center gap-4 py-4 scale-in">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: 'color-mix(in srgb, var(--destructive) 20%, transparent)' }}
            >
              <Swords className="w-9 h-9" style={{ color: 'var(--destructive)' }} />
            </div>
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-1">You are the</p>
              <p className="text-5xl font-black tracking-wide" style={{ color: 'var(--destructive)' }}>
                IMPOSTER
              </p>
              <p className="text-sm text-muted-foreground mt-2">Blend in. Don&apos;t get caught.</p>
            </div>
            <div
              className="w-full mt-2 rounded-xl px-4 py-3 text-left"
              style={{
                background: 'color-mix(in srgb, var(--destructive) 10%, transparent)',
                border: '1px solid color-mix(in srgb, var(--destructive) 25%, transparent)',
              }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Lightbulb
                  className="w-3.5 h-3.5"
                  style={{ color: room.show_hint ? 'var(--primary)' : 'var(--muted-foreground)' }}
                />
                <p
                  className="text-xs uppercase tracking-wider font-semibold"
                  style={{ color: room.show_hint ? 'var(--primary)' : 'var(--muted-foreground)' }}
                >
                  {room.show_hint ? 'Hint' : 'No hint this round'}
                </p>
              </div>
              {room.show_hint && category ? (
                <p className="text-sm">{category.hint}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">The host has hidden your hint.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-4 scale-in">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: 'color-mix(in srgb, var(--accent) 20%, transparent)' }}
            >
              <Shield className="w-9 h-9" style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-1">The word is</p>
              <p className="text-5xl font-black tracking-wide text-glow-accent" style={{ color: 'var(--accent)' }}>
                {room.word}
              </p>
              <p className="text-sm text-muted-foreground mt-2">Describe it — don&apos;t say it!</p>
            </div>
          </div>
        )}
      </button>

      {/* Admin controls */}
      {isAdmin && (
        <div className="glass rounded-2xl p-4 flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">Host Controls</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {room.show_hint
                ? <Eye className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                : <EyeOff className="w-4 h-4 text-muted-foreground" />}
              <div>
                <p className="text-sm font-medium">Show hint to imposters</p>
                <p className="text-xs text-muted-foreground">&quot;{category?.hint?.slice(0, 38)}...&quot;</p>
              </div>
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
            onClick={handleAdvance}
            disabled={loading}
          >
            {loading ? 'Starting...' : 'Begin Discussion'}
            {!loading && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      )}

      {!isAdmin && (
        <div className="glass rounded-2xl px-4 py-3.5 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            <p className="text-sm text-muted-foreground">Waiting for host to begin discussion...</p>
          </div>
        </div>
      )}
    </div>
  )
}
