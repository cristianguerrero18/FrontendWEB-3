/**
 * Sistema de almacenamiento global de tokens decodificados
 * Maneja tokens de múltiples usuarios con persistencia en localStorage
 */

// Clave para localStorage
const TOKEN_STORAGE_KEY = 'global_token_store_v2';

// Estructura del almacenamiento
const createEmptyStore = () => ({
  users: {},
  currentUserId: null,
  lastUpdated: null,
  version: '2.0'
});

// Cargar almacenamiento desde localStorage
const loadStore = () => {
  try {
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validar estructura
      if (parsed.version === '2.0' && parsed.users) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('❌ Error cargando almacenamiento global:', error);
  }
  // Si hay error o no existe, crear uno nuevo
  return createEmptyStore();
};

// Guardar almacenamiento en localStorage
const saveStore = (store) => {
  try {
    store.lastUpdated = new Date().toISOString();
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(store));
  } catch (error) {
    console.error('❌ Error guardando almacenamiento global:', error);
  }
};

// Decodificar token JWT (con manejo de errores)
const decodeTokenSafely = (token) => {
  try {
    // Método seguro para decodificar base64
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('❌ Error decodificando token:', error);
    return null;
  }
};

// ======================
// FUNCIONES PRINCIPALES
// ======================

/**
 * Almacena un token decodificado para un usuario
 * @param {string} userId - ID del usuario
 * @param {string} token - Token JWT
 * @param {Object} userData - Datos del usuario del servidor
 * @param {Object} carreraData - Datos de carrera (opcional)
 */
export const storeUserToken = (userId, token, userData, carreraData = null) => {
  const store = loadStore();
  const decodedToken = decodeTokenSafely(token);
  
  if (!decodedToken) {
    return null;
  }
  
  // Crear entrada del usuario
  const userEntry = {
    userId,
    email: userData?.correo || decodedToken.email,
    // Corregido: usar nombres_usuario y apellidos_usuario
    nombre: userData?.nombres_usuario 
      ? `${userData.nombres_usuario} ${userData.apellidos_usuario || ''}`.trim()
      : decodedToken.nombre || 'Usuario',
    id_rol: userData?.id_rol || decodedToken.id_rol,
    token: token.substring(0, 50) + '...', // Solo guardamos parte del token por seguridad
    decodedToken,
    userData,
    carreraData,
    loginTime: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    isActive: true
  };
  
  // Agregar o actualizar usuario
  store.users[userId] = userEntry;
  store.currentUserId = userId;
  
  saveStore(store);
  
  return userEntry;
};

/**
 * Obtiene el token decodificado de un usuario específico
 * @param {string} userId - ID del usuario
 */
export const getUserTokenData = (userId) => {
  const store = loadStore();
  const userData = store.users[userId];
  
  if (userData) {
    // Actualizar última actividad
    userData.lastActivity = new Date().toISOString();
    saveStore(store);
  }
  
  return userData || null;
};

/**
 * Obtiene el usuario actualmente activo
 */
export const getCurrentUser = () => {
  const store = loadStore();
  
  if (store.currentUserId && store.users[store.currentUserId]) {
    const userData = store.users[store.currentUserId];
    // Actualizar última actividad
    userData.lastActivity = new Date().toISOString();
    saveStore(store);
    
    return userData;
  }
  
  return null;
};

/**
 * Obtiene todos los usuarios almacenados
 */
export const getAllUsers = () => {
  const store = loadStore();
  return Object.values(store.users);
};

/**
 * Actualiza la actividad de un usuario
 * @param {string} userId - ID del usuario
 */
export const updateUserActivity = (userId) => {
  const store = loadStore();
  
  if (store.users[userId]) {
    store.users[userId].lastActivity = new Date().toISOString();
    saveStore(store);
    return true;
  }
  
  return false;
};

/**
 * Cierra sesión de un usuario (marca como inactivo)
 * @param {string} userId - ID del usuario
 */
