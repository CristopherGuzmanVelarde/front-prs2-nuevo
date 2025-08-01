import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Row, Col, Modal } from 'react-bootstrap';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { NOTIFICATION_TYPES } from '../../types/notification.types';
import './NotificationTemplates.css';

const NotificationTemplates = () => {
  const navigate = useNavigate();
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const templates = [
    {
      id: 1,
      name: 'Recordatorio de Examen',
      type: 'ACADEMIC',
      subject: 'Recordatorio: Examen próximo',
      message: 'Le recordamos que tiene un examen programado para la materia {materia} el día {fecha} a las {hora}. Por favor, llegue puntualmente y traiga sus materiales de estudio.',
      recipients: ['STUDENT'],
      color: 'primary'
    },
    {
      id: 2,
      name: 'Calificación Publicada',
      type: 'ACADEMIC',
      subject: 'Nueva calificación disponible',
      message: 'Se ha publicado una nueva calificación para la materia {materia}. Su nota es: {calificacion}. Puede revisar los detalles en el portal académico.',
      recipients: ['STUDENT'],
      color: 'success'
    },
    {
      id: 3,
      name: 'Reunión de Padres',
      type: 'ADMINISTRATIVE',
      subject: 'Convocatoria a reunión de padres',
      message: 'Estimados padres de familia, se convoca a reunión el día {fecha} a las {hora} para tratar asuntos importantes relacionados con el progreso académico de sus hijos.',
      recipients: ['PARENT'],
      color: 'info'
    },
    {
      id: 4,
      name: 'Ausencia Injustificada',
      type: 'ATTENDANCE',
      subject: 'Notificación de ausencia',
      message: 'Se registró una ausencia no justificada el día {fecha} en la materia {materia}. Por favor, presentar justificación correspondiente.',
      recipients: ['STUDENT', 'PARENT'],
      color: 'warning'
    },
    {
      id: 5,
      name: 'Cambio de Horario',
      type: 'ADMINISTRATIVE',
      subject: 'Modificación en horario de clases',
      message: 'Se informa que habrá un cambio en el horario de la materia {materia}. El nuevo horario será {nuevo_horario} a partir del {fecha_inicio}.',
      recipients: ['STUDENT', 'TEACHER'],
      color: 'secondary'
    },
    {
      id: 6,
      name: 'Felicitaciones por Logro',
      type: 'RECOGNITION',
      subject: '¡Felicitaciones por su excelente desempeño!',
      message: 'Nos complace felicitarle por su excelente desempeño académico en {materia}. Su dedicación y esfuerzo son dignos de reconocimiento. ¡Siga así!',
      recipients: ['STUDENT'],
      color: 'success'
    },
    {
      id: 7,
      name: 'Información de Evento',
      type: 'EVENT',
      subject: 'Próximo evento institucional',
      message: 'Le invitamos al evento {nombre_evento} que se realizará el {fecha} a las {hora} en {lugar}. Su participación es muy importante para nosotros.',
      recipients: ['STUDENT', 'TEACHER', 'PARENT'],
      color: 'primary'
    },
    {
      id: 8,
      name: 'Recordatorio de Pago',
      type: 'FINANCIAL',
      subject: 'Recordatorio de pago pendiente',
      message: 'Le recordamos que tiene un pago pendiente por concepto de {concepto} con vencimiento el {fecha_vencimiento}. El monto es de {monto}.',
      recipients: ['PARENT'],
      color: 'danger'
    }
  ];

  const handleUseTemplate = (template) => {
    setSelectedTemplate(template);
    setShowTemplateModal(true);
  };

  const handleConfirmTemplate = () => {
    // Navegar al formulario de creación con datos pre-llenados
    const templateData = {
      notificationType: selectedTemplate.type,
      message: selectedTemplate.message,
      subject: selectedTemplate.subject
    };
    
    // Pasar datos como state al navegador
    navigate('/notifications/add', { state: { templateData } });
  };

  const getVariables = (message) => {
    const matches = message.match(/{([^}]+)}/g);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  };

  return (
    <>
      <Header />
      <Sidebar activeClassName="notifications" />
      
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="page-title">
              <h4>Plantillas de Notificaciones</h4>
              <h6>Seleccione una plantilla para crear notificaciones rápidamente</h6>
            </div>
            <div className="page-btn">
              <Button 
                variant="secondary" 
                onClick={() => navigate('/notifications')}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Volver a Lista
              </Button>
            </div>
          </div>

          <Row>
            {templates.map(template => (
              <Col key={template.id} md={6} lg={4} className="mb-4">
                <Card className="h-100">
                  <Card.Header className={`bg-${template.color} text-white`}>
                    <h6 className="mb-0">
                      <i className={`fas fa-${template.color === 'primary' ? 'bell' : 
                                          template.color === 'success' ? 'check-circle' :
                                          template.color === 'info' ? 'info-circle' :
                                          template.color === 'warning' ? 'exclamation-triangle' :
                                          template.color === 'danger' ? 'exclamation-circle' :
                                          'envelope'} me-2`}></i>
                      {template.name}
                    </h6>
                  </Card.Header>
                  <Card.Body className="d-flex flex-column">
                    <div className="mb-2">
                      <small className="text-muted">Tipo:</small>
                      <div>
                        <span className={`badge bg-${template.color}`}>
                          {NOTIFICATION_TYPES.find(t => t.value === template.type)?.label || template.type}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <small className="text-muted">Destinatarios:</small>
                      <div>
                        {template.recipients.map(recipient => (
                          <span key={recipient} className="badge bg-secondary me-1">
                            {recipient === 'STUDENT' ? 'Estudiantes' :
                             recipient === 'TEACHER' ? 'Profesores' :
                             recipient === 'PARENT' ? 'Padres' : 'Admins'}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mb-3 flex-grow-1">
                      <small className="text-muted">Mensaje:</small>
                      <p className="small text-truncate-3">{template.message}</p>
                    </div>

                    {getVariables(template.message).length > 0 && (
                      <div className="mb-3">
                        <small className="text-muted">Variables:</small>
                        <div>
                          {getVariables(template.message).map(variable => (
                            <span key={variable} className="badge bg-light text-dark me-1">
                              {variable}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button 
                      variant={template.color}
                      size="sm"
                      onClick={() => handleUseTemplate(template)}
                      className="mt-auto"
                    >
                      <i className="fas fa-paper-plane me-2"></i>
                      Usar Plantilla
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Modal de confirmación */}
      <Modal show={showTemplateModal} onHide={() => setShowTemplateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Usar Plantilla</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTemplate && (
            <>
              <h6>{selectedTemplate.name}</h6>
              <p><strong>Mensaje:</strong></p>
              <div className="bg-light p-3 rounded">
                {selectedTemplate.message}
              </div>
              {getVariables(selectedTemplate.message).length > 0 && (
                <div className="mt-3">
                  <p><strong>Variables que debe reemplazar:</strong></p>
                  <ul>
                    {getVariables(selectedTemplate.message).map(variable => (
                      <li key={variable}><code>{`{${variable}}`}</code></li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="mt-3 text-muted">
                Esta plantilla se cargará en el formulario de creación donde podrá editarla y personalizarla.
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTemplateModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleConfirmTemplate}>
            <i className="fas fa-edit me-2"></i>
            Editar y Usar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default NotificationTemplates;
