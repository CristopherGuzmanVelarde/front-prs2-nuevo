/**
 * Utilidades para el módulo de notificaciones
 */

/**
 * Formatea una fecha para mostrar en notificaciones
 * @param {string} dateString - Fecha en formato ISO
 * @param {boolean} includeTime - Si incluir la hora
 * @returns {string} Fecha formateada
 */
export const formatNotificationDate = (dateString, includeTime = true) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(includeTime && {
      hour: '2-digit',
      minute: '2-digit'
    })
  };
  
  return date.toLocaleDateString('es-ES', options);
};

/**
 * Obtiene el tiempo relativo desde una fecha
 * @param {string} dateString - Fecha en formato ISO
 * @returns {string} Tiempo relativo (ej: "hace 2 horas")
 */
export const getRelativeTime = (dateString) => {
  if (!dateString) return 'Fecha desconocida';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Ahora mismo';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `Hace ${days} día${days > 1 ? 's' : ''}`;
  } else {
    return formatNotificationDate(dateString, false);
  }
};

/**
 * Obtiene el icono apropiado para un tipo de notificación
 * @param {string} notificationType - Tipo de notificación
 * @returns {string} Clase CSS del icono
 */
export const getNotificationIcon = (notificationType) => {
  const iconMap = {
    'GRADE_PUBLISHED': 'fa-graduation-cap',
    'GRADE_UPDATED': 'fa-edit',
    'LOW_PERFORMANCE': 'fa-exclamation-triangle',
    'ATTENDANCE_ALERT': 'fa-calendar-times',
    'ENROLLMENT_CONFIRMATION': 'fa-user-check',
    'PAYMENT_REMINDER': 'fa-credit-card',
    'SYSTEM_MAINTENANCE': 'fa-tools',
    'GENERAL_ANNOUNCEMENT': 'fa-bullhorn'
  };
  
  return iconMap[notificationType] || 'fa-bell';
};

/**
 * Obtiene el color del tema para un tipo de notificación
 * @param {string} notificationType - Tipo de notificación
 * @returns {string} Clase CSS de color
 */
export const getNotificationThemeColor = (notificationType) => {
  const colorMap = {
    'GRADE_PUBLISHED': 'success',
    'GRADE_UPDATED': 'info',
    'LOW_PERFORMANCE': 'warning',
    'ATTENDANCE_ALERT': 'danger',
    'ENROLLMENT_CONFIRMATION': 'primary',
    'PAYMENT_REMINDER': 'warning',
    'SYSTEM_MAINTENANCE': 'secondary',
    'GENERAL_ANNOUNCEMENT': 'primary'
  };
  
  return colorMap[notificationType] || 'secondary';
};

/**
 * Obtiene la prioridad de una notificación basada en su tipo
 * @param {string} notificationType - Tipo de notificación
 * @returns {number} Prioridad (1=alta, 2=media, 3=baja)
 */
export const getNotificationPriority = (notificationType) => {
  const priorityMap = {
    'LOW_PERFORMANCE': 1,
    'ATTENDANCE_ALERT': 1,
    'PAYMENT_REMINDER': 1,
    'GRADE_PUBLISHED': 2,
    'GRADE_UPDATED': 2,
    'ENROLLMENT_CONFIRMATION': 2,
    'SYSTEM_MAINTENANCE': 3,
    'GENERAL_ANNOUNCEMENT': 3
  };
  
  return priorityMap[notificationType] || 3;
};

/**
 * Filtra notificaciones por múltiples criterios
 * @param {Array} notifications - Array de notificaciones
 * @param {Object} filters - Filtros a aplicar
 * @returns {Array} Notificaciones filtradas
 */
export const filterNotifications = (notifications, filters) => {
  return notifications.filter(notification => {
    // Filtro por texto de búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesMessage = notification.message.toLowerCase().includes(searchLower);
      const matchesType = notification.notificationType.toLowerCase().includes(searchLower);
      if (!matchesMessage && !matchesType) return false;
    }
    
    // Filtro por tipo de destinatario
    if (filters.recipientType && filters.recipientType !== 'all') {
      if (notification.recipientType !== filters.recipientType) return false;
    }
    
    // Filtro por tipo de notificación
    if (filters.notificationType && filters.notificationType !== 'all') {
      if (notification.notificationType !== filters.notificationType) return false;
    }
    
    // Filtro por estado
    if (filters.status && filters.status !== 'all') {
      if (notification.status !== filters.status) return false;
    }
    
    // Filtro por canal
    if (filters.channel && filters.channel !== 'all') {
      if (notification.channel !== filters.channel) return false;
    }
    
    // Filtro por rango de fechas
    if (filters.dateFrom || filters.dateTo) {
      const notificationDate = new Date(notification.createdAt);
      if (filters.dateFrom && notificationDate < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && notificationDate > new Date(filters.dateTo)) return false;
    }
    
    return true;
  });
};

