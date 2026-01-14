-- Add new "waiting_for_freeze_dryer" status and packaging fields to orders table

-- First, update the unified_status check constraint to include the new status
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_unified_status_check;

ALTER TABLE public.orders
ADD CONSTRAINT orders_unified_status_check CHECK (
  unified_status IN (
    'pending_confirmation',
    'awaiting_shipment',
    'package_received',
    'pre_freeze_prep',
    'waiting_for_freeze_dryer',
    'freeze_drying',
    'final_packaging',
    'ready_for_payment',
    'completed'
  )
);

-- Add packaging fields to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS packaging_type TEXT CHECK (
  packaging_type IN ('bulk_100g', 'sachet_6pack', 'custom')
),
ADD COLUMN IF NOT EXISTS bulk_bags_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS bulk_bag_cost_per_unit DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS sachet_boxes_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sachet_box_cost_per_unit DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS custom_packaging_description TEXT,
ADD COLUMN IF NOT EXISTS total_packaging_cost DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS final_packaged_weight_kg DECIMAL(10, 3);

-- Add index for faster status queries
CREATE INDEX IF NOT EXISTS idx_orders_unified_status ON public.orders(unified_status);
