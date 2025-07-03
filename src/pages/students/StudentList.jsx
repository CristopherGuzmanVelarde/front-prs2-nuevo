import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Form, InputGroup, Spinner, Modal, Card, Row, Col } from 'react-bootstrap';
import { studentService } from '../../services';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import CustomAlert from '../common/CustomAlert';
import './StudentList.css';

const StudentList = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  const [filters, setFilters] = useState({
    status: 'A',
    gender: 'all',
    documentType: 'all'
  });
  const [showDetails, setShowDetails] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [alert, setAlert] = useState({
    show: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null
  });

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await studentService.getAllStudents();
      setStudents(data);
    } catch (error) {
      console.error('Error al cargar estudiantes:', error);
      setError('Error al cargar los datos. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
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
        message: 'Esta acción desactivará el estudiante temporalmente',
        type: 'warning',
        onConfirm: async () => {
          try {
            await studentService.deleteStudent(id);
            setStudents(prevStudents => 
              prevStudents.map(student => 
                student.id === id 
                  ? { ...student, status: 'I' }
                  : student
              )
            );
            showAlert({
              title: 'Desactivado',
              message: 'El estudiante ha sido desactivado correctamente',
              type: 'success',
              showCancel: false,
              autoClose: true
            });
          } catch (error) {
            showAlert({
              title: 'Error',
              message: error.message || 'No se pudo desactivar el estudiante',
              type: 'error',
              showCancel: false
            });
          }
        }
      });
    } catch (error) {
      console.error('Error al desactivar estudiante:', error);
      showAlert({
        title: 'Error',
        message: error.message || 'No se pudo desactivar el estudiante',
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
        message: 'Esta acción restaurará el estudiante',
        type: 'warning',
        onConfirm: async () => {
          try {
            const updatedStudent = await studentService.restoreStudent(id);
            setStudents(prevStudents => 
              prevStudents.map(student => 
                student.id === id ? updatedStudent : student
              )
            );
            showAlert({
              title: 'Restaurado',
              message: 'El estudiante ha sido restaurado correctamente',
              type: 'success',
              showCancel: false,
              autoClose: true
            });
          } catch (error) {
            showAlert({
              title: 'Error',
              message: error.message || 'No se pudo restaurar el estudiante',
              type: 'error',
              showCancel: false
            });
          }
        }
      });
    } catch (error) {
      console.error('Error al restaurar estudiante:', error);
      showAlert({
        title: 'Error',
        message: error.message || 'No se pudo restaurar el estudiante',
        type: 'error',
        showCancel: false
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const handleShowDetails = (student) => {
    setSelectedStudent(student);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedStudent(null);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getUniqueValues = (field) => {
    const values = new Set(students.map(s => s[field]));
    return Array.from(values).sort();
  };

  const filteredStudents = students.filter(student => {
    if (!student) return false;
    
    // Aplicar filtros
    if (filters.status !== 'all' && student.status !== filters.status) {
      return false;
    }

    if (filters.gender !== 'all' && student.gender !== filters.gender) {
      return false;
    }

    if (filters.documentType !== 'all' && student.documentType !== filters.documentType) {
      return false;
    }

    const searchString = searchTerm.toLowerCase();
    return (
      student.firstName?.toLowerCase().includes(searchString) ||
      student.lastName?.toLowerCase().includes(searchString) ||
      student.documentNumber?.toLowerCase().includes(searchString) ||
      student.email?.toLowerCase().includes(searchString)
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
      <Sidebar activeClassName="student-list" />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title">
                  <i className="fas fa-user-graduate me-2"></i>
                  Estudiantes
                </h3>
              </div>
              <div className="col-auto">
                <Button 
                  className="btn-add"
                  onClick={() => navigate('/add-student')}
                >
                  <i className="fas fa-plus me-2"></i>
                  Agregar Estudiante
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
                      <div className="col-12 col-sm-6 col-lg-3 mb-3">
                        <Form.Group>
                          <Form.Label>Estado</Form.Label>
                          <Form.Select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="form-select-sm"
                          >
                            <option value="A">Activos</option>
                            <option value="I">Inactivos</option>
                            <option value="all">Todos los estados</option>
                          </Form.Select>
                        </Form.Group>
                      </div>
                      <div className="col-12 col-sm-6 col-lg-3 mb-3">
                        <Form.Group>
                          <Form.Label>Género</Form.Label>
                          <Form.Select
                            value={filters.gender}
                            onChange={(e) => handleFilterChange('gender', e.target.value)}
                            className="form-select-sm"
                          >
                            <option value="all">Todos los géneros</option>
                            <option value="M">Masculino</option>
                            <option value="F">Femenino</option>
                          </Form.Select>
                        </Form.Group>
                      </div>
                      <div className="col-12 col-sm-6 col-lg-3 mb-3">
                        <Form.Group>
                          <Form.Label>Tipo de Documento</Form.Label>
                          <Form.Select
                            value={filters.documentType}
                            onChange={(e) => handleFilterChange('documentType', e.target.value)}
                            className="form-select-sm"
                          >
                            <option value="all">Todos los tipos</option>
                            {getUniqueValues('documentType').map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </div>
                      <div className="col-12 col-sm-6 col-lg-3 mb-3">
                        <Form.Group>
                          <Form.Label>Buscar</Form.Label>
                          <InputGroup size="sm">
                            <Form.Control
                              placeholder="Buscar por nombre, documento o email"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="form-control-sm"
                            />
                            <Button variant="outline-secondary" size="sm">
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
                              {key === 'gender' && <i className="fas fa-venus-mars me-1"></i>}
                              {key === 'documentType' && <i className="fas fa-id-card me-1"></i>}
                            </span>
                            {key === 'status' ? (value === 'A' ? 'Activos' : 'Inactivos') : 
                             key === 'gender' ? (value === 'M' ? 'Masculino' : 'Femenino') : 
                             value}
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
                            gender: 'all',
                            documentType: 'all'
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
                    Mostrando <strong>{filteredStudents.length}</strong> de <strong>{students.length}</strong> estudiantes
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
                          <th>Documento</th>
                          <th>Género</th>
                          <th>Contacto</th>
                          <th className="text-end">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map((student) => (
                          <tr key={student.id}>
                            <td data-label="Datos del Estudiante">
                              <div className="student-name">
                                <strong>{`${student.firstName} ${student.lastName}`}</strong>
                              </div>
                            </td>
                            <td data-label="Documento">
                              <span className="badge bg-light text-dark">
                                {`${student.documentType} - ${student.documentNumber}`}
                              </span>
                            </td>
                            <td data-label="Género">
                              <span className={`badge ${student.gender === 'M' ? 'bg-info' : 'bg-pink'}`}>
                                <i className={`fas fa-${student.gender === 'M' ? 'mars' : 'venus'} me-1`}></i>
                                {student.gender === 'M' ? 'Masculino' : 'Femenino'}
                              </span>
                            </td>
                            <td data-label="Contacto">
                              <div className="contact-info">
                                <div>{student.email}</div>
                                <small className="text-muted">{student.phone}</small>
                              </div>
                            </td>
                            <td data-label="Acciones">
                              <div className="actions">
                                <Button
                                  variant="info"
                                  size="sm"
                                  onClick={() => handleShowDetails(student)}
                                  disabled={processingAction}
                                >
                                  <i className="fas fa-eye me-1"></i>
                                  Ver
                                </Button>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => navigate(`/editstudent/${student.id}`)}
                                  disabled={processingAction}
                                >
                                  <i className="fas fa-edit me-1"></i>
                                  Editar
                                </Button>
                                {student.status === 'A' ? (
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleDelete(student.id)}
                                    disabled={processingAction}
                                  >
                                    <i className="fas fa-ban me-1"></i>
                                    Desactivar
                                  </Button>
                                ) : (
                                  <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => handleRestore(student.id)}
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
                        {filteredStudents.length === 0 && (
                          <tr>
                            <td colSpan="6" className="text-center py-4 text-muted">
                              <i className="fas fa-inbox fa-3x mb-3 d-block"></i>
                              No se encontraron estudiantes
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
            Detalles del Estudiante
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedStudent && (
            <div>
              <Card className="mb-4 border-0 shadow-sm">
                <Card.Header className="bg-light">
                  <h5 className="mb-0">
                    <i className="fas fa-user me-2"></i>
                    Información Personal
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="text-muted small">Nombre Completo</label>
                        <p className="h6">{`${selectedStudent.firstName} ${selectedStudent.lastName}`}</p>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small">Documento</label>
                        <p className="h6">
                          <span className="badge bg-light text-dark">
                            <i className="fas fa-id-card me-2"></i>
                            {`${selectedStudent.documentType} - ${selectedStudent.documentNumber}`}
                          </span>
                        </p>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small">Fecha de Nacimiento</label>
                        <p className="h6">
                          <i className="fas fa-birthday-cake me-2 text-muted"></i>
                          {new Date(selectedStudent.birthDate).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="text-muted small">Género</label>
                        <p className="h6">
                          <span className={`badge ${selectedStudent.gender === 'M' ? 'bg-info' : 'bg-pink'}`}>
                            <i className={`fas fa-${selectedStudent.gender === 'M' ? 'mars' : 'venus'} me-1`}></i>
                            {selectedStudent.gender === 'M' ? 'Masculino' : 'Femenino'}
                          </span>
                        </p>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small">Estado</label>
                        <p className="h6">
                          <span className={`badge ${selectedStudent.status === 'A' ? 'bg-success' : 'bg-danger'}`}>
                            <i className={`fas fa-${selectedStudent.status === 'A' ? 'check-circle' : 'times-circle'} me-1`}></i>
                            {selectedStudent.status === 'A' ? 'Activo' : 'Inactivo'}
                          </span>
                        </p>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small">Código QR</label>
                        <p className="h6">
                          <span className="badge bg-dark">
                            <i className="fas fa-qrcode me-2"></i>
                            {selectedStudent.nameQr}
                          </span>
                        </p>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card className="mb-4 border-0 shadow-sm">
                <Card.Header className="bg-light">
                  <h5 className="mb-0">
                    <i className="fas fa-address-card me-2"></i>
                    Información de Contacto
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="text-muted small">Email</label>
                        <p className="h6">
                          <i className="fas fa-envelope me-2 text-muted"></i>
                          <a href={`mailto:${selectedStudent.email}`} className="text-primary">
                            {selectedStudent.email}
                          </a>
                        </p>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small">Teléfono</label>
                        <p className="h6">
                          <i className="fas fa-phone me-2 text-muted"></i>
                          <a href={`tel:${selectedStudent.phone}`} className="text-primary">
                            {selectedStudent.phone}
                          </a>
                        </p>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="text-muted small">Dirección</label>
                        <p className="h6">
                          <i className="fas fa-map-marker-alt me-2 text-muted"></i>
                          {selectedStudent.address || 'No especificada'}
                        </p>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small">Ciudad</label>
                        <p className="h6">
                          <i className="fas fa-city me-2 text-muted"></i>
                          {selectedStudent.city || 'No especificada'}
                        </p>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-light">
                  <h5 className="mb-0">
                    <i className="fas fa-info-circle me-2"></i>
                    Información Adicional
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="text-muted small">Fecha de Registro</label>
                        <p className="h6">
                          <i className="fas fa-calendar-plus me-2 text-muted"></i>
                          {new Date(selectedStudent.createdAt).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small">Última Actualización</label>
                        <p className="h6">
                          <i className="fas fa-calendar-check me-2 text-muted"></i>
                          {new Date(selectedStudent.updatedAt).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="text-muted small">Institución</label>
                        <p className="h6">
                          <i className="fas fa-school me-2 text-muted"></i>
                          {selectedStudent.institutionId || 'No especificada'}
                        </p>
                      </div>
                      <div className="mb-3">
                        <label className="text-muted small">Observaciones</label>
                        <p className="h6">
                          <i className="fas fa-comment me-2 text-muted"></i>
                          {selectedStudent.observations || 'Sin observaciones'}
                        </p>
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
              navigate(`/editstudent/${selectedStudent.id}`);
            }}
          >
            <i className="fas fa-edit me-2"></i>
            Editar Estudiante
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

export default StudentList; 