/**
 * Ordena notificaciones por diferentes criterios
 * @param {Array} notifications - Array de notificaciones
 * @param {string} sortBy - Campo por el cual ordenar
 * @param {string} sortOrder - Orden (asc/desc)
 * @returns {Array} Notificaciones ordenadas
 */
export const sortNotifications = (notifications, sortBy = 'createdAt', sortOrder = 'desc') => {
  return [...notifications].sort((a, b) => {
    let valueA, valueB;
    
    switch (sortBy) {
      case 'createdAt':
      case 'sentAt':
        valueA = new Date(a[sortBy] || 0);
        valueB = new Date(b[sortBy] || 0);
        break;
      case 'priority':
        valueA = getNotificationPriority(a.notificationType);
        valueB = getNotificationPriority(b.notificationType);
        break;
      case 'message':
      case 'notificationType':
      case 'status':
      case 'channel':
        valueA = (a[sortBy] || '').toString().toLowerCase();
        valueB = (b[sortBy] || '').toString().toLowerCase();
        break;
      default:
        valueA = a[sortBy];
        valueB = b[sortBy];
    }
    
    if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Agrupa notificaciones por un criterio específico
 * @param {Array} notifications - Array de notificaciones
 * @param {string} groupBy - Campo por el cual agrupar
 * @returns {Object} Notificaciones agrupadas
 */
export const groupNotifications = (notifications, groupBy) => {
  return notifications.reduce((groups, notification) => {
    let key;
    
    switch (groupBy) {
      case 'date':
        key = formatNotificationDate(notification.createdAt, false);
        break;
      case 'status':
        key = notification.status;
        break;
      case 'type':
        key = notification.notificationType;
        break;
      case 'recipientType':
        key = notification.recipientType;
        break;
      case 'channel':
        key = notification.channel;
        break;
      default:
        key = notification[groupBy] || 'Sin categoría';
    }
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(notification);
    
    return groups;
  }, {});
};

/**
 * Calcula estadísticas de notificaciones
 * @param {Array} notifications - Array de notificaciones
 * @returns {Object} Estadísticas calculadas
 */
export const calculateNotificationStats = (notifications) => {
  const total = notifications.length;
  const byStatus = notifications.reduce((acc, notification) => {
    acc[notification.status] = (acc[notification.status] || 0) + 1;
    return acc;
  }, {});
  
  const byChannel = notifications.reduce((acc, notification) => {
    acc[notification.channel] = (acc[notification.channel] || 0) + 1;
    return acc;
  }, {});
  
  const byType = notifications.reduce((acc, notification) => {
    acc[notification.notificationType] = (acc[notification.notificationType] || 0) + 1;
    return acc;
  }, {});
  
  const successRate = total > 0 ? ((byStatus.SENT || 0) / total * 100).toFixed(1) : 0;
  const failureRate = total > 0 ? ((byStatus.FAILED || 0) / total * 100).toFixed(1) : 0;
  
  return {
    total,
    byStatus,
    byChannel,
    byType,
    successRate: parseFloat(successRate),
    failureRate: parseFloat(failureRate),
    pending: byStatus.PENDING || 0,
    sent: byStatus.SENT || 0,
    failed: byStatus.FAILED || 0
  };
};

/**
 * Valida el contenido de una notificación
 * @param {Object} notification - Datos de la notificación
 * @returns {Object} Resultado de la validación
 */
export const validateNotification = (notification) => {
  const errors = [];
  
  if (!notification.recipientId || notification.recipientId.trim() === '') {
    errors.push('El destinatario es requerido');
  }
  
  if (!notification.message || notification.message.trim() === '') {
    errors.push('El mensaje es requerido');
  } else if (notification.message.length < 10) {
    errors.push('El mensaje debe tener al menos 10 caracteres');
  } else if (notification.message.length > 500) {
    errors.push('El mensaje no puede exceder 500 caracteres');
  }
  
  if (!notification.notificationType) {
    errors.push('El tipo de notificación es requerido');
  }
  
  if (!notification.channel) {
    errors.push('El canal de envío es requerido');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Trunca un mensaje de notificación para preview
 * @param {string} message - Mensaje completo
 * @param {number} maxLength - Longitud máxima
 * @returns {string} Mensaje truncado
 */
export const truncateMessage = (message, maxLength = 50) => {
  if (!message) return '';
  if (message.length <= maxLength) return message;
  return message.substring(0, maxLength) + '...';
};

/**
 * Genera una plantilla de mensaje basada en el tipo de notificación
 * @param {string} notificationType - Tipo de notificación
 * @param {Object} data - Datos para la plantilla
 * @returns {string} Mensaje generado
 */
export const generateMessageTemplate = (notificationType, data = {}) => {
  const templates = {
    'GRADE_PUBLISHED': `Nueva calificación publicada para ${data.course || '[Curso]'}: ${data.grade || '[Nota]'}`,
    'GRADE_UPDATED': `Calificación actualizada en ${data.course || '[Curso]'}: ${data.grade || '[Nota]'}`,
    'LOW_PERFORMANCE': `Alerta de bajo rendimiento académico en ${data.course || '[Curso]'}. Se recomienda apoyo adicional.`,
    'ATTENDANCE_ALERT': `Alerta de asistencia: ${data.absences || '[X]'} faltas registradas en ${data.course || '[Curso]'}`,
    'ENROLLMENT_CONFIRMATION': `Matrícula confirmada exitosamente para el período ${data.period || '[Período]'}`,
    'PAYMENT_REMINDER': `Recordatorio de pago pendiente. Monto: ${data.amount || '[Monto]'}. Vencimiento: ${data.dueDate || '[Fecha]'}`,
    'SYSTEM_MAINTENANCE': `Mantenimiento programado del sistema el ${data.date || '[Fecha]'} de ${data.startTime || '[Hora inicio]'} a ${data.endTime || '[Hora fin]'}`,
    'GENERAL_ANNOUNCEMENT': data.customMessage || 'Anuncio general del sistema'
  };
  
  return templates[notificationType] || 'Notificación del sistema';
};

/**
 * Genera estadísticas de notificaciones por período
 * @param {Array} notifications - Lista de notificaciones
 * @param {number} days - Días hacia atrás
 * @returns {Object} Estadísticas del período
 */
export const getNotificationStatsByPeriod = (notifications, days = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const recentNotifications = notifications.filter(n => 
    new Date(n.createdAt) >= cutoffDate
  );
  
  return calculateNotificationStats(recentNotifications);
};

/**
 * Detecta variables en un mensaje de plantilla
 * @param {string} message - Mensaje con variables
 * @returns {Array} Lista de variables encontradas
 */
export const extractTemplateVariables = (message) => {
  const regex = /{([^}]+)}/g;
  const variables = [];
  let match;
  
  while ((match = regex.exec(message)) !== null) {
    variables.push(match[1]);
  }
  
  return [...new Set(variables)]; // Eliminar duplicados
};

/**
 * Reemplaza variables en un mensaje
 * @param {string} message - Mensaje con variables
 * @param {Object} variables - Variables y sus valores
 * @returns {string} Mensaje con variables reemplazadas
 */
export const replaceVariables = (message, variables) => {
  let result = message;
  
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{${key}}`, 'g');
    result = result.replace(regex, variables[key] || `{${key}}`);
  });
  
  return result;
};

/**
 * Convierte notificaciones a formato para exportación
 * @param {Array} notifications - Lista de notificaciones
 * @param {Function} getRecipientName - Función para obtener nombre del destinatario
 * @returns {Array} Datos formateados para exportar
 */
export const prepareNotificationsForExport = (notifications, getRecipientName) => {
  return notifications.map(notification => ({
    'Fecha Creación': formatNotificationDate(notification.createdAt),
    'Tipo Destinatario': notification.recipientType,
    'Destinatario': getRecipientName(notification.recipientId, notification.recipientType),
    'Tipo Notificación': notification.notificationType,
    'Canal': notification.channel,
    'Estado': notification.status,
    'Mensaje': notification.message,
    'Fecha Envío': notification.sentAt ? formatNotificationDate(notification.sentAt) : 'No enviada'
  }));
};
