export interface CartItem {
  productId: string
  title: string
  slug: string
  price: number
  imageUrl: string | null
  qty: number
  stockCount: number
}
