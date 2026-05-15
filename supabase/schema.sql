-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  dni TEXT,
  fecha_nacimiento DATE,
  sexo TEXT DEFAULT 'Femenino',
  telefono TEXT,
  domicilio TEXT,
  ocupacion TEXT,
  estado_civil TEXT,
  peso NUMERIC,
  talla NUMERIC,
  ta TEXT,
  fcfr TEXT,
  diagnostico TEXT,
  motivo TEXT,
  tratamientos_prev TEXT,
  antecedentes TEXT,
  habitos TEXT
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  dolor INTEGER DEFAULT 5 CHECK (dolor >= 0 AND dolor <= 10),
  evaluacion TEXT DEFAULT '',
  tratamiento TEXT DEFAULT '',
  ejercicios TEXT DEFAULT '',
  observaciones TEXT DEFAULT '',
  puntos JSONB DEFAULT '[]'
);

-- RLS Policies (enable for production with auth)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- For now allow all (single user app - the kinesio connects their own Supabase)
CREATE POLICY "Allow all on patients" ON patients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on sessions" ON sessions FOR ALL USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_patient_id ON sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_sessions_fecha ON sessions(fecha);
CREATE INDEX IF NOT EXISTS idx_patients_apellido ON patients(apellido);
