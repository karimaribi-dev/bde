'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { CartItem } from '@/lib/cart-types'

interface CartCtx {
  items:    CartItem[]
  add:      (item: Omit<CartItem, 'qty'>) => void
  remove:   (productId: string) => void
  setQty:   (productId: string, qty: number) => void
  clear:    () => void
  total:    number
  count:    number
  isOpen:   boolean
  open:     () => void
  close:    () => void
}

const Ctx = createContext<CartCtx | null>(null)

const LS_KEY = 'bde_cart_v1'

export function CartProvider({ children }: { children: ReactNode }) {
  const [items,   setItems]   = useState<CartItem[]>([])
  const [isOpen,  setIsOpen]  = useState(false)
  const [mounted, setMounted] = useState(false)

  /* Hydrate from localStorage */
  useEffect(() => {
    setMounted(true)
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch {}
  }, [])

  /* Persist */
  useEffect(() => {
    if (!mounted) return
    localStorage.setItem(LS_KEY, JSON.stringify(items))
  }, [items, mounted])

  /* Lock body scroll when drawer is open */
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const add = useCallback((item: Omit<CartItem, 'qty'>) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === item.productId)
      if (existing) {
        return prev.map(i =>
          i.productId === item.productId
            ? { ...i, qty: Math.min(i.stockCount, i.qty + 1) }
            : i
        )
      }
      return [...prev, { ...item, qty: 1 }]
    })
    setIsOpen(true)
  }, [])

  const remove = useCallback((productId: string) => {
    setItems(prev => prev.filter(i => i.productId !== productId))
  }, [])

  const setQty = useCallback((productId: string, qty: number) => {
    setItems(prev =>
      prev.map(i =>
        i.productId === productId
          ? { ...i, qty: Math.max(1, Math.min(i.stockCount, qty)) }
          : i
      )
    )
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const total = items.reduce((s, i) => s + i.price * i.qty, 0)
  const count = items.reduce((s, i) => s + i.qty, 0)

  return (
    <Ctx.Provider value={{
      items, add, remove, setQty, clear,
      total, count,
      isOpen,
      open:  () => setIsOpen(true),
      close: () => setIsOpen(false),
    }}>
      {children}
    </Ctx.Provider>
  )
}

export function useCart() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCart must be inside <CartProvider>')
  return ctx
}
