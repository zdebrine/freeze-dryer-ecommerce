export interface Profile {
  id: string
  email: string
  full_name: string
  role: "admin" | "client"
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
  roast_level: string | null
  grind_size: string | null
  special_instructions: string | null
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled"
  order_date: string
  requested_completion_date: string | null
  actual_completion_date: string | null
  machine_id: string | null
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
