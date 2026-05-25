'use client'

import Image from 'next/image'

interface Props {
  src: string
  alt: string
  color1?: string | null
  color2?: string | null
  sizes?: string
  priority?: boolean
  aspectRatio?: string
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

export default function DuotonePhoto({ src, alt, sizes, priority, aspectRatio, className, style, children }: Props) {
  return (
    <div style={{ position: 'relative', aspectRatio, overflow: 'hidden', isolation: 'isolate', ...style }} className={className}>
      <Image src={src} alt={alt} fill sizes={sizes} style={{ objectFit: 'cover' }} priority={priority} />
      {children}
    </div>
  )
}
