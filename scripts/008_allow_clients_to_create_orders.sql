-- Allow clients to create their own orders
-- This enables clients to submit order requests from the client portal

DROP POLICY IF EXISTS "Clients can insert own orders" ON public.orders;

CREATE POLICY "Clients can insert own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = client_id);
