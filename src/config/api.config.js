import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://ms.students.machashop.top/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor para manejar errores
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // El servidor respondió con un código de error
      console.error('Error de respuesta:', error.response.data);
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      console.error('Error de red:', error.message);
    } else {
      // Algo pasó al configurar la petición
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export { apiClient }; 