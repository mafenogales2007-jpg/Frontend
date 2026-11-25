function polarToCartesian(cx, cy, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

function createSlicePath(cx, cy, radius, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M', cx, cy,
    'L', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    'Z',
  ].join(' ');
}

export default function RuletaWheel({
  premios = [],
  rotation = 0,
  girando = false,
  puedeGirar = true,
  costoGiro = 0,
  yaGiro = false,
  onGirar,
  onTransitionEnd,
}) {
  const totalSegmentos = premios.length || 1;
  const anguloPorSegmento = 360 / totalSegmentos;
  const size = 400;
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = 186;
  const sliceRadius = 172;
  const textRadius = 114;

  const lucesBorde = Array.from({ length: 16 }, (_, idx) => {
    const pos = polarToCartesian(cx, cy, outerRadius - 6, idx * (360 / 16));
    return { id: idx, x: pos.x, y: pos.y };
  });

  const textoBoton = girando
    ? 'GIRANDO...'
    : yaGiro && puedeGirar
      ? 'GIRAR RULETA DE NUEVO'
      : 'GIRAR RULETA';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
      {/* Contenedor de la ruleta + indicador fijo */}
      <div
        style={{
          position: 'relative',
          width: 'min(400px, 84vw)',
          height: 'min(400px, 84vw)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
        }}
      >
        {/* Indicador fijo superior */}
        <div
          aria-label="Indicador de premio ganador"
          style={{
            position: 'absolute',
            top: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
            filter: 'drop-shadow(0 4px 6px rgba(10, 61, 76, 0.35))',
            pointerEvents: 'none',
          }}
        >
          <svg width="42" height="44" viewBox="0 0 42 44" fill="none">
            <path
              d="M21 42L4 12C2.4 9.2 4.4 5.5 7.7 5.5H34.3C37.6 5.5 39.6 9.2 38 12L21 42Z"
              fill="#F59E0B"
              stroke="#082F49"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <circle cx="21" cy="14" r="4.5" fill="#FFFFFF" />
          </svg>
        </div>

        {/* Disco SVG */}
        <div
          onTransitionEnd={(e) => {
            if (e.target === e.currentTarget && e.propertyName === 'transform' && onTransitionEnd) {
              onTransitionEnd(e);
            }
          }}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            transform: `rotate(${rotation}deg)`,
            transition: girando
              ? 'transform 4.6s cubic-bezier(0.12, 0.85, 0.18, 1)'
              : 'none',
            willChange: 'transform',
            filter: 'drop-shadow(0 16px 28px rgba(8, 47, 73, 0.22))',
          }}
        >
          <svg
            viewBox={`0 0 ${size} ${size}`}
            style={{ width: '100%', height: '100%', display: 'block' }}
          >
            {/* Aro exterior oscuro */}
            <circle cx={cx} cy={cy} r={outerRadius} fill="#082F49" />
            <circle cx={cx} cy={cy} r={outerRadius - 2} fill="none" stroke="#06B6D4" strokeWidth="3" opacity="0.6" />

            {/* Luces decorativas del borde */}
            {lucesBorde.map((luz) => (
              <circle
                key={luz.id}
                cx={luz.x}
                cy={luz.y}
                r="4"
                fill={luz.id % 2 === 0 ? '#FDE68A' : '#67E8F9'}
              />
            ))}

            {/* Segmentos de premios: segmento 0 centrado a las 12 en punto (0 deg) */}
            {premios.map((premio, index) => {
              const centerAngle = index * anguloPorSegmento;
              const startAngle = centerAngle - anguloPorSegmento / 2;
              const endAngle = centerAngle + anguloPorSegmento / 2;
              const pathData = createSlicePath(cx, cy, sliceRadius, startAngle, endAngle);
              const textPos = polarToCartesian(cx, cy, textRadius, centerAngle);

              return (
                <g key={premio.id}>
                  <path
                    d={pathData}
                    fill={premio.color}
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                  />
                  <g transform={`translate(${textPos.x}, ${textPos.y}) rotate(${centerAngle})`}>
                    <text
                      x="0"
                      y="0"
                      fill={premio.colorTexto || '#FFFFFF'}
                      fontSize="12.5"
                      fontWeight="800"
                      fontFamily="system-ui, -apple-system, sans-serif"
                      textAnchor="middle"
                      dominantBaseline="central"
                      style={{
                        letterSpacing: '0.3px',
                        textShadow: '0 1px 2px rgba(0,0,0,0.35)',
                      }}
                    >
                      {premio.etiquetaCorta || premio.titulo}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Aro interior */}
            <circle cx={cx} cy={cy} r={sliceRadius} fill="none" stroke="#FFFFFF" strokeWidth="3" />

            {/* Centro fijo decorativo de la ruleta */}
            <circle cx={cx} cy={cy} r="36" fill="#082F49" stroke="#FFFFFF" strokeWidth="4" />
            <circle cx={cx} cy={cy} r="28" fill="#06B6D4" />
            <text
              x={cx}
              y={cy}
              fill="#FFFFFF"
              fontSize="11"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              textAnchor="middle"
              dominantBaseline="central"
              style={{ letterSpacing: '0.6px' }}
            >
              CORA
            </text>
          </svg>
        </div>
      </div>

      {/* Botón principal debajo de la ruleta */}
      <button
        type="button"
        onClick={onGirar}
        disabled={girando || !puedeGirar}
        style={{
          padding: '0.9rem 2.2rem',
          borderRadius: '14px',
          border: 'none',
          background: girando || !puedeGirar
            ? '#cbd5e1'
            : 'linear-gradient(135deg, #0A3D4C 0%, #06B6D4 100%)',
          color: girando || !puedeGirar ? '#64748b' : '#FFFFFF',
          fontSize: '1rem',
          fontWeight: '800',
          letterSpacing: '0.6px',
          cursor: girando || !puedeGirar ? 'not-allowed' : 'pointer',
          boxShadow: girando || !puedeGirar
            ? 'none'
            : '0 10px 20px -5px rgba(6, 182, 212, 0.45)',
          transition: 'transform 0.15s ease, box-shadow 0.2s ease',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.6rem',
        }}
      >
        <span>{textoBoton}</span>
        {costoGiro > 0 && !girando && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              background: puedeGirar ? 'rgba(255,255,255,0.22)' : 'rgba(100,116,139,0.18)',
              padding: '0.2rem 0.55rem',
              borderRadius: '999px',
            }}
          >
            -{costoGiro} pts
          </span>
        )}
      </button>

      {!puedeGirar && !girando && (
        <p style={{ margin: 0, fontSize: '0.82rem', color: '#dc2626', fontWeight: '600' }}>
          Necesitas al menos {costoGiro} puntos para girar la ruleta.
        </p>
      )}
    </div>
  );
}
