import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import DeleteProductButton from '@/components/DeleteProductButton'
import { Product } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('products').select('*').order('sort_order', { ascending: true })
  const products = (data ?? []) as Product[]

  return (
    <div className="admin-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Produits du shop</h1>
        <Link href="/admin/products/new" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '10px 20px', background: '#262626', color: '#fff',
          borderRadius: 4, fontSize: 14, fontWeight: 600, textDecoration: 'none',
        }}>
          <i className="fa-solid fa-plus" /> Nouveau produit
        </Link>
      </div>

      {products.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: '#999' }}>
          <i className="fa-solid fa-box-open" style={{ fontSize: 40, marginBottom: 12, display: 'block' }} />
          <p style={{ margin: 0 }}>Aucun produit. <Link href="/admin/products/new" style={{ color: '#262626', fontWeight: 600 }}>Créer le premier →</Link></p>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', color: '#6b7280', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600, width: 60 }}>#</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', color: '#6b7280', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600, width: 70 }}>Photo</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', color: '#6b7280', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>Titre</th>
                <th style={{ padding: '10px 16px', textAlign: 'right', color: '#6b7280', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>Prix</th>
                <th style={{ padding: '10px 16px', textAlign: 'right', color: '#6b7280', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>Stock</th>
                <th style={{ padding: '10px 16px', textAlign: 'center', color: '#6b7280', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>Statut</th>
                <th style={{ padding: '10px 16px', textAlign: 'right', color: '#6b7280', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: i < products.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <td style={{ padding: '12px 16px', color: '#9ca3af', fontSize: 13 }}>{p.sort_order}</td>
                  <td style={{ padding: '12px 16px' }}>
                    {p.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image_url} alt={p.title} style={{ width: 44, height: 44, objectFit: 'contain', background: '#f5f5f0', borderRadius: 4, padding: 2 }} />
                    ) : (
                      <div style={{ width: 44, height: 44, background: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fa-solid fa-image" style={{ color: '#ccc', fontSize: 18 }} />
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#262626' }}>{p.title}</div>
                    {p.edition && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{p.edition}</div>}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#262626' }}>
                    {Number(p.price).toFixed(2)} €
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <span style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: 99,
                      background: p.stock_count === 0 ? '#fee2e2' : p.stock_count <= 5 ? '#fef3c7' : '#f0fdf4',
                      color: p.stock_count === 0 ? '#dc2626' : p.stock_count <= 5 ? '#d97706' : '#16a34a',
                      fontSize: 12, fontWeight: 700,
                    }}>
                      {p.stock_count === 0 ? 'Épuisé' : `${p.stock_count} restants`}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block', padding: '3px 10px', borderRadius: 99,
                      background: p.is_published ? '#dcfce7' : '#f3f4f6',
                      color: p.is_published ? '#16a34a' : '#6b7280',
                      fontSize: 12, fontWeight: 600,
                    }}>
                      {p.is_published ? 'Publié' : 'Brouillon'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
                      <Link href={`/admin/products/${p.id}`} style={{ padding: '4px 10px', background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: 4, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                        Modifier
                      </Link>
                      <DeleteProductButton id={p.id} title={p.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
