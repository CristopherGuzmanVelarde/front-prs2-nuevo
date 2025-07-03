import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { enrollmentService } from '../../services/enrollmentService';
import { classroomService } from '../../services/classroomService';
import { studentService } from '../../services/studentService';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import CustomAlert from '../common/CustomAlert';

const AddEnrollment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [formData, setFormData] = useState({
    studentId: '',
    classroomId: '',
    enrollmentDate: new Date().toISOString().split('T')[0],
    enrollmentYear: new Date().getFullYear().toString(),
    enrollmentPeriod: `${new Date().getFullYear()}-${Math.ceil((new Date().getMonth() + 1) / 6)}`,
    status: 'A'
  });
  const [alert, setAlert] = useState({
    show: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null
  });

  const showAlert = (config) => {
    setAlert({ ...config, show: true });
  };

  const hideAlert = () => {
    setAlert(prev => ({ ...prev, show: false }));
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Cargar aulas y estudiantes
        const [enrollmentsData, studentsData, classroomsData] = await Promise.all([
          enrollmentService.getAllEnrollments(),
          studentService.getAllStudents(),
          classroomService.getAllClassrooms()
        ]);

        // Filtrar estudiantes que no tienen matrícula activa
        const activeEnrollments = enrollmentsData.filter(e => e.status === 'A');
        const enrolledStudentIds = new Set(activeEnrollments.map(e => e.studentId));
        const availableStudents = studentsData.filter(student => !enrolledStudentIds.has(student.id));

        setAvailableStudents(availableStudents);
        setClassrooms(classroomsData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        showAlert({
          title: 'Error',
          message: 'Error al cargar los datos. Por favor, intente nuevamente.',
          type: 'error',
          showCancel: false
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.classroomId || !formData.studentId || !formData.enrollmentDate || 
          !formData.enrollmentYear || !formData.enrollmentPeriod) {
        throw new Error('Todos los campos son obligatorios');
      }

      await enrollmentService.createEnrollment(formData);
      
      showAlert({
        title: 'Éxito',
        message: 'Matrícula creada correctamente',
        type: 'success',
        showCancel: false,
        autoClose: true,
        onConfirm: () => navigate('/enrollmentlist')
      });
    } catch (error) {
      console.error('Error al crear matrícula:', error);
      showAlert({
        title: 'Error',
        message: error.message || 'Error al crear la matrícula',
        type: 'error',
        showCancel: false
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <>
        <Header />
        <Sidebar />
        <div className="page-wrapper">
          <div className="content container-fluid">
            <div className="text-center mt-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <Sidebar activeClassName="add-enrollment" />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row">
              <div className="col">
                <h3 className="page-title">Agregar Matrícula</h3>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="card-body">
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Estudiante</Form.Label>
                          <Form.Select
                            name="studentId"
                            value={formData.studentId}
                            onChange={handleChange}
                            required
                          >
                            <option value="">Seleccione un estudiante</option>
                            {availableStudents.map(student => (
                              <option key={student.id} value={student.id}>
                                {`${student.firstName} ${student.lastName}`}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Aula</Form.Label>
                          <Form.Select
                            name="classroomId"
                            value={formData.classroomId}
                            onChange={handleChange}
                            required
                          >
                            <option value="">Seleccione un aula</option>
                            {classrooms.map(classroom => (
                              <option key={classroom.id} value={classroom.id}>
                                {classroom.name}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Fecha de Matrícula</Form.Label>
                          <Form.Control
                            type="date"
                            name="enrollmentDate"
                            value={formData.enrollmentDate}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Año</Form.Label>
                          <Form.Control
                            type="text"
                            name="enrollmentYear"
                            value={formData.enrollmentYear}
                            onChange={handleChange}
                            required
                            pattern="\d{4}"
                            title="Ingrese un año válido (4 dígitos)"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Periodo</Form.Label>
                          <Form.Control
                            type="text"
                            name="enrollmentPeriod"
                            value={formData.enrollmentPeriod}
                            onChange={handleChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className="form-group text-end">
                      <Button variant="primary" type="submit" className="me-2">
                        Guardar
                      </Button>
                      <Button 
                        variant="secondary" 
                        onClick={() => navigate('/enrollmentlist')}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </Form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CustomAlert
        show={alert.show}
        onClose={hideAlert}
        onConfirm={alert.onConfirm}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        showCancel={alert.showCancel}
        autoClose={alert.autoClose}
      />
    </>
  );
};

export default AddEnrollment; 