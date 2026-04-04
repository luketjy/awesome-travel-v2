export type TourType = 'local' | 'worldwide'
export type TourDifficulty = 'easy' | 'moderate' | 'challenging'

export interface ItineraryDay {
  day: number
  title: string
  description: string
}

export interface PricingOptions {
  twin_sharing: number
  single_supplement?: number
  child_rate?: number
}

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
  tour_type?: TourType
  destination?: string | null
  highlights?: string[] | null
  inclusions?: string[] | null
  exclusions?: string[] | null
  itinerary?: ItineraryDay[] | null
  difficulty?: TourDifficulty | null
  min_pax?: number | null
  max_pax?: number | null
  pricing_options?: PricingOptions | null
  suitability_tags?: string[] | null
  enquiry_only?: boolean
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

export type BookingPaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded' | 'pending_refund'

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
  | 'beach'
  | 'cruise'
  | 'wildlife'
  | 'historical'
  | 'luxury'
  | 'budget'
  | 'honeymoon'
  | 'family'
  | 'pilgrimage'

export const TOUR_CATEGORIES: { value: TourCategory; label: string }[] = [
  { value: 'island-hopping', label: 'Island Hopping' },
  { value: 'city-tour', label: 'City Tour' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'food-tour', label: 'Food Tour' },
  { value: 'beach', label: 'Beach' },
  { value: 'cruise', label: 'Cruise' },
  { value: 'wildlife', label: 'Wildlife' },
  { value: 'historical', label: 'Historical' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'budget', label: 'Budget' },
  { value: 'honeymoon', label: 'Honeymoon' },
  { value: 'family', label: 'Family' },
  { value: 'pilgrimage', label: 'Pilgrimage' },
]
