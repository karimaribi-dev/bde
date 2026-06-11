'use client'

import dynamic from 'next/dynamic'

const EventMap = dynamic(() => import('./EventMap'), { ssr: false })

export default function EventMapClient({ lat, lng, locationName }: { lat: number; lng: number; locationName?: string }) {
  return <EventMap lat={lat} lng={lng} locationName={locationName} />
}
