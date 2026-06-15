export type ArticleStatus = 'draft' | 'published'

export interface Popup {
  id: string
  title: string
  heading: string
  subheading: string | null
  image_url: string | null
  image_alt: string | null
  cta_text: string | null
  cta_url: string | null
  is_active: boolean
  starts_at: string | null
  ends_at: string | null
  created_at: string
  updated_at: string
}

export interface Page {
  id: string
  title: string
  slug: string
  content: string
  meta_description: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface MaintenanceSettings {
  enabled: boolean
  title: string
  message: string
  image_url: string
  image_alt: string
}

export interface SocialLinks {
  linkedin?: string
  twitter?: string
  bluesky?: string
  instagram?: string
  facebook?: string
  youtube?: string
  tiktok?: string
  newsletter?: string
}

export interface AdSlot {
  id: string
  name: string
  snippet: string | null
  fallback_image_url: string | null
  fallback_image_alt: string | null
  fallback_link: string | null
  is_active: boolean
  updated_at: string
}

export interface Subscriber {
  id: string
  email: string
  status: 'active' | 'unsubscribed' | 'pending'
  unsubscribe_token: string
  created_at: string
}

export interface Newsletter {
  id: string
  subject: string
  editorial: string
  article_ids: string[]
  status: 'draft' | 'scheduled' | 'sent'
  scheduled_at: string | null
  sent_at: string | null
  recipients_count: number | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  name_en: string | null
  name_es: string | null
  name_de: string | null
  slug: string
  description: string | null
  sort_order: number
  created_at: string
}

export interface Event {
  id: string
  badge: string
  badge_en: string | null
  badge_color: string
  badge_text_color: string
  title: string
  title_en: string | null
  slug: string
  description: string | null
  description_en: string | null
  event_date: string          // YYYY-MM-DD
  event_time: string
  price: string
  image_url: string | null
  location_name: string | null
  location_address: string | null
  location_lat: number | null
  location_lng: number | null
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface Club {
  id: string
  title: string
  slug: string
  tagline: string
  tagline_en: string | null
  tagline_sub: string | null
  tagline_sub_en: string | null
  accent_color: string
  accent_text_color: string
  who_we_are: string | null
  who_we_are_en: string | null
  objective: string | null
  objective_en: string | null
  schedule: string | null
  schedule_en: string | null
  frequency: string | null
  frequency_en: string | null
  location: string | null
  location_en: string | null
  member_count: string | null
  image_url: string | null
  is_published: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  title: string
  title_en: string | null
  slug: string
  description: string | null
  description_en: string | null
  price: number
  stock_count: number
  edition: string | null
  image_url: string | null
  is_published: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  cover_image_url: string | null
  cover_image_alt: string | null
  sources: string | null
  cluster_id: string | null
  duotone_color1: string | null
  duotone_color2: string | null
  status: ArticleStatus
  category_id: string | null
  category?: Category
  published_at: string | null
  created_at: string
  updated_at: string
}
