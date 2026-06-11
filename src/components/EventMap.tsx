'use client'

import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

interface Props {
  lat: number
  lng: number
  locationName?: string
}

export default function EventMap({ lat, lng, locationName }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<import('leaflet').Map | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    let cancelled = false

    async function init() {
      const L = (await import('leaflet')).default

      // Si la cleanup a déjà tourné avant la fin de l'import, on abandonne
      if (cancelled || !containerRef.current) return

      // Si une instance existe déjà (StrictMode double-mount), on la supprime d'abord
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }

      // Corrige les icônes via CDN unpkg
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(containerRef.current).setView([lat, lng], 15)

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
      cancelled = true
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [lat, lng, locationName])

  return (
    <div
      ref={containerRef}
      style={{ height: 380, width: '100%', borderRadius: 8, overflow: 'hidden', border: '1px solid #e6e6e6' }}
    />
  )
}
