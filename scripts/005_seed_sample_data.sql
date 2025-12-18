-- Seed sample machines
INSERT INTO public.machines (machine_name, machine_code, capacity_kg, status) VALUES
  ('Freeze Dryer Alpha', 'FD-A001', 50.00, 'available'),
  ('Freeze Dryer Beta', 'FD-B002', 75.00, 'available'),
  ('Freeze Dryer Gamma', 'FD-G003', 100.00, 'in_use'),
  ('Freeze Dryer Delta', 'FD-D004', 50.00, 'maintenance')
ON CONFLICT (machine_code) DO NOTHING;
