/**
 * Utilidades para el módulo de calificaciones
 */

/**
 * Formatea una calificación para mostrar
 * @param {number} grade - Calificación numérica
 * @param {number} decimals - Número de decimales (por defecto 1)
 * @returns {string} Calificación formateada
 */
export const formatGrade = (grade, decimals = 1) => {
    if (grade === null || grade === undefined) return 'N/A';
    return Number(grade).toFixed(decimals);
  };
  
  /**
   * Obtiene el color CSS para una calificación
   * @param {number} grade - Calificación numérica
   * @returns {string} Clase CSS de color
   */
  export const getGradeColor = (grade) => {
    if (grade >= 14) return 'text-success';
    if (grade >= 11) return 'text-warning';
    return 'text-danger';
  };
  
  /**
   * Obtiene el estado de una calificación
   * @param {number} grade - Calificación numérica
   * @returns {Object} Estado con texto y color
   */
  export const getGradeStatus = (grade) => {
    if (grade >= 14) {
      return { text: 'Aprobado', color: 'success', icon: 'fa-check-circle' };
    }
    if (grade >= 11) {
      return { text: 'Recuperación', color: 'warning', icon: 'fa-exclamation-triangle' };
    }
    return { text: 'Desaprobado', color: 'danger', icon: 'fa-times-circle' };
  };
  
  /**
   * Calcula el promedio de calificaciones
   * @param {Array} grades - Array de calificaciones
   * @returns {number} Promedio calculado
   */
  export const calculateAverage = (grades) => {
    if (!grades || grades.length === 0) return 0;
    const sum = grades.reduce((acc, grade) => acc + (grade.grade || 0), 0);
    return sum / grades.length;
  };
  
  /**
   * Agrupa calificaciones por curso
   * @param {Array} grades - Array de calificaciones
   * @returns {Object} Calificaciones agrupadas por curso
   */
  export const groupGradesByCourse = (grades) => {
    return grades.reduce((acc, grade) => {
      const courseId = grade.courseId;
      if (!acc[courseId]) {
        acc[courseId] = [];
      }
      acc[courseId].push(grade);
      return acc;
    }, {});
  };
  
  /**
   * Agrupa calificaciones por período académico
   * @param {Array} grades - Array de calificaciones
   * @returns {Object} Calificaciones agrupadas por período
   */
  export const groupGradesByPeriod = (grades) => {
    return grades.reduce((acc, grade) => {
      const period = grade.academicPeriod;
      if (!acc[period]) {
        acc[period] = [];
      }
      acc[period].push(grade);
      return acc;
    }, {});
  };
  
  /**
   * Filtra calificaciones por rango de fechas
   * @param {Array} grades - Array de calificaciones
   * @param {Date} startDate - Fecha de inicio
   * @param {Date} endDate - Fecha de fin
   * @returns {Array} Calificaciones filtradas
   */
  export const filterGradesByDateRange = (grades, startDate, endDate) => {
    return grades.filter(grade => {
      if (!grade.evaluationDate || !Array.isArray(grade.evaluationDate)) {
        return false;
      }
      const [year, month, day] = grade.evaluationDate;
      const gradeDate = new Date(year, month - 1, day);
      return gradeDate >= startDate && gradeDate <= endDate;
    });
  };
  
  /**
   * Convierte array de fecha a objeto Date
   * @param {Array} dateArray - Array con [año, mes, día]
   * @returns {Date} Objeto Date
   */
  export const arrayToDate = (dateArray) => {
    if (!dateArray || !Array.isArray(dateArray) || dateArray.length < 3) {
      return null;
    }
    const [year, month, day] = dateArray;
    return new Date(year, month - 1, day);
  };
  
  /**
   * Convierte objeto Date a array de fecha
   * @param {Date} date - Objeto Date
   * @returns {Array} Array con [año, mes, día]
   */
  export const dateToArray = (date) => {
    if (!date || !(date instanceof Date)) {
      return null;
    }
    return [
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    ];
  };
  
  /**
   * Valida que una calificación sea válida
   * @param {number} grade - Calificación a validar
   * @returns {boolean} True si es válida
   */
  export const isValidGrade = (grade) => {
    return grade !== null && grade !== undefined && 
           !isNaN(grade) && grade >= 0 && grade <= 20;
  };
  
  /**
   * Obtiene estadísticas de un array de calificaciones
   * @param {Array} grades - Array de calificaciones
   * @returns {Object} Estadísticas calculadas
   */
  export const getGradeStatistics = (grades) => {
    if (!grades || grades.length === 0) {
      return {
        total: 0,
        average: 0,
        passed: 0,
        failed: 0,
        recovery: 0,
        highest: 0,
        lowest: 0
      };
    }
  
    const validGrades = grades.filter(g => isValidGrade(g.grade));
    const gradeValues = validGrades.map(g => g.grade);
    
    const passed = validGrades.filter(g => g.grade >= 14).length;
    const recovery = validGrades.filter(g => g.grade >= 11 && g.grade < 14).length;
    const failed = validGrades.filter(g => g.grade < 11).length;
    
    return {
      total: validGrades.length,
      average: gradeValues.length > 0 ? gradeValues.reduce((a, b) => a + b, 0) / gradeValues.length : 0,
      passed,
      failed,
      recovery,
      highest: gradeValues.length > 0 ? Math.max(...gradeValues) : 0,
      lowest: gradeValues.length > 0 ? Math.min(...gradeValues) : 0,
      passRate: validGrades.length > 0 ? (passed / validGrades.length) * 100 : 0
    };
  };
  
  /**
   * Ordena calificaciones por fecha de evaluación
   * @param {Array} grades - Array de calificaciones
   * @param {string} order - 'asc' o 'desc'
   * @returns {Array} Calificaciones ordenadas
   */
  export const sortGradesByDate = (grades, order = 'desc') => {
    return [...grades].sort((a, b) => {
      const dateA = arrayToDate(a.evaluationDate);
      const dateB = arrayToDate(b.evaluationDate);
      
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    });
  };
  