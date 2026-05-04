export interface Flight {
  scheduled_time: string | null
  actual_time: string | null
  flight_number: string | null
  destination_city: string | null
  destination_iata: string | null
  airline: string | null
  terminal: string | null
  gate: string | null
  status: string | null
}

export interface Change {
  time: string
  flight: string
  type: string
  field: string
  old_value: string | null
  new_value: string | null
  detail: string
}

export interface Notification {
  time: string
  phone: string
  flight: string
  msg: string
}

export interface GateGetterData {
  airport?: string
  tracked: string[]
  flights: Flight[]
  changes: Change[]
  notifications: Notification[]
  last_poll: string | null
  next_poll: string | null
  poll_count: number
  status: string
}

export interface HealthResponse {
  status: string
  poll_count: number
  last_poll: string | null
}

/* ── Nodestra Backend types ─────────────────────────────────────────── */

export interface SubscribeToFlightRequest {
  flight_number: string
  phone_number: string
  airport_id: string
}

export interface SubscribeToFlightResponse {
  status: 'subscribed' | 'already_subscribed'
  flight: string
}

export interface NavigateCallRequest {
  phone_number: string
  airport_id: string
  old_gate: string
  new_gate: string
}

export interface NavigateCallResponse {
  status: string
  call_id: string
}

export interface FlightChangeCallRequest {
  phone_number: string
  airport_id: string
  flight_number: string
  changes: { field: string; old_value: string; new_value: string }[]
}

export interface FlightChangeCallResponse {
  status: string
  call_id: string
}
