-- Add client information fields to orders table for snapshot at time of order creation
ALTER TABLE public.orders
ADD COLUMN client_name TEXT,
ADD COLUMN client_email TEXT,
ADD COLUMN client_company TEXT,
ADD COLUMN client_phone TEXT;

-- Update existing orders with client information from profiles
UPDATE public.orders o
SET 
  client_name = p.full_name,
  client_email = p.email,
  client_company = p.company_name,
  client_phone = p.phone
FROM public.profiles p
WHERE o.client_id = p.id;
