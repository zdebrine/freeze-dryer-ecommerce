-- Fix RLS policy for admin order insertion
-- Problem: JWT claims may not have 'role' set for existing admin users
-- Solution: Check both JWT claim and profiles table role

-- Drop existing admin insert policy
DROP POLICY IF EXISTS "Admins can insert orders" ON public.orders;

-- Create new policy that checks JWT claim first, then falls back to profiles table
CREATE POLICY "Admins can insert orders"
  ON public.orders FOR INSERT
  WITH CHECK (
    -- Check JWT claim first (preferred for performance)
    (auth.jwt()->>'role')::text = 'admin'
    OR
    -- Fallback: Check profiles table if JWT claim not set
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Also update the SELECT, UPDATE, and DELETE policies for consistency
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  USING (
    (auth.jwt()->>'role')::text = 'admin'
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  USING (
    (auth.jwt()->>'role')::text = 'admin'
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;
CREATE POLICY "Admins can delete orders"
  ON public.orders FOR DELETE
  USING (
    (auth.jwt()->>'role')::text = 'admin'
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
