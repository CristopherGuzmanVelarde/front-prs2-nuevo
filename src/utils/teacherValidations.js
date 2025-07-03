// This utility file provides validation functions specifically for the Teacher form.
import { isRequired, minLength, maxLength, cleanSpaces } from './validations'; // Reusing general validations

/**
 * Validates the specialty field.
 * @param {string} specialty - The specialty to validate.
 * @returns {string} - An error message, or an empty string if valid.
 */
export const validateSpecialty = (specialty) => {
    const cleanedSpecialty = cleanSpaces(specialty);
    if (!isRequired(cleanedSpecialty)) {
        return 'La especialidad es obligatoria.';
    }
    if (!minLength(cleanedSpecialty, 3)) {
        return 'La especialidad debe tener al menos 3 caracteres.';
    }
    if (!maxLength(cleanedSpecialty, 100)) {
        return 'La especialidad no debe exceder los 100 caracteres.';
    }
    return '';
};

/**
 * Validates the bio field.
 * @param {string} bio - The biography to validate.
 * @returns {string} - An error message, or an empty string if valid.
 */
export const validateBio = (bio) => {
    const cleanedBio = cleanSpaces(bio);
    // Bio is optional, so we only validate its length if it's not empty.
    if (isRequired(cleanedBio) && !maxLength(cleanedBio, 500)) {
        return 'La biografía no debe exceder los 500 caracteres.';
    }
    return '';
};

/**
 * Validates that a user has been selected from the dropdown.
 * @param {string} userId - The selected user ID.
 * @returns {string} - An error message, or an empty string if valid.
 */
export const validateUserId = (userId) => {
    if (!isRequired(userId)) {
        return 'Debe seleccionar un usuario.';
    }
    return '';
};
