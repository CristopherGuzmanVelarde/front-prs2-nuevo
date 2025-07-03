import { apiClient } from '../config/api.config';

export const classroomStudentService = {
  getAllEnrollments: async () => {
    try {
      const response = await apiClient.get('/classroom-students');
      return response.data;
    } catch (error) {
      console.error('Error al obtener matrículas:', error);
      throw error;
    }
  },

  getEnrollmentById: async (id) => {
    try {
      const response = await apiClient.get(`/classroom-students/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener matrícula:', error);
      throw error;
    }
  },

  createEnrollment: async (enrollmentData) => {
    try {
      const response = await apiClient.post('/classroom-students', enrollmentData);
      return response.data;
    } catch (error) {
      console.error('Error al crear matrícula:', error);
      throw error;
    }
  },

  updateEnrollment: async (id, enrollmentData) => {
    try {
      const response = await apiClient.put(`/classroom-students/${id}`, enrollmentData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar matrícula:', error);
      throw error;
    }
  },

  deleteEnrollment: async (id) => {
    try {
      const response = await apiClient.delete(`/classroom-students/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar matrícula:', error);
      throw error;
    }
  },

  restoreEnrollment: async (id) => {
    try {
      const response = await apiClient.put(`/classroom-students/${id}/restore`);
      return response.data;
    } catch (error) {
      console.error('Error al restaurar matrícula:', error);
      throw error;
    }
  },

  findByStudentId: async (studentId) => {
    try {
      const response = await apiClient.get(`/classroom-students/student/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener matrículas del estudiante:', error);
      throw error;
    }
  },

  findByClassroomId: async (classroomId) => {
    try {
      const response = await apiClient.get(`/classroom-students/classroom/${classroomId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener matrículas del aula:', error);
      throw error;
    }
  },

  findByStatus: async (status) => {
    try {
      const response = await apiClient.get(`/classroom-students/status/${status}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener matrículas por estado:', error);
      throw error;
    }
  },

  findByYear: async (year) => {
    try {
      const response = await apiClient.get(`/classroom-students/year/${year}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener matrículas por año:', error);
      throw error;
    }
  },

  findByPeriod: async (period) => {
    try {
      const response = await apiClient.get(`/classroom-students/period/${period}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener matrículas por periodo:', error);
      throw error;
    }
  },

  findByYearAndPeriod: async (year, period) => {
    try {
      const response = await apiClient.get(`/classroom-students/year/${year}/period/${period}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener matrículas por año y periodo:', error);
      throw error;
    }
  }
}; 