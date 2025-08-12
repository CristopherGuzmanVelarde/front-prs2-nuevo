import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { gradeService } from '../../services/gradeService';
import { studentService } from '../../services';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import CustomAlert from '../common/CustomAlert';
import { Grade, ACADEMIC_PERIODS, EVALUATION_TYPES, COURSES } from '../../types/grade.types';

const AddGrade = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    studentId: '',
    courseId: '',
    academicPeriod: '',
    evaluationType: '',
    grade: '',
    evaluationDate: '',
    remarks: ''
  });
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({
    show: false,
    title: '',
    message: '',
    type: 'info'
  });

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoadingStudents(true);
      setError('');
      console.log('Iniciando carga de estudiantes...');
      
      // Cargar todos los estudiantes
      const studentData = await studentService.getAllStudents();
      console.log('Resultado de carga de estudiantes:', studentData);
      
      // El servicio devuelve directamente el array de estudiantes
      if (Array.isArray(studentData)) {
        setStudents(studentData);
        
        console.log(`Estudiantes cargados exitosamente: ${studentData.length} estudiantes`);
        
        if (studentData.length === 0) {
          showAlert({
            title: 'Información',
            message: 'No se encontraron estudiantes registrados',
            type: 'info'
          });
        }
      } else {
        throw new Error('Formato de datos de estudiantes no válido');
      }
    } catch (error) {
      console.error('Error al cargar estudiantes:', error);
      setError('Error al cargar la lista de estudiantes. Por favor, intente nuevamente.');
      setStudents([]); // Establecer array vacío en caso de error
      showAlert({
        title: 'Error',
        message: 'Error al cargar la lista de estudiantes. Verifique su conexión e intente nuevamente.',
        type: 'error'
      });
    } finally {
      setLoadingStudents(false);
    }
  };

  const showAlert = (config) => {
    setAlert({
      show: true,
      ...config
    });
  };

  const hideAlert = () => {
    setAlert({
      show: false,
      title: '',
      message: '',
      type: 'info'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario comience a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.studentId.trim()) {
      newErrors.studentId = 'El estudiante es requerido';
    }
    
    if (!formData.courseId.trim()) {
      newErrors.courseId = 'El curso es requerido';
    }
    
    if (!formData.academicPeriod.trim()) {
      newErrors.academicPeriod = 'El período académico es requerido';
    }
    
    if (!formData.evaluationType.trim()) {
      newErrors.evaluationType = 'El tipo de evaluación es requerido';
    }
    
    if (!formData.grade || isNaN(formData.grade)) {
      newErrors.grade = 'La calificación es requerida y debe ser un número';
    } else {
      const gradeValue = parseFloat(formData.grade);
      if (gradeValue < 0 || gradeValue > 20) {
        newErrors.grade = 'La calificación debe estar entre 0 y 20';
      }
    }
    
    if (!formData.evaluationDate) {
      newErrors.evaluationDate = 'La fecha de evaluación es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Convertir la fecha al formato esperado por el backend
      const dateObj = new Date(formData.evaluationDate);
      const evaluationDateArray = [
        dateObj.getFullYear(),
        dateObj.getMonth() + 1,
        dateObj.getDate()
      ];

      const gradeData = {
        studentId: formData.studentId,
        courseId: formData.courseId,
        academicPeriod: formData.academicPeriod,
        evaluationType: formData.evaluationType,
        grade: parseFloat(formData.grade),
        evaluationDate: evaluationDateArray,
        remarks: formData.remarks || '',
        deleted: false
      };

      await gradeService.createGrade(gradeData);

      showAlert({
        title: 'Éxito',
        message: 'Calificación creada correctamente',
        type: 'success',
        onConfirm: () => {
          navigate('/grade');
        }
      });

    } catch (error) {
      console.error('Error al crear calificación:', error);
      let errorMessage = 'Error al crear la calificación';
      
      if (error.response && error.response.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }

      showAlert({
        title: 'Error',
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/grades');
  };

  return (
    <>
      <Header />
      <Sidebar activeClassName="grade-list" />
      
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="page-title">
              <h4>Agregar Calificación</h4>
              <h6>Crear nueva calificación académica</h6>
            </div>
            <div className="page-btn">
              <a 
                href="/test-students-api" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
              >
                🧪 Test API
              </a>
            </div>
          </div>

          <Card>
            <Card.Header>
              <h5 className="card-title">Información de la Calificación</h5>
            </Card.Header>
            {students.length > 0 && (
              <div className="alert alert-success mb-0 rounded-0" style={{ borderLeft: 'none', borderRight: 'none' }}>
                <i className="fas fa-check-circle me-2"></i>
                <small>
                  <strong>Estudiantes cargados:</strong> {students.length} estudiantes disponibles.
                </small>
              </div>
            )}
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Estudiante *</Form.Label>
                      {loadingStudents ? (
                        <div className="text-center py-3">
                          <Spinner animation="border" size="sm" />
                          <span className="ms-2">Cargando estudiantes desde el servidor...</span>
                          <br />
                          <small className="text-muted mt-1">
                            Conectando a: https://lab.vallegrande.edu.pe/school/ms-student/api/v1
                          </small>
                        </div>
                      ) : error ? (
                        <div>
                          <div className="alert alert-warning py-2">
                            <small>{error}</small>
                            <br />
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="p-0 mt-1"
                              onClick={loadStudents}
                            >
                              <i className="fas fa-refresh me-1"></i>
                              Reintentar
                            </Button>
                          </div>
                          <Form.Select disabled>
                            <option>Error al cargar estudiantes</option>
                          </Form.Select>
                        </div>
                      ) : students.length === 0 ? (
                        <div>
                          <div className="alert alert-info py-2">
                            <small>No hay estudiantes disponibles</small>
                            <br />
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="p-0 mt-1"
                              onClick={loadStudents}
                            >
                              <i className="fas fa-refresh me-1"></i>
                              Recargar
                            </Button>
                          </div>
                          <Form.Select disabled>
                            <option>No hay estudiantes disponibles</option>
                          </Form.Select>
                        </div>
                      ) : (
                        <Form.Select
                          name="studentId"
                          value={formData.studentId}
                          onChange={handleInputChange}
                          isInvalid={!!errors.studentId}
                        >
                          <option value="">Seleccionar estudiante</option>
                          {students.map(student => (
                            <option key={student.id} value={student.id}>
                              {student.firstName} {student.lastName} - {student.documentNumber}
                            </option>
                          ))}
                        </Form.Select>
                      )}
                      <Form.Control.Feedback type="invalid">
                        {errors.studentId}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Curso *</Form.Label>
                      <Form.Select
                        name="courseId"
                        value={formData.courseId}
                        onChange={handleInputChange}
                        isInvalid={!!errors.courseId}
                      >
                        <option value="">Seleccionar curso</option>
                        {COURSES.map(course => (
                          <option key={course.value} value={course.value}>
                            {course.value} - {course.label}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.courseId}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Período Académico *</Form.Label>
                      <Form.Select
                        name="academicPeriod"
                        value={formData.academicPeriod}
                        onChange={handleInputChange}
                        isInvalid={!!errors.academicPeriod}
                      >
                        <option value="">Seleccionar período</option>
                        {ACADEMIC_PERIODS.map(period => (
                          <option key={period.value} value={period.value}>
                            {period.label}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.academicPeriod}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tipo de Evaluación *</Form.Label>
                      <Form.Select
                        name="evaluationType"
                        value={formData.evaluationType}
                        onChange={handleInputChange}
                        isInvalid={!!errors.evaluationType}
                      >
                        <option value="">Seleccionar tipo</option>
                        {EVALUATION_TYPES.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.evaluationType}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Calificación * (0-20)</Form.Label>
                      <Form.Control
                        type="number"
                        name="grade"
                        value={formData.grade}
                        onChange={handleInputChange}
                        placeholder="Ingrese la calificación"
                        min="0"
                        max="20"
                        step="0.1"
                        isInvalid={!!errors.grade}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.grade}
                      </Form.Control.Feedback>
                      {formData.grade && !errors.grade && (
                        <Form.Text className="text-muted">
                          Estado: {new Grade({grade: parseFloat(formData.grade)}).getPassStatus()}
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Fecha de Evaluación *</Form.Label>
                      <Form.Control
                        type="date"
                        name="evaluationDate"
                        value={formData.evaluationDate}
                        onChange={handleInputChange}
                        isInvalid={!!errors.evaluationDate}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.evaluationDate}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Observaciones</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleInputChange}
                        placeholder="Ingrese observaciones adicionales (opcional)"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex justify-content-end gap-2">
                  <Button 
                    variant="secondary" 
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Guardando...
                      </>
                    ) : (
                      'Guardar Calificación'
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>

      <CustomAlert
        show={alert.show}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onConfirm={alert.onConfirm || hideAlert}
        onClose={hideAlert}
      />
    </>
  );
};

export default AddGrade;
