-- Migration: add multi-user auth support
-- Run this in the Supabase SQL Editor after the initial schema.sql

-- 1. Add user_id column to patients
ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Drop old "allow all" policies
DROP POLICY IF EXISTS "Allow all on patients" ON patients;
DROP POLICY IF EXISTS "Allow all on sessions" ON sessions;

-- 3. Patients: each user only sees/modifies their own
CREATE POLICY "Own patients only" ON patients
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Sessions: scoped through the patient's user_id
CREATE POLICY "Own sessions only" ON sessions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = sessions.patient_id
        AND patients.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = sessions.patient_id
        AND patients.user_id = auth.uid()
    )
  );
