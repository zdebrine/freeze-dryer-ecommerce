-- Add weight tracking fields to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS beans_input_weight_kg DECIMAL(10, 3),
ADD COLUMN IF NOT EXISTS concentrate_output_weight_kg DECIMAL(10, 3),
ADD COLUMN IF NOT EXISTS concentrate_input_weight_kg DECIMAL(10, 3),
ADD COLUMN IF NOT EXISTS powder_output_weight_kg DECIMAL(10, 3),
ADD COLUMN IF NOT EXISTS beans_to_concentrate_yield_percent DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS concentrate_to_powder_yield_percent DECIMAL(5, 2);

-- Add comments
COMMENT ON COLUMN orders.beans_input_weight_kg IS 'Weight of coffee beans received from client (in kg)';
COMMENT ON COLUMN orders.concentrate_output_weight_kg IS 'Weight of coffee concentrate produced from beans (in kg)';
COMMENT ON COLUMN orders.concentrate_input_weight_kg IS 'Weight of coffee concentrate loaded into freeze dryer (in kg)';
COMMENT ON COLUMN orders.powder_output_weight_kg IS 'Weight of freeze dried instant coffee powder produced (in kg)';
COMMENT ON COLUMN orders.beans_to_concentrate_yield_percent IS 'Calculated yield percentage from beans to concentrate';
COMMENT ON COLUMN orders.concentrate_to_powder_yield_percent IS 'Calculated yield percentage from concentrate to powder';

-- Create a function to automatically calculate yield percentages
CREATE OR REPLACE FUNCTION calculate_yield_percentages()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate beans to concentrate yield
  IF NEW.beans_input_weight_kg IS NOT NULL AND NEW.concentrate_output_weight_kg IS NOT NULL AND NEW.beans_input_weight_kg > 0 THEN
    NEW.beans_to_concentrate_yield_percent := (NEW.concentrate_output_weight_kg / NEW.beans_input_weight_kg) * 100;
  END IF;

  -- Calculate concentrate to powder yield
  IF NEW.concentrate_input_weight_kg IS NOT NULL AND NEW.powder_output_weight_kg IS NOT NULL AND NEW.concentrate_input_weight_kg > 0 THEN
    NEW.concentrate_to_powder_yield_percent := (NEW.powder_output_weight_kg / NEW.concentrate_input_weight_kg) * 100;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate yields
DROP TRIGGER IF EXISTS calculate_yields_trigger ON orders;
CREATE TRIGGER calculate_yields_trigger
  BEFORE INSERT OR UPDATE OF beans_input_weight_kg, concentrate_output_weight_kg, concentrate_input_weight_kg, powder_output_weight_kg
  ON orders
  FOR EACH ROW
  EXECUTE FUNCTION calculate_yield_percentages();
