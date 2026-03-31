-- Allow target_id to be NULL (represents NOTA / not ready to vote)
-- and add an is_nota flag for explicit querying
ALTER TABLE votes ALTER COLUMN target_id DROP NOT NULL;
ALTER TABLE votes ADD COLUMN IF NOT EXISTS is_nota boolean NOT NULL DEFAULT false;

-- Update any existing 'NOTA' string values (from before this migration) to proper nulls
UPDATE votes SET target_id = NULL, is_nota = true WHERE target_id = 'NOTA';
