/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import { Link } from 'react-router-dom';
import InstitutionService from '../../../services/institutionService';
import FeatherIcon from "feather-icons-react/build/FeatherIcon";

const ViewInstitution = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loadingData, setLoadingData] = useState(true);
  const [institution, setInstitution] = useState({
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

  // Cargar datos de la institución al montar el componente
  useEffect(() => {
    if (id) {
      loadInstitutionData();
    }
  }, [id]);

  const loadInstitutionData = async () => {
    try {
      setLoadingData(true);
      const institutionData = await InstitutionService.getInstitutionById(id);
      
      setInstitution({
        institutionName: institutionData.institutionName || '',
        codeName: institutionData.codeName || '',
        institutionLogo: institutionData.institutionLogo || '',
        modularCode: institutionData.modularCode || '',
        address: institutionData.address || '',
        contactEmail: institutionData.contactEmail || '',
        contactPhone: institutionData.contactPhone || '',
        status: institutionData.status || 'A',
        uiSettings: institutionData.uiSettings || {
          color_scheme: '#4A86E8',
          logo_position: 'left',
          show_student_photos: true
        },
        evaluationSystem: institutionData.evaluationSystem || {
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
        scheduleSettings: institutionData.scheduleSettings || {
          mornings_hours: '7:30am - 12:30pm',
          afternoon_hours: '12:30pm - 06:00pm',
          special_schedule_days: []
        },
        headquarterIds: institutionData.headquarterIds || []
      });
    } catch (error) {
      console.error('Error loading institution data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleBack = () => {
    navigate('/institution');
  };

  const handleEdit = () => {
    navigate(`/edit-institution/${id}`);
  };

  if (loadingData) {
    return (
      <div>
        <Header />
        <Sidebar
          id="menu-item2"
          id1="menu-items2"
          activeClassName="view-institution"
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

  // Función para renderizar el valor del estado
  const renderStatusBadge = (status) => {
    return (
      <span className={`badge ${status === 'A' ? 'bg-success' : 'bg-danger'}`}>
        {status === 'A' ? 'Activo' : 'Inactivo'}
      </span>
    );
  };

  // Función para renderizar los valores de la escala de evaluación
  const renderEvaluationScale = (scale) => {
    switch (scale) {
      case 'vigesimal':
        return 'Vigesimal (0-20)';
      case 'decimal':
        return 'Decimal (0-10)';
      case 'letters':
        return 'Letras (A, B, C, D, F)';
      default:
        return scale;
    }
  };

  return (
    <div>
      <Header />
      <Sidebar
        id="menu-item2"
        id1="menu-items2"
        activeClassName="view-institution"
      />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title">Detalles de la Institución</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/institution">Instituciones</Link>
                  </li>
                  <li className="breadcrumb-item active">Ver Institución</li>
                </ul>
              </div>
              <div className="col-auto">
                <button className="btn btn-secondary me-2" onClick={handleBack}>
                  <i className="fas fa-arrow-left"></i> Volver
                </button>
                <button className="btn btn-primary" onClick={handleEdit}>
                  <i className="fas fa-edit"></i> Editar
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="row">
                <div className="col-md-12">
                  <h4 className="mb-4">Información General</h4>
                </div>
                <div className="col-md-6">
                  <div className="form-group mb-3">
                    <label className="form-label fw-bold">Nombre de la Institución</label>
                    <p>{institution.institutionName}</p>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group mb-3">
                    <label className="form-label fw-bold">Código</label>
                    <p>{institution.codeName}</p>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group mb-3">
                    <label className="form-label fw-bold">Estado</label>
                    <p>{renderStatusBadge(institution.status)}</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group mb-3">
                    <label className="form-label fw-bold">Logo URL</label>
                    <p>{institution.institutionLogo || 'No disponible'}</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group mb-3">
                    <label className="form-label fw-bold">Código Modular</label>
                    <p>{institution.modularCode}</p>
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="form-group mb-3">
                    <label className="form-label fw-bold">Dirección</label>
                    <p>{institution.address}</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group mb-3">
                    <label className="form-label fw-bold">Email de Contacto</label>
                    <p>
                      <a href={`mailto:${institution.contactEmail}`}>
                        {institution.contactEmail}
                      </a>
                    </p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group mb-3">
                    <label className="form-label fw-bold">Teléfono de Contacto</label>
                    <p>
                      <a href={`tel:${institution.contactPhone}`}>
                        {institution.contactPhone}
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <hr className="my-4" />

              <div className="row">
                <div className="col-md-12">
                  <h4 className="mb-4">Configuración de Interfaz</h4>
                </div>
                <div className="col-md-4">
                  <div className="form-group mb-3">
                    <label className="form-label fw-bold">Esquema de Color</label>
                    <div style={{ 
                      width: '30px', 
                      height: '30px', 
                      borderRadius: '50%', 
                      background: institution.uiSettings?.color_scheme || '#4A86E8',
                      border: '1px solid #ddd' 
                    }}></div>
                    <small className="text-muted">{institution.uiSettings?.color_scheme || '#4A86E8'}</small>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group mb-3">
                    <label className="form-label fw-bold">Posición del Logo</label>
                    <p>{institution.uiSettings?.logo_position || 'left'}</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group mb-3">
                    <label className="form-label fw-bold">Mostrar Fotos de Estudiantes</label>
                    <p>
                      {institution.uiSettings?.show_student_photos ? 'Sí' : 'No'}
                    </p>
                  </div>
                </div>
              </div>

              <hr className="my-4" />

              <div className="row">
                <div className="col-md-12">
                  <h4 className="mb-4">Sistema de Evaluación</h4>
                </div>
                <div className="col-md-4">
                  <div className="form-group mb-3">
                    <label className="form-label fw-bold">Escala de Evaluación</label>
                    <p>{renderEvaluationScale(institution.evaluationSystem?.scale)}</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group mb-3">
                    <label className="form-label fw-bold">Nota Mínima Aprobatoria</label>
                    <p>{institution.evaluationSystem?.min_passing_grade}</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group mb-3">
                    <label className="form-label fw-bold">Mostrar Decimales</label>
                    <p>
                      {institution.evaluationSystem?.show_decimals ? 'Sí' : 'No'}
                    </p>
                  </div>
                </div>
              </div>

              <hr className="my-4" />

              <div className="row">
                <div className="col-md-12">
                  <h4 className="mb-4">Horarios</h4>
                </div>
                <div className="col-md-6">
                  <div className="form-group mb-3">
                    <label className="form-label fw-bold">Horario de Mañana</label>
                    <p>{institution.scheduleSettings?.mornings_hours || '7:30am - 12:30pm'}</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group mb-3">
                    <label className="form-label fw-bold">Horario de Tarde</label>
                    <p>{institution.scheduleSettings?.afternoon_hours || '12:30pm - 6:00pm'}</p>
                  </div>
                </div>
              </div>

              <hr className="my-4" />

              <div className="row">
                <div className="col-md-12">
                  <h4 className="mb-4">Acciones</h4>
                  <div className="d-flex gap-2">
                    <Link to={`/institution-directors/${id}`} className="btn btn-info">
                      <i className="fas fa-users me-2"></i> Directores
                    </Link>
                    <Link to={`/institution-headquarters/${id}`} className="btn btn-info">
                      <i className="fas fa-building me-2"></i> Sedes
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewInstitution;
