/**
 * @typedef {Object} ClassroomStudent
 * @property {string} id - ID único de la matrícula
 * @property {string} classroomId - ID del aula
 * @property {string} studentId - ID del estudiante
 * @property {Array<number>} enrollmentDate - Fecha de matrícula [año, mes, día]
 * @property {string} enrollmentYear - Año de matrícula
 * @property {string} enrollmentPeriod - Periodo de matrícula (e.g., "2024-1")
 * @property {string} status - Estado (A: Activo, I: Inactivo)
 */

/**
 * Crea una nueva instancia de ClassroomStudent con los datos proporcionados
 * @param {Object} data - Datos de la matrícula
 * @returns {ClassroomStudent} Nueva instancia de ClassroomStudent
 */
export class ClassroomStudent {
    constructor(data) {
        this.id = data.id;
        this.classroomId = data.classroomId;
        this.studentId = data.studentId;
        this.enrollmentDate = data.enrollmentDate;
        this.enrollmentYear = data.enrollmentYear;
        this.enrollmentPeriod = data.enrollmentPeriod;
        this.status = data.status;
    }
}

export const EnrollmentStatus = {
    ACTIVE: 'A',
    INACTIVE: 'I'
}; 