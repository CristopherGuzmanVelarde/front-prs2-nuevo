/**
 * @typedef {Object} Grade
 * @property {string} id - ID único de la calificación
 * @property {string} studentId - ID del estudiante
 * @property {string} courseId - ID del curso
 * @property {string} academicPeriod - Período académico (Bimester, Trimester, Annual)
 * @property {string} evaluationType - Tipo de evaluación
 * @property {number} grade - Calificación (0-20)
 * @property {Array<number>} evaluationDate - Fecha de evaluación [año, mes, día]
 * @property {string} remarks - Observaciones
 * @property {boolean} deleted - Estado de eliminación lógica
 */

/**
 * Crea una nueva instancia de Grade con los datos proporcionados
 * @param {Object} data - Datos de la calificación
 * @returns {Grade} Nueva instancia de Grade
 */
export class Grade {
    constructor(data = {}) {
        this.id = data.id || null;
        this.studentId = data.studentId || '';
        this.courseId = data.courseId || '';
        this.academicPeriod = data.academicPeriod || '';
        this.evaluationType = data.evaluationType || '';
        this.grade = data.grade || 0;
        this.evaluationDate = data.evaluationDate || null;
        this.remarks = data.remarks || '';
        this.deleted = data.deleted || false;
    }

    /**
     * Valida si la calificación es válida
     * @returns {Object} Resultado de la validación
     */
    validate() {
        const errors = [];

        if (!this.studentId || this.studentId.trim() === '') {
            errors.push('El ID del estudiante es requerido');
        }

        if (!this.courseId || this.courseId.trim() === '') {
            errors.push('El ID del curso es requerido');
        }

        if (!this.academicPeriod || this.academicPeriod.trim() === '') {
            errors.push('El período académico es requerido');
        }

        if (!this.evaluationType || this.evaluationType.trim() === '') {
            errors.push('El tipo de evaluación es requerido');
        }

        if (this.grade === null || this.grade === undefined || this.grade < 0 || this.grade > 20) {
            errors.push('La calificación debe estar entre 0 y 20');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Obtiene el estado de aprobación
     * @returns {string} Estado de aprobación
     */
    getPassStatus() {
        if (this.grade >= 14) return 'Aprobado';
        if (this.grade >= 11) return 'Recuperación';
        return 'Desaprobado';
    }

    /**
     * Obtiene el color del estado
     * @returns {string} Color del estado
     */
    getStatusColor() {
        if (this.grade >= 14) return 'success';
        if (this.grade >= 11) return 'warning';
        return 'danger';
    }
}

/**
 * Opciones para períodos académicos
 */
export const ACADEMIC_PERIODS = [
    { value: 'Bimester', label: 'Bimestre' },
    { value: 'Trimester', label: 'Trimestre' },
    { value: 'Annual', label: 'Anual' }
];

/**
 * Opciones para tipos de evaluación
 */
export const EVALUATION_TYPES = [
    { value: 'Examen Parcial', label: 'Examen Parcial' },
    { value: 'Examen Final', label: 'Examen Final' },
    { value: 'Práctica Calificada', label: 'Práctica Calificada' },
    { value: 'Tarea', label: 'Tarea' },
    { value: 'Participación', label: 'Participación' },
    { value: 'Proyecto', label: 'Proyecto' },
    { value: 'Laboratorio', label: 'Laboratorio' }
];

/**
 * Opciones para cursos disponibles
 */
export const COURSES = [
    { value: 'MAT101', label: 'Matemática I' },
    { value: 'MAT102', label: 'Matemática II' },
    { value: 'FIS101', label: 'Física I' },
    { value: 'FIS102', label: 'Física II' },
    { value: 'QUI101', label: 'Química I' },
    { value: 'QUI102', label: 'Química II' },
    { value: 'BIO101', label: 'Biología I' },
    { value: 'BIO102', label: 'Biología II' },
    { value: 'HIS101', label: 'Historia Universal' },
    { value: 'HIS102', label: 'Historia del Perú' },
    { value: 'GEO101', label: 'Geografía' },
    { value: 'LIT101', label: 'Literatura' },
    { value: 'ESP101', label: 'Lenguaje y Comunicación' },
    { value: 'ING101', label: 'Inglés I' },
    { value: 'ING102', label: 'Inglés II' },
    { value: 'EDU101', label: 'Educación Física' },
    { value: 'ART101', label: 'Arte y Cultura' },
    { value: 'REL101', label: 'Educación Religiosa' },
    { value: 'CIV101', label: 'Formación Ciudadana' },
    { value: 'PSI101', label: 'Psicología' },
    { value: 'ECO101', label: 'Economía' },
    { value: 'FIL101', label: 'Filosofía' },
    { value: 'INF101', label: 'Computación e Informática' },
    { value: 'EST101', label: 'Estadística' },
    { value: 'TUT101', label: 'Tutoría' }
];
