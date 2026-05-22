export default function NotFound() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#f3efe6",
        color: "#0c0c0c",
        fontFamily: "Georgia, 'Times New Roman', serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        zIndex: 9999,
      }}
    >
      <div style={{ maxWidth: "480px", padding: "2rem" }}>
        <p
          style={{
            fontSize: "0.75rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            opacity: 0.4,
            marginBottom: "1rem",
            fontFamily: "inherit",
          }}
        >
          Erreur
        </p>
        <h1
          style={{
            fontSize: "clamp(6rem, 20vw, 12rem)",
            fontWeight: 700,
            lineHeight: 1,
            margin: "0 0 1.5rem",
            letterSpacing: "-0.04em",
          }}
        >
          404
        </h1>
        <p
          style={{
            fontSize: "1.1rem",
            lineHeight: 1.6,
            opacity: 0.65,
            marginBottom: "2.5rem",
          }}
        >
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
        <a
          href="/"
          style={{
            display: "inline-block",
            padding: "0.65rem 1.5rem",
            border: "1px solid #0c0c0c",
            color: "#0c0c0c",
            textDecoration: "none",
            fontSize: "0.85rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Retour à l&apos;accueil
        </a>
      </div>
    </div>
  );
}
