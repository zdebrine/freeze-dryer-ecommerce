-- Create admin_clients junction table to track which clients belong to which admin
CREATE TABLE IF NOT EXISTS public.admin_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(admin_id, client_id)
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_clients_admin_id ON public.admin_clients(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_clients_client_id ON public.admin_clients(client_id);

-- Enable RLS
ALTER TABLE public.admin_clients ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_clients
CREATE POLICY "Admins can view their own client relationships"
  ON public.admin_clients FOR SELECT
  USING (
    auth.uid() = admin_id OR
    auth.uid() = client_id
  );

CREATE POLICY "Admins can insert client relationships"
  ON public.admin_clients FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    ) OR auth.uid() = client_id
  );

CREATE POLICY "Admins can delete their client relationships"
  ON public.admin_clients FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    ) AND auth.uid() = admin_id
  );