export const logoutUser = (userId) => {
  const store = loadStore();
  
  if (store.users[userId]) {
    // Marcar como inactivo
    store.users[userId].isActive = false;
    store.users[userId].logoutTime = new Date().toISOString();
    
    // Si es el usuario actual, limpiar currentUserId
    if (store.currentUserId === userId) {
      store.currentUserId = null;
    }
    
    saveStore(store);
    
    return true;
  }
  
  return false;
};

/**
 * Elimina completamente un usuario del almacenamiento
 * @param {string} userId - ID del usuario
 */
export const removeUser = (userId) => {
  const store = loadStore();
  
  if (store.users[userId]) {
    const userData = store.users[userId];
    delete store.users[userId];
    
    // Si es el usuario actual, limpiar currentUserId
    if (store.currentUserId === userId) {
      store.currentUserId = null;
    }
    
    saveStore(store);
    
    return true;
  }
  
  return false;
};

/**
 * Limpia completamente el almacenamiento global
 */
export const clearGlobalStore = () => {
  const emptyStore = createEmptyStore();
  saveStore(emptyStore);
  return true;
};

/**
 * Obtiene estadísticas del almacenamiento
 */
export const getStorageStats = () => {
  const store = loadStore();
  const users = Object.values(store.users);
  
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isActive).length,
    inactiveUsers: users.filter(u => !u.isActive).length,
    lastUpdated: store.lastUpdated,
    currentUser: store.currentUserId,
    usersByRole: {
      1: users.filter(u => u.id_rol === 1).length,
      2: users.filter(u => u.id_rol === 2).length,
      3: users.filter(u => u.id_rol === 3).length
    }
  };
  
  return stats;
};

/**
 * Verifica si un token está expirado
 * @param {string} userId - ID del usuario
 */
export const isTokenExpired = (userId) => {
  const userData = getUserTokenData(userId);
  
  if (!userData || !userData.decodedToken || !userData.decodedToken.exp) {
    return true;
  }
  
  const now = Math.floor(Date.now() / 1000);
  const isExpired = userData.decodedToken.exp < now;
  
  if (isExpired && userData.isActive) {
    // Marcar automáticamente como inactivo si está expirado
    logoutUser(userId);
  }
  
  return isExpired;
};

/**
 * Obtiene usuarios con tokens próximos a expirar (menos de 5 minutos)
 */
export const getExpiringTokens = (minutes = 5) => {
  const users = getAllUsers();
  const now = Math.floor(Date.now() / 1000);
  const threshold = minutes * 60;
  
  return users.filter(user => {
    if (!user.decodedToken || !user.decodedToken.exp || !user.isActive) {
      return false;
    }
    
    const timeLeft = user.decodedToken.exp - now;
    return timeLeft > 0 && timeLeft < threshold;
  });
};

// ======================
// FUNCIÓN DE DEPURACIÓN (solo para desarrollo)
// ======================

/**
 * Función de depuración - Solo usar en desarrollo
 */
export const debugStorage = () => {
  if (process.env.NODE_ENV !== 'development') return null;
  
  const store = loadStore();
  const stats = getStorageStats();
  
  console.log('🔍 ===== DEBUG ALMACENAMIENTO GLOBAL =====');
  console.log('📊 Estadísticas:', stats);
  
  Object.values(store.users).forEach((user, index) => {
    console.log(`👤 Usuario ${index + 1}:`, {
      userId: user.userId,
      nombre: user.nombre,
      email: user.email,
      id_rol: user.id_rol,
      isActive: user.isActive
    });
  });
  
  console.log('🔍 ======================================');
  
  return store;
};

export default {
  storeUserToken,
  getUserTokenData,
  getCurrentUser,
  getAllUsers,
  updateUserActivity,
  logoutUser,
  removeUser,
  clearGlobalStore,
  getStorageStats,
  isTokenExpired,
  getExpiringTokens,
  debugStorage
};