// Servicio de conexión con la API REST del backend CORA-POS (Node / Express / MongoDB)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Obtener token de autenticación del almacenamiento local
 */
export const getToken = () => localStorage.getItem('cora_pos_token');

/**
 * Guardar token y datos del usuario logueado
 */
export const setSessionData = (token, usuario) => {
  if (token) localStorage.setItem('cora_pos_token', token);
  if (usuario) localStorage.setItem('cora_pos_usuario', JSON.stringify(usuario));
};

/**
 * Limpiar datos de sesión al cerrar sesión
 */
export const clearSessionData = () => {
  localStorage.removeItem('cora_pos_token');
  localStorage.removeItem('cora_pos_usuario');
};

/**
 * Obtener usuario de la sesión actual
 */
export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('cora_pos_usuario');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Helper genérico para peticiones HTTP
 */
async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMsg = (data && data.message) || response.statusText || 'Error en la petición al servidor';
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// ==========================================
// 1. AUTENTICACIÓN Y USUARIOS
// ==========================================
export const authApi = {
  login: async ({ identificador, password, rolEsperado }) => {
    const res = await request('/users/login', {
      method: 'POST',
      body: JSON.stringify({
        identificador: identificador.trim(),
        clave: password,
      }),
    });

    const data = res.data;
    const usuario = data.usuario;
    const token = data.token;

    // Validación de rol si se especificó en el login
    if (rolEsperado && usuario.rol !== rolEsperado) {
      const nombreRolEsperado = rolEsperado === 'ADMIN' ? 'Administrador' : 'Cajero';
      throw new Error(`Acceso denegado: Tu cuenta no tiene permisos para el rol de ${nombreRolEsperado}.`);
    }

    setSessionData(token, usuario);
    return { token, usuario };
  },

  getProfile: async () => {
    try {
      const res = await request('/users/perfil');
      return res.data;
    } catch {
      return null;
    }
  },

  logout: () => {
    clearSessionData();
  },

  register: async (userData) => {
    return await request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
};

// ==========================================
// 2. PRODUCTOS
// ==========================================
export const productosApi = {
  getAll: async () => {
    const res = await request('/productos');
    const items = res.data || [];
    return items.map((p) => ({
      id: p._id,
      _id: p._id,
      nombre: p.nombreProductos,
      nombreProductos: p.nombreProductos,
      descripcion: p.descripcionProductos || '',
      precio: p.precioVenta || 0,
      precioVenta: p.precioVenta || 0,
      stock: p.totalStock ?? 0,
      totalStock: p.totalStock ?? 0,
      stockMinimo: p.stockMinimo ?? 5,
      stockCritico: p.stockCritico ?? false,
      codigo: p.sku || '',
      codigo_barras: p.sku || '',
      sku: p.sku || '',
      categoria_id: p.categoria?._id || p.categoria,
      categoria: p.categoria?.nombreCategoria || (typeof p.categoria === 'string' ? p.categoria : 'General'),
      iva: p.ivaProductos ?? 0,
      costo: 0,
      imagen_url: '',
      unidad_medida: 'und',
    }));
  },

  create: async (data) => {
    const skuGenerado = (data.codigo_barras || data.codigo || data.sku || `SKU-${Date.now().toString().slice(-6)}`).toUpperCase().trim();
    const payload = {
      sku: skuGenerado,
      nombreProductos: (data.nombre || data.nombreProductos || '').trim(),
      descripcionProductos: data.descripcion || data.descripcionProductos || '',
      precioVenta: Number(data.precio ?? data.precioVenta ?? 0),
      ivaProductos: Number(data.iva ?? data.ivaProductos ?? 0),
      categoria: data.categoria_id || data.categoria,
      totalStock: Number(data.stock ?? data.totalStock ?? 0),
      stockMinimo: Number(data.stockMinimo ?? 5),
    };

    const res = await request('/productos', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  update: async (id, data) => {
    const payload = {};
    if (data.nombre || data.nombreProductos) payload.nombreProductos = (data.nombre || data.nombreProductos).trim();
    if (data.precio !== undefined || data.precioVenta !== undefined) payload.precioVenta = Number(data.precio ?? data.precioVenta);
    if (data.codigo_barras || data.codigo || data.sku) payload.sku = (data.codigo_barras || data.codigo || data.sku).toUpperCase().trim();
    if (data.categoria_id || data.categoria) payload.categoria = data.categoria_id || data.categoria;
    if (data.stock !== undefined || data.totalStock !== undefined) payload.totalStock = Number(data.stock ?? data.totalStock);
    if (data.stockMinimo !== undefined) payload.stockMinimo = Number(data.stockMinimo);
    if (data.descripcion !== undefined) payload.descripcionProductos = data.descripcion;

    const res = await request(`/productos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  delete: async (id) => {
    const res = await request(`/productos/${id}`, {
      method: 'DELETE',
    });
    return res.data;
  },
};

// ==========================================
// 3. CATEGORÍAS
// ==========================================
export const categoriasApi = {
  getAll: async () => {
    const res = await request('/categorias');
    const items = res.data || [];
    return items.map((c) => ({
      id: c._id,
      _id: c._id,
      nombre: c.nombreCategoria,
      nombreCategoria: c.nombreCategoria,
      descripcion: c.descripcion || '',
    }));
  },

  create: async ({ nombre, descripcion = '' }) => {
    const res = await request('/categorias', {
      method: 'POST',
      body: JSON.stringify({
        nombreCategoria: nombre.trim(),
        descripcion: descripcion.trim(),
      }),
    });
    const item = res.data;
    return {
      id: item._id,
      _id: item._id,
      nombre: item.nombreCategoria,
      nombreCategoria: item.nombreCategoria,
      descripcion: item.descripcion || '',
    };
  },

  delete: async (id) => {
    const res = await request(`/categorias/${id}`, {
      method: 'DELETE',
    });
    return res.data;
  },
};

// ==========================================
// 4. CLIENTES Y FORMAS DE PAGO (AUXILIARES)
// ==========================================
export const clientesApi = {
  getAll: async () => {
    try {
      const res = await request('/clientes');
      return res.data || [];
    } catch {
      try {
        const res = await request('/terceros');
        return res.data || [];
      } catch {
        return [];
      }
    }
  },
};

export const formasDePagoApi = {
  getAll: async () => {
    try {
      const res = await request('/formas-de-pago');
      return res.data || [];
    } catch {
      return [];
    }
  },
};

// ==========================================
// 5. VENTAS
// ==========================================
export const ventasApi = {
  getAll: async () => {
    const res = await request('/ventas');
    const items = res.data || [];
    return items.map((v) => ({
      id: v._id,
      _id: v._id,
      total: v.totalVentas || 0,
      totalVentas: v.totalVentas || 0,
      subtotal: v.subTotalVentas || 0,
      descuento: v.descuento || 0,
      iva: v.ivaVentas || 0,
      metodo_pago: v.formaDePago?.descripcionFormaDePago || (typeof v.formaDePago === 'string' ? v.formaDePago : 'Efectivo'),
      monto_recibido: v.totalVentas || 0,
      cambio: 0,
      created_at: v.createdAt,
      createdAt: v.createdAt,
      cajero: v.cajero,
      cliente: v.cliente,
      estadoVentas: v.estadoVentas,
    }));
  },

  getById: async (id) => {
    const res = await request(`/ventas/${id}`);
    const v = res.data;
    return {
      ...v,
      id: v._id,
      _id: v._id,
      total: v.totalVentas,
      metodo_pago: v.formaDePago?.descripcionFormaDePago || 'Efectivo',
      monto_recibido: v.totalVentas,
      cambio: 0,
      created_at: v.createdAt,
      detalles: (v.detalles || []).map((d) => ({
        ...d,
        cantidad: d.cantidadVenta,
        precio_unitario: d.valorUnitarioVenta,
        subtotal: d.subTotalVenta,
        productos: {
          nombre: d.producto?.nombreProductos || d.producto?.nombre || 'Producto',
        },
      })),
    };
  },

  create: async ({ total, metodoPago, montoRecibido, cambio, items }) => {
    // 1. Obtener un cliente válido existente en la base de datos
    let clienteId = null;
    try {
      const clientes = await clientesApi.getAll();
      if (clientes && clientes.length > 0) {
        clienteId = clientes[0]._id || clientes[0].id;
      }
    } catch (e) {
      console.warn('No se pudieron consultar clientes:', e);
    }

    // 2. Obtener una forma de pago válida o enviar la descripción
    let formaDePagoVal = metodoPago || 'Efectivo';
    try {
      const formas = await formasDePagoApi.getAll();
      const encontrada = formas.find(
        (f) => f.descripcionFormaDePago?.toLowerCase() === (metodoPago || '').toLowerCase()
      );
      if (encontrada) {
        formaDePagoVal = encontrada._id;
      } else if (formas.length > 0) {
        formaDePagoVal = formas[0]._id;
      }
    } catch (e) {
      console.warn('No se pudieron consultar formas de pago:', e);
    }

    const payload = {
      cliente: clienteId,
      formaDePago: formaDePagoVal,
      totalVentas: Number(total),
      subTotalVentas: Number(total),
      items: items.map((it) => ({
        producto: it.id || it._id,
        cantidadVenta: Number(it.cantidad),
        valorUnitarioVenta: Number(it.precio),
      })),
    };

    const res = await request('/ventas', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },
};

export default {
  auth: authApi,
  productos: productosApi,
  categorias: categoriasApi,
  ventas: ventasApi,
  clientes: clientesApi,
  formasDePago: formasDePagoApi,
  getToken,
  setSessionData,
  clearSessionData,
  getStoredUser,
};
