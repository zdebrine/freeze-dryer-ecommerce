-- Allow clients to update tracking information on their own orders
-- This enables clients to submit tracking numbers for their shipments

CREATE POLICY "Clients can update tracking on own orders"
  ON public.orders FOR UPDATE
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

-- Note: This policy allows clients to update their own orders
-- The application code should restrict which fields clients can actually modify
-- (typically just tracking_number, tracking_confirmed_at, and order_stage)
