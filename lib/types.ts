export type RoomStatus = 'lobby' | 'role_reveal' | 'playing' | 'voting' | 'results'

export interface Room {
  id: string
  code: string
  admin_player_id: string | null
  status: RoomStatus
  category: string
  word: string | null
  imposter_count: number
  current_round: number
  total_rounds: number
  show_hint: boolean
  created_at: string
}

export interface Player {
  id: string
  room_id: string
  name: string
  is_imposter: boolean
  is_active: boolean
  score: number
  created_at: string
}

export interface Vote {
  id: string
  room_id: string
  voter_id: string
  target_id: string | null
  is_nota: boolean
  round: number
  created_at: string
}

export interface RoundResult {
  round: number
  eliminated: Player | null
  wasImposter: boolean
  voteCounts: Record<string, number>
}
