class Institution {
  constructor(data = {}) {
    this.id = data.id || null;
    this.institutionName = data.institutionName || '';
    this.codeName = data.codeName || '';
    this.institutionLogo = data.institutionLogo || '';
    this.modularCode = data.modularCode || '';
    this.address = data.address || '';
    this.contactEmail = data.contactEmail || '';
    this.contactPhone = data.contactPhone || '';
    this.status = data.status || 'A';
    this.userId = data.userId || null;
    this.uiSettings = data.uiSettings || {};
    this.evaluationSystem = data.evaluationSystem || {};
    this.scheduleSettings = data.scheduleSettings || {};
    this.headquarterIds = data.headquarterIds || [];
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  // Método para obtener el estado legible
  getStatusText() {
    return this.status === 'A' ? 'Activo' : 'Inactivo';
  }

  // Método para verificar si está activo
  isActive() {
    return this.status === 'A';
  }

  // Método para obtener información básica
  getBasicInfo() {
    return {
      id: this.id,
      name: this.institutionName,
      code: this.codeName,
      email: this.contactEmail,
      phone: this.contactPhone,
      status: this.getStatusText()
    };
  }

  // Método para validar campos requeridos
  isValid() {
    return !!(
      this.institutionName &&
      this.codeName &&
      this.contactEmail &&
      this.contactPhone
    );
  }
}

export default Institution;
