import axios from 'axios';

// Configuration for notification management API
const notificationApiClient = axios.create({
  baseURL: 'https://lab.vallegrande.edu.pe/school/ms-grade/notifications',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000 // 10 segundos de timeout
});

// Interceptor para manejar errores
notificationApiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.error('Error de respuesta:', error.response.data);
    } else if (error.request) {
      console.error('Error de red:', error.message);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

const notificationService = {
  /**
   * Obtiene todas las notificaciones
   * @returns {Promise<Array>} Lista de notificaciones
   */
  async getAllNotifications() {
    try {
      const response = await notificationApiClient.get("");
      return response.data || [];
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      
      // Si es un error 404, devolver array vacío en lugar de fallar
      if (error.response && error.response.status === 404) {
        console.warn('Endpoint de notificaciones no encontrado, devolviendo array vacío');
        return [];
      }
      
      throw error;
    }
  },

  /**
   * Obtiene una notificación por ID
   * @param {string} id - ID de la notificación
   * @returns {Promise<Object>} Notificación encontrada
   */
  async getNotificationById(id) {
    try {
      const response = await notificationApiClient.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener notificación ${id}:`, error);
      if (error.response && error.response.status === 404) {
        console.warn(`Notificación ${id} no encontrada`);
        return null;
      }
      throw error;
    }
  },

  /**
   * Obtiene notificaciones por ID de destinatario
   * @param {string} recipientId - ID del destinatario
   * @returns {Promise<Array>} Lista de notificaciones del destinatario
   */
  async getNotificationsByRecipientId(recipientId) {
    try {
      const response = await notificationApiClient.get(`/recipient/${recipientId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener notificaciones del destinatario ${recipientId}:`, error);
      throw error;
    }
  },

  /**
   * Obtiene notificaciones por tipo
   * @param {string} type - Tipo de notificación
   * @returns {Promise<Array>} Lista de notificaciones del tipo
   */
  async getNotificationsByType(type) {
    try {
      const response = await notificationApiClient.get(`/type/${type}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener notificaciones del tipo ${type}:`, error);
      throw error;
    }
  },

  /**
   * Obtiene notificaciones por estado
   * @param {string} status - Estado de la notificación
   * @returns {Promise<Array>} Lista de notificaciones con el estado
   */
  async getNotificationsByStatus(status) {
    try {
      const response = await notificationApiClient.get(`/status/${status}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener notificaciones con estado ${status}:`, error);
      throw error;
    }
  },

  /**
   * Obtiene notificaciones no leídas por destinatario
   * @param {string} recipientId - ID del destinatario
   * @returns {Promise<Array>} Lista de notificaciones no leídas
   */
  async getUnreadNotifications(recipientId) {
    try {
      const response = await notificationApiClient.get(`/recipient/${recipientId}/unread`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener notificaciones no leídas para ${recipientId}:`, error);
      throw error;
    }
  },

  /**
   * Crea una nueva notificación
   * @param {Object} notificationData - Datos de la notificación
   * @returns {Promise<Object>} Notificación creada
   */
  async createNotification(notificationData) {
    try {
      const response = await notificationApiClient.post('', notificationData);
      return response.data;
    } catch (error) {
      console.error('Error al crear notificación:', error);
      throw error;
    }
  },

  /**
   * Actualiza una notificación existente
   * @param {string} id - ID de la notificación
   * @param {Object} notificationData - Datos actualizados de la notificación
   * @returns {Promise<Object>} Notificación actualizada
   */
  async updateNotification(id, notificationData) {
    try {
      const response = await notificationApiClient.put(`/${id}`, notificationData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar notificación ${id}:`, error);
      throw error;
    }
  },

  /**
   * Marca una notificación como leída
   * @param {string} id - ID de la notificación
   * @returns {Promise<Object>} Notificación marcada como leída
   */
  async markAsRead(id) {
    try {
      const response = await notificationApiClient.put(`/${id}/read`);
      return response.data;
    } catch (error) {
      console.error(`Error al marcar notificación ${id} como leída:`, error);
      throw error;
    }
  },

  /**
   * Marca múltiples notificaciones como leídas
   * @param {Array<string>} ids - Array de IDs de notificaciones
   * @returns {Promise<Array>} Notificaciones marcadas como leídas
   */
  async markMultipleAsRead(ids) {
    try {
      // Marcar individualmente cada notificación como leída
      const promises = ids.map(id => this.markAsRead(id));
      const results = await Promise.all(promises);
      return results;
    } catch (error) {
      console.error('Error al marcar múltiples notificaciones como leídas:', error);
      throw error;
    }
  },

  /**
   * Reenvía una notificación
   * @param {string} id - ID de la notificación
   * @returns {Promise<Object>} Resultado del reenvío
   */
  async resendNotification(id) {
    try {
      const response = await notificationApiClient.post(`/${id}/resend`);
      return response.data;
    } catch (error) {
      console.error(`Error al reenviar notificación ${id}:`, error);
      throw error;
    }
  },

  /**
   * Elimina lógicamente una notificación
   * @param {string} id - ID de la notificación
   * @returns {Promise<Object>} Notificación eliminada
   */
  async deleteNotification(id) {
    try {
      const response = await notificationApiClient.delete(`/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar notificación ${id}:`, error);
      throw error;
    }
  },

  /**
   * Restaura una notificación eliminada lógicamente
   * @param {string} id - ID de la notificación
   * @returns {Promise<Object>} Notificación restaurada
   */
  async restoreNotification(id) {
    try {
      const response = await notificationApiClient.put(`/${id}/restore`);
      return response.data;
    } catch (error) {
      console.error(`Error al restaurar notificación ${id}:`, error);
      throw error;
    }
  },

  /**
   * Obtiene todas las notificaciones inactivas
   * @returns {Promise<Array>} Lista de notificaciones inactivas
   */
  async getAllInactiveNotifications() {
    try {
      // Como el endpoint /inactive no existe, intentamos obtener todas las notificaciones
      // y filtrar por estado eliminado en el frontend
      const response = await notificationApiClient.get("?deleted=true");
      return response.data || [];
    } catch (error) {
      console.error('Error al obtener notificaciones inactivas:', error);
      
      // Si el parámetro deleted no funciona, intentamos obtener todas y filtrar
      try {
        console.warn('Intentando obtener todas las notificaciones para filtrar eliminadas...');
        const allResponse = await notificationApiClient.get("");
        const allNotifications = allResponse.data || [];
        // Filtrar las notificaciones que tienen el campo deleted = true
        return allNotifications.filter(notification => notification.deleted === true);
      } catch (fallbackError) {
        console.error('Error en fallback:', fallbackError);
        // Si es un error 404, devolver array vacío
        if (error.response && error.response.status === 404) {
          console.warn('Endpoint de notificaciones inactivas no encontrado, devolviendo array vacío');
          return [];
        }
        throw error;
      }
    }
  },

  /**
   * Obtiene estadísticas de notificaciones
   * @returns {Promise<Object>} Estadísticas de notificaciones
   */
  async getNotificationStats() {
    try {
      const response = await notificationApiClient.get('/stats');
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas de notificaciones:', error);
      throw error;
    }
  },

  /**
   * Crea notificaciones en lote
   * @param {Array} notifications - Lista de notificaciones a crear
   * @returns {Promise<Array>} Lista de notificaciones creadas
   */
  async createBulkNotifications(notifications) {
    try {
      const promises = notifications.map(notification => 
        notificationApiClient.post('', notification)
      );
      const responses = await Promise.all(promises);
      return responses.map(response => response.data);
    } catch (error) {
      console.error('Error al crear notificaciones en lote:', error);
      throw error;
    }
  },

  /**
   * Envía notificaciones masivas
   * @param {Object} massNotificationData - Datos para notificación masiva
   * @returns {Promise<Object>} Resultado del envío masivo
   */
  async sendMassNotification(massNotificationData) {
    try {
      const response = await notificationApiClient.post('/mass-send', massNotificationData);
      return response.data;
    } catch (error) {
      console.error('Error al enviar notificación masiva:', error);
      throw error;
    }
  }
};

export { notificationService };
