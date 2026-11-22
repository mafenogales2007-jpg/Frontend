import React, { useState } from 'react';
import { authApi } from '../../services/api';
import ModalRegistro from './ModalRegistro';

export default function Login({ onLoginSuccess }) {
  const [rolSeleccionado, setRolSeleccionado] = useState('CAJERO'); // 'CAJERO' | 'ADMIN'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', error: false });
  const [mostrarModalRegistro, setMostrarModalRegistro] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje({ texto: '', error: false });

    try {
      const { usuario } = await authApi.login({
        identificador: email,
        password,
        rolEsperado: rolSeleccionado,
      });

      if (onLoginSuccess) {
        onLoginSuccess(usuario);
      }
    } catch (error) {
      setMensaje({
        texto: error.message || 'Error al iniciar sesión. Verifica tus credenciales.',
        error: true,
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        backgroundImage: `linear-gradient(135deg, rgba(10, 61, 76, 0.88) 0%, rgba(6, 26, 33, 0.92) 100%), url('https://5aldia.cl/wp-content/uploads/2018/04/frutas.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        boxSizing: 'border-box',
        padding: '1rem',
      }}
    >
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(10px)',
          padding: '2.2rem 2rem',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
          boxSizing: 'border-box',
          textAlign: 'center',
        }}
      >
        {/* Logotipo */}
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: '#0A3D4C',
            color: '#06B6D4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '900',
            fontSize: '1.2rem',
            margin: '0 auto 0.75rem auto',
            boxShadow: '0 0 15px rgba(6, 182, 212, 0.3)',
          }}
        >
          CP
        </div>

        <h2 style={{ color: '#0A3D4C', fontSize: '1.4rem', fontWeight: '800', margin: '0 0 0.2rem 0', letterSpacing: '-0.02em' }}>
          CORA POS
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '0 0 1.25rem 0', fontWeight: '500' }}>
          Ingresa tus credenciales de acceso
        </p>

        {/* Apartado para selección de Roles */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#475569', marginBottom: '0.4rem', textAlign: 'left' }}>
            Selecciona tu Rol de Acceso
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => {
                setRolSeleccionado('CAJERO');
                setMensaje({ texto: '', error: false });
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                padding: '0.65rem 0.8rem',
                borderRadius: '12px',
                border: rolSeleccionado === 'CAJERO' ? '2px solid #06B6D4' : '1px solid #cbd5e1',
                background: rolSeleccionado === 'CAJERO' ? '#0A3D4C' : '#f8fafc',
                color: rolSeleccionado === 'CAJERO' ? '#ffffff' : '#475569',
                fontSize: '0.82rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: rolSeleccionado === 'CAJERO' ? '0 4px 10px rgba(6, 182, 212, 0.2)' : 'none',
              }}
            >
              <span>🛒</span> Cajero
            </button>

            <button
              type="button"
              onClick={() => {
                setRolSeleccionado('ADMIN');
                setMensaje({ texto: '', error: false });
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                padding: '0.65rem 0.8rem',
                borderRadius: '12px',
                border: rolSeleccionado === 'ADMIN' ? '2px solid #06B6D4' : '1px solid #cbd5e1',
                background: rolSeleccionado === 'ADMIN' ? '#0A3D4C' : '#f8fafc',
                color: rolSeleccionado === 'ADMIN' ? '#ffffff' : '#475569',
                fontSize: '0.82rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: rolSeleccionado === 'ADMIN' ? '0 4px 10px rgba(6, 182, 212, 0.2)' : 'none',
              }}
            >
              <span>🛡️</span> Administrador
            </button>
          </div>
        </div>

        {mensaje.texto && (
          <div
            style={{
              padding: '0.75rem',
              borderRadius: '10px',
              fontSize: '0.75rem',
              marginBottom: '1.25rem',
              background: mensaje.error ? '#fee2e2' : '#dcfce7',
              color: mensaje.error ? '#991b1b' : '#166534',
              fontWeight: '600',
              lineHeight: '1.4',
            }}
          >
            {mensaje.texto}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
              Correo electrónico o Documento
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={rolSeleccionado === 'ADMIN' ? 'admin@corapos.com' : 'cajero@corapos.com'}
              style={{
                width: '100%',
                padding: '0.75rem 0.9rem',
                fontSize: '0.9rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                boxSizing: 'border-box',
                backgroundColor: '#f8fafc',
                color: '#0f172a',
                outline: 'none',
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '0.75rem 0.9rem',
                fontSize: '0.9rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                boxSizing: 'border-box',
                backgroundColor: '#f8fafc',
                color: '#0f172a',
                outline: 'none',
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #0A3D4C 0%, #065F73 100%)',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '0.9rem',
              cursor: cargando ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(10, 61, 76, 0.3)',
              marginBottom: '1rem',
            }}
          >
            {cargando ? 'Verificando...' : `Iniciar Sesión como ${rolSeleccionado === 'ADMIN' ? 'Administrador' : 'Cajero'}`}
          </button>
        </form>

        {/* Enlace para abrir el modal de registro */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
          <button
            type="button"
            onClick={() => setMostrarModalRegistro(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#06B6D4',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            ¿No tienes cuenta? Registrar operador
          </button>
        </div>
      </div>

      {/* Modal independiente de Registro */}
      {mostrarModalRegistro && (
        <ModalRegistro
          rolPorDefecto={rolSeleccionado}
          onCerrar={() => setMostrarModalRegistro(false)}
        />
      )}
    </div>
  );
}
