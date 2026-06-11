import { CartProvider } from '@/components/CartContext'
import CartDrawer from '@/components/CartDrawer'
import CartBubble from '@/components/CartBubble'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
      <CartBubble />
    </CartProvider>
  )
}
