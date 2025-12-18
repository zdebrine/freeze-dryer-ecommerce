-- Add assigned_admin_id field to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS assigned_admin_id UUID REFERENCES profiles(id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_orders_assigned_admin ON orders(assigned_admin_id);

-- Add comment
COMMENT ON COLUMN orders.assigned_admin_id IS 'Admin user assigned to handle this order';

-- Update RLS policies to ensure they work correctly
-- Drop and recreate the admin read policy to be more explicit
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT
  USING ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin');

-- Ensure admins can update assigned_admin_id
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
CREATE POLICY "Admins can update all orders" ON orders
  FOR UPDATE
  USING ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin')
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin');
