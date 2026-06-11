import { createClient } from '@/lib/supabase/server'
import MarkOrderProcessedButton from '@/components/MarkOrderProcessedButton'

export const dynamic = 'force-dynamic'

interface OrderItem {
  productId: string
  title:     string
  qty:       number
  price:     number
  subtotal:  number
}

interface ShopOrder {
  id:           string
  prenom:       string
  nom:          string
  classe:       string | null
  mail:         string
  items:        OrderItem[]
  total:        number
  is_processed: boolean
  created_at:   string
}

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('shop_orders')
    .select('*')
    .order('created_at', { ascending: false })

  const orders    = (data ?? []) as ShopOrder[]
  const pending   = orders.filter(o => !o.is_processed).length

  return (
    <div className="admin-content">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Commandes shop</h1>
        {pending > 0 && (
          <span style={{
            background: '#16a34a', color: '#fff',
            fontWeight: 700, fontSize: 13,
            padding: '3px 10px', borderRadius: 99,
          }}>
            {pending} en attente
          </span>
        )}
      </div>

      {orders.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: '#999' }}>
          <i className="fa-solid fa-inbox" style={{ fontSize: 40, marginBottom: 12, display: 'block' }} />
          <p style={{ margin: 0 }}>Aucune commande pour le moment.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {orders.map(order => (
            <div
              key={order.id}
              style={{
                background: order.is_processed ? '#fff' : '#f0fdf4',
                border: `1px solid ${order.is_processed ? '#e5e7eb' : '#bbf7d0'}`,
                borderRadius: 8,
                padding: '18px 22px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {/* En-tête */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {!order.is_processed && (
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', flexShrink: 0, display: 'inline-block' }} />
                    )}
                    <span style={{ fontWeight: 700, fontSize: 16 }}>
                      {order.prenom} {order.nom}
                    </span>
                    {order.classe && (
                      <span style={{ fontSize: 13, color: '#6b7280' }}>· {order.classe}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2, paddingLeft: order.is_processed ? 0 : 18 }}>
                    <a href={`mailto:${order.mail}`} style={{ color: '#0369a1', textDecoration: 'none' }}>{order.mail}</a>
                    {' · '}
                    {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <span style={{
                    fontFamily: 'var(--font-display, "Archivo Black", sans-serif)',
                    fontStyle: 'italic', fontWeight: 900, fontSize: 18,
                  }}>
                    {Number(order.total).toFixed(2)} €
                  </span>
                  <MarkOrderProcessedButton id={order.id} isProcessed={order.is_processed} />
                </div>
              </div>

              {/* Liste des produits */}
              <div style={{
                background: '#f9fafb',
                borderRadius: 4,
                padding: '10px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}>
                {order.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: '#374151' }}>
                    <span>
                      <span style={{ fontWeight: 600 }}>{item.qty}×</span> {item.title}
                    </span>
                    <span style={{ color: '#6b7280', flexShrink: 0, marginLeft: 16 }}>
                      {Number(item.price).toFixed(2)} € × {item.qty} = <strong>{Number(item.subtotal).toFixed(2)} €</strong>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
