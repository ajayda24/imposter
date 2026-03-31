'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createRoom, joinRoom } from '@/lib/actions'
import { WORD_CATEGORIES } from '@/lib/constants'
import { playSound } from '@/lib/sounds'
import { Input } from '@/components/ui/input'
import { Eye, Users, Shuffle, ChevronLeft, Plus, Minus } from 'lucide-react'

type Mode = 'home' | 'create' | 'join'

export default function HomePage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('home')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [category, setCategory] = useState(WORD_CATEGORIES[0].id)
  const [imposters, setImposters] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function goMode(m: Mode) {
    playSound('click')
    setMode(m)
    setError('')
  }

  async function handleCreate() {
    if (!name.trim()) return setError('Enter your name')
    setLoading(true)
    setError('')
    try {
      const { room, player } = await createRoom(name.trim(), category, imposters)
      // Store in both localStorage and URL param for resilient session management
      localStorage.setItem('playerId', player.id)
      localStorage.setItem('playerName', name.trim())
      playSound('start')
      router.push(`/room/${room.code}?pid=${player.id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create room')
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin() {
    if (!name.trim()) return setError('Enter your name')
    if (!code.trim()) return setError('Enter room code')
    setLoading(true)
    setError('')
    try {
      const { room, player } = await joinRoom(code.trim(), name.trim())
      // Store in both localStorage and URL param for resilient session management
      localStorage.setItem('playerId', player.id)
      localStorage.setItem('playerName', name.trim())
      playSound('join')
      router.push(`/room/${room.code}?pid=${player.id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to join room')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-dvh grid-bg flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* ambient glow orbs */}
      <div
        className="pointer-events-none absolute top-[-120px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)' }}
      />
      <div
        className="pointer-events-none absolute bottom-[-80px] right-[-80px] w-[300px] h-[300px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }}
      />

      <div className="w-full max-w-sm flex flex-col gap-6 relative z-10">
        {/* Logo */}
        <div className="text-center fade-in-up">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div
              className="w-12 h-12 rounded-2xl glow-primary flex items-center justify-center"
              style={{ background: 'var(--primary)' }}
            >
              <Eye className="w-6 h-6" style={{ color: 'var(--primary-foreground)' }} />
            </div>
          </div>
          <h1 className="text-5xl font-black tracking-tight text-glow-primary" style={{ color: 'var(--primary)' }}>
            IMPOSTER
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm tracking-wide">Social deduction party game</p>
        </div>

        {mode === 'home' && (
          <div className="flex flex-col gap-3 fade-in-up" style={{ animationDelay: '0.1s' }}>
            <button
              className="w-full rounded-xl py-4 font-bold text-base tracking-wide glow-primary transition-all active:scale-95"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
              onClick={() => goMode('create')}
            >
              Create Room
            </button>
            <button
              className="w-full rounded-xl py-4 font-bold text-base tracking-wide glass transition-all active:scale-95"
              onClick={() => goMode('join')}
            >
              Join Room
            </button>

            <div className="mt-4 glass rounded-xl p-4 flex justify-around text-center">
              {[
                { icon: <Users className="w-4 h-4" />, label: '3–10', sub: 'Players' },
                { icon: <Shuffle className="w-4 h-4" />, label: '8', sub: 'Categories' },
                { icon: <Eye className="w-4 h-4" />, label: '1–3', sub: 'Imposters' },
              ].map((item) => (
                <div key={item.sub} className="flex flex-col items-center gap-1">
                  <div className="text-muted-foreground">{item.icon}</div>
                  <p className="font-bold text-sm" style={{ color: 'var(--primary)' }}>{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {mode === 'create' && (
          <div className="glass rounded-2xl p-5 flex flex-col gap-5 fade-in-up">
            <div className="flex items-center gap-2">
              <button
                onClick={() => goMode('home')}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="font-bold text-lg">Create Room</h2>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Your Name</label>
              <Input
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
                className="bg-input border-border h-11"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Category</label>
              <div className="grid grid-cols-2 gap-2">
                {WORD_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setCategory(cat.id); playSound('tick') }}
                    className={`rounded-xl px-3 py-2.5 text-sm font-medium border transition-all active:scale-95 ${
                      category === cat.id
                        ? 'border-primary text-primary bg-primary/10 glow-primary'
                        : 'border-border text-muted-foreground hover:border-primary/40 bg-secondary'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Imposters</label>
              <div className="flex items-center gap-2 glass rounded-xl px-3 py-2">
                <button
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                  onClick={() => { setImposters((v) => Math.max(1, v - 1)); playSound('tick') }}
                  disabled={imposters <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="flex-1 text-center font-bold text-lg">{imposters}</span>
                <button
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                  onClick={() => { setImposters((v) => Math.min(3, v + 1)); playSound('tick') }}
                  disabled={imposters >= 3}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {error && <p className="text-destructive text-sm text-center">{error}</p>}

            <button
              className="w-full rounded-xl py-3.5 font-bold text-base glow-primary transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
              onClick={handleCreate}
              disabled={loading}
            >
              {loading ? 'Creating room...' : 'Create Room'}
            </button>
          </div>
        )}

        {mode === 'join' && (
          <div className="glass rounded-2xl p-5 flex flex-col gap-5 fade-in-up">
            <div className="flex items-center gap-2">
              <button
                onClick={() => goMode('home')}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="font-bold text-lg">Join Room</h2>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Your Name</label>
              <Input
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
                className="bg-input border-border h-11"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Room Code</label>
              <Input
                placeholder="ABC123"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="uppercase tracking-[0.3em] font-mono text-xl text-center bg-input border-border h-14"
              />
            </div>

            {error && <p className="text-destructive text-sm text-center">{error}</p>}

            <button
              className="w-full rounded-xl py-3.5 font-bold text-base glow-primary transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
              onClick={handleJoin}
              disabled={loading}
            >
              {loading ? 'Joining...' : 'Join Room'}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
