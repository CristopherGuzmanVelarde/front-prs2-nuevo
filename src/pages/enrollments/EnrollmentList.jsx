import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Form, InputGroup, Spinner, Modal, Card, Row, Col } from 'react-bootstrap';
import { enrollmentService } from '../../services/enrollmentService';
import { studentService } from '../../services/studentService';
import { classroomService } from '../../services/classroomService';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import CustomAlert from '../common/CustomAlert';

const EnrollmentList = () => {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [studentDetails, setStudentDetails] = useState({});
  const [classroomDetails, setClassroomDetails] = useState({});
  const [processingAction, setProcessingAction] = useState(false);
  const [filters, setFilters] = useState({
    status: 'A',
    classroom: 'all',
    year: 'all',
    period: 'all'
  });
  const [showDetails, setShowDetails] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [alert, setAlert] = useState({
    show: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null
  });

  const loadStudentDetails = async (studentId) => {
    if (!studentId || studentDetails[studentId]) return;
    
    try {
      const student = await studentService.getStudentById(studentId);
      setStudentDetails(prev => ({
        ...prev,
        [studentId]: student
      }));
    } catch (error) {
      console.error(`Error al cargar estudiante ${studentId}:`, error);
    }
  };

  const loadClassroomDetails = async (classroomId) => {
    if (!classroomId || classroomDetails[classroomId]) return;
    
    try {
      const classroom = await classroomService.getClassroomById(classroomId);
      setClassroomDetails(prev => ({
        ...prev,
        [classroomId]: classroom
      }));
    } catch (error) {
      console.error(`Error al cargar aula ${classroomId}:`, error);
    }
  };

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      setError('');
      
      const enrollmentsData = await enrollmentService.getAllEnrollments();
      setEnrollments(enrollmentsData);

      // Cargar detalles de estudiantes y aulas
      const promises = enrollmentsData.flatMap(enrollment => [
        loadStudentDetails(enrollment.studentId),
        loadClassroomDetails(enrollment.classroomId)
      ]);
      
      await Promise.all(promises);
    } catch (error) {
      console.error('Error al cargar matrículas:', error);
      setError('Error al cargar los datos. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnrollments();
  }, []);

  const showAlert = (config) => {
    setAlert({ ...config, show: true });
  };

  const hideAlert = () => {
    setAlert(prev => ({ ...prev, show: false }));
  };

  const handleDelete = async (id) => {
    try {
      setProcessingAction(true);
      showAlert({
        title: '¿Está seguro?',
        message: 'Esta acción desactivará la matrícula temporalmente',
        type: 'warning',
        onConfirm: async () => {
          try {
            await enrollmentService.deleteEnrollment(id);
            setEnrollments(prevEnrollments => 
              prevEnrollments.map(enrollment => 
                enrollment.id === id 
                  ? { ...enrollment, status: 'I' }
                  : enrollment
              )
            );
            showAlert({
              title: 'Desactivada',
              message: 'La matrícula ha sido desactivada correctamente',
              type: 'success',
              showCancel: false,
              autoClose: true
            });
          } catch (error) {
            showAlert({
              title: 'Error',
              message: error.message || 'No se pudo desactivar la matrícula',
              type: 'error',
              showCancel: false
            });
          }
        }
      });
    } catch (error) {
      console.error('Error al desactivar matrícula:', error);
      showAlert({
        title: 'Error',
        message: error.message || 'No se pudo desactivar la matrícula',
        type: 'error',
        showCancel: false
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRestore = async (id) => {
    try {
      setProcessingAction(true);
      showAlert({
        title: '¿Está seguro?',
        message: 'Esta acción restaurará la matrícula',
        type: 'warning',
        onConfirm: async () => {
          try {
            const updatedEnrollment = await enrollmentService.restoreEnrollment(id);
            setEnrollments(prevEnrollments => 
              prevEnrollments.map(enrollment => 
                enrollment.id === id ? updatedEnrollment : enrollment
              )
            );
            showAlert({
              title: 'Restaurada',
              message: 'La matrícula ha sido restaurada correctamente',
              type: 'success',
              showCancel: false,
              autoClose: true
            });
          } catch (error) {
            showAlert({
              title: 'Error',
              message: error.message || 'No se pudo restaurar la matrícula',
              type: 'error',
              showCancel: false
            });
          }
        }
      });
    } catch (error) {
      console.error('Error al restaurar matrícula:', error);
      showAlert({
        title: 'Error',
        message: error.message || 'No se pudo restaurar la matrícula',
        type: 'error',
        showCancel: false
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES');
    } catch (error) {
      return dateString;
    }
  };

  const getStudentName = (studentId) => {
    const student = studentDetails[studentId];
    if (!student) return 'Cargando...';
    return `${student.firstName} ${student.lastName} - ${student.documentNumber || 'Sin documento'}`;
  };

  const getClassroomName = (classroomId) => {
    const classroom = classroomDetails[classroomId];
    if (!classroom) return 'Cargando...';
    return classroom.name;
  };

  const handleShowDetails = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedEnrollment(null);
  };

  const getUniqueValues = (field) => {
    const values = new Set(enrollments.map(e => e[field]));
    return Array.from(values).sort();
  };

  const getUniqueClassrooms = () => {
    const classrooms = new Set();
    enrollments.forEach(e => {
      const classroom = classroomDetails[e.classroomId];
      if (classroom) {
        classrooms.add(classroom.name);
      }
    });
    return Array.from(classrooms).sort();
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    if (!enrollment) return false;
    
    // Aplicar filtros
    if (filters.status !== 'all' && enrollment.status !== filters.status) {
      return false;
    }

    if (filters.classroom !== 'all') {
      const classroom = classroomDetails[enrollment.classroomId];
      if (!classroom || classroom.name !== filters.classroom) {
        return false;
      }
    }

    if (filters.year !== 'all' && enrollment.enrollmentYear.toString() !== filters.year) {
      return false;
    }

    if (filters.period !== 'all' && enrollment.enrollmentPeriod !== filters.period) {
      return false;
    }
    
    const student = studentDetails[enrollment.studentId];
    if (!student) return true; // Incluir mientras se carga

    const searchString = searchTerm.toLowerCase();
    return (
      student.firstName?.toLowerCase().includes(searchString) ||
      student.lastName?.toLowerCase().includes(searchString) ||
      student.documentNumber?.toLowerCase().includes(searchString)
    );
  });

  if (loading) {
    return (
      <>
        <Header />
        <Sidebar />
        <div className="page-wrapper">
          <div className="content container-fluid">
            <div className="text-center mt-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </Spinner>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <Sidebar activeClassName="enrollment-list" />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title">
                  <i className="fas fa-graduation-cap me-2"></i>
                  Matrículas
                </h3>
              </div>
              <div className="col-auto">
                <Button 
                  className="btn-add"
                  onClick={() => navigate('/add-enrollment')}
                >
                  <i className="fas fa-plus me-2"></i>
                  Agregar Matrícula
                </Button>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <div className="filters-section">
                    <div className="row">
                      <div className="col-md-6 col-lg-3 mb-3">
                        <Form.Group>
                          <Form.Label>Estado</Form.Label>
                          <Form.Select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                          >
                            <option value="A">Activos</option>
                            <option value="I">Inactivos</option>
                            <option value="all">Todos los estados</option>
                          </Form.Select>
                        </Form.Group>
                      </div>
                      <div className="col-md-6 col-lg-3 mb-3">
                        <Form.Group>
                          <Form.Label>Aula</Form.Label>
                          <Form.Select
                            value={filters.classroom}
                            onChange={(e) => handleFilterChange('classroom', e.target.value)}
                          >
                            <option value="all">Todas las aulas</option>
                            {getUniqueClassrooms().map(classroom => (
                              <option key={classroom} value={classroom}>{classroom}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </div>
                      <div className="col-md-6 col-lg-3 mb-3">
                        <Form.Group>
                          <Form.Label>Año</Form.Label>
                          <Form.Select
                            value={filters.year}
                            onChange={(e) => handleFilterChange('year', e.target.value)}
                          >
                            <option value="all">Todos los años</option>
                            {getUniqueValues('enrollmentYear').map(year => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </div>
                      <div className="col-md-6 col-lg-3 mb-3">
                        <Form.Group>
                          <Form.Label>Periodo</Form.Label>
                          <Form.Select
                            value={filters.period}
                            onChange={(e) => handleFilterChange('period', e.target.value)}
                          >
                            <option value="all">Todos los periodos</option>
                            {getUniqueValues('enrollmentPeriod').map(period => (
                              <option key={period} value={period}>{period}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </div>
                      <div className="col-12">
                        <Form.Group>
                          <Form.Label>Buscar</Form.Label>
                          <InputGroup>
                            <Form.Control
                              placeholder="Buscar por nombre o documento del estudiante"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Button variant="outline-secondary">
                              <i className="fas fa-search"></i>
                            </Button>
                          </InputGroup>
                        </Form.Group>
                      </div>
                    </div>
                  </div>

                  {/* Filtros activos */}
                  {Object.values(filters).some(value => value !== 'all') && (
                    <div className="active-filters mb-4">
                      {Object.entries(filters).map(([key, value]) => 
                        value !== 'all' && (
                          <span key={key} className="filter-badge">
                            <span className="me-1">
                              {key === 'status' && <i className="fas fa-circle me-1"></i>}
                              {key === 'classroom' && <i className="fas fa-door-open me-1"></i>}
                              {key === 'year' && <i className="fas fa-calendar me-1"></i>}
                              {key === 'period' && <i className="fas fa-clock me-1"></i>}
                            </span>
                            {key === 'status' ? (value === 'A' ? 'Activos' : 'Inactivos') : value}
                            <button 
                              type="button" 
                              className="btn-close btn-close-white"
                              onClick={() => handleFilterChange(key, 'all')}
                              aria-label="Quitar filtro"
                            ></button>
                          </span>
                        )
                      )}
                      {Object.values(filters).some(value => value !== 'all') && (
                        <Button 
                          variant="link" 
                          className="text-muted p-0 ms-2" 
                          style={{ fontSize: '13px' }}
                          onClick={() => setFilters({
                            status: 'all',
                            classroom: 'all',
                            year: 'all',
                            period: 'all'
                          })}
                        >
                          Limpiar filtros
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Contador de resultados */}
                  <div className="results-count">
                    <i className="fas fa-list me-2"></i>
                    Mostrando <strong>{filteredEnrollments.length}</strong> de <strong>{enrollments.length}</strong> matrículas
                  </div>

                  {error && (
                    <div className="alert alert-danger" role="alert">
                      <i className="fas fa-exclamation-circle me-2"></i>
                      {error}
                    </div>
                  )}

                  <div className="table-responsive">
                    <Table hover>
                      <thead>
                        <tr>
                          <th>Datos del Estudiante</th>
                          <th>Aula</th>
                          <th>Fecha de Matrícula</th>
                          <th>Año</th>
                          <th>Periodo</th>
                          <th className="text-end">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEnrollments.map((enrollment) => (
                          <tr key={enrollment.id}>
                            <td>
                              <div className="student-name">{getStudentName(enrollment.studentId)}</div>
                            </td>
                            <td>
                              <span className="badge bg-light text-dark">
                                {getClassroomName(enrollment.classroomId)}
                              </span>
                            </td>
                            <td>{formatDate(enrollment.enrollmentDate)}</td>
                            <td>{enrollment.enrollmentYear}</td>
                            <td>
                              <span className="badge bg-light text-dark">
                                {enrollment.enrollmentPeriod}
                              </span>
                            </td>
                            <td>
                              <div className="actions">
                                <Button
                                  variant="info"
                                  size="sm"
                                  onClick={() => handleShowDetails(enrollment)}
                                  disabled={processingAction}
                                >
                                  <i className="fas fa-eye me-1"></i>
                                  Ver
                                </Button>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => navigate(`/editenrollment/${enrollment.id}`)}
                                  disabled={processingAction}
                                >
                                  <i className="fas fa-edit me-1"></i>
                                  Editar
                                </Button>
                                {enrollment.status === 'A' ? (
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleDelete(enrollment.id)}
                                    disabled={processingAction}
                                  >
                                    <i className="fas fa-ban me-1"></i>
                                    Desactivar
                                  </Button>
                                ) : (
                                  <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => handleRestore(enrollment.id)}
                                    disabled={processingAction}
                                  >
                                    <i className="fas fa-redo me-1"></i>
                                    Restaurar
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredEnrollments.length === 0 && (
                          <tr>
                            <td colSpan="7" className="text-center py-4 text-muted">
                              <i className="fas fa-inbox fa-3x mb-3 d-block"></i>
                              No se encontraron matrículas
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Detalles */}
      <Modal show={showDetails} onHide={handleCloseDetails} size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="fas fa-info-circle me-2"></i>
            Detalles de la Matrícula
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedEnrollment && (
            <div>
              <Card className="mb-4 border-0 shadow-sm">
                <Card.Header className="bg-light">
                  <h5 className="mb-0">
                    <i className="fas fa-user me-2"></i>
                    Información del Estudiante
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="text-muted small">Nombre Completo</label>
                        <p className="h6">{getStudentName(selectedEnrollment.studentId)}</p>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="text-muted small">Aula Asignada</label>
                        <p className="h6">{getClassroomName(selectedEnrollment.classroomId)}</p>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-light">
                  <h5 className="mb-0">
                    <i className="fas fa-graduation-cap me-2"></i>
                    Información de la Matrícula
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="text-muted small">Fecha de Matrícula</label>
                        <p className="h6">{formatDate(selectedEnrollment.enrollmentDate)}</p>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small">Año Académico</label>
                        <p className="h6">{selectedEnrollment.enrollmentYear}</p>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="text-muted small">Periodo</label>
                        <p className="h6">{selectedEnrollment.enrollmentPeriod}</p>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small">Estado</label>
                        <div>
                          <span className={`badge ${
                            selectedEnrollment.status === 'A' 
                              ? 'bg-success'
                              : 'bg-danger'
                          } px-3 py-2`}>
                            <i className={`fas fa-${
                              selectedEnrollment.status === 'A' 
                                ? 'check-circle'
                                : 'times-circle'
                            } me-2`}></i>
                            {selectedEnrollment.status === 'A' ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={handleCloseDetails}>
            <i className="fas fa-times me-2"></i>
            Cerrar
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              handleCloseDetails();
              navigate(`/editenrollment/${selectedEnrollment.id}`);
            }}
          >
            <i className="fas fa-edit me-2"></i>
            Editar Matrícula
          </Button>
        </Modal.Footer>
      </Modal>
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

export default EnrollmentList; 