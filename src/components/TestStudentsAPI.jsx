import React, { useState, useEffect } from 'react';
import { studentService } from '../../services';
import { gradeService } from '../../services/gradeService';
import { apiClient } from '../../config/api.config';
import axios from 'axios';

const TestAPI = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cliente para el API de calificaciones
  const gradeApiClient = axios.create({
    baseURL: 'https://ms.grademanagement.machashop.top/api/grades',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    timeout: 10000
  });

  const addResult = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, { message, type, timestamp }]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testStudentsAPI = async () => {
    addResult('🧪 Probando API de Estudiantes...', 'info');
    try {
      const response = await apiClient.get('/students');
      addResult(`✅ API Estudiantes exitoso! Estudiantes: ${response.data.length}`, 'success');
      addResult(`📋 URL: https://ms.students.machashop.top/api/v1/students`, 'info');
    } catch (error) {
      addResult(`❌ Error API Estudiantes: ${error.message}`, 'error');
      console.error('Error API Estudiantes:', error);
    }
  };

  const testGradesAPI = async () => {
    addResult('� Probando API de Calificaciones...', 'info');
    try {
      const response = await gradeApiClient.get('/');
      addResult(`✅ API Calificaciones exitoso! Calificaciones: ${response.data.length}`, 'success');
      addResult(`� URL: https://ms.grademanagement.machashop.top/api/grades`, 'info');
      if (response.data.length > 0) {
        const grade = response.data[0];
        addResult(`� Ejemplo: Estudiante ${grade.studentId} - Nota: ${grade.grade}`, 'info');
      }
    } catch (error) {
      addResult(`❌ Error API Calificaciones: ${error.message}`, 'error');
      console.error('Error API Calificaciones:', error);
    }
  };

  const testStudentService = async () => {
    addResult('� Probando studentService.getAllStudents()...', 'info');
    try {
      const result = await studentService.getAllStudents();
      addResult(`✅ StudentService exitoso! Estudiantes: ${result.data.length}`, 'success');
      addResult(`🔄 Usando mock: ${result.isMockData}`, result.isMockData ? 'warning' : 'success');
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
    } catch (error) {
      addResult(`❌ Error GradeService: ${error.message}`, 'error');
      console.error('Error GradeService:', error);
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    clearResults();
    
    addResult('🚀 Iniciando tests de conectividad completos...', 'info');
    
    await testStudentsAPI();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testGradesAPI();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testStudentService();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testGradeService();
    
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
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <h3>🧪 Test de Conectividad APIs</h3>
      <p style={{ color: '#6c757d', marginBottom: '20px' }}>
        Prueba de conectividad con APIs de Estudiantes y Calificaciones
      </p>
      
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
          style={{ 
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🗑️ Limpiar
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
