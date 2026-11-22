import React, { useState } from 'react';
import { authApi } from '../../services/api';

export default function ModalRegistro({ rolPorDefecto = 'CAJERO', onCerrar }) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [documento, setDocumento] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState(rolPorDefecto);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', error: false });
  const [exito, setExito] = useState(false);

  const handleRegistrar = async (e) => {
    e.preventDefault();
    if (cargando || exito) return;

    if (!email || !password || password.length < 6) {
      setMensaje({ texto: 'Ingresa un correo válido y contraseña de al menos 6 caracteres.', error: true });
      return;
    }

    setCargando(true);
    setMensaje({ texto: '', error: false });

    try {
      await authApi.register({
        nombreUsuario: nombre.trim(),
        apellidoUsuario: apellido.trim() || 'Operador',
        documentoUsuario: documento.trim(),
        emailUsuario: email.trim().toLowerCase(),
        claveUsuario: password,
        rol: rol || 'CAJERO',
      });

      setExito(true);
      setTimeout(() => {
        if (onCerrar) onCerrar();
      }, 2200);
    } catch (error) {
      setMensaje({
        texto: error.message || 'Error al registrar usuario en el servidor.',
        error: true,
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(10, 25, 41, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <style>
        {`
          @keyframes scaleUp {
            0% { transform: scale(0.8); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes checkmark {
            0% { transform: scale(0); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
        `}
      </style>

      <div
        style={{
          backgroundColor: '#ffffff',
          padding: '2rem 1.8rem',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          boxSizing: 'border-box',
          textAlign: 'center',
          animation: 'scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {exito ? (
          <div style={{ padding: '1.5rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                width: '75px',
                height: '75px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.2rem',
                marginBottom: '1.25rem',
                boxShadow: '0 0 25px rgba(16, 185, 129, 0.4)',
                animation: 'checkmark 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
              }}
            >
              ✓
            </div>
            <h2 style={{ margin: '0 0 0.5rem 0', color: '#0A3D4C', fontSize: '1.4rem', fontWeight: '900' }}>
              ¡Registrado con Éxito!
            </h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', fontWeight: '500' }}>
              El operador ha sido registrado en el sistema POS. Ya puedes iniciar sesión.
            </p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ margin: 0, color: '#0A3D4C', fontSize: '1.25rem', fontWeight: '800' }}>
                Registrar Nuevo Operador
              </h2>
              <button
                type="button"
                onClick={onCerrar}
                style={{ background: 'transparent', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: '#94a3b8', fontWeight: 'bold' }}
              >
                ✕
              </button>
            </div>

            {mensaje.texto && (
              <div
                style={{
                  padding: '0.75rem',
                  borderRadius: '10px',
                  fontSize: '0.78rem',
                  marginBottom: '1rem',
                  background: mensaje.error ? '#fee2e2' : '#dcfce7',
                  color: mensaje.error ? '#991b1b' : '#166534',
                  fontWeight: '600',
                  lineHeight: '1.35',
                  textAlign: 'left',
                }}
              >
                {mensaje.texto}
              </div>
            )}

            <form onSubmit={handleRegistrar} style={{ textAlign: 'left' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Juan"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.8rem',
                      fontSize: '0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      boxSizing: 'border-box',
                      backgroundColor: '#f8fafc',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                    Apellido
                  </label>
                  <input
                    type="text"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    placeholder="Ej. Pérez"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.8rem',
                      fontSize: '0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      boxSizing: 'border-box',
                      backgroundColor: '#f8fafc',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                    N° Documento *
                  </label>
                  <input
                    type="text"
                    value={documento}
                    onChange={(e) => setDocumento(e.target.value)}
                    placeholder="1020304050"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.8rem',
                      fontSize: '0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      boxSizing: 'border-box',
                      backgroundColor: '#f8fafc',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                    Rol Asignado
                  </label>
                  <select
                    value={rol}
                    onChange={(e) => setRol(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.6rem',
                      fontSize: '0.82rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      boxSizing: 'border-box',
                      backgroundColor: '#f8fafc',
                      color: '#0f172a',
                      outline: 'none',
                      fontWeight: '600',
                    }}
                  >
                    <option value="CAJERO">Cajero</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                  Correo electrónico *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operador@corapos.com"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.8rem',
                    fontSize: '0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    boxSizing: 'border-box',
                    backgroundColor: '#f8fafc',
                    color: '#0f172a',
                    outline: 'none',
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
                  Contraseña (mínimo 6 caracteres) *
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.8rem',
                    fontSize: '0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    boxSizing: 'border-box',
                    backgroundColor: '#f8fafc',
                    color: '#0f172a',
                    outline: 'none',
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={onCerrar}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cargando}
                  style={{
                    flex: 1.5,
                    padding: '0.75rem',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #0A3D4C 0%, #065F73 100%)',
                    color: '#ffffff',
                    fontWeight: '700',
                    cursor: cargando ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(10, 61, 76, 0.25)',
                    fontSize: '0.85rem',
                  }}
                >
                  {cargando ? 'Registrando...' : 'Crear Cuenta'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
