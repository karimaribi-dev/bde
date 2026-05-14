import { createClient } from '@/lib/supabase/server'
import CategoryManager from '@/components/CategoryManager'

export default async function AdminCategoriesPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase.from('categories').select('*').order('name')

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Catégories</h1>
      <CategoryManager initialCategories={categories ?? []} />
    </div>
  )
}
