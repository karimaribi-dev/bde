export type ArticleStatus = 'draft' | 'published'

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string
}

export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  cover_image_url: string | null
  status: ArticleStatus
  category_id: string | null
  category?: Category
  published_at: string | null
  created_at: string
  updated_at: string
}
