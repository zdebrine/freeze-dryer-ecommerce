-- Add employee role to profiles table
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'client', 'employee'));

-- Create employee_permissions table to track what employees can do
CREATE TABLE IF NOT EXISTS public.employee_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  can_view_orders BOOLEAN DEFAULT TRUE,
  can_update_orders BOOLEAN DEFAULT TRUE,
  can_sign_off BOOLEAN DEFAULT TRUE,
  can_create_invoices BOOLEAN DEFAULT FALSE, -- Restricted for employees
  can_complete_orders BOOLEAN DEFAULT FALSE, -- Restricted for employees
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id)
);

-- Enable RLS on employee_permissions
ALTER TABLE public.employee_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employee_permissions
CREATE POLICY "Admins can view all employee permissions"
  ON public.employee_permissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Employees can view their own permissions"
  ON public.employee_permissions FOR SELECT
  USING (employee_id = auth.uid());

CREATE POLICY "Admins can manage employee permissions"
  ON public.employee_permissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Update orders table RLS policies to include employees
DROP POLICY IF EXISTS "Employees can view all orders" ON public.orders;
CREATE POLICY "Employees can view all orders"
  ON public.orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'employee')
    )
  );

DROP POLICY IF EXISTS "Employees can update orders" ON public.orders;
CREATE POLICY "Employees can update orders"
  ON public.orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      LEFT JOIN public.employee_permissions ep ON p.id = ep.employee_id
      WHERE p.id = auth.uid() 
      AND p.role = 'employee' 
      AND (ep.can_update_orders = TRUE OR ep.can_update_orders IS NULL)
    )
    OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Update order_logs policies to allow employees to insert logs
DROP POLICY IF EXISTS "Admins and employees can insert order logs" ON public.order_logs;
CREATE POLICY "Admins and employees can insert order logs"
  ON public.order_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'employee')
    )
  );

-- Update machines policies to allow employees read access
DROP POLICY IF EXISTS "Employees can view machines" ON public.machines;
CREATE POLICY "Employees can view machines"
  ON public.machines FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'employee')
    )
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_employee_permissions_employee_id ON employee_permissions(employee_id);

COMMENT ON TABLE employee_permissions IS 'Defines granular permissions for employee users';
COMMENT ON COLUMN employee_permissions.can_create_invoices IS 'Only admins can create invoices - employees cannot';
COMMENT ON COLUMN employee_permissions.can_complete_orders IS 'Only admins can complete orders - employees cannot';
