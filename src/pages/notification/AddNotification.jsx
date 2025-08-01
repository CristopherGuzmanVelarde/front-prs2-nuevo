import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Form, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { notificationService } from '../../services/notificationService';
import { studentService } from '../../services';
import { teacherService } from '../../services/teacherService';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import CustomAlert from '../common/CustomAlert';
import { RECIPIENT_TYPES, NOTIFICATION_TYPES, NOTIFICATION_STATUS, NOTIFICATION_CHANNELS } from '../../types/notification.types';

const AddNotification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const templateData = location.state?.templateData;
  
  const [formData, setFormData] = useState({
    recipientId: '',
    recipientType: '',
    message: templateData?.message || '',
    notificationType: templateData?.notificationType || '',
    status: 'PENDING',
    channel: 'EMAIL'
  });
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({
    show: false,
    title: '',
    message: '',
    type: 'info'
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoadingData(true);
    try {
      await Promise.all([
        loadStudents(),
        loadTeachers()
      ]);
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const loadStudents = async () => {
    try {
      const data = await studentService.getAllStudents();
      // El servicio devuelve directamente el array de estudiantes
      if (Array.isArray(data)) {
        setStudents(data);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error('Error al cargar estudiantes:', error);
      setStudents([]); // Establecer array vacío en caso de error
      showAlert({
        title: 'Error',
        message: 'Error al cargar la lista de estudiantes',
        type: 'error'
      });
    }
  };

  const loadTeachers = async () => {
    try {
      const data = await teacherService.getAllTeachers('ACTIVE');
      setTeachers(data);
    } catch (error) {
      console.error('Error al cargar profesores:', error);
      showAlert({
        title: 'Error',
        message: 'Error al cargar la lista de profesores',
        type: 'error'
      });
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

    // Si cambia el tipo de destinatario, limpiar el ID del destinatario
    if (name === 'recipientType') {
      setFormData(prev => ({
        ...prev,
        recipientId: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.recipientId.trim()) {
      newErrors.recipientId = 'El destinatario es requerido';
    }
    
    if (!formData.recipientType.trim()) {
      newErrors.recipientType = 'El tipo de destinatario es requerido';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'El mensaje es requerido';
    } else if (formData.message.length < 10) {
      newErrors.message = 'El mensaje debe tener al menos 10 caracteres';
    } else if (formData.message.length > 500) {
      newErrors.message = 'El mensaje no puede exceder 500 caracteres';
    }
    
    if (!formData.notificationType.trim()) {
      newErrors.notificationType = 'El tipo de notificación es requerido';
    }
    
    if (!formData.channel.trim()) {
      newErrors.channel = 'El canal es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showAlert({
        title: 'Error de validación',
        message: 'Por favor, corrija los errores en el formulario',
        type: 'warning'
      });
      return;
    }

    setLoading(true);
    try {
      await notificationService.createNotification(formData);
      showAlert({
        title: 'Éxito',
        message: 'Notificación creada correctamente',
        type: 'success',
        onConfirm: () => navigate('/notifications')
      });
    } catch (error) {
      console.error('Error al crear notificación:', error);
      showAlert({
        title: 'Error',
        message: 'Error al crear la notificación. Por favor, intente nuevamente.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/notifications');
  };

  const renderRecipientOptions = () => {
    switch (formData.recipientType) {
      case 'STUDENT':
        return students.map(student => (
          <option key={student.id} value={student.id}>
            {student.firstName} {student.lastName} - {student.documentNumber}
          </option>
        ));
      case 'TEACHER':
        return teachers.map(teacher => (
          <option key={teacher.id} value={teacher.id}>
            {teacher.firstName} {teacher.lastName} - {teacher.email}
          </option>
        ));
      case 'PARENT':
        return [<option key="parent1" value="parent1">Padre 1</option>]; // Placeholder - Necesita implementación
      case 'ADMIN':
        return [<option key="admin1" value="admin1">Administrador 1</option>]; // Placeholder - Necesita implementación
      default:
        return [];
    }
  };

  const getRecipientLabel = () => {
    switch (formData.recipientType) {
      case 'STUDENT':
        return 'Estudiante';
      case 'TEACHER':
        return 'Profesor';
      case 'PARENT':
        return 'Padre/Madre';
      case 'ADMIN':
        return 'Administrador';
      default:
        return 'Destinatario';
    }
  };

  return (
    <>
      <Header />
      <Sidebar activeClassName="notifications" />
      
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="page-title">
              <h4>Agregar Notificación</h4>
              <h6>Crear nueva notificación</h6>
            </div>
            <div className="page-btn">
              <Button 
                variant="info" 
                onClick={() => navigate('/notifications/templates')}
              >
                <i className="fas fa-file-alt me-2"></i>
                Ver Plantillas
              </Button>
            </div>
          </div>

          {templateData && (
            <Alert variant="info" className="mb-3">
              <i className="fas fa-info-circle me-2"></i>
              Se ha cargado una plantilla. Puede editarla según sus necesidades.
            </Alert>
          )}

          <Card>
            <Card.Header>
              <h5 className="card-title">Información de la Notificación</h5>
            </Card.Header>
            <Card.Body>
              {loadingData ? (
                <div className="text-center">
                  <Spinner animation="border" />
                  <p>Cargando datos...</p>
                </div>
              ) : (
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Tipo de Destinatario *</Form.Label>
                        <Form.Select
                          name="recipientType"
                          value={formData.recipientType}
                          onChange={handleInputChange}
                          isInvalid={!!errors.recipientType}
                        >
                          <option value="">Seleccionar tipo</option>
                          {RECIPIENT_TYPES.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {errors.recipientType}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>{getRecipientLabel()} *</Form.Label>
                        <Form.Select
                          name="recipientId"
                          value={formData.recipientId}
                          onChange={handleInputChange}
                          isInvalid={!!errors.recipientId}
                          disabled={!formData.recipientType}
                        >
                          <option value="">
                            {formData.recipientType ? `Seleccionar ${getRecipientLabel().toLowerCase()}` : 'Primero seleccione el tipo'}
                          </option>
                          {renderRecipientOptions()}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {errors.recipientId}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Tipo de Notificación *</Form.Label>
                        <Form.Select
                          name="notificationType"
                          value={formData.notificationType}
                          onChange={handleInputChange}
                          isInvalid={!!errors.notificationType}
                        >
                          <option value="">Seleccionar tipo</option>
                          {NOTIFICATION_TYPES.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {errors.notificationType}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Canal *</Form.Label>
                        <Form.Select
                          name="channel"
                          value={formData.channel}
                          onChange={handleInputChange}
                          isInvalid={!!errors.channel}
                        >
                          {NOTIFICATION_CHANNELS.map(channel => (
                            <option key={channel.value} value={channel.value}>
                              {channel.label}
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {errors.channel}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Estado</Form.Label>
                        <Form.Select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          isInvalid={!!errors.status}
                        >
                          {NOTIFICATION_STATUS.map(status => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {errors.status}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>Mensaje *</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={5}
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          isInvalid={!!errors.message}
                          placeholder="Escriba el mensaje de la notificación..."
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.message}
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">
                          {formData.message.length}/500 caracteres
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-flex gap-2">
                    <Button 
                      type="submit" 
                      variant="primary" 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" className="me-2" />
                          Creando...
                        </>
                      ) : (
                        'Crear Notificación'
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      <CustomAlert
        show={alert.show}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onConfirm={alert.onConfirm}
        onClose={hideAlert}
      />
    </>
  );
};

export default AddNotification;
