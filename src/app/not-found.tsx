export default function NotFound() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#F5F0E8',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '0 24px',
      gap: 40,
    }}>

      {/* Texte haut */}
      <p style={{
        fontFamily: '"Archivo Black", sans-serif',
        fontWeight: 900,
        fontSize: 'clamp(13px, 1.4vw, 18px)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        lineHeight: 1.55,
        color: '#1a1a1a',
        margin: 0,
      }}>
        CETTE PAGE N&apos;EXISTE PAS<br />
        OU A ÉTÉ DÉPLACÉE.
      </p>

      {/* 4 + Mimi + 4 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'clamp(0px, 2vw, 20px)',
      }}>
        {/* Premier 4 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/404-un.svg"
          alt="4"
          style={{ width: 'clamp(90px, 11vw, 155px)', height: 'auto' }}
        />

        {/* Mimi triste */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/mimitriste.svg"
          alt="0"
          style={{ width: 'clamp(180px, 22vw, 300px)', height: 'auto' }}
        />

        {/* Deuxième 4 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/404-deux.svg"
          alt="4"
          style={{ width: 'clamp(90px, 11vw, 150px)', height: 'auto' }}
        />
      </div>

      {/* Bouton */}
      <a
        href="/"
        style={{
          display: 'inline-block',
          padding: '14px 36px',
          border: '1.5px solid #1a1a1a',
          borderRadius: 999,
          color: '#1a1a1a',
          textDecoration: 'none',
          fontFamily: '"Archivo Black", sans-serif',
          fontWeight: 700,
          fontSize: 'clamp(11px, 1.1vw, 14px)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        RETOUR À L&apos;ACCUEIL
      </a>

    </div>
  )
}
