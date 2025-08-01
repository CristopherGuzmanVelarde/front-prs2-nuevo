import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { gradeService } from '../../services/gradeService';
import { studentService } from '../../services';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import CustomAlert from '../common/CustomAlert';
import { Grade, ACADEMIC_PERIODS, EVALUATION_TYPES, COURSES } from '../../types/grade.types';

const EditGrade = () => {
  const navigate = useNavigate();
  const { id } = useParams();
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
  const [loadingData, setLoadingData] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({
    show: false,
    title: '',
    message: '',
    type: 'info'
  });

  useEffect(() => {
    loadGradeData();
    loadStudents();
  }, [id]);

  const loadGradeData = async () => {
    try {
      setLoadingData(true);
      const grade = await gradeService.getGradeById(id);
      
      // Convertir la fecha del formato array al formato de input date
      let dateString = '';
      if (grade.evaluationDate && Array.isArray(grade.evaluationDate)) {
        const [year, month, day] = grade.evaluationDate;
        dateString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      }

      setFormData({
        studentId: grade.studentId || '',
        courseId: grade.courseId || '',
        academicPeriod: grade.academicPeriod || '',
        evaluationType: grade.evaluationType || '',
        grade: grade.grade ? grade.grade.toString() : '',
        evaluationDate: dateString,
        remarks: grade.remarks || ''
      });
    } catch (error) {
      console.error('Error al cargar calificación:', error);
      showAlert({
        title: 'Error',
        message: 'Error al cargar los datos de la calificación',
        type: 'error',
        onConfirm: () => navigate('/grades')
      });
    } finally {
      setLoadingData(false);
    }
  };

  const loadStudents = async () => {
    try {
      setLoadingStudents(true);
      
      // Cargar todos los estudiantes
      const studentData = await studentService.getAllStudents();
      console.log('Estudiantes cargados:', studentData);
      
      // El servicio devuelve directamente el array de estudiantes
      if (Array.isArray(studentData)) {
        setStudents(studentData);
      } else {
        setStudents([]);
      }
      
    } catch (error) {
      console.error('Error al cargar estudiantes:', error);
      setStudents([]); // Establecer array vacío en caso de error
      showAlert({
        title: 'Error',
        message: 'Error al cargar la lista de estudiantes.',
        type: 'warning'
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

      await gradeService.updateGrade(id, gradeData);

      showAlert({
        title: 'Éxito',
        message: 'Calificación actualizada correctamente',
        type: 'success',
        onConfirm: () => {
          navigate('/grade');
        }
      });

    } catch (error) {
      console.error('Error al actualizar calificación:', error);
      let errorMessage = 'Error al actualizar la calificación';
      
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
    navigate('/grade');
  };

  if (loadingData) {
    return (
      <>
        <Header />
        <Sidebar activeClassName="grade-list" />
        <div className="page-wrapper">
          <div className="content">
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </Spinner>
              <div className="mt-2">Cargando datos de la calificación...</div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <Sidebar activeClassName="grade-list" />
      
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="page-title">
              <h4>Editar Calificación</h4>
              <h6>Modificar calificación académica</h6>
            </div>
          </div>

          <Card>
            <Card.Header>
              <h5 className="card-title">Información de la Calificación</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Estudiante *</Form.Label>
                      {loadingStudents ? (
                        <div className="text-center py-2">
                          <Spinner animation="border" size="sm" />
                          <span className="ms-2">Cargando estudiantes...</span>
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
                        Actualizando...
                      </>
                    ) : (
                      'Actualizar Calificación'
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

export default EditGrade;
