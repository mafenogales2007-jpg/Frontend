import { useState, useRef, useEffect } from 'react';
import RuletaWheel from './RuletaWheel';
import ModalPremioRuleta from './ModalPremioRuleta';
import {
  COSTO_GIRO_PUNTOS,
  PESOS_POR_PUNTO,
  PREMIOS_RULETA,
  PUNTOS_INICIALES,
  guardarHistorial,
  guardarPuntos,
  leerHistorialGuardado,
  leerPuntosGuardados,
} from './ruletaConfig';

export default function RuletaPremiosMain() {
  const [puntos, setPuntos] = useState(() => leerPuntosGuardados());
  const [historial, setHistorial] = useState(() => leerHistorialGuardado());
  const [rotation, setRotation] = useState(0);
  const [girando, setGirando] = useState(false);
  const [ultimoPremio, setUltimoPremio] = useState(null);
  const [modalPremio, setModalPremio] = useState(null);

  // Formulario rápido del sistema de puntos
  const [nombreCliente, setNombreCliente] = useState('');
  const [montoCompra, setMontoCompra] = useState('');
  const [mensajePuntos, setMensajePuntos] = useState('');

  // Control estricto del resultado ganador para evitar cambios después de detenerse
  const giroActivoRef = useRef(null);
  const timeoutSeguridadRef = useRef(null);

  useEffect(() => {
    guardarPuntos(puntos);
  }, [puntos]);

  useEffect(() => {
    guardarHistorial(historial);
  }, [historial]);

  useEffect(() => {
    return () => {
      if (timeoutSeguridadRef.current) {
        clearTimeout(timeoutSeguridadRef.current);
      }
    };
  }, []);

  const puedeGirar = !girando && puntos >= COSTO_GIRO_PUNTOS;

  const finalizarGiro = () => {
    const giro = giroActivoRef.current;
    if (!giro || giro.finalizado) return;

    giro.finalizado = true;
    giroActivoRef.current = null;

    if (timeoutSeguridadRef.current) {
      clearTimeout(timeoutSeguridadRef.current);
      timeoutSeguridadRef.current = null;
    }

    const premioGanado = giro.premio;
    const puntosGanados = premioGanado.puntosExtra || 0;
    const saldoFinal = giro.saldoTrasCobro + puntosGanados;

    setGirando(false);
    setUltimoPremio(premioGanado);

    if (puntosGanados > 0) {
      setPuntos((prev) => prev + puntosGanados);
    }

    const nuevoRegistro = {
      id: `RUL-${Date.now()}`,
      fecha: new Date().toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      premio: premioGanado.titulo,
      color: premioGanado.color,
      costo: COSTO_GIRO_PUNTOS,
      puntosExtra: puntosGanados,
      saldo: saldoFinal,
    };

    setHistorial((prev) => [nuevoRegistro, ...prev].slice(0, 20));
    setModalPremio(premioGanado);
  };

  const iniciarGiro = () => {
    if (girando || puntos < COSTO_GIRO_PUNTOS) return;

    const totalSegmentos = PREMIOS_RULETA.length;
    const anguloPorSegmento = 360 / totalSegmentos;
    const indiceGanador = Math.floor(Math.random() * totalSegmentos);
    const premioElegido = PREMIOS_RULETA[indiceGanador];

    // Desviación controlada dentro del segmento (máx 30% del ancho para nunca tocar bordes)
    const margenSeguro = anguloPorSegmento * 0.3;
    const jitter = (Math.random() * 2 - 1) * margenSeguro;

    // El segmento i está centrado en i * anguloPorSegmento desde las 12 en punto.
    // Al rotar en sentido horario R grados, el segmento bajo el puntero cumple:
    // R ≡ 360 - indiceGanador * anguloPorSegmento (mod 360).
    const moduloActual = ((rotation % 360) + 360) % 360;
    const objetivoBase = ((360 - indiceGanador * anguloPorSegmento + jitter) % 360 + 360) % 360;
    const delta = (objetivoBase - moduloActual + 360) % 360;
    const vueltasCompletas = 6 * 360;
    const nuevaRotacion = rotation + vueltasCompletas + delta;

    const saldoTrasCobro = puntos - COSTO_GIRO_PUNTOS;

    giroActivoRef.current = {
      indice: indiceGanador,
      premio: premioElegido,
      saldoTrasCobro,
      finalizado: false,
    };

    setModalPremio(null);
    setMensajePuntos('');
    setPuntos(saldoTrasCobro);
    setGirando(true);
    setRotation(nuevaRotacion);

    // Respaldo por si el navegador omite onTransitionEnd
    timeoutSeguridadRef.current = setTimeout(() => {
      finalizarGiro();
    }, 4800);
  };

  const handleAgregarPorCompra = (e) => {
    e.preventDefault();
    if (girando) return;
    const monto = Number(montoCompra);
    if (!Number.isFinite(monto) || monto < PESOS_POR_PUNTO) {
      setMensajePuntos(`Ingresa un monto mínimo de $${PESOS_POR_PUNTO.toLocaleString('es-CO')} para generar puntos.`);
      return;
    }
    const puntosCalculados = Math.floor(monto / PESOS_POR_PUNTO);
    const clienteTexto = nombreCliente.trim() || 'Cliente';
    setPuntos((prev) => prev + puntosCalculados);
    setMensajePuntos(`+${puntosCalculados} pts acreditados a ${clienteTexto}.`);
    setMontoCompra('');
  };

  const handleRecargaRapida = (cantidad) => {
    if (girando) return;
    setPuntos((prev) => prev + cantidad);
    setMensajePuntos(`+${cantidad} puntos sumados al saldo disponible.`);
  };

  const handleReiniciarSistema = () => {
    if (girando) return;
    setPuntos(PUNTOS_INICIALES);
    setHistorial([]);
    setUltimoPremio(null);
    setModalPremio(null);
    setMensajePuntos(`Saldo restablecido a ${PUNTOS_INICIALES} puntos.`);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, -apple-system, sans-serif', maxWidth: '1220px', margin: '0 auto' }}>
      {/* Encabezado de la sección */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ margin: 0, color: '#0A3D4C', fontSize: '1.8rem', fontWeight: '900' }}>
            Ruleta de premios
          </h1>
          <p style={{ margin: '0.3rem 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Sistema de puntos y recompensas para clientes de CORA POS
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '0.55rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              boxShadow: '0 2px 6px rgba(8, 47, 73, 0.05)',
            }}
          >
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
              Puntos disponibles
            </span>
            <span style={{ fontSize: '1.15rem', fontWeight: '900', color: '#06B6D4' }}>
              {puntos} pts
            </span>
          </div>

          <button
            type="button"
            onClick={handleReiniciarSistema}
            disabled={girando}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#0A3D4C',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: girando ? 'not-allowed' : 'pointer',
              opacity: girando ? 0.6 : 1,
            }}
          >
            Reiniciar saldo
          </button>
        </div>
      </div>

      {/* Layout principal: Ruleta a la izquierda, Sistema de Puntos + Historial a la derecha */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1.75rem',
          alignItems: 'start',
        }}
      >
        {/* Tarjeta de la Ruleta */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '2rem 1.5rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.25rem',
          }}
        >
          <RuletaWheel
            premios={PREMIOS_RULETA}
            rotation={rotation}
            girando={girando}
            puedeGirar={puedeGirar}
            costoGiro={COSTO_GIRO_PUNTOS}
            yaGiro={Boolean(ultimoPremio)}
            onGirar={iniciarGiro}
            onTransitionEnd={finalizarGiro}
          />

          {/* Resultado bloqueado visible tras detenerse */}
          {ultimoPremio && !girando && (
            <div
              style={{
                width: '100%',
                background: '#f8fafc',
                border: `2px solid ${ultimoPremio.color}`,
                borderRadius: '14px',
                padding: '0.9rem 1.1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                boxSizing: 'border-box',
              }}
            >
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>
                  Último premio obtenido
                </span>
                <div style={{ fontSize: '1.05rem', fontWeight: '900', color: '#0A3D4C' }}>
                  {ultimoPremio.titulo}
                </div>
              </div>

              <button
                type="button"
                onClick={iniciarGiro}
                disabled={!puedeGirar}
                style={{
                  padding: '0.5rem 0.9rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: puedeGirar ? '#0A3D4C' : '#e2e8f0',
                  color: puedeGirar ? '#ffffff' : '#64748b',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  cursor: puedeGirar ? 'pointer' : 'not-allowed',
                  whiteSpace: 'nowrap',
                }}
              >
                Volver a girar
              </button>
            </div>
          )}
        </div>

        {/* Columna derecha: Sistema de Puntos + Lista de premios + Historial */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Panel del Sistema de Puntos */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '1.5rem',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.06)',
              borderTop: '5px solid #06B6D4',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#0A3D4C' }}>
                  Sistema de Puntos
                </h2>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Cada giro cuesta {COSTO_GIRO_PUNTOS} puntos. Acumula 1 punto por cada ${PESOS_POR_PUNTO} en compras.
                </p>
              </div>
              <div
                style={{
                  background: '#ecfeff',
                  color: '#0891b2',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '10px',
                  fontWeight: '900',
                  fontSize: '1.1rem',
                }}
              >
                {puntos} pts
              </div>
            </div>

            <form onSubmit={handleAgregarPorCompra} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <input
                  type="text"
                  placeholder="Cliente (opcional)"
                  value={nombreCliente}
                  onChange={(e) => setNombreCliente(e.target.value)}
                  style={{
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
                <input
                  type="number"
                  min={PESOS_POR_PUNTO}
                  step="100"
                  placeholder="Valor compra ($)"
                  value={montoCompra}
                  onChange={(e) => setMontoCompra(e.target.value)}
                  style={{
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  type="submit"
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#0A3D4C',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  Sumar puntos por compra
                </button>

                {[25, 50, 100].map((cantidad) => (
                  <button
                    key={cantidad}
                    type="button"
                    onClick={() => handleRecargaRapida(cantidad)}
                    style={{
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      color: '#0A3D4C',
                      fontWeight: '700',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    +{cantidad} pts
                  </button>
                ))}
              </div>
            </form>

            {mensajePuntos && (
              <div
                style={{
                  marginTop: '0.75rem',
                  padding: '0.55rem 0.8rem',
                  borderRadius: '8px',
                  background: '#f0fdfa',
                  border: '1px solid #99f6e4',
                  color: '#0f766e',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                }}
              >
                {mensajePuntos}
              </div>
            )}
          </div>

          {/* Tabla de premios disponibles */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '1.35rem 1.5rem',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.06)',
            }}
          >
            <h3 style={{ margin: '0 0 0.85rem', fontSize: '1rem', fontWeight: '800', color: '#0A3D4C' }}>
              Premios en la ruleta
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.55rem' }}>
              {PREMIOS_RULETA.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.55rem',
                    padding: '0.45rem 0.65rem',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    border: '1px solid #f1f5f9',
                  }}
                >
                  <span
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: item.color,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.titulo}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Historial de giros */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '1.35rem 1.5rem',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.06)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#0A3D4C' }}>
                Historial de giros
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700' }}>
                {historial.length} {historial.length === 1 ? 'registro' : 'registros'}
              </span>
            </div>

            {historial.length === 0 ? (
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>
                Aún no se han realizado giros. Presiona "GIRAR RULETA" para probar suerte.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '220px', overflowY: 'auto' }}>
                {historial.map((reg) => (
                  <div
                    key={reg.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '10px',
                      background: '#f8fafc',
                      borderLeft: `4px solid ${reg.color || '#06B6D4'}`,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a' }}>
                        {reg.premio}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {reg.fecha} · Saldo: {reg.saldo} pts
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        color: reg.puntosExtra > 0 ? '#059669' : '#64748b',
                      }}
                    >
                      {reg.puntosExtra > 0 ? `+${reg.puntosExtra} pts` : `-${reg.costo} pts`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ventana modal del premio obtenido */}
      <ModalPremioRuleta
        premio={modalPremio}
        puntosDisponibles={puntos}
        costoGiro={COSTO_GIRO_PUNTOS}
        puedeVolverAGirar={puedeGirar}
        onCerrar={() => setModalPremio(null)}
        onVolverAGirar={iniciarGiro}
      />
    </div>
  );
}
