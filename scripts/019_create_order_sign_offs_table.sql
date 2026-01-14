-- Create order_signoffs table to track who signed off at each stage
CREATE TABLE IF NOT EXISTS public.order_signoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  stage TEXT NOT NULL CHECK (stage IN (
    'pre_freeze_prep',
    'freeze_drying_start',
    'freeze_drying_complete',
    'final_packaging',
    'ready_for_payment'
  )),
  signed_by_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  signed_by_name TEXT NOT NULL, -- Denormalized for historical record
  signed_by_role TEXT NOT NULL, -- admin or employee
  notes TEXT,
  signed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(order_id, stage)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_order_signoffs_order_id ON order_signoffs(order_id);
CREATE INDEX IF NOT EXISTS idx_order_signoffs_signed_by_id ON order_signoffs(signed_by_id);
CREATE INDEX IF NOT EXISTS idx_order_signoffs_stage ON order_signoffs(stage);

-- Enable RLS
ALTER TABLE public.order_signoffs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for order_signoffs
CREATE POLICY "Users can view signoffs for orders they can access"
  ON public.order_signoffs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_signoffs.order_id
      AND (
        orders.client_id = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'employee')
        )
      )
    )
  );

CREATE POLICY "Admins and employees can insert signoffs"
  ON public.order_signoffs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'employee')
    )
  );

COMMENT ON TABLE order_signoffs IS 'Tracks employee/admin sign-offs at each stage of the freeze drying process';
COMMENT ON COLUMN order_signoffs.stage IS 'Process stage being signed off: pre_freeze_prep, freeze_drying_start, freeze_drying_complete, final_packaging, ready_for_payment';
COMMENT ON COLUMN order_signoffs.signed_by_name IS 'Denormalized employee/admin name for historical record keeping';
