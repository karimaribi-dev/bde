import { createClient } from '@/lib/supabase/server'
import ArticleEditor from '@/components/ArticleEditor'

export const dynamic = 'force-dynamic'

export default async function NewArticlePage() {
  const supabase = await createClient()
  const { data: categories } = await supabase.from('categories').select('*').order('name')

  return <ArticleEditor categories={categories ?? []} />
}
