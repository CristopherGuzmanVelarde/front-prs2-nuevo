import { apiClient } from '../config/api.config';

const studentService = {
  async getAllStudents() {
    try {
      const response = await apiClient.get('/students');
      return response.data;
    } catch (error) {
      console.error('Error al obtener estudiantes:', error);
      throw error;
    }
  },

  async getStudentById(id) {
    try {
      const response = await apiClient.get(`/students/${id}`);
      const student = response.data;
      // Formatear el nombre completo para mostrar
      student.displayName = `${student.firstName} ${student.lastName} - ${student.documentNumber}`;
      return student;
    } catch (error) {
      console.error(`Error al obtener estudiante ${id}:`, error);
      throw error;
    }
  },

  async getActiveStudents() {
    try {
      const response = await apiClient.get('/students?status=A');
      return response.data;
    } catch (error) {
      console.error('Error al obtener estudiantes activos:', error);
      throw error;
    }
  },

  async createStudent(studentData) {
    try {
      const response = await apiClient.post('/students', studentData);
      return response.data;
    } catch (error) {
      console.error('Error al crear estudiante:', error);
      throw error;
    }
  },

  async updateStudent(id, studentData) {
    try {
      const response = await apiClient.put(`/students/${id}`, studentData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar estudiante:', error);
      throw error;
    }
  },

  async deleteStudent(id) {
    try {
      const response = await apiClient.delete(`/students/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar estudiante:', error);
      throw error;
    }
  },

  async checkActiveEnrollment(studentId) {
    try {
      const response = await apiClient.get('/classroom-students');
      const enrollments = response.data;
      return enrollments.some(e => e.studentId === studentId && e.status === 'A');
    } catch (error) {
      console.error('Error al verificar matrícula activa:', error);
      throw error;
    }
  }
};

export { studentService }; 