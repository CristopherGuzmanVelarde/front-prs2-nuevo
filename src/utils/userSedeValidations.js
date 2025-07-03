
import { isRequired, maxLength } from './validations';

/**
 * Validates that a user has been selected.
 * @param {string} userId - The selected user ID.
 * @returns {string} - An error message, or an empty string if valid.
 */
export const validateUserId = (userId) => {
    if (!isRequired(userId)) {
        return 'Debe seleccionar un usuario.';
    }
    return '';
};

/**
 * Validates that a sede (headquarters) has been selected.
 * @param {string} sedeId - The selected sede ID.
 * @returns {string} - An error message, or an empty string if valid.
 */
export const validateSedeId = (sedeId) => {
    if (!isRequired(sedeId)) {
        return 'Debe seleccionar una sede.';
    }
    return '';
};

/**
 * Validates that an assignment date has been selected.
 * @param {string} date - The selected date string.
 * @returns {string} - An error message, or an empty string if valid.
 */
export const validateAssignedAt = (date) => {
    if (!isRequired(date)) {
        return 'La fecha de asignación es obligatoria.';
    }
    return '';
};

/**
 * Validates the 'activeUntil' date. It's optional, but if provided, must be after the 'assignedAt' date.
 * @param {string} activeUntil - The end date string.
 * @param {string} assignedAt - The start date string.
 * @returns {string} - An error message, or an empty string if valid.
 */
export const validateActiveUntil = (activeUntil, assignedAt) => {
    if (activeUntil && assignedAt) {
        if (new Date(activeUntil) < new Date(assignedAt)) {
            return 'La fecha "Activo Hasta" no puede ser anterior a la fecha de asignación.';
        }
    }
    return '';
};

/**
 * Validates optional text fields like reason, observations, schedule, responsibilities.
 * @param {string} text - The text to validate.
 * @param {string} fieldName - The name of the field for the error message.
 * @param {number} max - The maximum allowed length.
 * @returns {string} - An error message, or an empty string if valid.
 */
export const validateOptionalTextField = (text, fieldName, max = 255) => {
    if (text && !maxLength(text, max)) {
        return `${fieldName} no debe exceder los ${max} caracteres.`;
    }
    return '';
};

    