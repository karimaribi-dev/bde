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
  slug: string
  description: string | null
  sort_order: number
  created_at: string
}

export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  cover_image_url: string | null
  cover_image_alt: string | null
  status: ArticleStatus
  category_id: string | null
  category?: Category
  published_at: string | null
  created_at: string
  updated_at: string
}
