import React, { useState, useEffect } from 'react';
import { studentService, gradeService, notificationService } from '../services';
import { apiClient } from '../config/api.config';

const TestAPI = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, { message, type, timestamp }]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testStudentsAPI = async () => {
    addResult('👥 Probando API de Estudiantes...', 'info');
    addResult('🔗 Endpoint: https://ms.students.machashop.top/api/v1/students', 'info');
    
    try {
      const response = await apiClient.get('/students');
      addResult(`✅ API Estudiantes exitoso! Estudiantes: ${response.data.length}`, 'success');
      
      if (response.data.length > 0) {
        const student = response.data[0];
        addResult(`📄 Ejemplo: ${student.firstName || student.name} ${student.lastName || ''}`, 'info');
      } else {
        addResult('ℹ️ No se encontraron estudiantes en el servidor', 'warning');
      }
    } catch (error) {
      addResult(`❌ Error API Estudiantes: ${error.message}`, 'error');
      
      if (error.response) {
        addResult(`📊 Estado HTTP: ${error.response.status}`, 'error');
        addResult(`📝 Respuesta: ${JSON.stringify(error.response.data)}`, 'error');
      } else if (error.request) {
        addResult('🔌 Error de conexión - servidor no responde', 'error');
      }
      
      console.error('Error API Estudiantes:', error);
    }
  };

  const testGradesAPI = async () => {
    addResult('📊 Probando API de Calificaciones...', 'info');
    addResult('🔗 Endpoint: https://ms.grademanagement.machashop.top/api/grades', 'info');
    
    try {
      const response = await gradeService.getAllGrades();
      
      if (Array.isArray(response) && response.length > 0) {
        addResult(`✅ API Calificaciones exitoso! Calificaciones: ${response.length}`, 'success');
        const grade = response[0];
        addResult(`📄 Ejemplo: Estudiante ${grade.studentId || grade.student_id} - Nota: ${grade.grade}`, 'info');
      } else if (Array.isArray(response) && response.length === 0) {
        addResult('⚠️ API Calificaciones conectado pero sin datos', 'warning');
        addResult('💡 El servidor responde correctamente pero no hay calificaciones registradas', 'info');
      } else {
        addResult('⚠️ Respuesta inesperada del servidor de calificaciones', 'warning');
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        addResult('❌ Endpoint de calificaciones no encontrado (404)', 'error');
        addResult('💡 Verifica que el servidor esté ejecutándose y el endpoint sea correcto', 'info');
      } else {
        addResult(`❌ Error API Calificaciones: ${error.message}`, 'error');
        
        if (error.response) {
          addResult(`📊 Estado HTTP: ${error.response.status}`, 'error');
          if (error.response.data) {
            addResult(`📝 Respuesta: ${JSON.stringify(error.response.data)}`, 'error');
          }
        } else if (error.request) {
          addResult('🔌 Error de conexión - servidor no responde', 'error');
        }
      }
      
      console.error('Error API Calificaciones:', error);
    }
  };

  const testStudentService = async () => {
    addResult('👥 Probando studentService.getAllStudents()...', 'info');
    try {
      const result = await studentService.getAllStudents();
      
      if (result && Array.isArray(result)) {
        addResult(`✅ StudentService exitoso! Estudiantes: ${result.length}`, 'success');
      } else if (result && result.data && Array.isArray(result.data)) {
        addResult(`✅ StudentService exitoso! Estudiantes: ${result.data.length}`, 'success');
      } else {
        addResult('⚠️ StudentService responde con formato inesperado', 'warning');
      }
    } catch (error) {
      addResult(`❌ Error StudentService: ${error.message}`, 'error');
      console.error('Error StudentService:', error);
    }
  };

  const testGradeService = async () => {
    addResult('📊 Probando gradeService.getAllGrades()...', 'info');
    try {
      const result = await gradeService.getAllGrades();
      
      if (Array.isArray(result) && result.length > 0) {
        addResult(`✅ GradeService exitoso! Calificaciones: ${result.length}`, 'success');
      } else if (Array.isArray(result) && result.length === 0) {
        addResult('⚠️ GradeService conectado pero sin datos', 'warning');
      } else {
        addResult('⚠️ GradeService responde con formato inesperado', 'warning');
      }
    } catch (error) {
      addResult(`❌ Error GradeService: ${error.message}`, 'error');
      console.error('Error GradeService:', error);
    }
  };

  const testNotificationService = async () => {
    addResult('🔔 Probando notificationService.getAllNotifications()...', 'info');
    addResult('🔗 Endpoint: https://ms.grademanagement.machashop.top/notifications', 'info');
    
    try {
      const result = await notificationService.getAllNotifications();
      
      if (Array.isArray(result) && result.length > 0) {
        addResult(`✅ NotificationService exitoso! Notificaciones: ${result.length}`, 'success');
        const notification = result[0];
        addResult(`📄 Ejemplo: ${notification.message || notification.title}`, 'info');
      } else if (Array.isArray(result) && result.length === 0) {
        addResult('⚠️ API Notificaciones conectado pero sin datos', 'warning');
        addResult('💡 El servidor responde correctamente pero no hay notificaciones registradas', 'info');
      } else {
        addResult('⚠️ Respuesta inesperada del servidor de notificaciones', 'warning');
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        addResult('❌ Endpoint de notificaciones no encontrado (404)', 'error');
        addResult('💡 Verifica que el servidor esté ejecutándose y el endpoint sea correcto', 'info');
      } else {
        addResult(`❌ Error NotificationService: ${error.message}`, 'error');
        
        if (error.response) {
          addResult(`📊 Estado HTTP: ${error.response.status}`, 'error');
          if (error.response.data) {
            addResult(`📝 Respuesta: ${JSON.stringify(error.response.data)}`, 'error');
          }
        } else if (error.request) {
          addResult('🔌 Error de conexión - servidor no responde', 'error');
        }
      }
      
      console.error('Error NotificationService:', error);
    }
  };

  const initializeBackendData = async () => {
    addResult('🔧 Inicializando datos de prueba en el backend...', 'info');
    try {
      const response = await fetch('https://ms.grademanagement.machashop.top/debug/init-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        addResult(`✅ Datos inicializados: ${data.grades_created} calificaciones, ${data.notifications_created} notificaciones`, 'success');
        addResult('🔄 Ejecutando tests nuevamente...', 'info');
        
        // Esperar un momento y ejecutar tests nuevamente
        setTimeout(() => {
          runAllTests();
        }, 2000);
      } else {
        addResult(`❌ Error al inicializar datos: ${response.status}`, 'error');
      }
    } catch (error) {
      addResult(`❌ Error al conectar con el backend: ${error.message}`, 'error');
    }
  };

  const checkBackendStats = async () => {
    addResult('📊 Verificando estadísticas del backend...', 'info');
    try {
      const response = await fetch('https://ms.grademanagement.machashop.top/debug/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        addResult(`📈 Estadísticas: ${data.total_grades} calificaciones, ${data.total_notifications} notificaciones`, 'info');
      } else {
        addResult(`❌ Error al obtener estadísticas: ${response.status}`, 'error');
      }
    } catch (error) {
      addResult(`❌ Error al conectar: ${error.message}`, 'error');
    }
  };

  const checkBasicConnectivity = async () => {
    addResult('🔍 Verificando conectividad básica...', 'info');
    
    // Verificar conectividad con endpoints principales
    const endpoints = [
      { name: 'Estudiantes', url: 'https://ms.students.machashop.top/api/v1/students' },
      { name: 'Calificaciones', url: 'https://ms.grademanagement.machashop.top/api/grades' },
      { name: 'Notificaciones', url: 'https://ms.grademanagement.machashop.top/notifications' }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint.url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          timeout: 5000
        });

        if (response.ok) {
          addResult(`✅ ${endpoint.name}: Servidor responde (${response.status})`, 'success');
        } else {
          addResult(`⚠️ ${endpoint.name}: Servidor responde con error ${response.status}`, 'warning');
        }
      } catch (error) {
        addResult(`❌ ${endpoint.name}: No se puede conectar - ${error.message}`, 'error');
      }
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    clearResults();
    
    addResult('🚀 Iniciando tests de conectividad completos...', 'info');
    addResult('ℹ️ Probando solo APIs reales - sin datos mock', 'info');
    
    // Primero verificar conectividad básica
    await checkBasicConnectivity();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testStudentsAPI();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testGradesAPI();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testStudentService();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testGradeService();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testNotificationService();
    
    addResult('✅ Tests completados!', 'success');
    setLoading(false);
  };

  useEffect(() => {
    runAllTests();
  }, []);

  const getResultStyle = (type) => {
    const baseStyle = {
      padding: '8px',
      margin: '4px 0',
      borderRadius: '4px',
      fontSize: '12px',
      fontFamily: 'monospace'
    };

    switch (type) {
      case 'success':
        return { ...baseStyle, backgroundColor: '#d4edda', border: '1px solid #c3e6cb' };
      case 'error':
        return { ...baseStyle, backgroundColor: '#f8d7da', border: '1px solid #f5c6cb' };
      case 'warning':
        return { ...baseStyle, backgroundColor: '#fff3cd', border: '1px solid #ffeaa7' };
      default:
        return { ...baseStyle, backgroundColor: '#e2e3e5', border: '1px solid #d6d8db' };
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px' }}>
      <h3>🧪 Test de Conectividad APIs - Sin Mock Data</h3>
      <p style={{ color: '#6c757d', marginBottom: '20px' }}>
        Prueba de conectividad con APIs reales: Estudiantes, Calificaciones y Notificaciones
      </p>
      
      <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#e7f3ff', border: '1px solid #b3d9ff', borderRadius: '4px' }}>
        <strong>📍 Endpoints configurados:</strong>
        <ul style={{ margin: '5px 0', paddingLeft: '20px', fontSize: '12px' }}>
          <li>👥 Estudiantes: https://ms.students.machashop.top/api/v1/students</li>
          <li>📊 Calificaciones: https://ms.grademanagement.machashop.top/api/grades</li>
          <li>🔔 Notificaciones: https://ms.grademanagement.machashop.top/notifications</li>
        </ul>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={runAllTests} 
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '🔄 Ejecutando...' : '🧪 Ejecutar Tests'}
        </button>
        
        <button 
          onClick={clearResults}
          disabled={loading}
          style={{ 
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          🗑️ Limpiar
        </button>
        
        <button 
          onClick={initializeBackendData}
          disabled={loading}
          style={{ 
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          🔧 Inicializar Datos
        </button>
        
        <button 
          onClick={checkBackendStats}
          disabled={loading}
          style={{ 
            padding: '10px 20px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          📊 Ver Estadísticas
        </button>
      </div>

      <div style={{ 
        maxHeight: '500px', 
        overflowY: 'auto', 
        border: '1px solid #ddd', 
        borderRadius: '4px',
        padding: '10px'
      }}>
        {testResults.map((result, index) => (
          <div key={index} style={getResultStyle(result.type)}>
            <strong>{result.timestamp}</strong>: {result.message}
          </div>
        ))}
        
        {testResults.length === 0 && (
          <div style={{ textAlign: 'center', color: '#6c757d', padding: '20px' }}>
            No hay resultados aún...
          </div>
        )}
      </div>
    </div>
  );
};

export default TestAPI;
