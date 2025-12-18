-- Add shipping address to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS shipping_address_line1 TEXT,
ADD COLUMN IF NOT EXISTS shipping_address_line2 TEXT,
ADD COLUMN IF NOT EXISTS shipping_city TEXT,
ADD COLUMN IF NOT EXISTS shipping_state TEXT,
ADD COLUMN IF NOT EXISTS shipping_postal_code TEXT,
ADD COLUMN IF NOT EXISTS shipping_country TEXT DEFAULT 'United States';

-- Add tracking and Shopify fields to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
ADD COLUMN IF NOT EXISTS tracking_confirmed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS package_received BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS package_received_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS shopify_draft_order_id TEXT,
ADD COLUMN IF NOT EXISTS shopify_order_id TEXT,
ADD COLUMN IF NOT EXISTS shopify_checkout_url TEXT,
ADD COLUMN IF NOT EXISTS payment_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS payment_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS order_stage TEXT DEFAULT 'pending_confirmation' CHECK (order_stage IN (
  'pending_confirmation',
  'confirmed',
  'awaiting_shipment',
  'package_in_transit',
  'package_received',
  'pre_freeze',
  'freezing',
  'post_freeze',
  'packaging',
  'completed',
  'payment_pending',
  'payment_completed',
  'shipped_to_customer'
));

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number);
CREATE INDEX IF NOT EXISTS idx_orders_shopify_draft_order_id ON orders(shopify_draft_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_stage ON orders(order_stage);

COMMENT ON COLUMN orders.order_stage IS 'Detailed stage of order processing for client notifications';
COMMENT ON COLUMN orders.tracking_number IS 'Client-provided tracking number for shipment to admin';
COMMENT ON COLUMN orders.shopify_checkout_url IS 'Shopify cart URL sent to client for payment';
