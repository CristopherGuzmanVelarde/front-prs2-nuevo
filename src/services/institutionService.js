import Institution from '../types/institution';

class InstitutionService {
  constructor() {
    this.apiUrl = 'https://lab.vallegrande.edu.pe/school/ms-institution/api/v1/institutions'; // Cambia esta URL por la de tu API
  }

  // Obtener todas las instituciones
  async getAllInstitutions() {
    try {
      const response = await fetch(this.apiUrl);
      
      if (!response.ok) {
        throw new Error(`Error fetching institutions: ${response.status}`);
      }
      
      const data = await response.json();
      return data.map(institution => new Institution(institution));
    } catch (error) {
      console.error('Error in InstitutionService.getAllInstitutions:', error);
      throw error;
    }
  }

  // Obtener institución por ID
  async getInstitutionById(id) {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching institution: ${response.status}`);
      }
      
      const data = await response.json();
      return new Institution(data);
    } catch (error) {
      console.error('Error in InstitutionService.getInstitutionById:', error);
      throw error;
    }
  }

  // Crear una nueva institución
  async createInstitution(institutionData) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(institutionData),
      });
      
      if (!response.ok) {
        throw new Error(`Error creating institution: ${response.status}`);
      }
      
      const data = await response.json();
      return new Institution(data);
    } catch (error) {
      console.error('Error in InstitutionService.createInstitution:', error);
      throw error;
    }
  }

  // Actualizar una institución
  async updateInstitution(id, institutionData) {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(institutionData),
      });
      
      if (!response.ok) {
        throw new Error(`Error updating institution: ${response.status}`);
      }
      
      const data = await response.json();
      return new Institution(data);
    } catch (error) {
      console.error('Error in InstitutionService.updateInstitution:', error);
      throw error;
    }
  }

  // Eliminar (inactivar) una institución
  async deleteInstitution(id) {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting institution: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error in InstitutionService.deleteInstitution:', error);
      throw error;
    }
  }

  // Restaurar una institución
  async restoreInstitution(id) {
    try {
      const response = await fetch(`${this.apiUrl}/restore/${id}`, {
        method: 'PUT',
      });
      
      if (!response.ok) {
        throw new Error(`Error restoring institution: ${response.status}`);
      }
      
      const data = await response.json();
      return new Institution(data);
    } catch (error) {
      console.error('Error in InstitutionService.restoreInstitution:', error);
      throw error;
    }
  }

  // Asignar director a una institución
  async assignDirector(id, directorData) {
    try {
      const response = await fetch(`${this.apiUrl}/assign/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(directorData),
      });
      
      if (!response.ok) {
        throw new Error(`Error assigning director: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in InstitutionService.assignDirector:', error);
      throw error;
    }
  }

  // Obtener directores de una institución
  async getInstitutionDirectors(id) {
    try {
      const response = await fetch(`${this.apiUrl}/${id}/directors`);
      
      if (!response.ok) {
        throw new Error(`Error fetching directors: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in InstitutionService.getInstitutionDirectors:', error);
      throw error;
    }
  }

  // Obtener sedes de una institución
  async getInstitutionHeadquarters(id) {
    try {
      const response = await fetch(`${this.apiUrl}/${id}/headquarters`);
      
      if (!response.ok) {
        throw new Error(`Error fetching headquarters: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in InstitutionService.getInstitutionHeadquarters:', error);
      throw error;
    }
  }

  // Eliminar (inactivar) una sede
  async deleteHeadquarter(id) {
    try {
      const response = await fetch(`https://ms.institution.machashop.top/api/v1/headquarters/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting headquarter: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error in InstitutionService.deleteHeadquarter:', error);
      throw error;
    }
  }

  // Restaurar una sede
  async restoreHeadquarter(id) {
    try {
      const response = await fetch(`https://ms.institution.machashop.top/api/v1/headquarters/restore/${id}`, {
        method: 'PUT',
      });
      
      if (!response.ok) {
        throw new Error(`Error restoring headquarter: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in InstitutionService.restoreHeadquarter:', error);
      throw error;
    }
  }

  // Crear una nueva sede
  async createHeadquarter(headquarterData) {
    try {
      // Asegurar que el status no sea null
      if (headquarterData.status === null || headquarterData.status === undefined) {
        headquarterData.status = 'A'; // Establecer como Activo por defecto
      }
      
      console.log('Creating headquarter with data:', headquarterData);
      
      const response = await fetch(`https://ms.institution.machashop.top/api/v1/headquarters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(headquarterData),
      });
      
      if (!response.ok) {
        throw new Error(`Error creating headquarter: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in InstitutionService.createHeadquarter:', error);
      throw error;
    }
  }

  // Actualizar una sede
  async updateHeadquarter(id, headquarterData) {
    try {
      // Asegurar que el status no sea null
      if (headquarterData.status === null || headquarterData.status === undefined) {
        headquarterData.status = 'A'; // Establecer como Activo por defecto
      }
      
      console.log('Updating headquarter with data:', headquarterData);
      
      const response = await fetch(`https://ms.institution.machashop.top/api/v1/headquarters/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(headquarterData),
      });
      
      if (!response.ok) {
        throw new Error(`Error updating headquarter: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error in InstitutionService.updateHeadquarter:', error);
      throw error;
    }
  }

  // Obtener sede por ID
  async getHeadquarterById(id) {
    try {
      const response = await fetch(`https://ms.institution.machashop.top/api/v1/headquarters/${id}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching headquarter: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Headquarter data retrieved from API:', data);
      
      // Si el status es null, asignar 'A' por defecto
      if (data.status === null || data.status === undefined) {
        data.status = 'A';
      }
      
      return data;
    } catch (error) {
      console.error('Error in InstitutionService.getHeadquarterById:', error);
      throw error;
    }
  }

  // Método legacy para compatibilidad
  async getCurrentInstitution() {
    try {
      const response = await fetch(this.apiUrl);
      
      if (!response.ok) {
        throw new Error(`Error fetching user profile: ${response.status}`);
      }
      
      const data = await response.json();
      return new Institution(data);
    } catch (error) {
      console.error('Error in InstitutionService.getCurrentUser:', error);
      throw error;
    }
  }
}

export default new InstitutionService();