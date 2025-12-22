-- Simplify order status by creating a unified status system
-- This combines the separate 'status' and 'order_stage' fields into one

-- First, let's add a new column for the unified status
ALTER TABLE orders ADD COLUMN IF NOT EXISTS unified_status TEXT;

-- Set a default unified status based on existing status and stage
UPDATE orders 
SET unified_status = CASE
  WHEN status = 'pending' AND (order_stage IS NULL OR order_stage = 'pending_confirmation') THEN 'pending_confirmation'
  WHEN status = 'confirmed' AND order_stage = 'awaiting_shipment' THEN 'awaiting_shipment'
  WHEN order_stage = 'package_received' THEN 'package_received'
  WHEN order_stage = 'pre_freeze' THEN 'pre_freeze_prep'
  WHEN status = 'in_progress' AND order_stage = 'freezing' THEN 'freeze_drying'
  WHEN order_stage = 'packaging' THEN 'final_packaging'
  WHEN order_stage = 'completed' OR status = 'completed' THEN 'ready_for_payment'
  WHEN order_stage = 'payment_completed' THEN 'completed'
  ELSE 'pending_confirmation'
END
WHERE unified_status IS NULL;

-- Add constraint for valid unified statuses
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_unified_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_unified_status_check CHECK (
  unified_status IN (
    'pending_confirmation',
    'awaiting_shipment',
    'package_received',
    'pre_freeze_prep',
    'freeze_drying',
    'final_packaging',
    'ready_for_payment',
    'completed'
  )
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_unified_status ON orders(unified_status);

COMMENT ON COLUMN orders.unified_status IS 'Simplified unified status combining order status and processing stage';
