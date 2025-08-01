import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { notificationService } from '../../services/notificationService';
import { studentService } from '../../services';
import { teacherService } from '../../services/teacherService';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import CustomAlert from '../common/CustomAlert';
import { NOTIFICATION_TYPES, NOTIFICATION_CHANNELS } from '../../types/notification.types';

const BulkNotification = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    recipientType: '',
    recipients: [],
    message: '',
    notificationType: '',
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
      const data = await studentService.getActiveStudents();
      setStudents(data);
    } catch (error) {
      console.error('Error al cargar estudiantes:', error);
    }
  };

  const loadTeachers = async () => {
    try {
      const data = await teacherService.getAllTeachers('ACTIVE');
      setTeachers(data);
    } catch (error) {
      console.error('Error al cargar profesores:', error);
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
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    if (name === 'recipientType') {
      setFormData(prev => ({
        ...prev,
        recipients: []
      }));
    }
  };

  const handleRecipientChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      recipients: checked 
        ? [...prev.recipients, value]
        : prev.recipients.filter(id => id !== value)
    }));
  };

  const handleSelectAll = (e) => {
    const { checked } = e.target;
    if (checked) {
      const allIds = formData.recipientType === 'STUDENT' 
        ? students.map(s => s.id)
        : teachers.map(t => t.id);
      setFormData(prev => ({
        ...prev,
        recipients: allIds
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        recipients: []
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.recipientType.trim()) {
      newErrors.recipientType = 'El tipo de destinatario es requerido';
    }
    
    if (formData.recipients.length === 0) {
      newErrors.recipients = 'Debe seleccionar al menos un destinatario';
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
      const notifications = formData.recipients.map(recipientId => ({
        recipientId,
        recipientType: formData.recipientType,
        message: formData.message,
        notificationType: formData.notificationType,
        status: 'PENDING',
        channel: formData.channel
      }));

      await notificationService.createBulkNotifications(notifications);
      
      showAlert({
        title: 'Éxito',
        message: `Se crearon ${notifications.length} notificaciones correctamente`,
        type: 'success',
        onConfirm: () => navigate('/notifications')
      });
    } catch (error) {
      console.error('Error al crear notificaciones:', error);
      showAlert({
        title: 'Error',
        message: 'Error al crear las notificaciones. Por favor, intente nuevamente.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/notifications');
  };

  const renderRecipients = () => {
    const recipients = formData.recipientType === 'STUDENT' ? students : teachers;
    
    if (recipients.length === 0) {
      return (
        <Alert variant="info">
          No hay {formData.recipientType === 'STUDENT' ? 'estudiantes' : 'profesores'} disponibles
        </Alert>
      );
    }

    return (
      <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px' }}>
        <Form.Check
          type="checkbox"
          label="Seleccionar todos"
          checked={formData.recipients.length === recipients.length && recipients.length > 0}
          onChange={handleSelectAll}
          className="mb-2 fw-bold"
        />
        <hr />
        {recipients.map(recipient => (
          <Form.Check
            key={recipient.id}
            type="checkbox"
            label={`${recipient.firstName} ${recipient.lastName} - ${recipient.email || recipient.documentNumber}`}
            value={recipient.id}
            checked={formData.recipients.includes(recipient.id)}
            onChange={handleRecipientChange}
            className="mb-1"
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <Header />
      <Sidebar activeClassName="notifications" />
      
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="page-title">
              <h4>Notificación Masiva</h4>
              <h6>Enviar notificación a múltiples destinatarios</h6>
            </div>
          </div>

          <Card>
            <Card.Header>
              <h5 className="card-title">Información de la Notificación Masiva</h5>
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
                          <option value="STUDENT">Estudiantes</option>
                          <option value="TEACHER">Profesores</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {errors.recipientType}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

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
                  </Row>

                  <Row>
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

                  {formData.recipientType && (
                    <Row>
                      <Col md={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            Destinatarios * 
                            <small className="text-muted">
                              ({formData.recipients.length} seleccionados)
                            </small>
                          </Form.Label>
                          {renderRecipients()}
                          {errors.recipients && (
                            <div className="text-danger mt-1">{errors.recipients}</div>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                  )}

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
                          Enviando...
                        </>
                      ) : (
                        `Enviar a ${formData.recipients.length} destinatarios`
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

export default BulkNotification;
