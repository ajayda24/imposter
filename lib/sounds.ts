// Sound utility using Web Audio API — lightweight, no dependencies
type SoundType = 'click' | 'join' | 'start' | 'reveal' | 'vote' | 'win' | 'lose' | 'tick'

let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

function playTone(
  frequency: number,
  type: OscillatorType,
  duration: number,
  volume = 0.3,
  delay = 0,
  fadeOut = true
) {
  try {
    const ac = getCtx()
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.connect(gain)
    gain.connect(ac.destination)
    osc.type = type
    osc.frequency.setValueAtTime(frequency, ac.currentTime + delay)
    gain.gain.setValueAtTime(volume, ac.currentTime + delay)
    if (fadeOut) {
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + duration)
    }
    osc.start(ac.currentTime + delay)
    osc.stop(ac.currentTime + delay + duration)
  } catch (_) {
    // ignore — audio context may be blocked
  }
}

export function playSound(type: SoundType) {
  switch (type) {
    case 'click':
      playTone(440, 'sine', 0.08, 0.15)
      break
    case 'join':
      playTone(523, 'sine', 0.1, 0.2)
      playTone(659, 'sine', 0.15, 0.2, 0.1)
      break
    case 'start':
      playTone(392, 'triangle', 0.1, 0.25)
      playTone(494, 'triangle', 0.1, 0.25, 0.12)
      playTone(587, 'triangle', 0.2, 0.3, 0.24)
      break
    case 'reveal':
      playTone(300, 'sawtooth', 0.05, 0.15)
      playTone(600, 'sine', 0.25, 0.3, 0.05)
      break
    case 'vote':
      playTone(350, 'sine', 0.08, 0.2)
      playTone(420, 'sine', 0.12, 0.2, 0.09)
      break
    case 'win':
      ;[523, 659, 784, 1047].forEach((f, i) => playTone(f, 'triangle', 0.2, 0.3, i * 0.1))
      break
    case 'lose':
      ;[400, 320, 250].forEach((f, i) => playTone(f, 'sawtooth', 0.2, 0.2, i * 0.12))
      break
    case 'tick':
      playTone(800, 'square', 0.04, 0.1)
      break
  }
}
