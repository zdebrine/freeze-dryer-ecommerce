-- Machines table for tracking freeze-drying equipment

CREATE TABLE IF NOT EXISTS public.machines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_name TEXT NOT NULL,
  machine_code TEXT UNIQUE NOT NULL,
  capacity_kg DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (
    status IN ('available', 'in_use', 'maintenance', 'offline')
  ),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;

-- RLS Policies for machines
CREATE POLICY "Admins can view all machines"
  ON public.machines FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert machines"
  ON public.machines FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update machines"
  ON public.machines FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete machines"
  ON public.machines FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
