
-- Add new fields to doctor_profiles
ALTER TABLE public.doctor_profiles
  ADD COLUMN IF NOT EXISTS practice_type text DEFAULT '',
  ADD COLUMN IF NOT EXISTS consultation_mode text DEFAULT 'Online',
  ADD COLUMN IF NOT EXISTS available_days text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS available_start_time time DEFAULT '09:00',
  ADD COLUMN IF NOT EXISTS available_end_time time DEFAULT '17:00';
