import axios from 'axios';

// Configuration for grade management API
const gradeApiClient = axios.create({
  baseURL: 'https://lab.vallegrande.edu.pe/school/ms-grade/api/v1/grades',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000 // 10 segundos de timeout
});

// Interceptor para logging de requests
gradeApiClient.interceptors.request.use(
  config => {
    console.log(`🚀 Grade API Request: ${config.method?.toUpperCase()} ${config.url}`);
    console.log('Headers:', config.headers);
    return config;
  },
  error => {
    console.error('❌ Grade Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
gradeApiClient.interceptors.response.use(
  response => {
    console.log(`✅ Grade API Response: ${response.status} - ${response.config.url}`);
    console.log('Data:', response.data);
    return response;
  },
  error => {
    console.error('❌ Grade API Error:', error);
    
    if (error.response) {
      console.error('Error de respuesta:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      console.error('Error de red/timeout:', error.message);
    } else {
      console.error('Error de configuración:', error.message);
    }
    return Promise.reject(error);
  }
);

const gradeService = {
  /**
   * Obtiene todas las calificaciones
   * @returns {Promise<Array>} Lista de calificaciones
   */
  async getAllGrades() {
    try {
      const response = await gradeApiClient.get();
      return response.data || [];
    } catch (error) {
      console.error('Error al obtener calificaciones:', error);
      
      // Si es un error 404, devolver array vacío en lugar de fallar
      if (error.response && error.response.status === 404) {
        console.warn('Endpoint de calificaciones no encontrado, devolviendo array vacío');
        return [];
      }
      
      throw error;
    }
  },

  /**
   * Obtiene calificaciones con paginación
   * @param {number} page - Número de página (comenzando en 0)
   * @param {number} size - Tamaño de página
   * @param {string} sort - Campo de ordenamiento (opcional)
   * @param {string} direction - Dirección de ordenamiento: 'asc' o 'desc' (opcional)
   * @returns {Promise<Object>} Objeto con calificaciones paginadas y metadatos
   */
  async getGradesPaginated(page = 0, size = 10, sort = 'evaluationDate', direction = 'desc') {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sort: `${sort},${direction}`
      });
      
      const response = await gradeApiClient.get(`?${params}`);
      return {
        content: response.data || [],
        totalElements: response.headers['x-total-count'] || response.data?.length || 0,
        totalPages: Math.ceil((response.headers['x-total-count'] || response.data?.length || 0) / size),
        size: size,
        number: page,
        first: page === 0,
        last: page >= Math.ceil((response.headers['x-total-count'] || response.data?.length || 0) / size) - 1
      };
    } catch (error) {
      console.error('Error al obtener calificaciones paginadas:', error);
      
      // Si el backend no soporta paginación, hacer paginación manual
      if (error.response && (error.response.status === 400 || error.response.status === 404)) {
        console.warn('Paginación no soportada en backend, usando paginación manual');
        try {
          const allGrades = await this.getAllGrades();
          const start = page * size;
          const end = start + size;
          const content = allGrades.slice(start, end);
          
          return {
            content,
            totalElements: allGrades.length,
            totalPages: Math.ceil(allGrades.length / size),
            size: size,
            number: page,
            first: page === 0,
            last: page >= Math.ceil(allGrades.length / size) - 1
          };
        } catch (fallbackError) {
          throw fallbackError;
        }
      }
      
      throw error;
    }
  },

  /**
   * Obtiene una calificación por ID
   * @param {string} id - ID de la calificación
   * @returns {Promise<Object>} Calificación encontrada
   */
  async getGradeById(id) {
    try {
      const response = await gradeApiClient.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener calificación ${id}:`, error);
      if (error.response && error.response.status === 404) {
        console.warn(`Calificación ${id} no encontrada`);
        return null;
      }
      throw error;
    }
  },

  /**
   * Obtiene calificaciones por ID de estudiante
   * @param {string} studentId - ID del estudiante
   * @returns {Promise<Array>} Lista de calificaciones del estudiante
   */
  async getGradesByStudentId(studentId) {
    try {
      const response = await gradeApiClient.get(`/student/${studentId}`);
      return response.data || [];
    } catch (error) {
      console.error(`Error al obtener calificaciones del estudiante ${studentId}:`, error);
      if (error.response && error.response.status === 404) {
        console.warn(`No se encontraron calificaciones para el estudiante ${studentId}`);
        return [];
      }
      throw error;
    }
  },

  /**
   * Obtiene calificaciones por ID de curso
   * @param {string} courseId - ID del curso
   * @returns {Promise<Array>} Lista de calificaciones del curso
   */
  async getGradesByCourseId(courseId) {
    try {
      const response = await gradeApiClient.get(`/course/${courseId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener calificaciones del curso ${courseId}:`, error);
      throw error;
    }
  },

  /**
   * Obtiene calificaciones por ID de estudiante y curso
   * @param {string} studentId - ID del estudiante
   * @param {string} courseId - ID del curso
   * @returns {Promise<Array>} Lista de calificaciones del estudiante en el curso
   */
  async getGradesByStudentAndCourse(studentId, courseId) {
    try {
      const response = await gradeApiClient.get(`/student/${studentId}/course/${courseId}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener calificaciones del estudiante ${studentId} en curso ${courseId}:`, error);
      throw error;
    }
  },

  /**
   * Obtiene notificaciones relacionadas a una calificación
   * @param {string} gradeId - ID de la calificación
   * @returns {Promise<Array>} Lista de notificaciones
   */
  async getGradeNotifications(gradeId) {
    try {
      const response = await gradeApiClient.get(`/${gradeId}/notifications`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener notificaciones de la calificación ${gradeId}:`, error);
      throw error;
    }
  },

  /**
   * Crea una nueva calificación
   * @param {Object} gradeData - Datos de la calificación
   * @returns {Promise<Object>} Calificación creada
   */
  async createGrade(gradeData) {
    try {
      const response = await gradeApiClient.post('', gradeData);
      return response.data;
    } catch (error) {
      console.error('Error al crear calificación:', error);
      throw error;
    }
  },

  /**
   * Actualiza una calificación existente
   * @param {string} id - ID de la calificación
   * @param {Object} gradeData - Datos actualizados de la calificación
   * @returns {Promise<Object>} Calificación actualizada
   */
  async updateGrade(id, gradeData) {
    try {
      const response = await gradeApiClient.put(`/${id}`, gradeData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar calificación ${id}:`, error);
      throw error;
    }
  },

  /**
   * Elimina lógicamente una calificación
   * @param {string} id - ID de la calificación
   * @returns {Promise<Object>} Calificación eliminada
   */
  async deleteGrade(id) {
    try {
      const response = await gradeApiClient.delete(`/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar calificación ${id}:`, error);
      throw error;
    }
  },

  /**
   * Restaura una calificación eliminada lógicamente
   * @param {string} id - ID de la calificación
   * @returns {Promise<Object>} Calificación restaurada
   */
  async restoreGrade(id) {
    try {
      const response = await gradeApiClient.put(`/${id}/restore`);
      return response.data;
    } catch (error) {
      console.error(`Error al restaurar calificación ${id}:`, error);
      throw error;
    }
  },

  /**
   * Obtiene todas las calificaciones inactivas
   * @returns {Promise<Array>} Lista de calificaciones inactivas
   */
  async getAllInactiveGrades() {
    try {
      const response = await gradeApiClient.get('/inactive');
      return response.data;
    } catch (error) {
      console.error('Error al obtener calificaciones inactivas:', error);
      throw error;
    }
  },

  /**
   * Obtiene calificaciones inactivas con paginación
   * @param {number} page - Número de página (comenzando en 0)
   * @param {number} size - Tamaño de página
   * @param {string} sort - Campo de ordenamiento (opcional)
   * @param {string} direction - Dirección de ordenamiento: 'asc' o 'desc' (opcional)
   * @returns {Promise<Object>} Objeto con calificaciones inactivas paginadas y metadatos
   */
  async getInactiveGradesPaginated(page = 0, size = 10, sort = 'evaluationDate', direction = 'desc') {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sort: `${sort},${direction}`
      });
      
      const response = await gradeApiClient.get(`/inactive?${params}`);
      return {
        content: response.data || [],
        totalElements: response.headers['x-total-count'] || response.data?.length || 0,
        totalPages: Math.ceil((response.headers['x-total-count'] || response.data?.length || 0) / size),
        size: size,
        number: page,
        first: page === 0,
        last: page >= Math.ceil((response.headers['x-total-count'] || response.data?.length || 0) / size) - 1
      };
    } catch (error) {
      console.error('Error al obtener calificaciones inactivas paginadas:', error);
      
      // Si el backend no soporta paginación, hacer paginación manual
      if (error.response && (error.response.status === 400 || error.response.status === 404)) {
        console.warn('Paginación no soportada para inactivas, usando paginación manual');
        try {
          const allInactiveGrades = await this.getAllInactiveGrades();
          const start = page * size;
          const end = start + size;
          const content = allInactiveGrades.slice(start, end);
          
          return {
            content,
            totalElements: allInactiveGrades.length,
            totalPages: Math.ceil(allInactiveGrades.length / size),
            size: size,
            number: page,
            first: page === 0,
            last: page >= Math.ceil(allInactiveGrades.length / size) - 1
          };
        } catch (fallbackError) {
          throw fallbackError;
        }
      }
      
      throw error;
    }
  }
};

export { gradeService };
