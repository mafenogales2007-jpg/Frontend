export default function ModalPremioRuleta({
  premio,
  puntosDisponibles,
  costoGiro,
  puedeVolverAGirar,
  onCerrar,
  onVolverAGirar,
}) {
  if (!premio) return null;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-premio-titulo"
      style={{ zIndex: 3000 }}
    >
      <div
        style={{
          background: '#ffffff',
          width: '420px',
          maxWidth: '92vw',
          borderRadius: '20px',
          boxShadow: '0 25px 35px -10px rgba(8, 47, 73, 0.35)',
          overflow: 'hidden',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center',
        }}
      >
        {/* Franja superior del color ganador */}
        <div
          style={{
            background: premio.color || '#06B6D4',
            padding: '1.75rem 1.5rem 1.35rem',
            color: '#ffffff',
            position: 'relative',
          }}
        >
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar ventana"
            style={{
              position: 'absolute',
              top: '12px',
              right: '14px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: '#ffffff',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              fontSize: '1.1rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>

          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.22)',
              margin: '0 auto 0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
          </div>

          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              opacity: 0.95,
            }}
          >
            ¡Premio obtenido!
          </span>
          <h2
            id="modal-premio-titulo"
            style={{
              margin: '0.35rem 0 0',
              fontSize: '1.65rem',
              fontWeight: '900',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
            }}
          >
            {premio.titulo}
          </h2>
        </div>

        {/* Detalle del premio y puntos */}
        <div style={{ padding: '1.5rem' }}>
          <p style={{ margin: '0 0 1rem', color: '#475569', fontSize: '0.92rem', lineHeight: 1.5 }}>
            {premio.descripcion}
          </p>

          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '0.85rem 1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700' }}>
              Saldo actual de puntos
            </span>
            <span style={{ fontSize: '1.1rem', color: '#0A3D4C', fontWeight: '900' }}>
              {puntosDisponibles} pts
            </span>
          </div>

          {!puedeVolverAGirar && (
            <p style={{ margin: '0 0 1rem', fontSize: '0.8rem', color: '#dc2626', fontWeight: '600' }}>
              No tienes suficientes puntos ({costoGiro} pts requeridos) para volver a girar.
            </p>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={onCerrar}
              style={{
                flex: 1,
                padding: '0.7rem 1rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                fontWeight: '700',
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              Aceptar
            </button>

            <button
              type="button"
              onClick={onVolverAGirar}
              disabled={!puedeVolverAGirar}
              style={{
                flex: 1.2,
                padding: '0.7rem 1rem',
                borderRadius: '10px',
                border: 'none',
                background: puedeVolverAGirar ? '#0A3D4C' : '#cbd5e1',
                color: puedeVolverAGirar ? '#ffffff' : '#64748b',
                fontWeight: '800',
                fontSize: '0.88rem',
                cursor: puedeVolverAGirar ? 'pointer' : 'not-allowed',
              }}
            >
              Volver a girar (-{costoGiro} pts)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
