import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { notificationService } from '../../services/notificationService';
import { studentService } from '../../services';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import CustomAlert from '../common/CustomAlert';
import { RECIPIENT_TYPES, NOTIFICATION_TYPES, NOTIFICATION_STATUS, NOTIFICATION_CHANNELS } from '../../types/notification.types';

const EditNotification = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    recipientId: '',
    recipientType: '',
    message: '',
    notificationType: '',
    status: '',
    channel: ''
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
    const init = async () => {
      await loadStudents();
      await loadNotificationData();
    };
    init();
  }, [id]);

  const loadNotificationData = async () => {
    try {
      setLoadingData(true);
      const notification = await notificationService.getNotificationById(id);
      if (!notification) throw new Error('Notificación no encontrada');

      // Normalizar posibles variantes de nombres de campos provenientes del backend
      const rawRecipientType = notification.recipientType || notification.recipient_type || '';
      const rawRecipientId = notification.recipientId || notification.recipient_id || '';
      const rawNotificationType = notification.notificationType || notification.type || '';
      const rawChannel = notification.channel || notification.deliveryChannel || 'EMAIL';
      const rawStatus = notification.status || 'PENDING';

      let recipientType = rawRecipientType;
      let recipientId = rawRecipientId;

      // Si viene como nombre completo y todavía no tenemos estudiantes cargados, guardamos tal cual.
      // Luego un efecto posterior intentará mapearlo cuando students esté disponible.
      if (recipientType && recipientType.includes(' ') && !recipientId) {
        // Intento inmediato si students ya está
        if (students.length > 0) {
          const matchStudent = students.find(s => `${s.firstName} ${s.lastName}` === recipientType);
          if (matchStudent) {
            recipientId = matchStudent.id;
            recipientType = 'STUDENT';
          }
        }
      }

      setFormData({
        recipientId: recipientId,
        recipientType: recipientType,
        message: notification.message || '',
        notificationType: rawNotificationType || '',
        status: rawStatus,
        channel: rawChannel || 'EMAIL'
      });
    } catch (error) {
      console.error('Error al cargar notificación:', error);
      showAlert({
        title: 'Error',
        message: 'Error al cargar los datos de la notificación',
        type: 'error',
        onConfirm: () => navigate('/notifications')
      });
    } finally {
      setLoadingData(false);
    }
  };

  const loadStudents = async () => {
    try {
      setLoadingStudents(true);
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
      newErrors.channel = 'El canal de envío es requerido';
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

      const notificationData = {
        recipientId: formData.recipientId,
        recipientType: formData.recipientType,
        message: formData.message.trim(),
        notificationType: formData.notificationType,
        status: formData.status,
        channel: formData.channel
      };

      await notificationService.updateNotification(id, notificationData);

      showAlert({
        title: 'Éxito',
        message: 'Notificación actualizada correctamente',
        type: 'success',
        onConfirm: () => {
          navigate('/notifications');
        }
      });

    } catch (error) {
      console.error('Error al actualizar notificación:', error);
      let errorMessage = 'Error al actualizar la notificación';
      
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
    navigate('/notifications');
  };

  const getRecipientOptions = () => {
    switch (formData.recipientType) {
      case 'STUDENT':
        return students.map(student => (
          <option key={student.id} value={student.id}>
            {student.firstName} {student.lastName} - {student.documentNumber}
          </option>
        ));
      case 'TEACHER':
        return [<option key="teacher1" value="teacher1">Profesor 1</option>]; // Placeholder
      case 'PARENT':
        return [<option key="parent1" value="parent1">Padre 1</option>]; // Placeholder
      case 'ADMIN':
        return [<option key="admin1" value="admin1">Administrador 1</option>]; // Placeholder
      default:
        return [];
    }
  };

  // Efecto adicional: cuando los estudiantes se cargan y recipientType es un nombre completo, mapearlo.
  useEffect(() => {
    if (!formData.recipientType) return;
    const validCodes = ['STUDENT', 'TEACHER', 'PARENT', 'ADMIN'];
    const looksLikeFullName = formData.recipientType.includes(' ');
    if (students.length > 0 && looksLikeFullName && !validCodes.includes(formData.recipientType)) {
      const matchStudent = students.find(s => `${s.firstName} ${s.lastName}` === formData.recipientType);
      if (matchStudent) {
        setFormData(prev => ({
          ...prev,
          recipientType: 'STUDENT',
          recipientId: prev.recipientId || matchStudent.id
        }));
      }
    }
  }, [students, formData.recipientType]);

  if (loadingData) {
    return (
      <>
        <Header />
        <Sidebar activeClassName="notifications" />
        <div className="page-wrapper">
          <div className="content">
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </Spinner>
              <div className="mt-2">Cargando datos de la notificación...</div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <Sidebar activeClassName="notifications" />
      
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="page-title">
              <h4>Editar Notificación</h4>
              <h6>Modificar notificación existente</h6>
            </div>
          </div>

          <Card>
            <Card.Header>
              <h5 className="card-title">Información de la Notificación</h5>
            </Card.Header>
            <Card.Body>
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
                      <Form.Label>Destinatario *</Form.Label>
                      {loadingStudents && formData.recipientType === 'STUDENT' ? (
                        <div className="text-center py-2">
                          <Spinner animation="border" size="sm" />
                          <span className="ms-2">Cargando destinatarios...</span>
                        </div>
                      ) : (
                        <Form.Select
                          name="recipientId"
                          value={formData.recipientId}
                          onChange={handleInputChange}
                          isInvalid={!!errors.recipientId}
                          disabled={!formData.recipientType}
                        >
                          <option value="">
                            {formData.recipientType ? 'Seleccionar destinatario' : 'Primero seleccione el tipo'}
                          </option>
                          {getRecipientOptions()}
                        </Form.Select>
                      )}
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
                      <Form.Label>Canal de Envío *</Form.Label>
                      <Form.Select
                        name="channel"
                        value={formData.channel}
                        onChange={handleInputChange}
                        isInvalid={!!errors.channel}
                      >
                        <option value="">Seleccionar canal</option>
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
                      <Form.Label>Estado *</Form.Label>
                      <Form.Select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                      >
                        {NOTIFICATION_STATUS.map(status => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Mensaje *</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Escriba el mensaje de la notificación..."
                        isInvalid={!!errors.message}
                        maxLength={500}
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
                      'Actualizar Notificación'
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
        onCancel={hideAlert}
      />
    </>
  );
};

export default EditNotification;
