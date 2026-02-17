
-- Add is_verified to doctor_profiles
ALTER TABLE public.doctor_profiles ADD COLUMN is_verified boolean NOT NULL DEFAULT false;

-- Create doctor_availability table for appointment slots
CREATE TABLE public.doctor_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES public.doctor_profiles(id) ON DELETE CASCADE,
  slot_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_booked boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(doctor_id, slot_date, start_time)
);

ALTER TABLE public.doctor_availability ENABLE ROW LEVEL SECURITY;

-- Doctors can manage their own slots
CREATE POLICY "Doctors can view own availability"
  ON public.doctor_availability FOR SELECT
  USING (doctor_id IN (SELECT id FROM public.doctor_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can insert own availability"
  ON public.doctor_availability FOR INSERT
  WITH CHECK (doctor_id IN (SELECT id FROM public.doctor_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can update own availability"
  ON public.doctor_availability FOR UPDATE
  USING (doctor_id IN (SELECT id FROM public.doctor_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Doctors can delete own availability"
  ON public.doctor_availability FOR DELETE
  USING (doctor_id IN (SELECT id FROM public.doctor_profiles WHERE user_id = auth.uid()));

-- Admins can view all availability
CREATE POLICY "Admins can view all availability"
  ON public.doctor_availability FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Patients can view availability (for booking)
CREATE POLICY "Patients can view availability"
  ON public.doctor_availability FOR SELECT
  USING (has_role(auth.uid(), 'patient'::app_role));
