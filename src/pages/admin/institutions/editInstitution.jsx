/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { message, DatePicker } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import FeatherIcon from "feather-icons-react/build/FeatherIcon";
import { Link } from 'react-router-dom';
import InstitutionService from '../../../services/institutionService';

// Custom CSS for notification animation
const notificationStyle = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const EditInstitution = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [formData, setFormData] = useState({
    institutionName: '',
    codeName: '',
    institutionLogo: '',
    modularCode: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    status: 'A',
    uiSettings: {
      color_scheme: '#4A86E8',
      logo_position: 'left',
      show_student_photos: true
    },
    evaluationSystem: {
      scale: 'vigesimal',
      min_passing_grade: 11,
      show_decimals: true,
      grade_letters: {
        AD: { min: 17, max: 20, description: "Logro destacado" },
        A: { min: 14, max: 16.99, description: "Logro esperado" },
        B: { min: 11, max: 13.99, description: "En proceso" },
        C: { min: 0, max: 10.99, description: "En inicio" }
      }
    },
    scheduleSettings: {
      mornings_hours: '7:30am - 12:30pm',
      afternoon_hours: '12:30pm - 06:00pm',
      special_schedule_days: []
    },
    headquarterIds: []
  });

  // Validation state
  const [errors, setErrors] = useState({});

  // Validation functions
  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'institutionName':
        if (!value) {
          error = 'El nombre de la institución es obligatorio';
        } else if (value.length < 3 || value.length > 100) {
          error = 'El nombre debe tener entre 3 y 100 caracteres';
        }
        break;
      
      case 'codeName':
        if (!value) {
          error = 'El código de la institución es obligatorio';
        } else if (value.length < 2 || value.length > 10) {
          error = 'El código debe tener entre 2 y 10 caracteres';
        } else if (!/^[A-Z0-9]+$/.test(value)) {
          error = 'El código solo puede contener letras mayúsculas y números';
        }
        break;
      
      case 'modularCode':
        if (!value) {
          error = 'El código modular es obligatorio';
        } else if (value.length < 5 || value.length > 10) {
          error = 'El código modular debe tener entre 5 y 10 caracteres';
        }
        break;
      
      case 'address':
        if (!value.trim()) {
          error = 'La dirección no puede estar vacía';
        }
        break;
      
      case 'contactEmail':
        if (!value) {
          error = 'El correo de contacto es obligatorio';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Formato de correo inválido';
        }
        break;
      
      case 'contactPhone':
        if (value && !/^[0-9]{9,12}$/.test(value)) {
          error = 'El teléfono debe contener entre 9 y 12 dígitos';
        }
        break;
      
      default:
        break;
    }
    
    return error;
  };

  const validateTimeFormat = (value, fieldName) => {
    // Regex pattern to validate time format like "7:30am - 12:30pm" with exactly one space before and after the dash
    const timeFormatPattern = /^\d{1,2}:\d{2}(am|pm) - \d{1,2}:\d{2}(am|pm)$/i;
    if (!value) return '';
    if (!timeFormatPattern.test(value)) {
      return `El formato debe ser exactamente "7:30am - 12:30pm" con un espacio antes y después del guion`;
    }
    return '';
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate all fields
    Object.keys(formData).forEach(key => {
      if (key !== 'uiSettings' && key !== 'evaluationSystem' && key !== 'scheduleSettings' && key !== 'headquarterIds') {
        const error = validateField(key, formData[key]);
        if (error) {
          newErrors[key] = error;
        }
      }
    });

    // Validate schedule settings
    const morningHoursError = validateTimeFormat(formData.scheduleSettings.mornings_hours, 'mornings_hours');
    if (morningHoursError) {
      newErrors.mornings_hours = morningHoursError;
    }

    const afternoonHoursError = validateTimeFormat(formData.scheduleSettings.afternoon_hours, 'afternoon_hours');
    if (afternoonHoursError) {
      newErrors.afternoon_hours = afternoonHoursError;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Cargar datos de la institución al montar el componente
  useEffect(() => {
    loadInstitutionData();
  }, [id]);

  // Inject the style into the document head
  useEffect(() => {
    // Create style element
    const styleElement = document.createElement('style');
    styleElement.innerHTML = notificationStyle;
    document.head.appendChild(styleElement);

    // Clean up on unmount
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const loadInstitutionData = async () => {
    try {
      setLoadingData(true);
      const institution = await InstitutionService.getInstitutionById(id);

      setFormData({
        institutionName: institution.institutionName || '',
        codeName: institution.codeName || '',
        institutionLogo: institution.institutionLogo || '',
        modularCode: institution.modularCode || '',
        address: institution.address || '',
        contactEmail: institution.contactEmail || '',
        contactPhone: institution.contactPhone || '',
        status: institution.status || 'A',
        uiSettings: {
          color_scheme: institution.uiSettings?.color_scheme || '#4A86E8',
          logo_position: institution.uiSettings?.logo_position || 'left',
          show_student_photos: institution.uiSettings?.show_student_photos ?? true
        },
        evaluationSystem: {
          scale: institution.evaluationSystem?.scale || 'vigesimal',
          min_passing_grade: institution.evaluationSystem?.min_passing_grade || 11,
          show_decimals: institution.evaluationSystem?.show_decimals ?? true,
          round_method: institution.evaluationSystem?.round_method || 'up',
          grade_letters: institution.evaluationSystem?.grade_letters || {
            AD: { min: 17, max: 20, description: "Logro destacado" },
            A: { min: 14, max: 16.99, description: "Logro esperado" },
            B: { min: 11, max: 13.99, description: "En proceso" },
            C: { min: 0, max: 10.99, description: "En inicio" }
          }
        },
        scheduleSettings: {
          mornings_hours: institution.scheduleSettings?.mornings_hours || '7:30am - 12:30pm',
          afternoon_hours: institution.scheduleSettings?.afternoon_hours || '12:30pm - 06:00pm',
          special_schedule_days: institution.scheduleSettings?.special_schedule_days || []
        },
        headquarterIds: institution.headquarterIds || []
      });
    } catch (error) {
      console.error('Error loading institution:', error);
      message.error('Error al cargar los datos de la institución');
      navigate('/institution');
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validate field on change
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleUISettingsChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      uiSettings: {
        ...prev.uiSettings,
        [field]: value
      }
    }));
  };

  const handleEvaluationSystemChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      evaluationSystem: {
        ...prev.evaluationSystem,
        [field]: value
      }
    }));
  };

  const handleScheduleSettingsChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      scheduleSettings: {
        ...prev.scheduleSettings,
        [field]: value
      }
    }));

    // Validate time format for schedule settings
    if (field === 'mornings_hours' || field === 'afternoon_hours') {
      const error = validateTimeFormat(value, field);
      setErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Realizar todas las validaciones antes de enviar
    if (!validateForm()) {
      // Mostrar el primer error
      const firstError = Object.values(errors)[0];
      message.error(firstError || 'Por favor, corrija los errores en el formulario');
      return;
    }

    // Validar formulario
    const isValid = validateForm();
    if (!isValid) {
      message.error('Por favor corrige los errores en el formulario');
      return;
    }

    try {
      setLoading(true);

      // Crear el objeto con la estructura esperada por el backend
      const institutionData = {
        institutionName: formData.institutionName.trim(),
        codeName: formData.codeName.trim(),
        institutionLogo: formData.institutionLogo.trim(),
        modularCode: formData.modularCode.trim(),
        address: formData.address.trim(),
        contactEmail: formData.contactEmail.trim(),
        contactPhone: formData.contactPhone.trim(),
        status: formData.status,
        uiSettings: formData.uiSettings,
        evaluationSystem: formData.evaluationSystem,
        scheduleSettings: formData.scheduleSettings,
        headquarterIds: formData.headquarterIds
      };

      await InstitutionService.updateInstitution(id, institutionData);

      // Show success notification
      setShowNotification(true);
      
      // Navigate after a short delay to show the notification
      setTimeout(() => {
        navigate('/institution');
      }, 2000);
    } catch (error) {
      console.error('Error updating institution:', error);
      
      // Mostrar notificación de error personalizada
      setShowErrorNotification(true);
      
      // Ocultar la notificación después de 3 segundos
      setTimeout(() => {
        setShowErrorNotification(false);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/institution');
  };

  if (loadingData) {
    return (
      <div>
        <Header />
        <Sidebar
          id="menu-item2"
          id1="menu-items2"
          activeClassName="edit-institution"
        />
        <div className="page-wrapper">
          <div className="content">
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '500px' }}>
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-2">Cargando datos de la institución...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Custom success notification */}
      {showNotification && (
        <div 
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            backgroundColor: '#52c41a',
            color: 'white',
            padding: '15px 20px',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'fadeIn 0.3s ease'
          }}
        >
          <FeatherIcon icon="check-circle" size={20} />
          <div>
            <div style={{ fontWeight: 'bold' }}>¡Operación Exitosa!</div>
            <div>Institución actualizada correctamente</div>
          </div>
        </div>
      )}
      
      {/* Custom error notification */}
      {showErrorNotification && (
        <div 
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            backgroundColor: '#ff4d4f',
            color: 'white',
            padding: '15px 20px',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'fadeIn 0.3s ease'
          }}
        >
          <FeatherIcon icon="alert-circle" size={20} />
          <div>
            <div style={{ fontWeight: 'bold' }}>Error</div>
            <div>Por favor ingrese valores únicos. La información ya está siendo utilizada por otra institución.</div>
          </div>
        </div>
      )}
      
      <Header />
      <Sidebar
        id="menu-item2"
        id1="menu-items2"
        activeClassName="edit-institution"
      />
      <div className="page-wrapper">
        <div className="content">
          {/* Page Header */}
          <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/admin">Administración</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <i className="feather-chevron-right">
                      <FeatherIcon icon="chevron-right" />
                    </i>
                  </li>
                  <li className="breadcrumb-item">
                    <Link to="/institution">Instituciones</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <i className="feather-chevron-right">
                      <FeatherIcon icon="chevron-right" />
                    </i>
                  </li>
                  <li className="breadcrumb-item active">Editar Institución</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="row">
            <div className="col-sm-12">
              <div className="card">
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-12">
                        <div className="form-heading">
                          <h4>Detalles de la Institución</h4>
                        </div>
                      </div>

                      {/* Campos básicos */}
                      <div className="col-12 col-md-6 col-xl-6">
                        <div className="form-group local-forms">
                          <label>
                            Nombre de la Institución <span className="login-danger">*</span>
                          </label>
                          <input
                            className={`form-control ${errors.institutionName ? 'is-invalid' : ''}`}
                            type="text"
                            name="institutionName"
                            value={formData.institutionName}
                            onChange={handleInputChange}
                            placeholder="Ej: Institución Educativa Centro de Mujeres"
                            required
                          />
                          {errors.institutionName && (
                            <div className="invalid-feedback">{errors.institutionName}</div>
                          )}
                        </div>
                      </div>

                      <div className="col-12 col-md-6 col-xl-3">
                        <div className="form-group local-forms">
                          <label>
                            Código <span className="login-danger">*</span>
                          </label>
                          <input
                            className={`form-control ${errors.codeName ? 'is-invalid' : ''}`}
                            type="text"
                            name="codeName"
                            value={formData.codeName}
                            onChange={handleInputChange}
                            placeholder="Ej: IEE"
                            required
                          />
                          {errors.codeName && (
                            <div className="invalid-feedback">{errors.codeName}</div>
                          )}
                        </div>
                      </div>

                      <div className="col-12 col-md-6 col-xl-6">
                        <div className="form-group local-forms">
                          <label>
                            Logo de la Institución (URL)
                          </label>
                          <input
                            className="form-control"
                            type="url"
                            name="institutionLogo"
                            value={formData.institutionLogo}
                            onChange={handleInputChange}
                            placeholder="Ej: https://i.ibb.co/LDFH4V9Y/centrodemujeres.png"
                          />
                        </div>
                      </div>

                      <div className="col-12 col-md-6 col-xl-3">
                        <div className="form-group local-forms">
                          <label>
                            Código Modular
                          </label>
                          <input
                            className={`form-control ${errors.modularCode ? 'is-invalid' : ''}`}
                            type="text"
                            name="modularCode"
                            value={formData.modularCode}
                            onChange={handleInputChange}
                            placeholder="Ej: MOD789012"
                          />
                          {errors.modularCode && (
                            <div className="invalid-feedback">{errors.modularCode}</div>
                          )}
                        </div>
                      </div>

                      <div className="col-12 col-md-12 col-xl-12">
                        <div className="form-group local-forms">
                          <label>
                            Dirección
                          </label>
                          <input
                            className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Ej: Av. Principal 456, Lima"
                          />
                          {errors.address && (
                            <div className="invalid-feedback">{errors.address}</div>
                          )}
                        </div>
                      </div>

                      <div className="col-12 col-md-6 col-xl-6">
                        <div className="form-group local-forms">
                          <label>
                            Email de Contacto <span className="login-danger">*</span>
                          </label>
                          <input
                            className={`form-control ${errors.contactEmail ? 'is-invalid' : ''}`}
                            type="email"
                            name="contactEmail"
                            value={formData.contactEmail}
                            onChange={handleInputChange}
                            placeholder="contacto@ieejemplo.edu.pe"
                            required
                          />
                          {errors.contactEmail && (
                            <div className="invalid-feedback">{errors.contactEmail}</div>
                          )}
                        </div>
                      </div>

                      <div className="col-12 col-md-6 col-xl-6">
                        <div className="form-group local-forms">
                          <label>
                            Teléfono de Contacto <span className="login-danger">*</span>
                          </label>
                          <input
                            className={`form-control ${errors.contactPhone ? 'is-invalid' : ''}`}
                            type="tel"
                            name="contactPhone"
                            value={formData.contactPhone}
                            onChange={handleInputChange}
                            placeholder="987654321"
                            required
                          />
                          {errors.contactPhone && (
                            <div className="invalid-feedback">{errors.contactPhone}</div>
                          )}
                        </div>
                      </div>


                      {/* Configuraciones de Interfaz */}
                      <div className="col-12">
                        <div className="form-heading">
                          <h4>Configuraciones de Interfaz</h4>
                        </div>
                      </div>

                      <div className="col-12 col-md-6 col-xl-4">
                        <div className="form-group local-forms">
                          <label>Color Principal</label>
                          <input
                            className="form-control"
                            type="color"
                            value={formData.uiSettings.color_scheme}
                            onChange={(e) => handleUISettingsChange('color_scheme', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="col-12 col-md-6 col-xl-4">
                        <div className="form-group local-forms">
                          <label>Posición del Logo</label>
                          <select
                            className="form-control"
                            value={formData.uiSettings.logo_position}
                            onChange={(e) => handleUISettingsChange('logo_position', e.target.value)}
                          >
                            <option value="left">Izquierda</option>
                            <option value="center">Centro</option>
                            <option value="right">Derecha</option>
                          </select>
                        </div>
                      </div>

                      <div className="col-12 col-md-6 col-xl-4">
                        <div className="form-group">
                          <label className="form-check-label">
                            <input
                              type="checkbox"
                              className="form-check-input me-2"
                              checked={formData.uiSettings.show_student_photos}
                              onChange={(e) => handleUISettingsChange('show_student_photos', e.target.checked)}
                            />
                            Mostrar fotos de estudiantes
                          </label>
                        </div>
                      </div>

                      {/* Sistema de Evaluación */}
                      <div className="col-12">
                        <div className="form-heading">
                          <h4>Sistema de Evaluación</h4>
                        </div>
                      </div>

                      <div className="col-12 col-md-6 col-xl-4">
                        <div className="form-group local-forms">
                          <label>Escala de Calificación</label>
                          <select
                            className="form-control"
                            value={formData.evaluationSystem.scale}
                            onChange={(e) => handleEvaluationSystemChange('scale', e.target.value)}
                          >
                            <option value="vigesimal">Vigesimal (0-20)</option>
                            <option value="literal">Literal (A, B, C, D)</option>
                            <option value="percentage">Porcentaje (0-100%)</option>
                          </select>
                        </div>
                      </div>

                      <div className="col-12 col-md-6 col-xl-4">
                        <div className="form-group local-forms">
                          <label>Nota Mínima Aprobatoria</label>
                          <input
                            className="form-control"
                            type="number"
                            min="0"
                            max="20"
                            value={formData.evaluationSystem.min_passing_grade}
                            onChange={(e) => handleEvaluationSystemChange('min_passing_grade', parseInt(e.target.value))}
                          />
                        </div>
                      </div>

                      <div className="col-12 col-md-6 col-xl-4">
                        <div className="form-group">
                          <label className="form-check-label">
                            <input
                              type="checkbox"
                              className="form-check-input me-2"
                              checked={formData.evaluationSystem.show_decimals}
                              onChange={(e) => handleEvaluationSystemChange('show_decimals', e.target.checked)}
                            />
                            Mostrar decimales en calificaciones
                          </label>
                        </div>
                      </div>

                      {/* Configuraciones de Horario */}
                      <div className="col-12">
                        <div className="form-heading">
                          <h4>Configuraciones de Horario</h4>
                        </div>
                      </div>

                      <div className="col-12 col-md-6 col-xl-6">
                        <div className="form-group local-forms">
                          <label>Horario Turno Mañana</label>
                          <input
                            className={`form-control ${errors.mornings_hours ? 'is-invalid' : ''}`}
                            type="text"
                            value={formData.scheduleSettings.mornings_hours}
                            onChange={(e) => handleScheduleSettingsChange('mornings_hours', e.target.value)}
                            placeholder="7:30am - 12:30pm"
                          />
                          {errors.mornings_hours && (
                            <div className="invalid-feedback">{errors.mornings_hours}</div>
                          )}
                        </div>
                      </div>

                      <div className="col-12 col-md-6 col-xl-6">
                        <div className="form-group local-forms">
                          <label>Horario Turno Tarde</label>
                          <input
                            className={`form-control ${errors.afternoon_hours ? 'is-invalid' : ''}`}
                            type="text"
                            value={formData.scheduleSettings.afternoon_hours}
                            onChange={(e) => handleScheduleSettingsChange('afternoon_hours', e.target.value)}
                            placeholder="12:30pm - 06:00pm"
                          />
                          {errors.afternoon_hours && (
                            <div className="invalid-feedback">{errors.afternoon_hours}</div>
                          )}
                        </div>
                      </div>

                      {/* Días Especiales */}
                      <div className="col-12">
                        <div className="form-heading">
                          <h4>Días Especiales</h4>
                          <small className="text-muted">Configure días con horarios especiales o cierres</small>
                        </div>
                      </div>

                      <div className="col-12">
                        <div className="form-group">
                          <label>Días Especiales</label>
                          <div className="special-days-container">
                            {formData.scheduleSettings.special_schedule_days.map((day, index) => (
                              <div key={index} className="row mb-3 p-3 border rounded">
                                <div className="col-md-4">
                                  <label>Fecha</label>
                                  <input
                                    type="date"
                                    className="form-control"
                                    value={day.date || ''}
                                    onChange={(e) => {
                                      const updatedDays = [...formData.scheduleSettings.special_schedule_days];
                                      updatedDays[index] = { ...updatedDays[index], date: e.target.value };
                                      handleScheduleSettingsChange('special_schedule_days', updatedDays);
                                    }}
                                  />
                                </div>
                                <div className="col-md-6">
                                  <label>Descripción</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={day.description || ''}
                                    onChange={(e) => {
                                      const updatedDays = [...formData.scheduleSettings.special_schedule_days];
                                      updatedDays[index] = { ...updatedDays[index], description: e.target.value };
                                      handleScheduleSettingsChange('special_schedule_days', updatedDays);
                                    }}
                                    placeholder="Ej: Día festivo, Clausura, etc."
                                  />
                                </div>
                                <div className="col-md-2 d-flex align-items-end">
                                  <button
                                    type="button"
                                    className="btn btn-danger btn-sm"
                                    onClick={() => {
                                      const updatedDays = formData.scheduleSettings.special_schedule_days.filter((_, i) => i !== index);
                                      handleScheduleSettingsChange('special_schedule_days', updatedDays);
                                    }}
                                  >
                                    <i className="fa fa-trash"></i>
                                  </button>
                                </div>
                              </div>
                            ))}

                            <button
                              type="button"
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => {
                                const updatedDays = [...formData.scheduleSettings.special_schedule_days, { date: '', description: '' }];
                                handleScheduleSettingsChange('special_schedule_days', updatedDays);
                              }}
                            >
                              <i className="fa fa-plus me-2"></i>
                              Agregar Día Especial
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div className="col-12">
                        <div className="doctor-submit text-end">
                          <button
                            type="submit"
                            className="btn btn-primary submit-form me-2"
                            disabled={loading}
                          >
                            {loading ? 'Actualizando...' : 'Actualizar Institución'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary cancel-form"
                            onClick={handleCancel}
                            disabled={loading}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditInstitution;
