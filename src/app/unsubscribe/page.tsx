import Link from 'next/link'

export default function UnsubscribePage({ searchParams }: { searchParams: Promise<{ done?: string }> }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--paper)', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--mute)', marginBottom: 16 }}>
          AI Trends News
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-.02em', marginBottom: 16 }}>
          Vous êtes désabonné.
        </h1>
        <p style={{ color: 'var(--ink-2)', lineHeight: 1.6, marginBottom: 32 }}>
          Votre adresse email a été retirée de notre liste de diffusion. Vous ne recevrez plus nos newsletters.
        </p>
        <Link href="/" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--ink)', textDecoration: 'underline' }}>
          ← Retour au site
        </Link>
      </div>
    </div>
  )
}
