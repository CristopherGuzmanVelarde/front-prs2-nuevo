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
    addResult('🔗 Endpoint: https://ms.grademanagement.machashop.top/api/grades/', 'info');
    
    try {
      const response = await gradeService.getAllGrades();
      addResult(`✅ API Calificaciones exitoso! Calificaciones: ${response.length}`, 'success');
      
      if (response.length > 0) {
        const grade = response[0];
        addResult(`📄 Ejemplo: Estudiante ${grade.studentId || grade.student_id} - Nota: ${grade.grade}`, 'info');
      } else {
        addResult('ℹ️ No se encontraron calificaciones en el servidor', 'warning');
      }
    } catch (error) {
      addResult(`❌ Error API Calificaciones: ${error.message}`, 'error');
      
      if (error.response) {
        addResult(`📊 Estado HTTP: ${error.response.status}`, 'error');
        addResult(`📝 Respuesta: ${JSON.stringify(error.response.data)}`, 'error');
      } else if (error.request) {
        addResult('🔌 Error de conexión - servidor no responde', 'error');
      }
      
      console.error('Error API Calificaciones:', error);
    }
  };

  const testStudentService = async () => {
    addResult('👤 Probando studentService.getAllStudents()...', 'info');
    try {
      const result = await studentService.getAllStudents();
      addResult(`✅ StudentService exitoso! Estudiantes: ${result.length}`, 'success');
      
      if (result.length > 0) {
        const student = result[0];
        addResult(`📄 Ejemplo: ${student.firstName || student.name} ${student.lastName || ''}`, 'info');
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
      addResult(`✅ GradeService exitoso! Calificaciones: ${result.length}`, 'success');
      
      if (result.length > 0) {
        const grade = result[0];
        addResult(`📄 Ejemplo: Estudiante ${grade.studentId || grade.student_id} - Nota: ${grade.grade}`, 'info');
      }
    } catch (error) {
      addResult(`❌ Error GradeService: ${error.message}`, 'error');
      console.error('Error GradeService:', error);
    }
  };

  const testNotificationService = async () => {
    addResult('🔔 Probando notificationService.getAllNotifications()...', 'info');
    addResult('🔗 Endpoint: https://ms.grademanagement.machashop.top/api/notifications/', 'info');
    
    try {
      const result = await notificationService.getAllNotifications();
      addResult(`✅ NotificationService exitoso! Notificaciones: ${result.length}`, 'success');
      
      if (result.length > 0) {
        const notification = result[0];
        addResult(`📄 Ejemplo: ${notification.message || notification.title}`, 'info');
      } else {
        addResult('ℹ️ No se encontraron notificaciones en el servidor', 'warning');
      }
    } catch (error) {
      addResult(`❌ Error NotificationService: ${error.message}`, 'error');
      
      if (error.response) {
        addResult(`📊 Estado HTTP: ${error.response.status}`, 'error');
        addResult(`📝 Respuesta: ${JSON.stringify(error.response.data)}`, 'error');
      } else if (error.request) {
        addResult('🔌 Error de conexión - servidor no responde', 'error');
      }
      
      console.error('Error NotificationService:', error);
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    clearResults();
    
    addResult('🚀 Iniciando tests de conectividad completos...', 'info');
    addResult('ℹ️ No se usarán datos mock - solo APIs reales', 'info');
    
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
        return { ...baseStyle, backgroundColor: '#d4edda', border: '1px solid #c3e6cb', color: '#155724' };
      case 'error':
        return { ...baseStyle, backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', color: '#721c24' };
      case 'warning':
        return { ...baseStyle, backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', color: '#856404' };
      default:
        return { ...baseStyle, backgroundColor: '#e2e3e5', border: '1px solid #d6d8db', color: '#383d41' };
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px' }}>
      <h3>🧪 Test de Conectividad APIs - Sin Mock Data</h3>
      <p style={{ color: '#6c757d', marginBottom: '20px' }}>
        Prueba de conectividad con APIs reales de Estudiantes, Calificaciones y Notificaciones
      </p>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={runAllTests} 
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: loading ? '#6c757d' : '#007bff',
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
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          🗑️ Limpiar
        </button>
      </div>

      <div style={{ 
        maxHeight: '600px', 
        overflowY: 'auto', 
        border: '1px solid #ddd', 
        borderRadius: '4px',
        padding: '10px',
        backgroundColor: '#f8f9fa'
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
      
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#6c757d' }}>
        <strong>Estado de APIs:</strong>
        <ul style={{ marginTop: '5px' }}>
          <li>🟢 Verde: API funcionando correctamente</li>
          <li>🟡 Amarillo: API responde pero sin datos</li>
          <li>🔴 Rojo: API con errores o no disponible</li>
        </ul>
      </div>
    </div>
  );
};

export default TestAPI;
