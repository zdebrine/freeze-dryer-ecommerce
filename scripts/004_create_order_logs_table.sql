-- Order logs table for tracking status changes and updates

CREATE TABLE IF NOT EXISTS public.order_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  previous_status TEXT,
  new_status TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_order_logs_order_id ON public.order_logs(order_id);

-- Enable RLS
ALTER TABLE public.order_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for order_logs
CREATE POLICY "Users can view logs for their orders"
  ON public.order_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_logs.order_id
      AND (orders.client_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
      ))
    )
  );

CREATE POLICY "Admins can insert order logs"
  ON public.order_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
