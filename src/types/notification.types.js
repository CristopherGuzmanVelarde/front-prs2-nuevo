/**
 * @typedef {Object} Notification
 * @property {string} id - ID único de la notificación
 * @property {string} recipientId - ID del destinatario
 * @property {string} recipientType - Tipo de destinatario (STUDENT, TEACHER, PARENT)
 * @property {string} message - Mensaje de la notificación
 * @property {string} notificationType - Tipo de notificación
 * @property {string} status - Estado de la notificación (PENDING, SENT, FAILED)
 * @property {string} channel - Canal de envío (EMAIL, SMS, PUSH)
 * @property {string} createdAt - Fecha de creación
 * @property {string} sentAt - Fecha de envío
 * @property {boolean} deleted - Estado de eliminación lógica
 */

/**
 * Crea una nueva instancia de Notification con los datos proporcionados
 * @param {Object} data - Datos de la notificación
 * @returns {Notification} Nueva instancia de Notification
 */
export class Notification {
    constructor(data = {}) {
        this.id = data.id || null;
        this.recipientId = data.recipientId || '';
        this.recipientType = data.recipientType || '';
        this.message = data.message || '';
        this.notificationType = data.notificationType || '';
        this.status = data.status || 'PENDING';
        this.channel = data.channel || 'EMAIL';
        this.createdAt = data.createdAt || null;
        this.sentAt = data.sentAt || null;
        this.deleted = data.deleted || false;
    }

    /**
     * Valida si la notificación es válida
     * @returns {Object} Resultado de la validación
     */
    validate() {
        const errors = [];

        if (!this.recipientId || this.recipientId.trim() === '') {
            errors.push('El ID del destinatario es requerido');
        }

        if (!this.recipientType || this.recipientType.trim() === '') {
            errors.push('El tipo de destinatario es requerido');
        }

        if (!this.message || this.message.trim() === '') {
            errors.push('El mensaje es requerido');
        }

        if (!this.notificationType || this.notificationType.trim() === '') {
            errors.push('El tipo de notificación es requerido');
        }

        if (!this.channel || this.channel.trim() === '') {
            errors.push('El canal de envío es requerido');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Obtiene el estado con formato legible
     * @returns {string} Estado formateado
     */
    getFormattedStatus() {
        const statusMap = {
            'PENDING': 'Pendiente',
            'SENT': 'Enviado',
            'FAILED': 'Fallido'
        };
        return statusMap[this.status] || this.status;
    }

    /**
     * Obtiene el color del estado para la UI
     * @returns {string} Clase CSS de color
     */
    getStatusColor() {
        const colorMap = {
            'PENDING': 'warning',
            'SENT': 'success',
            'FAILED': 'danger'
        };
        return colorMap[this.status] || 'secondary';
    }

    /**
     * Obtiene el icono del estado
     * @returns {string} Clase CSS del icono
     */
    getStatusIcon() {
        const iconMap = {
            'PENDING': 'fa-clock',
            'SENT': 'fa-check-circle',
            'FAILED': 'fa-times-circle'
        };
        return iconMap[this.status] || 'fa-question-circle';
    }

    /**
     * Verifica si la notificación fue enviada
     * @returns {boolean} True si fue enviada
     */
    isSent() {
        return this.status === 'SENT';
    }

    /**
     * Verifica si la notificación falló
     * @returns {boolean} True si falló
     */
    isFailed() {
        return this.status === 'FAILED';
    }

    /**
     * Verifica si la notificación está pendiente
     * @returns {boolean} True si está pendiente
     */
    isPending() {
        return this.status === 'PENDING';
    }
}

/**
 * Tipos de destinatario
 */
export const RECIPIENT_TYPES = [
    { value: 'STUDENT', label: 'Estudiante' },
    { value: 'TEACHER', label: 'Profesor' },
    { value: 'PARENT', label: 'Padre/Madre' },
    { value: 'ADMIN', label: 'Administrador' }
];

/**
 * Tipos de notificación
 */
export const NOTIFICATION_TYPES = [
    { value: 'GRADE_PUBLISHED', label: 'Calificación Publicada' },
    { value: 'GRADE_UPDATED', label: 'Calificación Actualizada' },
    { value: 'LOW_PERFORMANCE', label: 'Bajo Rendimiento' },
    { value: 'ATTENDANCE_ALERT', label: 'Alerta de Asistencia' },
    { value: 'ENROLLMENT_CONFIRMATION', label: 'Confirmación de Matrícula' },
    { value: 'PAYMENT_REMINDER', label: 'Recordatorio de Pago' },
    { value: 'SYSTEM_MAINTENANCE', label: 'Mantenimiento del Sistema' },
    { value: 'GENERAL_ANNOUNCEMENT', label: 'Anuncio General' }
];

/**
 * Estados de notificación
 */
export const NOTIFICATION_STATUS = [
    { value: 'PENDING', label: 'Pendiente' },
    { value: 'SENT', label: 'Enviado' },
    { value: 'FAILED', label: 'Fallido' }
];

/**
 * Canales de envío
 */
export const NOTIFICATION_CHANNELS = [
    { value: 'EMAIL', label: 'Correo Electrónico' },
    { value: 'SMS', label: 'SMS' },
    { value: 'PUSH', label: 'Notificación Push' },
    { value: 'IN_APP', label: 'En la Aplicación' }
];
