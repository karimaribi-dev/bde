import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProductEditor from '@/components/ProductEditor'
import { Product } from '@/lib/types'

export const dynamic = 'force-dynamic'

interface Props { params: Promise<{ id: string }> }

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('products').select('*').eq('id', id).single()
  if (!data) notFound()
  return <ProductEditor product={data as Product} />
}
