/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import Header from "../Header";
import Sidebar from "../Sidebar";
import { DatePicker } from "antd";
import FeatherIcon from "feather-icons-react/build/FeatherIcon";
import Select from "react-select";
import { Link, useParams, useNavigate } from 'react-router-dom';
import { managementService } from '../../services/ManagementService';

const AddPatients = () => {
  const { id } = useParams(); // Para detectar si estamos editando
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  // Estados para los campos del formulario
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    documentType: 'DNI',
    documentNumber: '',
    email: '',
    phone: '',
    password: '',
    userImage: '',
    role: '',
    status: 'A'
  });

  // Estados adicionales para comparación en edición
  const [originalData, setOriginalData] = useState({
    email: '',
    documentNumber: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Opciones para los selects
  const [documentTypeOptions] = useState([
    { value: 'DNI', label: 'DNI' },
    { value: 'CNE', label: 'CNE' }
  ]);

  const [roleOptions] = useState([
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'SUPERADMIN', label: 'Super Administrador' },
    { value: 'USUARIO', label: 'Usuario' },
    { value: 'ESCOLAR', label: 'Escolar' }
  ]);

  const [statusOptions] = useState([
    { value: 'A', label: 'Activo' },
    { value: 'I', label: 'Inactivo' }
  ]);

  // Cargar datos del usuario si estamos editando
  useEffect(() => {
    if (isEditing) {
      loadUserData();
    }
  }, [id]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const user = await managementService.getUserById(id);
      if (user) {
        const userData = {
          firstname: user.firstname || '',
          lastname: user.lastname || '',
          documentType: user.documentType || 'DNI',
          documentNumber: user.documentNumber || '',
          email: user.email || '',
          phone: user.phone || '',
          password: '', // No cargamos la contraseña por seguridad
          userImage: user.userImage || '',
          role: user.role || '',
          status: user.status || 'A'
        };
        
        setFormData(userData);
        
        // Guardar datos originales para comparación
        setOriginalData({
          email: user.email || '',
          documentNumber: user.documentNumber || ''
        });
        
        if (user.userImage) {
          setImagePreview(user.userImage);
        }
      } else {
        alert('Usuario no encontrado');
        navigate('/patientslist'); // CAMBIADO: navegación a patientslist
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      alert('Error al cargar los datos del usuario');
      navigate('/patientslist'); // CAMBIADO: navegación a patientslist
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo si existe
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Manejar cambios en los selects
  const handleSelectChange = (selectedOption, fieldName) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: selectedOption ? selectedOption.value : ''
    }));
    
    // Limpiar error del campo si existe
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }
  };

  // Convertir imagen a base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Manejar carga de archivo de imagen
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido');
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo es muy grande. Máximo 5MB permitido');
        return;
      }

      try {
        const base64 = await convertToBase64(file);
        setFormData(prev => ({
          ...prev,
          userImage: base64
        }));
        setImagePreview(base64);
      } catch (error) {
        console.error('Error converting image to base64:', error);
        alert('Error al procesar la imagen');
      }
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstname.trim()) {
      newErrors.firstname = 'El nombre es requerido';
    }

    if (!formData.lastname.trim()) {
      newErrors.lastname = 'El apellido es requerido';
    }

    if (!formData.documentNumber.trim()) {
      newErrors.documentNumber = 'El número de documento es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    }

    if (!isEditing && !formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.role) {
      newErrors.role = 'El rol es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Verificar duplicados solo si estamos creando o si cambiaron los datos
      if (!isEditing || formData.email !== originalData.email) {
        const emailExists = await managementService.emailExists(formData.email);
        if (emailExists) {
          setErrors({ email: 'Este email ya está registrado' });
          return;
        }
      }

      if (!isEditing || formData.documentNumber !== originalData.documentNumber) {
        const documentExists = await managementService.documentNumberExists(formData.documentNumber);
        if (documentExists) {
          setErrors({ documentNumber: 'Este número de documento ya está registrado' });
          return;
        }
      }

      let result;
      const userData = { ...formData };
      
      // Si estamos editando y no hay nueva contraseña, no enviarla
      if (isEditing && !userData.password) {
        delete userData.password;
      }

      if (isEditing) {
        result = await managementService.updateUser(id, userData);
      } else {
        result = await managementService.createUser(userData);
      }

      if (result) {
        alert(`Usuario ${isEditing ? 'actualizado' : 'creado'} exitosamente`);
        navigate('/patientslist'); // CAMBIADO: navegación a patientslist
      }
    } catch (error) {
      console.error('Error saving user:', error);
      alert(`Error al ${isEditing ? 'actualizar' : 'crear'} el usuario: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cancelación
  const handleCancel = () => {
    navigate('/patientslist'); // CAMBIADO: navegación a patientslist
  };

  // Obtener valor seleccionado para los selects
  const getSelectedValue = (options, value) => {
    return options.find(option => option.value === value) || null;
  };

  return (
    <div>
      <Header />
      <Sidebar
        id="menu-item2"
        id1="menu-items2"
        activeClassName="add-patient"
      />
      <>
        <div className="page-wrapper">
          <div className="content">
            {/* Page Header */}
            <div className="page-header">
              <div className="row">
                <div className="col-sm-12">
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/patientslist">Usuarios</Link> {/* CAMBIADO: enlace del breadcrumb también actualizado */}
                    </li>
                    <li className="breadcrumb-item">
                      <i className="feather-chevron-right">
                        <FeatherIcon icon="chevron-right" />
                      </i>
                    </li>
                    <li className="breadcrumb-item active">
                      {isEditing ? 'Editar Usuario' : 'Agregar Usuario'}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            {/* /Page Header */}
            <div className="row">
              <div className="col-sm-12">
                <div className="card">
                  <div className="card-body">
                    <form onSubmit={handleSubmit}>
                      <div className="row">
                        <div className="col-12">
                          <div className="form-heading">
                            <h4>{isEditing ? 'Editar Usuario' : 'Detalles del Usuario'}</h4>
                          </div>
                        </div>

                        {/* Nombre */}
                        <div className="col-12 col-md-6 col-xl-4">
                          <div className="form-group local-forms">
                            <label>
                              Nombre <span className="login-danger">*</span>
                            </label>
                            <input
                              className={`form-control ${errors.firstname ? 'is-invalid' : ''}`}
                              type="text"
                              name="firstname"
                              value={formData.firstname}
                              onChange={handleInputChange}
                              placeholder="Ingrese el nombre"
                            />
                            {errors.firstname && (
                              <div className="invalid-feedback">{errors.firstname}</div>
                            )}
                          </div>
                        </div>

                        {/* Apellido */}
                        <div className="col-12 col-md-6 col-xl-4">
                          <div className="form-group local-forms">
                            <label>
                              Apellido <span className="login-danger">*</span>
                            </label>
                            <input
                              className={`form-control ${errors.lastname ? 'is-invalid' : ''}`}
                              type="text"
                              name="lastname"
                              value={formData.lastname}
                              onChange={handleInputChange}
                              placeholder="Ingrese el apellido"
                            />
                            {errors.lastname && (
                              <div className="invalid-feedback">{errors.lastname}</div>
                            )}
                          </div>
                        </div>

                        {/* Tipo de Documento */}
                        <div className="col-12 col-md-6 col-xl-4">
                          <div className="form-group local-forms">
                            <label>
                              Tipo de Documento <span className="login-danger">*</span>
                            </label>
                            <Select
                              value={getSelectedValue(documentTypeOptions, formData.documentType)}
                              onChange={(selected) => handleSelectChange(selected, 'documentType')}
                              options={documentTypeOptions}
                              placeholder="Seleccione tipo de documento"
                              components={{
                                IndicatorSeparator: () => null
                              }}
                              styles={{
                                control: (baseStyles, state) => ({
                                  ...baseStyles,
                                  borderColor: state.isFocused ? 'none' : '2px solid rgba(46, 55, 164, 0.1)',
                                  boxShadow: state.isFocused ? '0 0 0 1px #2e37a4' : 'none',
                                  '&:hover': {
                                    borderColor: state.isFocused ? 'none' : '2px solid rgba(46, 55, 164, 0.1)',
                                  },
                                  borderRadius: '10px',
                                  fontSize: "14px",
                                  minHeight: "45px",
                                }),
                                dropdownIndicator: (base, state) => ({
                                  ...base,
                                  transform: state.selectProps.menuIsOpen ? 'rotate(-180deg)' : 'rotate(0)',
                                  transition: '250ms',
                                  width: '35px',
                                  height: '35px',
                                }),
                              }}
                            />
                            {errors.documentType && (
                              <div className="invalid-feedback d-block">{errors.documentType}</div>
                            )}
                          </div>
                        </div>

                        {/* Número de Documento */}
                        <div className="col-12 col-md-6 col-xl-4">
                          <div className="form-group local-forms">
                            <label>
                              Número de Documento <span className="login-danger">*</span>
                            </label>
                            <input
                              className={`form-control ${errors.documentNumber ? 'is-invalid' : ''}`}
                              type="text"
                              name="documentNumber"
                              value={formData.documentNumber}
                              onChange={handleInputChange}
                              placeholder="Ingrese el número de documento"
                            />
                            {errors.documentNumber && (
                              <div className="invalid-feedback">{errors.documentNumber}</div>
                            )}
                          </div>
                        </div>

                        {/* Email */}
                        <div className="col-12 col-md-6 col-xl-4">
                          <div className="form-group local-forms">
                            <label>
                              Email <span className="login-danger">*</span>
                            </label>
                            <input
                              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder="Ingrese el email"
                              autoComplete="username"
                            />
                            {errors.email && (
                              <div className="invalid-feedback">{errors.email}</div>
                            )}
                          </div>
                        </div>

                        {/* Teléfono */}
                        <div className="col-12 col-md-6 col-xl-4">
                          <div className="form-group local-forms">
                            <label>
                              Teléfono <span className="login-danger">*</span>
                            </label>
                            <input
                              className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                              type="text"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="Ingrese el teléfono"
                            />
                            {errors.phone && (
                              <div className="invalid-feedback">{errors.phone}</div>
                            )}
                          </div>
                        </div>

                        {/* Contraseña */}
                        <div className="col-12 col-md-6 col-xl-6">
                          <div className="form-group local-forms">
                            <label>
                              Contraseña {!isEditing && <span className="login-danger">*</span>}
                              {isEditing && <small className="text-muted"> (Dejar vacío para mantener la actual)</small>}
                            </label>
                            <input
                              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                              type="password"
                              name="password"
                              value={formData.password}
                              onChange={handleInputChange}
                              placeholder={isEditing ? "Nueva contraseña (opcional)" : "Ingrese la contraseña"}
                              autoComplete="new-password"
                            />
                            {errors.password && (
                              <div className="invalid-feedback">{errors.password}</div>
                            )}
                          </div>
                        </div>

                        {/* Rol */}
                        <div className="col-12 col-md-6 col-xl-6">
                          <div className="form-group local-forms">
                            <label>
                              Rol <span className="login-danger">*</span>
                            </label>
                            <Select
                              value={getSelectedValue(roleOptions, formData.role)}
                              onChange={(selected) => handleSelectChange(selected, 'role')}
                              options={roleOptions}
                              placeholder="Seleccione un rol"
                              components={{
                                IndicatorSeparator: () => null
                              }}
                              styles={{
                                control: (baseStyles, state) => ({
                                  ...baseStyles,
                                  borderColor: state.isFocused ? 'none' : '2px solid rgba(46, 55, 164, 0.1)',
                                  boxShadow: state.isFocused ? '0 0 0 1px #2e37a4' : 'none',
                                  '&:hover': {
                                    borderColor: state.isFocused ? 'none' : '2px solid rgba(46, 55, 164, 0.1)',
                                  },
                                  borderRadius: '10px',
                                  fontSize: "14px",
                                  minHeight: "45px",
                                }),
                                dropdownIndicator: (base, state) => ({
                                  ...base,
                                  transform: state.selectProps.menuIsOpen ? 'rotate(-180deg)' : 'rotate(0)',
                                  transition: '250ms',
                                  width: '35px',
                                  height: '35px',
                                }),
                              }}
                            />
                            {errors.role && (
                              <div className="invalid-feedback d-block">{errors.role}</div>
                            )}
                          </div>
                        </div>

                        {/* Imagen de Usuario */}
                        <div className="col-12 col-md-6 col-xl-6">
                          <div className="form-group local-top-form">
                            <label className="local-top">
                              Imagen de Usuario
                            </label>
                            <div className="settings-btn upload-files-avator">
                              <input
                                type="file"
                                accept="image/*"
                                name="userImage"
                                id="file"
                                onChange={handleFileChange}
                                className="hide-input"
                              />
                              <label htmlFor="file" className="upload">
                                Elegir Archivo
                              </label>
                            </div>
                            {imagePreview && (
                              <div className="mt-2">
                                <img 
                                  src={imagePreview} 
                                  alt="Vista previa" 
                                  style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '10px' }}
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Estado */}
                        <div className="col-12 col-md-6 col-xl-6">
                          <div className="form-group select-gender">
                            <label className="gen-label">
                              Estado <span className="login-danger">*</span>
                            </label>
                            <div className="form-check-inline">
                              <label className="form-check-label">
                                <input
                                  type="radio"
                                  name="status"
                                  value="A"
                                  className="form-check-input"
                                  checked={formData.status === 'A'}
                                  onChange={handleInputChange}
                                />
                                Activo
                              </label>
                            </div>
                            <div className="form-check-inline">
                              <label className="form-check-label">
                                <input
                                  type="radio"
                                  name="status"
                                  value="I"
                                  className="form-check-input"
                                  checked={formData.status === 'I'}
                                  onChange={handleInputChange}
                                />
                                Inactivo
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="col-12">
                          <div className="doctor-submit text-end">
                            <button
                              type="submit"
                              className="btn btn-primary submit-form me-2"
                              disabled={loading}
                            >
                              {loading ? 'Procesando...' : (isEditing ? 'Actualizar' : 'Crear')}
                            </button>
                            <button
                              type="button"
                              className="btn btn-primary cancel-form"
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
      </>
    </div>
  );
};

export default AddPatients;