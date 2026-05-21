import { createClient } from '@/lib/supabase/server'
import CategoryManager from '@/components/CategoryManager'

export const dynamic = 'force-dynamic'

export default async function AdminCategoriesPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Catégories</h1>
      <CategoryManager initialCategories={categories ?? []} />
    </div>
  )
}
