import { apiClient } from '../config/api.config';
import { ClassroomStudent } from '../types/classroom-student.types';

class ClassroomStudentService {
    constructor() {
        this.endpoint = '/classroom-students';
    }

    /**
     * Obtiene todas las matrículas
     * @returns {Promise<ClassroomStudent[]>} Lista de matrículas
     */
    async getAllEnrollments() {
        const { data } = await apiClient.get(this.endpoint);
        return data.map(enrollment => new ClassroomStudent(enrollment));
    }

    /**
     * Obtiene una matrícula por su ID
     * @param {string} id - ID de la matrícula
     * @returns {Promise<ClassroomStudent>} Matrícula encontrada
     */
    async getEnrollmentById(id) {
        const { data } = await apiClient.get(`${this.endpoint}/${id}`);
        return new ClassroomStudent(data);
    }

    /**
     * Crea una nueva matrícula
     * @param {ClassroomStudent} enrollmentData - Datos de la matrícula
     * @returns {Promise<ClassroomStudent>} Matrícula creada
     */
    async createEnrollment(enrollmentData) {
        const { data } = await apiClient.post(this.endpoint, enrollmentData);
        return new ClassroomStudent(data);
    }

    /**
     * Actualiza una matrícula existente
     * @param {string} id - ID de la matrícula
     * @param {ClassroomStudent} enrollmentData - Datos actualizados de la matrícula
     * @returns {Promise<ClassroomStudent>} Matrícula actualizada
     */
    async updateEnrollment(id, enrollmentData) {
        const { data } = await apiClient.put(`${this.endpoint}/${id}`, enrollmentData);
        return new ClassroomStudent(data);
    }

    /**
     * Elimina una matrícula (baja lógica)
     * @param {string} id - ID de la matrícula
     * @returns {Promise<void>}
     */
    async deleteEnrollment(id) {
        await apiClient.delete(`${this.endpoint}/${id}`);
    }

    /**
     * Busca matrículas por estudiante
     * @param {string} studentId - ID del estudiante
     * @returns {Promise<ClassroomStudent[]>} Lista de matrículas
     */
    async getEnrollmentsByStudent(studentId) {
        const { data } = await apiClient.get(`${this.endpoint}/student/${studentId}`);
        return data.map(enrollment => new ClassroomStudent(enrollment));
    }

    /**
     * Busca matrículas por aula
     * @param {string} classroomId - ID del aula
     * @returns {Promise<ClassroomStudent[]>} Lista de matrículas
     */
    async getEnrollmentsByClassroom(classroomId) {
        const { data } = await apiClient.get(`${this.endpoint}/classroom/${classroomId}`);
        return data.map(enrollment => new ClassroomStudent(enrollment));
    }

    /**
     * Busca matrículas por estado
     * @param {string} status - Estado de la matrícula (A/I)
     * @returns {Promise<ClassroomStudent[]>} Lista de matrículas
     */
    async getEnrollmentsByStatus(status) {
        const { data } = await apiClient.get(`${this.endpoint}/status/${status}`);
        return data.map(enrollment => new ClassroomStudent(enrollment));
    }

    /**
     * Busca matrículas por año
     * @param {string} year - Año de la matrícula
     * @returns {Promise<ClassroomStudent[]>} Lista de matrículas
     */
    async getEnrollmentsByYear(year) {
        const { data } = await apiClient.get(`${this.endpoint}/year/${year}`);
        return data.map(enrollment => new ClassroomStudent(enrollment));
    }

    /**
     * Busca matrículas por periodo
     * @param {string} period - Periodo de la matrícula
     * @returns {Promise<ClassroomStudent[]>} Lista de matrículas
     */
    async getEnrollmentsByPeriod(period) {
        const { data } = await apiClient.get(`${this.endpoint}/period/${period}`);
        return data.map(enrollment => new ClassroomStudent(enrollment));
    }

    /**
     * Busca matrículas por año y periodo
     * @param {string} year - Año de la matrícula
     * @param {string} period - Periodo de la matrícula
     * @returns {Promise<ClassroomStudent[]>} Lista de matrículas
     */
    async getEnrollmentsByYearAndPeriod(year, period) {
        const { data } = await apiClient.get(`${this.endpoint}/year/${year}/period/${period}`);
        return data.map(enrollment => new ClassroomStudent(enrollment));
    }

    /**
     * Restaura una matrícula eliminada
     * @param {string} id - ID de la matrícula
     * @returns {Promise<ClassroomStudent>} Matrícula restaurada
     */
    async restoreEnrollment(id) {
        const { data } = await apiClient.put(`${this.endpoint}/${id}/restore`);
        return new ClassroomStudent(data);
    }
}

export default new ClassroomStudentService(); 