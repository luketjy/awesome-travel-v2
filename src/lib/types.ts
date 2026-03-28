export interface Tour {
  id: string
  name: string
  slug: string
  description: string
  price: number
  category: string
  duration: string
  images: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TourDate {
  id: string
  tour_id: string
  date: string
  capacity: number
  booked_pax: number
  is_active: boolean
  created_at: string
  available_spots?: number
}

export type BookingPaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed'

export interface Booking {
  id: string
  tour_date_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  num_pax: number
  total_price: number
  status: 'pending' | 'confirmed' | 'cancelled'
  notes?: string
  created_at: string
  /** FOMO Pay gateway order id (set when a payment session is created). */
  fomo_order_id?: string | null
  payment_status?: BookingPaymentStatus | string
  tour_date?: TourDate & { tour?: Tour }
}

export type TourCategory =
  | 'island-hopping'
  | 'city-tour'
  | 'adventure'
  | 'cultural'
  | 'food-tour'

export const TOUR_CATEGORIES: { value: TourCategory; label: string }[] = [
  { value: 'island-hopping', label: 'Island Hopping' },
  { value: 'city-tour', label: 'City Tour' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'food-tour', label: 'Food Tour' },
]
