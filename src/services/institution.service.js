import axios from 'axios';

class InstitutionService {
  constructor() {
    this.apiUrl = 'https://ms.institution.machashop.top/api/v1/institutions';
  }

  async getAllInstitutions() {
    try {
      const response = await axios.get(this.apiUrl);
      return response.data;
    } catch (error) {
      console.error('Error al obtener instituciones:', error);
      throw error;
    }
  }
}

export default new InstitutionService();