'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'

interface Area { x: number; y: number; width: number; height: number }
interface Point { x: number; y: number }

interface Props {
  src: string
  aspect?: number
  onConfirm: (blob: Blob) => void
  onCancel: () => void
}

async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const response = await fetch(imageSrc)
  const blob = await response.blob()
  const img = await createImageBitmap(blob)
  const canvas = document.createElement('canvas')
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height)
  return new Promise((resolve, reject) =>
    canvas.toBlob(b => b ? resolve(b) : reject(new Error('Erreur canvas')), 'image/webp', 0.92)
  )
}

const RATIOS = [
  { label: '16 : 9', value: 16 / 9 },
  { label: '4 : 3',  value: 4 / 3  },
  { label: '3 : 2',  value: 3 / 2  },
  { label: '3 : 4',  value: 3 / 4  },
  { label: '1 : 1',  value: 1      },
]

export default function ImageCropModal({ src, aspect: defaultAspect, onConfirm, onCancel }: Props) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [aspect, setAspect] = useState(defaultAspect ?? 16 / 9)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [processing, setProcessing] = useState(false)

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels)
  }, [])

  async function handleConfirm() {
    if (!croppedAreaPixels) return
    setProcessing(true)
    try {
      const blob = await getCroppedBlob(src, croppedAreaPixels)
      onConfirm(blob)
    } catch {
      setProcessing(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,.9)', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', background: '#0c0c0c', borderBottom: '1px solid rgba(255,255,255,.1)' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,.6)' }}>
          Recadrer l&apos;image
        </span>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{ padding: '7px 16px', border: '1px solid rgba(255,255,255,.2)', background: 'transparent', color: 'rgba(255,255,255,.7)', fontSize: 13, cursor: 'pointer', borderRadius: 6 }}>
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={processing}
            style={{ padding: '7px 18px', background: '#FFE74A', color: '#111', fontSize: 13, fontWeight: 700, cursor: 'pointer', borderRadius: 6, opacity: processing ? .5 : 1 }}
          >
            {processing ? 'Traitement…' : 'Valider le recadrage'}
          </button>
        </div>
      </div>

      {/* Zone de crop */}
      <div style={{ position: 'relative', flex: 1 }}>
        <Cropper
          image={src}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>

      {/* Contrôles */}
      <div style={{ background: '#0c0c0c', borderTop: '1px solid rgba(255,255,255,.1)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>

        {/* Zoom */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 200 }}>
          <span style={{ color: 'rgba(255,255,255,.4)', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.15em', whiteSpace: 'nowrap' }}>ZOOM</span>
          <input
            type="range" min={1} max={3} step={0.01} value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            style={{ flex: 1, accentColor: '#FFE74A', cursor: 'pointer' }}
          />
          <span style={{ color: 'rgba(255,255,255,.5)', fontFamily: 'var(--font-mono)', fontSize: 11, minWidth: 32 }}>
            {zoom.toFixed(1)}×
          </span>
        </div>

        {/* Ratios */}
        <div style={{ display: 'flex', gap: 6 }}>
          {RATIOS.map(r => (
            <button
              key={r.label}
              onClick={() => { setAspect(r.value); setCrop({ x: 0, y: 0 }); setZoom(1) }}
              style={{
                padding: '5px 12px', fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '.08em',
                border: '1px solid',
                borderColor: aspect === r.value ? '#FFE74A' : 'rgba(255,255,255,.2)',
                borderRadius: 5,
                background: aspect === r.value ? '#FFE74A' : 'transparent',
                color: aspect === r.value ? '#111' : 'rgba(255,255,255,.5)',
                cursor: 'pointer',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
