import type { Room, Player } from '@/lib/types'

export interface GameViewProps {
  room: Room
  players: Player[]
  votes: import('@/lib/types').Vote[]
  myPlayer: Player | null
  isAdmin: boolean
}
