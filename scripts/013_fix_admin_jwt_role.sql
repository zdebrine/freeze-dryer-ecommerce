-- Fix admin JWT role for existing users and create helper function
-- This ensures that the role is properly stored in the JWT token for RLS policies

-- Update existing admin users to have role in app_metadata
UPDATE auth.users
SET raw_app_meta_data = 
  COALESCE(raw_app_meta_data, '{}'::jsonb) || 
  jsonb_build_object('role', p.role)
FROM public.profiles p
WHERE auth.users.id = p.id
  AND p.role = 'admin'
  AND (auth.users.raw_app_meta_data->>'role' IS NULL OR auth.users.raw_app_meta_data->>'role' != 'admin');

-- Update existing client users to have role in app_metadata
UPDATE auth.users
SET raw_app_meta_data = 
  COALESCE(raw_app_meta_data, '{}'::jsonb) || 
  jsonb_build_object('role', p.role)
FROM public.profiles p
WHERE auth.users.id = p.id
  AND p.role = 'client'
  AND (auth.users.raw_app_meta_data->>'role' IS NULL OR auth.users.raw_app_meta_data->>'role' != 'client');

-- Create a function to sync profile role changes to JWT
CREATE OR REPLACE FUNCTION public.sync_role_to_jwt()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When a profile's role changes, update the user's app_metadata
  UPDATE auth.users
  SET raw_app_meta_data = 
    COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', NEW.role)
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Create trigger to keep JWT in sync with profile role
DROP TRIGGER IF EXISTS sync_role_to_jwt_trigger ON public.profiles;
CREATE TRIGGER sync_role_to_jwt_trigger
  AFTER INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_role_to_jwt();

-- Note: Users will need to log out and log back in for JWT changes to take effect
-- Or the session needs to be refreshed
