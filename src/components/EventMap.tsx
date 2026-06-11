'use client'

import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

interface Props {
  lat: number
  lng: number
  locationName?: string
}

export default function EventMap({ lat, lng, locationName }: Props) {
  const containerRef  = useRef<HTMLDivElement>(null)
  const mapRef        = useRef<import('leaflet').Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    let map: import('leaflet').Map

    async function init() {
      const L = (await import('leaflet')).default

      /* Corrige les icônes manquantes avec les assets CDN de Leaflet */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      map = L.map(containerRef.current!).setView([lat, lng], 15)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)

      L.marker([lat, lng])
        .addTo(map)
        .bindPopup(locationName ?? "Lieu de l'événement")
        .openPopup()

      mapRef.current = map
    }

    init()

    return () => {
      map?.remove()
      mapRef.current = null
    }
  }, [lat, lng, locationName])

  return (
    <div
      ref={containerRef}
      style={{ height: 380, width: '100%', borderRadius: 8, overflow: 'hidden', border: '1px solid #e6e6e6' }}
    />
  )
}
