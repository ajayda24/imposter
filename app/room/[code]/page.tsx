import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { RoomClient } from '@/components/room-client'

export default async function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const supabase = await createClient()

  const { data: room } = await supabase
    .from('rooms')
    .select()
    .eq('code', code.toUpperCase())
    .single()

  if (!room) notFound()

  const { data: players } = await supabase
    .from('players')
    .select()
    .eq('room_id', room.id)
    .order('created_at', { ascending: true })

  const { data: votes } = await supabase
    .from('votes')
    .select()
    .eq('room_id', room.id)

  return (
    <Suspense>
      <RoomClient
        initialRoom={room}
        initialPlayers={players ?? []}
        initialVotes={votes ?? []}
      />
    </Suspense>
  )
}
