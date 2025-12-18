-- Fix infinite recursion in RLS policies
-- The issue: policies were querying the profiles table while evaluating policies on profiles
-- Solution: Use auth.jwt() to check the role directly from the JWT token

-- Drop the problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;

-- Create new admin policies using JWT claims instead of querying profiles
-- Note: The role is stored in the JWT token when the user logs in

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    (auth.jwt()->>'role')::text = 'admin'
  );

CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  USING (
    (auth.jwt()->>'role')::text = 'admin'
  );

CREATE POLICY "Admins can insert orders"
  ON public.orders FOR INSERT
  WITH CHECK (
    (auth.jwt()->>'role')::text = 'admin'
  );

CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  USING (
    (auth.jwt()->>'role')::text = 'admin'
  );

CREATE POLICY "Admins can delete orders"
  ON public.orders FOR DELETE
  USING (
    (auth.jwt()->>'role')::text = 'admin'
  );

-- Update the function that handles profile creation to set the role in app_metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert the profile
  INSERT INTO public.profiles (id, email, full_name, role, company_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    COALESCE(NEW.raw_user_meta_data->>'company_name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Update the user's app_metadata to include role for JWT
  UPDATE auth.users
  SET raw_app_meta_data = 
    COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', COALESCE(NEW.raw_user_meta_data->>'role', 'client'))
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$;
