'use client'

import { useState } from 'react'
import { startGame } from '@/lib/actions'
import { WORD_CATEGORIES } from '@/lib/constants'
import { playSound } from '@/lib/sounds'
import type { GameViewProps } from '@/components/game-view-props'
import { Users, Crown, Copy, Check, Play } from 'lucide-react'

const PLAYER_COLORS = [
  'var(--primary)',
  'var(--accent)',
  'oklch(0.72 0.18 300)',
  'oklch(0.72 0.18 130)',
  'oklch(0.72 0.18 50)',
  'oklch(0.72 0.18 175)',
  'oklch(0.72 0.18 260)',
  'oklch(0.72 0.18 15)',
  'oklch(0.72 0.18 220)',
  'oklch(0.72 0.18 80)',
]

export function LobbyView({ room, players, isAdmin, myPlayer }: GameViewProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const category = WORD_CATEGORIES.find((c) => c.id === room.category)
  const canStart = players.length >= 3

  async function handleStart() {
    if (!canStart) return
    setLoading(true)
    setError('')
    playSound('start')
    try {
      await startGame(room.id)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to start')
      setLoading(false)
    }
  }

  function copyCode() {
    navigator.clipboard.writeText(room.code)
    setCopied(true)
    playSound('click')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-4 fade-in-up">
      {/* Header */}
      <div className="text-center pt-8">
        <p className="text-xs text-muted-foreground uppercase tracking-[0.2em]">Waiting for players</p>
        <h1 className="text-3xl font-black mt-1 tracking-tight" style={{ color: 'var(--primary)' }}>
          LOBBY
        </h1>
      </div>

      {/* Room code */}
      <div className="glass rounded-2xl p-5 text-center relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{ background: 'radial-gradient(ellipse at center, var(--primary) 0%, transparent 70%)' }}
        />
        <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] mb-2">Room Code</p>
        <div className="flex items-center justify-center gap-3">
          <p
            className="font-mono text-5xl font-black tracking-[0.2em] text-glow-primary"
            style={{ color: 'var(--primary)' }}
          >
            {room.code}
          </p>
          <button
            onClick={copyCode}
            className="p-2 rounded-xl glass transition-all active:scale-95"
            aria-label="Copy code"
          >
            {copied
              ? <Check className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              : <Copy className="w-5 h-5 text-muted-foreground" />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Share with friends to join</p>
      </div>

      {/* Game settings strip */}
      <div className="glass rounded-2xl p-4 grid grid-cols-2 divide-x divide-border text-center">
        {[
          { label: 'Category', value: category?.label ?? room.category },
          { label: 'Imposters', value: room.imposter_count },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-0.5 px-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
            <p className="font-bold text-sm">{value}</p>
          </div>
        ))}
      </div>

      {/* Players */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-semibold text-sm">Players</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className={`w-2 h-2 rounded-full ${canStart ? 'bg-green-400' : 'bg-yellow-400'}`}
              style={{ boxShadow: canStart ? '0 0 6px #4ade80' : '0 0 6px #facc15' }}
            />
            <span className="text-xs text-muted-foreground">
              {players.length}{canStart ? '' : ` / need ${3 - players.length} more`}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {players.map((p, i) => {
            const color = PLAYER_COLORS[i % PLAYER_COLORS.length]
            const isMe = p.id === myPlayer?.id
            const isRoomAdmin = p.id === room.admin_player_id
            return (
              <div
                key={p.id}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all scale-in"
                style={{
                  background: `color-mix(in srgb, ${color} 10%, var(--secondary))`,
                  border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
                  animationDelay: `${i * 0.05}s`,
                }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs"
                  style={{ background: color, color: 'var(--primary-foreground)' }}
                >
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-sm truncate flex-1">{p.name}</span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {isRoomAdmin && <Crown className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />}
                  {isMe && <span className="text-[10px] text-muted-foreground">you</span>}
                </div>
              </div>
            )
          })}

          {/* Empty slots hint */}
          {!canStart &&
            Array.from({ length: Math.max(0, 3 - players.length) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 border border-dashed border-border opacity-40"
              >
                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs text-muted-foreground">
                  ?
                </div>
                <span className="text-sm text-muted-foreground">Waiting...</span>
              </div>
            ))}
        </div>
      </div>

      {/* Admin start */}
      {isAdmin ? (
        <div className="flex flex-col gap-2">
          {error && <p className="text-destructive text-sm text-center">{error}</p>}
          <button
            className={`w-full rounded-2xl py-4 font-black text-base tracking-wide flex items-center justify-center gap-2.5 transition-all active:scale-95 ${
              canStart ? 'glow-primary' : 'opacity-40 cursor-not-allowed'
            }`}
            style={{
              background: canStart ? 'var(--primary)' : 'var(--secondary)',
              color: canStart ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
            }}
            onClick={handleStart}
            disabled={loading || !canStart}
          >
            <Play className="w-5 h-5 fill-current" />
            {loading
              ? 'Starting game...'
              : canStart
                ? 'Start Game'
                : `Need ${3 - players.length} more player${3 - players.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      ) : (
        <div className="glass rounded-2xl px-4 py-3.5 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            <p className="text-sm text-muted-foreground">Waiting for the host to start...</p>
          </div>
        </div>
      )}
    </div>
  )
}
