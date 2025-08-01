import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Form, InputGroup, Spinner, Modal, Card, Row, Col, Badge, Alert } from 'react-bootstrap';
import { notificationService } from '../../services/notificationService';
import { studentService } from '../../services';
import { teacherService } from '../../services/teacherService';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import CustomAlert from '../common/CustomAlert';
import { Notification, RECIPIENT_TYPES, NOTIFICATION_TYPES, NOTIFICATION_STATUS, NOTIFICATION_CHANNELS } from '../../types/notification.types';
import './NotificationList.css';

const NotificationList = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  const [filters, setFilters] = useState({
    recipientType: 'all',
    notificationType: 'all',
    status: 'all',
    channel: 'all',
    showDeleted: false
  });
  const [showDetails, setShowDetails] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [alert, setAlert] = useState({
    show: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    autoClose: false
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    sent: 0,
    failed: 0
  });

  // Función helper para determinar si una notificación está eliminada
  const isNotificationDeleted = (notification) => {
    return notification.deleted === true || 
           notification.deleted === 'true' || 
           notification.deleted === 1 ||
           notification.status === 'DELETED' ||
           notification.isDeleted === true ||
           notification.active === false;
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Obtener todas las notificaciones y filtrar en el frontend
      const allData = await notificationService.getAllNotifications();
      console.log('🔍 Todas las notificaciones recibidas:', allData);
      console.log('🔍 Filtro showDeleted actual:', filters.showDeleted);
      
      // Analizar cada notificación en detalle
      console.log('🔍 Analizando', allData.length, 'notificaciones para filtrado');
      allData.forEach((notification, index) => {
        const isDeleted = isNotificationDeleted(notification);
        console.log(`� Notificación ${index + 1}:`, {
          id: notification.id,
          deleted: notification.deleted,
          deletedType: typeof notification.deleted,
          isDeleted: isDeleted,
          status: notification.status,
          relevantFields: Object.keys(notification).filter(key => 
            key.toLowerCase().includes('delet') || 
            key.toLowerCase().includes('activ') ||
            key.toLowerCase().includes('status')
          )
        });
      });
      
      // Filtrar según el estado showDeleted
      let data;
      if (filters.showDeleted) {
        // Mostrar solo las notificaciones eliminadas
        console.log('🔍 Filtrando para mostrar SOLO notificaciones eliminadas');
        data = allData.filter(notification => {
          const isDeleted = isNotificationDeleted(notification);
          
          if (isDeleted) {
            console.log(`✅ Notificación ${notification.id} está ELIMINADA y será mostrada`);
          } else {
            console.log(`❌ Notificación ${notification.id} NO está eliminada y será omitida`);
          }
          
          return isDeleted;
        });
      } else {
        // Para notificaciones activas, filtrar normalmente
        console.log('🔍 Filtrando para mostrar SOLO notificaciones activas');
        data = allData.filter(notification => {
          const isDeleted = isNotificationDeleted(notification);
          
          if (!isDeleted) {
            console.log(`✅ Notificación ${notification.id} está ACTIVA y será mostrada`);
          } else {
            console.log(`❌ Notificación ${notification.id} está eliminada y será omitida`);
          }
          
          return !isDeleted;
        });
      }
      
      console.log(`🔍 Resultado del filtrado: ${data.length} notificaciones de ${allData.length} totales`);
      console.log('🔍 IDs de notificaciones filtradas:', data.map(n => n.id));
      
      setNotifications(data);
      calculateStats(data);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
      setError('Error al cargar los datos. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const data = await studentService.getAllStudents();
      setStudents(data);
    } catch (error) {
      console.error('Error al cargar estudiantes:', error);
    }
  };

  const loadTeachers = async () => {
    try {
      const data = await teacherService.getAllTeachers();
      setTeachers(data);
    } catch (error) {
      console.error('Error al cargar profesores:', error);
    }
  };

  const calculateStats = (notificationList) => {
    const stats = {
      total: notificationList.length,
      pending: notificationList.filter(n => n.status === 'PENDING').length,
      sent: notificationList.filter(n => n.status === 'SENT').length,
      failed: notificationList.filter(n => n.status === 'FAILED').length
    };
    setStats(stats);
  };

  useEffect(() => {
    console.log('🔍 useEffect ejecutándose - filters.showDeleted:', filters.showDeleted);
    loadNotifications();
    loadStudents();
    loadTeachers();
  }, [filters.showDeleted]);

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
      onConfirm: null,
      autoClose: false
    });
  };

  const getRecipientName = (recipientId, recipientType) => {
    if (recipientType === 'STUDENT') {
      const student = students.find(s => s.id === recipientId);
      return student ? `${student.firstName} ${student.lastName}` : 'Estudiante no encontrado';
    } else if (recipientType === 'TEACHER') {
      const teacher = teachers.find(t => t.id === recipientId);
      return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Profesor no encontrado';
    }
    return recipientId;
  };

  const filteredNotifications = notifications.filter(notification => {
    const recipientName = getRecipientName(notification.recipientId, notification.recipientType).toLowerCase();
    const matchesSearch = recipientName.includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.notificationType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRecipientType = filters.recipientType === 'all' || notification.recipientType === filters.recipientType;
    const matchesNotificationType = filters.notificationType === 'all' || notification.notificationType === filters.notificationType;
    const matchesStatus = filters.status === 'all' || notification.status === filters.status;
    const matchesChannel = filters.channel === 'all' || notification.channel === filters.channel;
    
    return matchesSearch && matchesRecipientType && matchesNotificationType && matchesStatus && matchesChannel;
  });

  const handleDelete = async (id) => {
    showAlert({
      title: 'Confirmar eliminación',
      message: '¿Está seguro que desea eliminar esta notificación?',
      type: 'warning',
      onConfirm: async () => {
        try {
          setProcessingAction(true);
          await notificationService.deleteNotification(id);
          await loadNotifications();
          showAlert({
            title: 'Éxito',
            message: 'Notificación eliminada correctamente',
            type: 'success',
            autoClose: true,
            onConfirm: () => hideAlert()
          });
        } catch (error) {
          showAlert({
            title: 'Error',
            message: 'Error al eliminar la notificación',
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
      message: '¿Está seguro que desea restaurar esta notificación?',
      type: 'info',
      onConfirm: async () => {
        try {
          setProcessingAction(true);
          await notificationService.restoreNotification(id);
          await loadNotifications();
          showAlert({
            title: 'Éxito',
            message: 'Notificación restaurada correctamente',
            type: 'success',
            autoClose: true,
            onConfirm: () => hideAlert()
          });
        } catch (error) {
          showAlert({
            title: 'Error',
            message: 'Error al restaurar la notificación',
            type: 'error'
          });
        } finally {
          setProcessingAction(false);
        }
      }
    });
  };

  const handleResend = async (id) => {
    showAlert({
      title: 'Confirmar reenvío',
      message: '¿Está seguro que desea reenviar esta notificación?',
      type: 'info',
      onConfirm: async () => {
        try {
          setProcessingAction(true);
          await notificationService.resendNotification(id);
          await loadNotifications();
          showAlert({
            title: 'Éxito',
            message: 'Notificación reenviada correctamente',
            type: 'success',
            autoClose: true,
            onConfirm: () => hideAlert()
          });
        } catch (error) {
          showAlert({
            title: 'Error',
            message: 'Error al reenviar la notificación',
            type: 'error'
          });
        } finally {
          setProcessingAction(false);
        }
      }
    });
  };

  const handleViewDetails = (notification) => {
    setSelectedNotification(notification);
    setShowDetails(true);
  };

  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleMassMarkAsRead = async () => {
    if (selectedNotifications.length === 0) return;

    try {
      setProcessingAction(true);
      await notificationService.markMultipleAsRead(selectedNotifications);
      setSelectedNotifications([]);
      await loadNotifications();
      showAlert({
        title: 'Éxito',
        message: `${selectedNotifications.length} notificaciones marcadas como leídas`,
        type: 'success',
        autoClose: true,
        onConfirm: () => hideAlert()
      });
    } catch (error) {
      showAlert({
        title: 'Error',
        message: 'Error al marcar notificaciones como leídas',
        type: 'error'
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationTypeBadge = (type) => {
    const typeObj = NOTIFICATION_TYPES.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  const getRecipientTypeBadge = (type) => {
    const typeObj = RECIPIENT_TYPES.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  const getChannelBadge = (channel) => {
    const channelObj = NOTIFICATION_CHANNELS.find(c => c.value === channel);
    return channelObj ? channelObj.label : channel;
  };

  const getStatusBadge = (notification) => {
    const notificationObj = new Notification(notification);
    const status = notificationObj.getFormattedStatus();
    const color = notificationObj.getStatusColor();
    const icon = notificationObj.getStatusIcon();
    return <Badge bg={color}><i className={`fas ${icon} me-1`}></i>{status}</Badge>;
  };

  const formatNotificationId = (id) => {
    if (!id) return 'N/A';
    // Tomar los primeros 8 caracteres y formatearlos en grupos de 4
    const shortId = id.substring(0, 8).toUpperCase();
    return `${shortId.substring(0, 4)}-${shortId.substring(4, 8)}`;
  };

  return (
    <>
      <Header />
      <Sidebar activeClassName="notifications" />
      
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="page-title">
              <h4>
                Lista de Notificaciones
                {filters.showDeleted && (
                  <Badge bg="danger" className="ms-2">
                    <i className="fas fa-trash me-1"></i>
                    Eliminadas
                  </Badge>
                )}
              </h4>
              <h6>
                {filters.showDeleted 
                  ? 'Gestión de notificaciones eliminadas del sistema'
                  : 'Gestión de notificaciones activas del sistema'}
              </h6>
            </div>
            <div className="page-btn">
              <div className="d-flex gap-2">
                <Button 
                  variant="outline-secondary" 
                  onClick={() => navigate('/notifications/templates')}
                >
                  <i className="fas fa-file-alt me-2"></i>
                  Plantillas
                </Button>
                <Button 
                  variant="info" 
                  onClick={() => navigate('/notifications/bulk')}
                >
                  <i className="fas fa-bullhorn me-2"></i>
                  Notificación Masiva
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => navigate('/notifications/add')}
                >
                  <i className="fas fa-plus me-2"></i>
                  Agregar Notificación
                </Button>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <Row className="mb-3">
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h5 className="text-primary">{stats.total}</h5>
                  <small className="text-muted">Total</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h5 className="text-warning">{stats.pending}</h5>
                  <small className="text-muted">Pendientes</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h5 className="text-success">{stats.sent}</h5>
                  <small className="text-muted">Enviadas</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center">
                <Card.Body>
                  <h5 className="text-danger">{stats.failed}</h5>
                  <small className="text-muted">Fallidas</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card>
            <Card.Body>
              <Row className="mb-3">
                <Col md={3}>
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="fas fa-search"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Buscar notificaciones..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={2}>
                  <Form.Select
                    value={filters.recipientType}
                    onChange={(e) => setFilters({...filters, recipientType: e.target.value})}
                  >
                    <option value="all">Todos los destinatarios</option>
                    {RECIPIENT_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Form.Select
                    value={filters.notificationType}
                    onChange={(e) => setFilters({...filters, notificationType: e.target.value})}
                  >
                    <option value="all">Todos los tipos</option>
                    {NOTIFICATION_TYPES.map(type => (
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
                    <option value="all">Todos los estados</option>
                    {NOTIFICATION_STATUS.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Form.Check
                    type="checkbox"
                    label="Ver eliminadas"
                    checked={filters.showDeleted}
                    onChange={(e) => {
                      console.log('🔍 Cambiando filtro showDeleted a:', e.target.checked);
                      setFilters({...filters, showDeleted: e.target.checked});
                    }}
                  />
                </Col>
                <Col md={1}>
                  <Button variant="outline-secondary" onClick={loadNotifications}>
                    <i className="fas fa-sync-alt"></i>
                  </Button>
                </Col>
              </Row>

              {/* Acciones masivas */}
              {selectedNotifications.length > 0 && (
                <Alert variant="info" className="d-flex justify-content-between align-items-center">
                  <span>{selectedNotifications.length} notificaciones seleccionadas</span>
                  <div>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="me-2"
                      onClick={handleMassMarkAsRead}
                      disabled={processingAction}
                    >
                      <i className="fas fa-check me-1"></i>
                      Marcar como leídas
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={() => setSelectedNotifications([])}
                    >
                      Cancelar
                    </Button>
                  </div>
                </Alert>
              )}

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
                      Mostrando {filteredNotifications.length} de {notifications.length} notificaciones
                    </small>
                  </div>
                  
                  <Table responsive striped hover>
                    <thead>
                      <tr>
                        <th>
                          <Form.Check
                            type="checkbox"
                            checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                            onChange={handleSelectAll}
                          />
                        </th>
                        <th>Destinatario</th>
                        <th>Tipo</th>
                        <th>Mensaje</th>
                        <th>Estado</th>
                        <th>Canal</th>
                        <th>ID</th>
                        <th>Eliminado</th>
                        <th>Creado</th>
                        <th>Enviado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredNotifications.map((notification) => (
                        <tr key={notification.id}>
                          <td>
                            <Form.Check
                              type="checkbox"
                              checked={selectedNotifications.includes(notification.id)}
                              onChange={() => handleSelectNotification(notification.id)}
                            />
                          </td>
                          <td>
                            <div>
                              <strong>{getRecipientName(notification.recipientId, notification.recipientType)}</strong>
                              <br />
                              <small className="text-muted">{getRecipientTypeBadge(notification.recipientType)}</small>
                            </div>
                          </td>
                          <td>
                            <Badge bg="secondary">
                              {getNotificationTypeBadge(notification.notificationType)}
                            </Badge>
                          </td>
                          <td>
                            <div className="message-preview">
                              {notification.message.length > 50 
                                ? `${notification.message.substring(0, 50)}...` 
                                : notification.message}
                            </div>
                          </td>
                          <td>{getStatusBadge(notification)}</td>
                          <td>
                            <small className="text-muted">
                              {getChannelBadge(notification.channel)}
                            </small>
                          </td>
                          <td>
                            <code title={notification.id} style={{cursor: 'help', fontSize: '0.8em'}}>
                              {formatNotificationId(notification.id)}
                            </code>
                          </td>
                          <td>
                            {(() => {
                              const isDeleted = isNotificationDeleted(notification);
                              
                              return (
                                <div>
                                  <Badge bg={isDeleted ? 'danger' : 'success'}>
                                    {isDeleted ? 'SÍ' : 'NO'}
                                  </Badge>
                                  <br />
                                  <small className="text-muted">
                                    deleted: {JSON.stringify(notification.deleted)}
                                  </small>
                                </div>
                              );
                            })()}
                          </td>
                          <td>{formatDate(notification.createdAt)}</td>
                          <td>{formatDate(notification.sentAt)}</td>
                          <td>
                            <div className="action-buttons">
                              <Button
                                variant="outline-info"
                                size="sm"
                                className="me-1"
                                onClick={() => handleViewDetails(notification)}
                                title="Ver detalles"
                              >
                                <i className="fas fa-eye"></i>
                              </Button>
                              {notification.status === 'FAILED' && !filters.showDeleted && (
                                <Button
                                  variant="outline-warning"
                                  size="sm"
                                  className="me-1"
                                  onClick={() => handleResend(notification.id)}
                                  disabled={processingAction}
                                  title="Reenviar"
                                >
                                  <i className="fas fa-redo"></i>
                                </Button>
                              )}
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="me-1"
                                onClick={() => navigate(`/notifications/edit/${notification.id}`)}
                                title="Editar"
                                disabled={filters.showDeleted}
                              >
                                <i className="fas fa-edit"></i>
                              </Button>
                              {filters.showDeleted ? (
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  onClick={() => handleRestore(notification.id)}
                                  disabled={processingAction}
                                  title="Restaurar"
                                >
                                  <i className="fas fa-undo"></i>
                                </Button>
                              ) : (
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDelete(notification.id)}
                                  disabled={processingAction}
                                  title="Eliminar"
                                >
                                  <i className="fas fa-trash"></i>
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  {filteredNotifications.length === 0 && (
                    <div className="text-center py-4">
                      <i className="fas fa-bell-slash fa-3x text-muted mb-3"></i>
                      <p className="text-muted">
                        {filters.showDeleted 
                          ? 'No hay notificaciones eliminadas' 
                          : 'No hay notificaciones activas'}
                      </p>
                      {filters.showDeleted && (
                        <small className="text-muted">
                          Las notificaciones eliminadas aparecerán aquí
                        </small>
                      )}
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
          <Modal.Title>Detalles de la Notificación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedNotification && (
            <Row>
              <Col md={6}>
                <p><strong>Destinatario:</strong> {getRecipientName(selectedNotification.recipientId, selectedNotification.recipientType)}</p>
                <p><strong>Tipo de Destinatario:</strong> {getRecipientTypeBadge(selectedNotification.recipientType)}</p>
                <p><strong>Tipo de Notificación:</strong> {getNotificationTypeBadge(selectedNotification.notificationType)}</p>
                <p><strong>Canal:</strong> {getChannelBadge(selectedNotification.channel)}</p>
              </Col>
              <Col md={6}>
                <p><strong>Estado:</strong> {getStatusBadge(selectedNotification)}</p>
                <p><strong>Fecha de Creación:</strong> {formatDate(selectedNotification.createdAt)}</p>
                <p><strong>Fecha de Envío:</strong> {formatDate(selectedNotification.sentAt)}</p>
                <p><strong>ID:</strong> <code title={selectedNotification.id} style={{cursor: 'help'}}>{formatNotificationId(selectedNotification.id)}</code></p>
              </Col>
              <Col md={12}>
                <hr />
                <p><strong>Mensaje:</strong></p>
                <div className="bg-light p-3 rounded">
                  {selectedNotification.message}
                </div>
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

      <CustomAlert
        show={alert.show}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onConfirm={alert.onConfirm}
        onCancel={hideAlert}
        onClose={hideAlert}
        autoClose={alert.autoClose}
      />
    </>
  );
};

export default NotificationList;
