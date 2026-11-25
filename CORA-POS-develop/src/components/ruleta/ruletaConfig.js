export const COSTO_GIRO_PUNTOS = 25;
export const PUNTOS_INICIALES = 100;
export const PESOS_POR_PUNTO = 100; // $100 COP = 1 punto (ej: $5.000 = 50 pts)

export const STORAGE_KEYS = {
  PUNTOS: 'cora_pos_puntos_cliente',
  HISTORIAL: 'cora_pos_ruleta_historial',
};

export const PREMIOS_RULETA = [
  {
    id: 'desc-10',
    titulo: '10% Descuento',
    etiquetaCorta: '10% DCTO',
    descripcion: 'Aplica 10% de descuento en la próxima compra del cliente.',
    color: '#06B6D4',
    colorTexto: '#FFFFFF',
    puntosExtra: 0,
    tipo: 'descuento',
  },
  {
    id: 'pts-50',
    titulo: '+50 Puntos',
    etiquetaCorta: '+50 PTS',
    descripcion: '¡Bonificación directa sumada al saldo de puntos del cliente!',
    color: '#10B981',
    colorTexto: '#FFFFFF',
    puntosExtra: 50,
    tipo: 'puntos',
  },
  {
    id: 'envio-gratis',
    titulo: 'Empaque Gratis',
    etiquetaCorta: 'EMPAQUE',
    descripcion: 'Empaque especial o domicilio sin costo adicional.',
    color: '#F59E0B',
    colorTexto: '#FFFFFF',
    puntosExtra: 0,
    tipo: 'beneficio',
  },
  {
    id: 'bebida-2x1',
    titulo: '2x1 en Bebidas',
    etiquetaCorta: '2x1 BEBIDA',
    descripcion: 'Lleva 2 bebidas seleccionadas por el precio de 1.',
    color: '#8B5CF6',
    colorTexto: '#FFFFFF',
    puntosExtra: 0,
    tipo: 'promocion',
  },
  {
    id: 'bono-5000',
    titulo: 'Bono $5.000',
    etiquetaCorta: 'BONO $5K',
    descripcion: 'Bono redimible de $5.000 en productos de la tienda.',
    color: '#EF4444',
    colorTexto: '#FFFFFF',
    puntosExtra: 0,
    tipo: 'bono',
  },
  {
    id: 'pts-100',
    titulo: '+100 Puntos',
    etiquetaCorta: '+100 PTS',
    descripcion: '¡Premio mayor en puntos! Se acreditan al instante.',
    color: '#3B82F6',
    colorTexto: '#FFFFFF',
    puntosExtra: 100,
    tipo: 'puntos',
  },
  {
    id: 'sorpresa',
    titulo: 'Regalo Sorpresa',
    etiquetaCorta: 'SORPRESA',
    descripcion: 'Obsequio sorpresa cortesía de la tienda en caja.',
    color: '#EC4899',
    colorTexto: '#FFFFFF',
    puntosExtra: 0,
    tipo: 'regalo',
  },
  {
    id: 'desc-20',
    titulo: '20% Descuento',
    etiquetaCorta: '20% DCTO',
    descripcion: '¡Gran premio! 20% de descuento en el total de la compra.',
    color: '#14B8A6',
    colorTexto: '#FFFFFF',
    puntosExtra: 0,
    tipo: 'descuento',
  },
];

export function leerPuntosGuardados() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PUNTOS);
    if (raw === null) return PUNTOS_INICIALES;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : PUNTOS_INICIALES;
  } catch {
    return PUNTOS_INICIALES;
  }
}

export function guardarPuntos(puntos) {
  try {
    localStorage.setItem(STORAGE_KEYS.PUNTOS, String(Math.max(0, Math.floor(puntos))));
  } catch {
    // Ignorar errores de almacenamiento en entornos restringidos
  }
}

export function leerHistorialGuardado() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORIAL);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function guardarHistorial(historial) {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORIAL, JSON.stringify(historial.slice(0, 20)));
  } catch {
    // Ignorar errores de almacenamiento en entornos restringidos
  }
}
