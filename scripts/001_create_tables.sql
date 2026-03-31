-- Rooms table
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  admin_player_id UUID,
  status TEXT NOT NULL DEFAULT 'lobby', -- lobby | playing | voting | results
  category TEXT NOT NULL DEFAULT 'fruits',
  word TEXT,
  imposter_count INT NOT NULL DEFAULT 1,
  current_round INT NOT NULL DEFAULT 1,
  total_rounds INT NOT NULL DEFAULT 3,
  show_hint BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rooms_select_all" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "rooms_insert_all" ON public.rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "rooms_update_all" ON public.rooms FOR UPDATE USING (true);

-- Players table
CREATE TABLE IF NOT EXISTS public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_imposter BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  score INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "players_select_all" ON public.players FOR SELECT USING (true);
CREATE POLICY "players_insert_all" ON public.players FOR INSERT WITH CHECK (true);
CREATE POLICY "players_update_all" ON public.players FOR UPDATE USING (true);

-- Votes table
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  round INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(room_id, voter_id, round)
);

ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "votes_select_all" ON public.votes FOR SELECT USING (true);
CREATE POLICY "votes_insert_all" ON public.votes FOR INSERT WITH CHECK (true);
CREATE POLICY "votes_update_all" ON public.votes FOR UPDATE USING (true);
