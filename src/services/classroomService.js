import { apiClient } from '../config/api.config';

const classroomService = {
    getAllClassrooms: async () => {
      try {
        const response = await apiClient.get('/classroom-students');
        // Extraer aulas únicas del listado de matrículas
        const enrollments = response.data;
        const uniqueClassrooms = [...new Set(enrollments.map(e => e.classroomId))]
          .map(id => ({ id, name: `Aula ${id}` }));
        return uniqueClassrooms;
      } catch (error) {
        console.error('Error al obtener aulas:', error);
        throw error;
      }
    },
  
    getClassroomById: async (id) => {
      try {
        // Obtener matrículas del aula específica
        const response = await apiClient.get(`/classroom-students?classroomId=${id}`);
        const enrollments = response.data;
        if (enrollments.length > 0) {
          return { id, name: `Aula ${id}` };
        }
        throw new Error('Aula no encontrada');
      } catch (error) {
        console.error('Error al obtener aula:', error);
        throw error;
      }
    },
  
    createClassroom: async (classroomData) => {
      try {
        const response = await apiClient.post('/classroom', classroomData);
        return response.data;
      } catch (error) {
        console.error('Error al crear aula:', error);
        throw error;
      }
    },
  
    updateClassroom: async (id, classroomData) => {
      try {
        const response = await apiClient.put(`/classroom/${id}`, classroomData);
        return response.data;
      } catch (error) {
        console.error('Error al actualizar aula:', error);
        throw error;
      }
    },
  
    deleteClassroom: async (id) => {
      try {
        const response = await apiClient.delete(`/classroom/${id}`);
        return response.data;
      } catch (error) {
        console.error('Error al eliminar aula:', error);
        throw error;
      }
    }
  };
  
  export { classroomService }; 