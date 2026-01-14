-- Add lot number field to orders (required field)
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS lot_number TEXT;

-- Add comment explaining the field
COMMENT ON COLUMN orders.lot_number IS 'Required lot number for tracking production batches';
