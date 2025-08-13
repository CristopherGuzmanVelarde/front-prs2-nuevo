/**
 * Enumeración para el estado de documentos
 */
export const DocumentStatus = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE'  // Corregido: faltaba comilla de apertura
  };
  
  /**
   * Clase para validar y crear objetos UserDocument
   */
  export class UserDocument {
    constructor({
      id = null,
      userId,
      fileName,
      fileType,
      fileUrl,
      uploadedAt = null,
      uploadedBy,
      description = null,
      status = DocumentStatus.ACTIVE
    }) {
      this.id = id;
      this.userId = userId;
      this.fileName = fileName;
      this.fileType = fileType;
      this.fileUrl = fileUrl;
      this.uploadedAt = uploadedAt;
      this.uploadedBy = uploadedBy;
      this.description = description;
      this.status = status;
    }
  
    /**
     * Valida si el documento tiene los campos requeridos
     */
    isValid() {
      return !!(this.userId && this.fileName && this.fileType && this.fileUrl && this.uploadedBy);
    }
  
    /**
     * Convierte el objeto a JSON para envío
     */
    toJSON() {
      return {
        id: this.id,
        userId: this.userId,
        fileName: this.fileName,
        fileType: this.fileType,
        fileUrl: this.fileUrl,
        uploadedAt: this.uploadedAt,
        uploadedBy: this.uploadedBy,
        description: this.description,
        status: this.status
      };
    }
  }
  
  /**
   * Clase para request de creación de documentos
   */
  export class CreateDocumentRequest {
    constructor({
      userId,
      fileName,
      fileType,
      fileUrl,
      uploadedBy,
      description = null
    }) {
      this.userId = userId;
      this.fileName = fileName;
      this.fileType = fileType;
      this.fileUrl = fileUrl;
      this.uploadedBy = uploadedBy;
      this.description = description;
    }
  
    isValid() {
      return !!(this.userId && this.fileName && this.fileType && this.fileUrl && this.uploadedBy);
    }
  }
  
  /**
   * Clase para request de actualización de documentos
   */
  export class UpdateDocumentRequest {
    constructor({
      userId,
      fileName,
      fileType,
      fileUrl,
      uploadedBy,
      description = null
    }) {
      this.userId = userId;
      this.fileName = fileName;
      this.fileType = fileType;
      this.fileUrl = fileUrl;
      this.uploadedBy = uploadedBy;
      this.description = description;
    }
  
    isValid() {
      return !!(this.userId && this.fileName && this.fileType && this.fileUrl && this.uploadedBy);
    }
  }
  
  /**
   * Clase para manejar respuestas de la API
   */
  export class ApiResponse {
    constructor(data = null, error = null, status = 200) {
      this.data = data;
      this.error = error;
      this.status = status;
      this.success = status >= 200 && status < 300;
    }
  }