import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Form, InputGroup, Spinner, Modal, Card, Row, Col, Badge } from 'react-bootstrap';
import { gradeService } from '../../services/gradeService';
import { studentService } from '../../services';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import CustomAlert from '../common/CustomAlert';
import { Grade, ACADEMIC_PERIODS, EVALUATION_TYPES, COURSES } from '../../types/grade.types';
import './GradeList.css';

const GradeList = () => {
  const navigate = useNavigate();
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  const [filters, setFilters] = useState({
    academicPeriod: 'all',
    evaluationType: 'all',
    status: 'active'
  });
  const [showDetails, setShowDetails] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [alert, setAlert] = useState({
    show: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null
  });

  const loadGrades = async () => {
    try {
      setLoading(true);
      setError('');
      const data = filters.status === 'active' 
        ? await gradeService.getAllGrades()
        : await gradeService.getAllInactiveGrades();
      setGrades(data);
    } catch (error) {
      console.error('Error al cargar calificaciones:', error);
      setError('Error al cargar los datos. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const data = await studentService.getAllStudents();
      // El servicio ya devuelve un array de estudiantes directamente
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar estudiantes:', error);
      setStudents([]); // Establecer array vacío en caso de error
    }
  };

  useEffect(() => {
    loadGrades();
    loadStudents();
  }, [filters.status]);

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
      type: 'info',
      onConfirm: null
    });
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'N/A';
  };

  const getCourseName = (courseId) => {
    const course = COURSES.find(c => c.value === courseId);
    return course ? `${course.value} - ${course.label}` : courseId;
  };

  const filteredGrades = grades.filter(grade => {
    const studentName = getStudentName(grade.studentId).toLowerCase();
    const courseName = getCourseName(grade.courseId).toLowerCase();
    const matchesSearch = studentName.includes(searchTerm.toLowerCase()) ||
                         courseName.includes(searchTerm.toLowerCase()) ||
                         grade.evaluationType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAcademicPeriod = filters.academicPeriod === 'all' || grade.academicPeriod === filters.academicPeriod;
    const matchesEvaluationType = filters.evaluationType === 'all' || grade.evaluationType === filters.evaluationType;
    
    return matchesSearch && matchesAcademicPeriod && matchesEvaluationType;
  });

  const handleDelete = async (id) => {
    showAlert({
      title: 'Confirmar eliminación',
      message: '¿Está seguro que desea eliminar esta calificación?',
      type: 'warning',
      onConfirm: async () => {
        try {
          setProcessingAction(true);
          await gradeService.deleteGrade(id);
          await loadGrades();
          showAlert({
            title: 'Éxito',
            message: 'Calificación eliminada correctamente',
            type: 'success',
            showCancel: false,
            autoClose: true,
            autoCloseTime: 2000,
            onConfirm: hideAlert
          });
        } catch (error) {
          showAlert({
            title: 'Error',
            message: 'Error al eliminar la calificación',
            type: 'error'
          });
        } finally {
          setProcessingAction(false);
        }
      }
    });
  };

  const handleRestore = async (id) => {
    showAlert({
      title: 'Confirmar restauración',
      message: '¿Está seguro que desea restaurar esta calificación?',
      type: 'info',
      onConfirm: async () => {
        try {
          setProcessingAction(true);
          await gradeService.restoreGrade(id);
          await loadGrades();
          showAlert({
            title: 'Éxito',
            message: 'Calificación restaurada correctamente',
            type: 'success',
            showCancel: false,
            autoClose: true,
            autoCloseTime: 2000,
            onConfirm: hideAlert
          });
        } catch (error) {
          showAlert({
            title: 'Error',
            message: 'Error al restaurar la calificación',
            type: 'error'
          });
        } finally {
          setProcessingAction(false);
        }
      }
    });
  };

  const handleViewDetails = (grade) => {
    setSelectedGrade(grade);
    setShowDetails(true);
  };

  const handleViewNotifications = async (gradeId) => {
    try {
      setLoading(true);
      const data = await gradeService.getGradeNotifications(gradeId);
      setNotifications(data);
      setShowNotifications(true);
    } catch (error) {
      showAlert({
        title: 'Error',
        message: 'Error al cargar las notificaciones',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateArray) => {
    if (!dateArray || !Array.isArray(dateArray)) return 'N/A';
    const [year, month, day] = dateArray;
    return new Date(year, month - 1, day).toLocaleDateString('es-ES');
  };

  const getGradeStatusBadge = (grade) => {
    const gradeObj = new Grade(grade);
    const status = gradeObj.getPassStatus();
    const color = gradeObj.getStatusColor();
    return <Badge bg={color}>{status}</Badge>;
  };

  return (
    <>
      <Header />
      <Sidebar activeClassName="grade-list" />
      
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="page-title">
              <h4>Lista de Calificaciones</h4>
              <h6>Gestión de calificaciones académicas</h6>
            </div>
            <div className="page-btn">
              <Button 
                variant="primary" 
                onClick={() => navigate('/grade/add')}
              >
                <i className="fas fa-plus me-2"></i>
                Agregar Calificación
              </Button>
            </div>
          </div>

          <Card>
            <Card.Body>
              <Row className="mb-3">
                <Col md={4}>
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="fas fa-search"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Buscar por estudiante, curso o tipo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={2}>
                  <Form.Select
                    value={filters.academicPeriod}
                    onChange={(e) => setFilters({...filters, academicPeriod: e.target.value})}
                  >
                    <option value="all">Todos los períodos</option>
                    {ACADEMIC_PERIODS.map(period => (
                      <option key={period.value} value={period.value}>
                        {period.label}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Form.Select
                    value={filters.evaluationType}
                    onChange={(e) => setFilters({...filters, evaluationType: e.target.value})}
                  >
                    <option value="all">Todos los tipos</option>
                    {EVALUATION_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Form.Select
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                  >
                    <option value="active">Activas</option>
                    <option value="inactive">Eliminadas</option>
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Button variant="outline-secondary" onClick={loadGrades}>
                    <i className="fas fa-sync-alt"></i> Actualizar
                  </Button>
                </Col>
              </Row>

              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                  </Spinner>
                </div>
              ) : error ? (
                <div className="alert alert-danger">{error}</div>
              ) : (
                <>
                  <div className="mb-3">
                    <small className="text-muted">
                      Mostrando {filteredGrades.length} de {grades.length} calificaciones
                    </small>
                  </div>
                  
                  <Table responsive striped hover>
                    <thead>
                      <tr>
                        <th>Estudiante</th>
                        <th>Curso</th>
                        <th>Período</th>
                        <th>Tipo</th>
                        <th>Calificación</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGrades.map((grade) => (
                        <tr key={grade.id}>
                          <td>{getStudentName(grade.studentId)}</td>
                          <td>{getCourseName(grade.courseId)}</td>
                          <td>{grade.academicPeriod}</td>
                          <td>{grade.evaluationType}</td>
                          <td>
                            <strong className={`text-${new Grade(grade).getStatusColor()}`}>
                              {grade.grade.toFixed(1)}
                            </strong>
                          </td>
                          <td>{getGradeStatusBadge(grade)}</td>
                          <td>{formatDate(grade.evaluationDate)}</td>
                          <td>
                            <div className="action-buttons">
                              <Button
                                variant="outline-info"
                                size="sm"
                                className="me-1"
                                onClick={() => handleViewDetails(grade)}
                                title="Ver detalles"
                              >
                                <i className="fas fa-eye"></i>
                              </Button>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="me-1"
                                onClick={() => navigate(`/grade/edit/${grade.id}`)}
                                title="Editar"
                                disabled={filters.status === 'inactive'}
                              >
                                <i className="fas fa-edit"></i>
                              </Button>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                className="me-1"
                                onClick={() => handleViewNotifications(grade.id)}
                                title="Ver notificaciones"
                              >
                                <i className="fas fa-bell"></i>
                              </Button>
                              {filters.status === 'active' ? (
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDelete(grade.id)}
                                  disabled={processingAction}
                                  title="Eliminar"
                                >
                                  <i className="fas fa-trash"></i>
                                </Button>
                              ) : (
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => handleRestore(grade.id)}
                                  disabled={processingAction}
                                  title="Restaurar"
                                >
                                  <i className="fas fa-undo"></i>
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  {filteredGrades.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-muted">No se encontraron calificaciones</p>
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Modal de detalles */}
      <Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalles de la Calificación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedGrade && (
            <Row>
              <Col md={6}>
                <p><strong>Estudiante:</strong> {getStudentName(selectedGrade.studentId)}</p>
                <p><strong>Curso:</strong> {getCourseName(selectedGrade.courseId)}</p>
                <p><strong>Período Académico:</strong> {selectedGrade.academicPeriod}</p>
                <p><strong>Tipo de Evaluación:</strong> {selectedGrade.evaluationType}</p>
              </Col>
              <Col md={6}>
                <p><strong>Calificación:</strong> {selectedGrade.grade.toFixed(1)}</p>
                <p><strong>Estado:</strong> {getGradeStatusBadge(selectedGrade)}</p>
                <p><strong>Fecha de Evaluación:</strong> {formatDate(selectedGrade.evaluationDate)}</p>
                <p><strong>Observaciones:</strong> {selectedGrade.remarks || 'Sin observaciones'}</p>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetails(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de notificaciones */}
      <Modal show={showNotifications} onHide={() => setShowNotifications(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Notificaciones Relacionadas</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {notifications.length > 0 ? (
            <div>
              {notifications.map((notification, index) => (
                <Card key={index} className="mb-2">
                  <Card.Body>
                    <div className="d-flex justify-content-between">
                      <h6>{notification.notificationType}</h6>
                      <small className="text-muted">
                        {new Date(notification.createdAt).toLocaleDateString('es-ES')}
                      </small>
                    </div>
                    <p className="mb-1">{notification.message}</p>
                    <small className="text-muted">Estado: {notification.status}</small>
                  </Card.Body>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted">No hay notificaciones relacionadas</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNotifications(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      <CustomAlert
        show={alert.show}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        showCancel={alert.showCancel}
        autoClose={alert.autoClose}
        autoCloseTime={alert.autoCloseTime}
        onConfirm={alert.onConfirm || hideAlert}
        onClose={hideAlert}
      />
    </>
  );
};

export default GradeList;
