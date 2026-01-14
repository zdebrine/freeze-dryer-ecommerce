export interface Profile {
  id: string
  email: string
  full_name: string
  role: "admin" | "client" | "employee"
  company_name: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_number: string
  client_id: string
  coffee_type: string
  quantity_kg: number
  lot_number: string
  roast_level: string | null
  grind_size: string | null
  special_instructions: string | null
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled"
  unified_status: string | null
  order_date: string
  requested_completion_date: string | null
  actual_completion_date: string | null
  machine_id: string | null
  // Weight tracking fields
  beans_input_weight_kg: number | null
  concentrate_output_weight_kg: number | null
  concentrate_input_weight_kg: number | null
  powder_output_weight_kg: number | null
  beans_to_concentrate_yield_percent: number | null
  concentrate_to_powder_yield_percent: number | null
  // Packaging fields
  packaging_type: "bulk_100g" | "sachet_6pack" | "custom" | null
  bulk_bags_count: number | null
  bulk_bag_cost_per_unit: number | null
  sachet_boxes_count: number | null
  sachet_box_cost_per_unit: number | null
  custom_packaging_description: string | null
  total_packaging_cost: number | null
  final_packaged_weight_kg: number | null
  created_at: string
  updated_at: string
}

export interface Machine {
  id: string
  machine_name: string
  machine_code: string
  capacity_kg: number
  status: "available" | "in_use" | "maintenance" | "offline"
  notes: string | null
  created_at: string
  updated_at: string
}

export interface OrderLog {
  id: string
  order_id: string
  user_id: string
  action: string
  previous_status: string | null
  new_status: string | null
  notes: string | null
  created_at: string
}

export interface EmployeePermissions {
  id: string
  employee_id: string
  can_view_orders: boolean
  can_update_orders: boolean
  can_sign_off: boolean
  can_create_invoices: boolean
  can_complete_orders: boolean
  created_at: string
  updated_at: string
}

export interface OrderSignoff {
  id: string
  order_id: string
  stage: "pre_freeze_prep" | "freeze_drying_start" | "freeze_drying_complete" | "final_packaging" | "ready_for_payment"
  signed_by_id: string
  signed_by_name: string
  signed_by_role: "admin" | "employee"
  notes: string | null
  signed_at: string
  created_at: string
}

export interface TeamInvitation {
  id: string
  invited_by: string
  email: string
  role: "employee"
  status: "pending" | "accepted" | "expired"
  token: string
  expires_at: string
  created_at: string
  updated_at: string
}
