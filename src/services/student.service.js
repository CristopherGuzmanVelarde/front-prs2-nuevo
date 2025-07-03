import { apiClient } from '../config/api.config';
import { Student } from '../types/student.types';

class StudentService {
    constructor() {
        this.endpoint = '/students';
    }

    /**
     * Obtiene todos los estudiantes
     * @returns {Promise<Student[]>} Lista de estudiantes
     */
    async getAllStudents() {
        const { data } = await apiClient.get(this.endpoint);
        return data.map(student => new Student(student));
    }

    /**
     * Obtiene un estudiante por su ID
     * @param {string} id - ID del estudiante
     * @returns {Promise<Student>} Estudiante encontrado
     */
    async getStudentById(id) {
        const { data } = await apiClient.get(`${this.endpoint}/${id}`);
        return new Student(data);
    }

    /**
     * Crea un nuevo estudiante
     * @param {Student} studentData - Datos del estudiante
     * @returns {Promise<Student>} Estudiante creado
     */
    async createStudent(studentData) {
        const { data } = await apiClient.post(this.endpoint, studentData);
        return new Student(data);
    }

    /**
     * Actualiza un estudiante existente
     * @param {string} id - ID del estudiante
     * @param {Student} studentData - Datos actualizados del estudiante
     * @returns {Promise<Student>} Estudiante actualizado
     */
    async updateStudent(id, studentData) {
        const { data } = await apiClient.put(`${this.endpoint}/${id}`, studentData);
        return new Student(data);
    }

    /**
     * Elimina un estudiante (baja lógica)
     * @param {string} id - ID del estudiante
     * @returns {Promise<void>}
     */
    async deleteStudent(id) {
        await apiClient.delete(`${this.endpoint}/${id}`);
    }

    /**
     * Busca estudiantes por institución
     * @param {string} institutionId - ID de la institución
     * @returns {Promise<Student[]>} Lista de estudiantes
     */
    async getStudentsByInstitution(institutionId) {
        const { data } = await apiClient.get(`${this.endpoint}/institution/${institutionId}`);
        return data.map(student => new Student(student));
    }

    /**
     * Busca estudiantes por estado
     * @param {string} status - Estado del estudiante (A/I)
     * @returns {Promise<Student[]>} Lista de estudiantes
     */
    async getStudentsByStatus(status) {
        const { data } = await apiClient.get(`${this.endpoint}/status/${status}`);
        return data.map(student => new Student(student));
    }

    /**
     * Busca estudiantes por género
     * @param {string} gender - Género del estudiante (M/F)
     * @returns {Promise<Student[]>} Lista de estudiantes
     */
    async getStudentsByGender(gender) {
        const { data } = await apiClient.get(`${this.endpoint}/gender/${gender}`);
        return data.map(student => new Student(student));
    }

    /**
     * Restaura un estudiante eliminado
     * @param {string} id - ID del estudiante
     * @returns {Promise<Student>} Estudiante restaurado
     */
    async restoreStudent(id) {
        const { data } = await apiClient.put(`${this.endpoint}/${id}/restore`);
        return new Student(data);
    }
}

export default new StudentService(); 