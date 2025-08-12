import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Form, InputGroup, Spinner, Modal, Card, Row, Col, Badge, Alert, Dropdown } from 'react-bootstrap';
import { notificationService } from '../../services/notificationService';
import { studentService } from '../../services';
import { teacherService } from '../../services/teacherService';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import Pagination from '../../components/Pagination';
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

  // Estados para paginación
  const [pagination, setPagination] = useState({
    currentPage: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
    usePagination: true
  });

  // Funciones para manejar paginación
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
    loadNotifications(newPage, pagination.pageSize);
  };

  const handlePageSizeChange = (newPageSize) => {
    setPagination(prev => ({ 
      ...prev, 
      pageSize: newPageSize, 
      currentPage: 0 
    }));
    loadNotifications(0, newPageSize);
  };

  // Función helper para determinar si una notificación está eliminada
  const isNotificationDeleted = (notification) => {
    // Verificar diferentes campos que podrían indicar eliminación
    const deletedValues = [
      notification.deleted === true,
      notification.deleted === 'true',
      notification.deleted === 1,
      notification.deleted === '1',
      notification.status === 'DELETED',
      notification.status === 'deleted',
      notification.isDeleted === true,
      notification.active === false,
      notification.estado === 'eliminado',
      notification.estado === 'ELIMINADO'
    ];
    
    return deletedValues.some(value => value === true);
  };

  const loadNotifications = async (page = pagination.currentPage, size = pagination.pageSize) => {
    try {
      setLoading(true);
      setError('');
      
      // Obtener todas las notificaciones y filtrar en el frontend
      let allData = await notificationService.getAllNotifications();
      
      // Validar que allData sea un array
      if (!Array.isArray(allData)) {
        console.warn('⚠️ getAllNotifications no devolvió un array válido:', allData);
        allData = [];
      }
      
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
      
      // Aplicar filtros adicionales (búsqueda, tipo, estado, etc.)
      let finalData = data;
      
      // Filtro de búsqueda
      if (searchTerm) {
        finalData = finalData.filter(notification => 
          notification.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          getRecipientName(notification.recipientId, notification.recipientType)?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Filtros por tipo, estado, canal
      if (filters.recipientType !== 'all') {
        finalData = finalData.filter(notification => notification.recipientType === filters.recipientType);
      }
      
      if (filters.notificationType !== 'all') {
        finalData = finalData.filter(notification => notification.notificationType === filters.notificationType);
      }
      
      if (filters.status !== 'all') {
        finalData = finalData.filter(notification => notification.status === filters.status);
      }
      
      if (filters.channel !== 'all') {
        finalData = finalData.filter(notification => notification.channel === filters.channel);
      }
      
      // Calcular paginación
      const totalElements = finalData.length;
      const totalPages = Math.ceil(totalElements / size);
      const startIndex = page * size;
      const endIndex = startIndex + size;
      const paginatedData = finalData.slice(startIndex, endIndex);
      
      // Actualizar estados
      setPagination(prev => ({
        ...prev,
        currentPage: page,
        totalElements,
        totalPages
      }));
      
      setNotifications(paginatedData || []);
      calculateStats(finalData || []); // Usar todos los datos filtrados para las estadísticas
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
      setError('Error al cargar los datos. Por favor, intente nuevamente.');
      setNotifications([]);
      calculateStats([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const data = await studentService.getAllStudents();
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar estudiantes:', error);
      setStudents([]);
    }
  };

  const loadTeachers = async () => {
    try {
      const data = await teacherService.getAllTeachers();
      setTeachers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar profesores:', error);
      setTeachers([]);
    }
  };

  const calculateStats = (notificationList) => {
    // Verificar que notificationList sea un array válido
    const validList = Array.isArray(notificationList) ? notificationList : [];
    
    const stats = {
      total: validList.length,
      pending: validList.filter(n => n.status === 'PENDING').length,
      sent: validList.filter(n => n.status === 'SENT').length,
      failed: validList.filter(n => n.status === 'FAILED').length
    };
    setStats(stats);
  };

  useEffect(() => {
    console.log('🔍 useEffect ejecutándose - filters.showDeleted:', filters.showDeleted);
    loadNotifications();
    loadStudents();
    loadTeachers();
  }, [filters.showDeleted]);

  // Reiniciar paginación cuando cambien los filtros de búsqueda
  useEffect(() => {
    if (pagination.currentPage !== 0) {
      setPagination(prev => ({ ...prev, currentPage: 0 }));
      loadNotifications(0, pagination.pageSize);
    } else {
      loadNotifications(0, pagination.pageSize);
    }
  }, [filters.recipientType, filters.notificationType, filters.status, filters.channel, searchTerm]);

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
    // Si el recipientType no está definido o está vacío, intentar detectar automáticamente
    if (!recipientType || recipientType === '' || recipientType === 'undefined') {
      // Buscar primero en estudiantes
      const student = students.find(s => s.id === recipientId);
      if (student) {
        return `${student.firstName} ${student.lastName}`;
      }
      
      // Si no es estudiante, buscar en profesores
      const teacher = teachers.find(t => t.id === recipientId);
      if (teacher) {
        return `${teacher.firstName} ${teacher.lastName}`;
      }
      
      return recipientId || 'Destinatario no encontrado';
    }
    
    // Si recipientType está definido, usar la lógica original
    if (recipientType === 'STUDENT' || recipientType === 'Estudiante') {
      const student = students.find(s => s.id === recipientId);
      return student ? `${student.firstName} ${student.lastName}` : 'Estudiante no encontrado';
    } else if (recipientType === 'TEACHER' || recipientType === 'Profesor') {
      const teacher = teachers.find(t => t.id === recipientId);
      return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Profesor no encontrado';
    } else if (recipientType === 'PARENT' || recipientType === 'Padre') {
      return 'Padre de familia';
    }
    
    // Si es un nombre completo (como en el backend actualizado)
    if (recipientType && recipientType.includes(' ')) {
      return recipientType;
    }
    
    return recipientId || 'Destinatario no encontrado';
  };

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

  const handleSend = async (id) => {
    showAlert({
      title: 'Confirmar envío',
      message: '¿Está seguro que desea enviar esta notificación?',
      type: 'info',
      onConfirm: async () => {
        try {
          setProcessingAction(true);
          await notificationService.sendNotification(id);
          await loadNotifications();
          showAlert({
            title: 'Éxito',
            message: 'Notificación enviada correctamente',
            type: 'success',
            autoClose: true,
            onConfirm: () => hideAlert()
          });
        } catch (error) {
          showAlert({
            title: 'Error',
            message: 'Error al enviar la notificación',
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

  const handleChangeStatus = async (id, newStatus) => {
    const statusLabels = {
      'PENDING': 'Pendiente',
      'SENT': 'Enviado',
      'FAILED': 'Fallido'
    };

    showAlert({
      title: 'Confirmar cambio de estado',
      message: `¿Está seguro que desea cambiar el estado a "${statusLabels[newStatus]}"?`,
      type: 'info',
      onConfirm: async () => {
        try {
          setProcessingAction(true);
          const current = notifications.find(n => n.id === id);
          if (!current) throw new Error('Notificación no encontrada');

            // Construir payload mínimo
          const updateData = {
            recipientId: current.recipientId,
            recipientType: current.recipientType,
            message: current.message,
            notificationType: current.notificationType,
            channel: current.channel,
            status: newStatus
          };

          await notificationService.updateNotification(id, updateData);
          await loadNotifications();
          showAlert({
            title: 'Éxito',
            message: `Estado cambiado a "${statusLabels[newStatus]}" correctamente`,
            type: 'success',
            autoClose: true,
            onConfirm: () => hideAlert()
          });
        } catch (error) {
          showAlert({
            title: 'Error',
            message: 'Error al cambiar el estado de la notificación',
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
    const validNotifications = Array.isArray(notifications) ? notifications : [];
    const validSelected = Array.isArray(selectedNotifications) ? selectedNotifications : [];
    
    if (validSelected.length === validNotifications.length && validNotifications.length > 0) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(validNotifications.map(n => n.id));
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
    if (!dateString || dateString === 'N/A' || dateString === 'Invalid Date') return 'N/A';
    
    try {
      // Intentar parsear diferentes formatos de fecha
      let date;
      
      // Si es un array (formato del backend Java)
      if (Array.isArray(dateString)) {
        const [year, month, day, hour = 0, minute = 0, second = 0] = dateString;
        date = new Date(year, month - 1, day, hour, minute, second);
      } 
      // Si es un string ISO o timestamp
      else if (typeof dateString === 'string' || typeof dateString === 'number') {
        date = new Date(dateString);
      }
      // Si ya es un objeto Date
      else if (dateString instanceof Date) {
        date = dateString;
      }
      else {
        return 'Formato inválido';
      }
      
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }
      
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formateando fecha:', error, 'Input:', dateString);
      return 'Error de formato';
    }
  };

  const getNotificationTypeBadge = (type) => {
    const typeObj = NOTIFICATION_TYPES.find(t => t.value === type);
    const label = typeObj ? typeObj.label : type;
    
    // Definir colores según el tipo de notificación
    let badgeColor = 'secondary'; // Color por defecto
    
    switch (type) {
      case 'GRADE_PUBLISHED':
      case 'Calificación Publicada':
        badgeColor = 'success';
        break;
      case 'GRADE_UPDATED':
      case 'Calificación Actualizada':
        badgeColor = 'info';
        break;
      case 'LOW_PERFORMANCE':
      case 'Bajo Rendimiento':
        badgeColor = 'warning';
        break;
      case 'ATTENDANCE_ALERT':
      case 'Alerta de Asistencia':
        badgeColor = 'danger';
        break;
      case 'ENROLLMENT_CONFIRMATION':
      case 'Confirmación de Matrícula':
        badgeColor = 'primary';
        break;
      case 'PAYMENT_REMINDER':
      case 'Recordatorio de Pago':
        badgeColor = 'warning';
        break;
      case 'SYSTEM_MAINTENANCE':
      case 'Mantenimiento del Sistema':
        badgeColor = 'dark';
        break;
      case 'GENERAL_ANNOUNCEMENT':
      case 'Anuncio General':
        badgeColor = 'info';
        break;
      default:
        badgeColor = 'secondary';
    }
    
    return { label, color: badgeColor };
  };

  const getRecipientTypeBadge = (type, recipientId) => {
    // Si el tipo no está definido o está vacío, intentar detectar automáticamente
    if (!type || type === '' || type === 'undefined') {
      // Buscar en estudiantes
      const student = students.find(s => s.id === recipientId);
      if (student) {
        return 'Estudiante';
      }
      
      // Buscar en profesores
      const teacher = teachers.find(t => t.id === recipientId);
      if (teacher) {
        return 'Profesor';
      }
      
      return 'Desconocido';
    }
    
    // Si es un nombre completo (como viene del backend actualizado)
    if (type && type.includes(' ')) {
      // Buscar en estudiantes para determinar el tipo
      const student = students.find(s => s.id === recipientId);
      if (student) {
        return 'Estudiante';
      }
      
      // Buscar en profesores
      const teacher = teachers.find(t => t.id === recipientId);
      if (teacher) {
        return 'Profesor';
      }
      
      return 'Persona';
    }
    
    // Mapear tipos conocidos
    const typeMapping = {
      'STUDENT': 'Estudiante',
      'TEACHER': 'Profesor', 
      'PARENT': 'Padre',
      'Estudiante': 'Estudiante',
      'Profesor': 'Profesor',
      'Padre': 'Padre'
    };
    
    return typeMapping[type] || type;
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
                  <div className="mb-3 d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      {pagination.usePagination 
                        ? `Página ${pagination.currentPage + 1} de ${pagination.totalPages} (${pagination.totalElements} registros)`
                        : `Mostrando ${notifications.length} notificaciones`}
                    </small>
                    
                    {pagination.usePagination && (
                      <div className="page-size-selector">
                        <small className="text-muted me-2">Registros por página:</small>
                        <Form.Select
                          size="sm"
                          style={{ width: 'auto', display: 'inline-block' }}
                          value={pagination.pageSize}
                          onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                        </Form.Select>
                      </div>
                    )}
                  </div>
                  
                  <Table responsive striped hover>
                    <thead>
                      <tr>
                        <th>
                          <Form.Check
                            type="checkbox"
                            checked={selectedNotifications.length === notifications.length && notifications.length > 0}
                            onChange={handleSelectAll}
                          />
                        </th>
                        <th>Destinatario</th>
                        <th>Tipo</th>
                        <th>Mensaje</th>
                        <th>Estado</th>
                        <th>Canal</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notifications.map((notification) => (
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
                              <small className="text-muted">{getRecipientTypeBadge(notification.recipientType, notification.recipientId)}</small>
                            </div>
                          </td>
                          <td>
                            {(() => {
                              const typeBadge = getNotificationTypeBadge(notification.notificationType);
                              return (
                                <Badge bg={typeBadge.color}>
                                  {typeBadge.label}
                                </Badge>
                              );
                            })()}
                          </td>
                          <td>
                            <div className="message-preview">
                              {notification.message && notification.message.length > 50 
                                ? `${notification.message.substring(0, 50)}...` 
                                : (notification.message || 'Sin mensaje')}
                            </div>
                          </td>
                          <td>{getStatusBadge(notification)}</td>
                          <td>
                            <small className="text-muted">
                              {getChannelBadge(notification.channel)}
                            </small>
                          </td>
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
                              
                              {/* Dropdown para cambiar estado */}
                              {!filters.showDeleted && (
                                <Dropdown className="d-inline me-1">
                                  <Dropdown.Toggle 
                                    variant="outline-secondary" 
                                    size="sm"
                                    disabled={processingAction}
                                    title={`Estado actual: ${notification.status === 'PENDING' ? 'Pendiente' : notification.status === 'SENT' ? 'Enviado' : 'Fallido'}`}
                                  >
                                    <i className="fas fa-exchange-alt"></i>
                                  </Dropdown.Toggle>
                                  <Dropdown.Menu>
                                    <Dropdown.Header>
                                      <i className="fas fa-info-circle me-1"></i>
                                      Estado actual: {notification.status === 'PENDING' ? 'Pendiente' : notification.status === 'SENT' ? 'Enviado' : 'Fallido'}
                                    </Dropdown.Header>
                                    <Dropdown.Divider />
                                    <small className="dropdown-header text-muted">Cambiar a:</small>
                                    {notification.status !== 'PENDING' && (
                                      <Dropdown.Item 
                                        onClick={() => handleChangeStatus(notification.id, 'PENDING')}
                                      >
                                        <i className="fas fa-clock text-warning me-2"></i>
                                        Pendiente
                                      </Dropdown.Item>
                                    )}
                                    {notification.status !== 'SENT' && (
                                      <Dropdown.Item 
                                        onClick={() => handleChangeStatus(notification.id, 'SENT')}
                                      >
                                        <i className="fas fa-check-circle text-success me-2"></i>
                                        Enviado
                                      </Dropdown.Item>
                                    )}
                                    {notification.status !== 'FAILED' && (
                                      <Dropdown.Item 
                                        onClick={() => handleChangeStatus(notification.id, 'FAILED')}
                                      >
                                        <i className="fas fa-times-circle text-danger me-2"></i>
                                        Fallido
                                      </Dropdown.Item>
                                    )}
                                  </Dropdown.Menu>
                                </Dropdown>
                              )}
                              {notification.status === 'PENDING' && !filters.showDeleted && (
                                <Button
                                  variant="outline-success"
                                  size="sm"
                                  className="me-1"
                                  onClick={() => handleSend(notification.id)}
                                  disabled={processingAction}
                                  title="Enviar"
                                >
                                  <i className="fas fa-paper-plane"></i>
                                </Button>
                              )}
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

                  {notifications.length === 0 && (
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

                  {/* Componente de paginación */}
                  {pagination.usePagination && pagination.totalPages > 1 && (
                    <div className="mt-4">
                      <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        totalElements={pagination.totalElements}
                        pageSize={pagination.pageSize}
                        onPageChange={handlePageChange}
                        showInfo={true}
                        showSizeSelector={true}
                        onPageSizeChange={handlePageSizeChange}
                        className="justify-content-center"
                      />
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
                <p><strong>Tipo de Destinatario:</strong> {getRecipientTypeBadge(selectedNotification.recipientType, selectedNotification.recipientId)}</p>
                <p><strong>Tipo de Notificación:</strong> 
                  {(() => {
                    const typeBadge = getNotificationTypeBadge(selectedNotification.notificationType);
                    return (
                      <Badge bg={typeBadge.color} className="ms-2">
                        {typeBadge.label}
                      </Badge>
                    );
                  })()}
                </p>
                <p><strong>Canal:</strong> {getChannelBadge(selectedNotification.channel)}</p>
              </Col>
              <Col md={6}>
                <p><strong>Estado:</strong> {getStatusBadge(selectedNotification)}</p>
                <p><strong>Fecha de Creación:</strong> {formatDate(selectedNotification.createdAt)}</p>
                <p><strong>Fecha de Envío:</strong> {formatDate(selectedNotification.sentAt)}</p>
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
