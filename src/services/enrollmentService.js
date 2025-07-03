import { apiClient } from '../config/api.config';

const enrollmentService = {
  getAllEnrollments: async () => {
    try {
      const response = await apiClient.get('/classroom-students');
      return response.data;
    } catch (error) {
      console.error('Error al obtener matrículas:', error);
      throw new Error('No se pudieron cargar las matrículas');
    }
  },

  getEnrollmentById: async (id) => {
    try {
      const response = await apiClient.get(`/classroom-students/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener matrícula:', error);
      throw new Error('No se pudo cargar la matrícula');
    }
  },

  createEnrollment: async (enrollmentData) => {
    try {
      // Validar que el estudiante no tenga una matrícula activa
      const enrollments = await enrollmentService.getAllEnrollments();
      const hasActiveEnrollment = enrollments.some(
        e => e.studentId === enrollmentData.studentId && e.status === 'A'
      );

      if (hasActiveEnrollment) {
        throw new Error('El estudiante ya tiene una matrícula activa');
      }

      const response = await apiClient.post('/classroom-students', enrollmentData);
      return response.data;
    } catch (error) {
      console.error('Error al crear matrícula:', error);
      throw new Error(error.message || 'No se pudo crear la matrícula');
    }
  },

  updateEnrollment: async (id, enrollmentData) => {
    try {
      // Si estamos activando una matrícula, verificar que el estudiante no tenga otra activa
      if (enrollmentData.status === 'A') {
        const enrollments = await enrollmentService.getAllEnrollments();
        const hasOtherActiveEnrollment = enrollments.some(
          e => e.studentId === enrollmentData.studentId && 
              e.status === 'A' && 
              e.id !== id
        );

        if (hasOtherActiveEnrollment) {
          throw new Error('El estudiante ya tiene una matrícula activa');
        }
      }

      const response = await apiClient.put(`/classroom-students/${id}`, enrollmentData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar matrícula:', error);
      throw new Error(error.message || 'No se pudo actualizar la matrícula');
    }
  },

  deleteEnrollment: async (id) => {
    try {
      // Usamos el método DELETE según la documentación
      const response = await apiClient.delete(`/classroom-students/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al desactivar matrícula:', error);
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('No se pudo desactivar la matrícula');
    }
  },

  restoreEnrollment: async (id) => {
    try {
      // Usamos el endpoint correcto para restaurar
      const response = await apiClient.put(`/classroom-students/${id}/restore`);
      return response.data;
    } catch (error) {
      console.error('Error al restaurar matrícula:', error);
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('No se pudo restaurar la matrícula');
    }
  }
};

export { enrollmentService }; 