import { 
    UserDocument, 
    CreateDocumentRequest, 
    UpdateDocumentRequest, 
    ApiResponse 
  } from '../types/UserDocument';
  
  /**
   * Servicio para gestión de documentos de usuarios
   */
  export class UserDocumentService {
    constructor() {
      this.baseUrl = 'https://8086-vallegrande-msuserdocum-u3inuptv0zt.ws-us121.gitpod.io/api/v1/user-documents';
    }
  
    /**
     * Configuración común para las peticiones fetch
     */
    getRequestConfig(method = 'GET', body = null) {
      const config = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      };
  
      if (body) {
        config.body = JSON.stringify(body);
      }
  
      return config;
    }
  
    /**
     * Manejo genérico de respuestas
     */
    async handleResponse(response) {
      try {
        if (!response.ok) {
          // Intentar obtener el mensaje de error del servidor
          let errorMessage = `Error ${response.status}: ${response.statusText}`;
          try {
            const errorData = await response.json();
            if (errorData.message) {
              errorMessage = errorData.message;
            }
          } catch (e) {
            // Si no se puede parsear como JSON, usar el mensaje por defecto
          }
  
          return new ApiResponse(
            null, 
            errorMessage,
            response.status
          );
        }
  
        // Para respuestas 204 No Content (típicas en DELETE/PUT)
        if (response.status === 204) {
          return new ApiResponse({ success: true }, null, response.status);
        }
  
        const data = await response.json();
        return new ApiResponse(data, null, response.status);
      } catch (error) {
        return new ApiResponse(
          null, 
          `Error parsing response: ${error.message}`,
          response.status || 0
        );
      }
    }
  
    /**
     * Obtener todos los documentos activos
     * GET /api/v1/user-documents
     */
    async getAllActiveDocuments() {
      try {
        const response = await fetch(this.baseUrl, this.getRequestConfig());
        return await this.handleResponse(response);
      } catch (error) {
        return new ApiResponse(null, `Network error: ${error.message}`, 0);
      }
    }
  
    /**
     * Obtener documentos por ID de usuario
     * GET /api/v1/user-documents/user/{userId}
     */
    async getDocumentsByUserId(userId) {
      if (!userId) {
        return new ApiResponse(null, 'userId is required', 400);
      }
  
      try {
        const url = `${this.baseUrl}/user/${userId}`;
        const response = await fetch(url, this.getRequestConfig());
        return await this.handleResponse(response);
      } catch (error) {
        return new ApiResponse(null, `Network error: ${error.message}`, 0);
      }
    }
  
    /**
     * Obtener documento por ID
     * GET /api/v1/user-documents/{id}
     */
    async getDocumentById(id) {
      if (!id) {
        return new ApiResponse(null, 'Document ID is required', 400);
      }
  
      try {
        const url = `${this.baseUrl}/${id}`;
        const response = await fetch(url, this.getRequestConfig());
        return await this.handleResponse(response);
      } catch (error) {
        return new ApiResponse(null, `Network error: ${error.message}`, 0);
      }
    }
  
    /**
     * Crear nuevo documento
     * POST /api/v1/user-documents
     */
    async createDocument(createRequest) {
      if (!(createRequest instanceof CreateDocumentRequest)) {
        return new ApiResponse(null, 'Invalid CreateDocumentRequest', 400);
      }
  
      if (!createRequest.isValid()) {
        return new ApiResponse(null, 'Required fields are missing', 400);
      }
  
      try {
        const response = await fetch(
          this.baseUrl, 
          this.getRequestConfig('POST', createRequest)
        );
        return await this.handleResponse(response);
      } catch (error) {
        return new ApiResponse(null, `Network error: ${error.message}`, 0);
      }
    }
  
    /**
     * Actualizar documento
     * PUT /api/v1/user-documents/{id}
     */
    async updateDocument(id, updateRequest) {
      if (!id) {
        return new ApiResponse(null, 'Document ID is required', 400);
      }
  
      if (!(updateRequest instanceof UpdateDocumentRequest)) {
        return new ApiResponse(null, 'Invalid UpdateDocumentRequest', 400);
      }
  
      if (!updateRequest.isValid()) {
        return new ApiResponse(null, 'Required fields are missing', 400);
      }
  
      try {
        const url = `${this.baseUrl}/${id}`;
        const response = await fetch(
          url, 
          this.getRequestConfig('PUT', updateRequest)
        );
        return await this.handleResponse(response);
      } catch (error) {
        return new ApiResponse(null, `Network error: ${error.message}`, 0);
      }
    }
  
    /**
     * Reactivar documento
     * PUT /api/v1/user-documents/{id}/activate
     */
    async activateDocument(id) {
      if (!id) {
        return new ApiResponse(null, 'Document ID is required', 400);
      }
    
      try {
        const url = `${this.baseUrl}/${id}/activate`;
        const response = await fetch(url, this.getRequestConfig('PUT'));
        
        // Para activar documento, varios códigos de estado son válidos
        if (response.status === 204 || response.status === 200) {
          return new ApiResponse({ success: true, message: 'Document activated successfully' }, null, response.status);
        }
        
        return await this.handleResponse(response);
      } catch (error) {
        return new ApiResponse(null, `Network error: ${error.message}`, 0);
      }
    }
  
    /**
     * Desactivar documento
     * DELETE /api/v1/user-documents/{id}/deactivate
     */
    async deactivateDocument(id) {
      if (!id) {
        return new ApiResponse(null, 'Document ID is required', 400);
      }
    
      try {
        const url = `${this.baseUrl}/${id}/deactivate`;
        const response = await fetch(url, this.getRequestConfig('DELETE'));
        
        // Para desactivar documento, varios códigos de estado son válidos
        if (response.status === 204 || response.status === 200) {
          return new ApiResponse({ success: true, message: 'Document deactivated successfully' }, null, response.status);
        }
        
        return await this.handleResponse(response);
      } catch (error) {
        return new ApiResponse(null, `Network error: ${error.message}`, 0);
      }
    }
  
    /**
     * Eliminar documento físicamente (eliminación permanente)
     * DELETE /api/v1/user-documents/{id}
     */
    async deleteDocument(id) {
      if (!id) {
        return new ApiResponse(null, 'Document ID is required', 400);
      }
  
      try {
        const url = `${this.baseUrl}/${id}`;
        const response = await fetch(url, this.getRequestConfig('DELETE'));
        
        // Para eliminación física, varios códigos de estado son válidos
        if (response.status === 204 || response.status === 200) {
          return new ApiResponse({ success: true, message: 'Document deleted permanently' }, null, response.status);
        }
        
        return await this.handleResponse(response);
      } catch (error) {
        return new ApiResponse(null, `Network error: ${error.message}`, 0);
      }
    }
  
    /**
     * Obtener todos los documentos (activos e inactivos)
     * GET /api/v1/user-documents/all
     */
    async getAllDocuments() {
      try {
        const url = `${this.baseUrl}/all`;
        const response = await fetch(url, this.getRequestConfig());
        return await this.handleResponse(response);
      } catch (error) {
        return new ApiResponse(null, `Network error: ${error.message}`, 0);
      }
    }
  
    /**
     * Obtener documentos inactivos
     * GET /api/v1/user-documents/inactive
     */
    async getInactiveDocuments() {
      try {
        const url = `${this.baseUrl}/inactive`;
        const response = await fetch(url, this.getRequestConfig());
        return await this.handleResponse(response);
      } catch (error) {
        return new ApiResponse(null, `Network error: ${error.message}`, 0);
      }
    }
  
    /**
     * Buscar documentos por criterio
     * GET /api/v1/user-documents/search?query={query}&status={status}
     */
    async searchDocuments(query, status = 'ALL') {
      try {
        const params = new URLSearchParams();
        if (query) params.append('query', query);
        if (status && status !== 'ALL') params.append('status', status);
        
        const url = `${this.baseUrl}/search?${params.toString()}`;
        const response = await fetch(url, this.getRequestConfig());
        return await this.handleResponse(response);
      } catch (error) {
        return new ApiResponse(null, `Network error: ${error.message}`, 0);
      }
    }
  
    /**
     * Obtener estadísticas de documentos
     * GET /api/v1/user-documents/stats
     */
    async getDocumentStats() {
      try {
        const url = `${this.baseUrl}/stats`;
        const response = await fetch(url, this.getRequestConfig());
        return await this.handleResponse(response);
      } catch (error) {
        // Si la API no tiene endpoint de stats, calcularlo localmente
        try {
          const allDocsResponse = await this.getAllDocuments();
          if (allDocsResponse.success && allDocsResponse.data) {
            const allDocs = allDocsResponse.data;
            const stats = {
              total: allDocs.length,
              active: allDocs.filter(doc => doc.status === 'A' || doc.status === 'ACTIVE').length,
              inactive: allDocs.filter(doc => doc.status === 'I' || doc.status === 'INACTIVE').length,
            };
            return new ApiResponse(stats, null, 200);
          }
        } catch (fallbackError) {
          console.warn('Could not calculate stats:', fallbackError);
        }
        return new ApiResponse({ total: 0, active: 0, inactive: 0 }, null, 200);
      }
    }
  
    /**
     * Operación masiva: desactivar múltiples documentos
     */
    async deactivateMultipleDocuments(documentIds) {
      if (!Array.isArray(documentIds) || documentIds.length === 0) {
        return new ApiResponse(null, 'Document IDs array is required', 400);
      }
  
      const results = [];
      const errors = [];
  
      for (const id of documentIds) {
        try {
          const response = await this.deactivateDocument(id);
          if (response.success) {
            results.push({ id, success: true });
          } else {
            errors.push({ id, error: response.error });
          }
        } catch (error) {
          errors.push({ id, error: error.message });
        }
      }
  
      return new ApiResponse(
        { 
          successful: results,
          errors: errors,
          totalProcessed: documentIds.length,
          successfulCount: results.length,
          errorCount: errors.length
        },
        errors.length > 0 ? `${errors.length} documents failed to deactivate` : null,
        200
      );
    }
  
    /**
     * Operación masiva: activar múltiples documentos
     */
    async activateMultipleDocuments(documentIds) {
      if (!Array.isArray(documentIds) || documentIds.length === 0) {
        return new ApiResponse(null, 'Document IDs array is required', 400);
      }
  
      const results = [];
      const errors = [];
  
      for (const id of documentIds) {
        try {
          const response = await this.activateDocument(id);
          if (response.success) {
            results.push({ id, success: true });
          } else {
            errors.push({ id, error: response.error });
          }
        } catch (error) {
          errors.push({ id, error: error.message });
        }
      }
  
      return new ApiResponse(
        { 
          successful: results,
          errors: errors,
          totalProcessed: documentIds.length,
          successfulCount: results.length,
          errorCount: errors.length
        },
        errors.length > 0 ? `${errors.length} documents failed to activate` : null,
        200
      );
    }
  
    /**
     * Operación masiva: eliminar múltiples documentos permanentemente
     */
    async deleteMultipleDocuments(documentIds) {
      if (!Array.isArray(documentIds) || documentIds.length === 0) {
        return new ApiResponse(null, 'Document IDs array is required', 400);
      }
  
      const results = [];
      const errors = [];
  
      for (const id of documentIds) {
        try {
          const response = await this.deleteDocument(id);
          if (response.success) {
            results.push({ id, success: true });
          } else {
            errors.push({ id, error: response.error });
          }
        } catch (error) {
          errors.push({ id, error: error.message });
        }
      }
  
      return new ApiResponse(
        { 
          successful: results,
          errors: errors,
          totalProcessed: documentIds.length,
          successfulCount: results.length,
          errorCount: errors.length
        },
        errors.length > 0 ? `${errors.length} documents failed to delete` : null,
        200
      );
    }
  
    /**
     * Validar conectividad con la API
     */
    async healthCheck() {
      try {
        const url = `${this.baseUrl}/health`;
        const response = await fetch(url, { 
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        
        if (response.ok) {
          return new ApiResponse({ healthy: true, status: 'API is accessible' }, null, response.status);
        } else {
          return new ApiResponse({ healthy: false, status: 'API returned error' }, null, response.status);
        }
      } catch (error) {
        return new ApiResponse({ healthy: false, status: 'API is not accessible' }, `Network error: ${error.message}`, 0);
      }
    }
  }
  
  export const userDocumentService = new UserDocumentService();