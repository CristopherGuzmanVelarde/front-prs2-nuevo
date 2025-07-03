import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import { userService } from '../../services/userService'; 
import {
    validateName,
    cleanSpaces,
    capitalize,
    validateEmail,
    validatePhone,
    validateUserName,
    validateDocumentType,
    validateDocumentNumber,
    validateInstitutionId,
    validatePassword,
    cleanInternalSpaces
} from '../../utils/validations';

const AVAILABLE_PERMISSIONS = [
    'VER', 'CREAR', 'EDITAR', 'ELIMINAR', 'RESTAURAR'
];

const initialUserState = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    userName: '',
    documentType: 'DNI',
    documentNumber: '',
    password: '',
    role: 'PROFESOR',
    status: 'ACTIVE',
    institutionId: '',
    permissions: [],
};


const UserForm = ({ user, onSave, onCancel }) => {
    const isEditMode = !!user;

    const getInitialState = () => {
        if (isEditMode) {
            // NOTE: In a production environment, passwords should not be sent from the backend.
            // This is modified to show the current password as requested.
            return [{
                ...initialUserState,
                ...user,
            }];
        }
        return [initialUserState];
    };

    const [users, setUsers] = useState(getInitialState);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([{}]);
    const [touched, setTouched] = useState([{}]);
    const [defaultInstitutionId, setDefaultInstitutionId] = useState('');
    const [loadingInstitutions, setLoadingInstitutions] = useState(true);
    const [passwordVisibility, setPasswordVisibility] = useState({});

    useEffect(() => {
        const fetchInstitution = async () => {
            setLoadingInstitutions(true);
            try {
                const response = await axios.get('https://ms.institution.machashop.top/api/v1/institutions');
                const institutionsData = response.data || [];
                if (institutionsData.length > 0) {
                    const defaultId = institutionsData[0].id;
                    setDefaultInstitutionId(defaultId);
                    
                    if (!isEditMode) {
                        setUsers(currentUsers =>
                            currentUsers.map(u => ({
                                ...u,
                                institutionId: u.institutionId || defaultId
                            }))
                        );
                    }
                } else {
                     console.error('No se encontraron instituciones. El ID de institución no se pudo establecer por defecto.');
                }
            } catch (error) {
                console.error('Error fetching institutions:', error);
            } finally {
                setLoadingInstitutions(false);
            }
        };
        fetchInstitution();
    }, [isEditMode]);

    const validateField = (index, name, value) => {
        const currentUser = users[index];
        let error = '';
        switch(name) {
            case 'firstName':
                error = validateName(value, 'Nombre');
                break;
            case 'lastName':
                error = validateName(value, 'Apellido');
                break;
            case 'email':
                error = validateEmail(value, 'Email');
                break;
            case 'phone':
                error = validatePhone(value, 'Teléfono', true);
                break;
            case 'userName':
                error = validateUserName(value, 'Usuario', true);
                break;
            case 'documentNumber':
                error = validateDocumentNumber(value, currentUser.documentType, 'Número de Documento', true);
                break;
            case 'documentType':
                error = validateDocumentType(value, 'Tipo de Documento', true);
                break;
            case 'password':
                // Password is not required in edit mode, but if present, it must be valid.
                error = validatePassword(value, 'Contraseña', !isEditMode);
                break;
            default:
                break;
        }
        setErrors(prev => {
            const newErrors = [...prev];
            if (!newErrors[index]) newErrors[index] = {};
            newErrors[index][name] = error;
            return newErrors;
        });
    };
    
    const handleBlur = (index, e) => {
        const { name, value } = e.target;
        setTouched(prev => {
            const newTouched = [...prev];
            if (!newTouched[index]) newTouched[index] = {};
            newTouched[index][name] = true;
            return newTouched;
        });
        validateField(index, name, value);
    };

    const handleUserChange = (index, e) => {
        const { name, value } = e.target;
        let processedValue = value;

        if (name === 'firstName' || name === 'lastName') {
            processedValue = capitalize(cleanInternalSpaces(value));
        } else if (name === 'email') {
             processedValue = cleanSpaces(value);
        } else if (name === 'documentType') {
             processedValue = value.toUpperCase();
        }

        const updatedUsers = [...users];
        updatedUsers[index] = { ...updatedUsers[index], [name]: processedValue };
        setUsers(updatedUsers);

        if (touched[index]?.[name]) {
            validateField(index, name, processedValue);
        }
    };

    const togglePasswordVisibility = (index) => {
        setPasswordVisibility(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const handlePermissionsChange = (index, selectedOptions) => {
        const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
        const updatedUsers = [...users];
        updatedUsers[index].permissions = selectedValues;
        setUsers(updatedUsers);
        
        setErrors(prev => {
            const newErrors = [...prev];
            if (!newErrors[index]) newErrors[index] = {};
            newErrors[index].permissions = selectedValues.length > 0 ? '' : 'Se debe seleccionar al menos un permiso.';
            return newErrors;
        });
    };

    const addUserForm = () => {
        setUsers([...users, { ...initialUserState, institutionId: defaultInstitutionId }]);
        setErrors([...errors, {}]);
        setTouched([...touched, {}]);
    };

    const removeUserForm = (index) => {
        if (users.length > 1) {
            setUsers(users.filter((_, i) => i !== index));
            setErrors(errors.filter((_, i) => i !== index));
            setTouched(touched.filter((_, i) => i !== index));
        }
    };
    
    const getValidationClass = (index, fieldName) => {
        if (!touched[index]?.[fieldName]) {
            return '';
        }
        return errors[index]?.[fieldName] ? 'is-invalid' : 'is-valid';
    };

    const validateAllForms = () => {
        let allValid = true;
        const newErrors = users.map(currentUser => {
            const userErrors = {
                firstName: validateName(currentUser.firstName, 'Nombre'),
                lastName: validateName(currentUser.lastName, 'Apellido'),
                email: validateEmail(currentUser.email, 'Email'),
                phone: validatePhone(currentUser.phone, 'Teléfono', true),
                userName: validateUserName(currentUser.userName, 'Usuario', true),
                documentType: validateDocumentType(currentUser.documentType, 'Tipo de Documento', true),
                documentNumber: validateDocumentNumber(currentUser.documentNumber, currentUser.documentType, 'Número de Documento', true),
                institutionId: validateInstitutionId(currentUser.institutionId, 'ID Institución'),
                password: validatePassword(currentUser.password, 'Contraseña', !isEditMode),
                permissions: currentUser.permissions.length === 0 ? 'Se debe seleccionar al menos un permiso.' : ''
            };
            if (Object.values(userErrors).some(e => e)) {
                allValid = false;
            }
            return userErrors;
        });
        setErrors(newErrors);
        return allValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const allTouched = users.map(() => ({
            firstName: true, lastName: true, email: true, phone: true,
            userName: true, documentType: true, documentNumber: true,
            password: true, permissions: true, institutionId: true
        }));
        setTouched(allTouched);

        if (!validateAllForms()) {
            console.error('Por favor corrige los errores del formulario.');
            return;
        }

        setLoading(true);
        try {
            if (isEditMode) {
                const userId = user.id || user._id;
                if (!userId) {
                    console.error('Error: No se pudo encontrar el ID del usuario para actualizar.');
                    setLoading(false);
                    return;
                }

                const userData = { ...users[0] };
                
                // Do not send password if it's the same as the initial one or if it's empty,
                // unless it's a new user. The backend handles empty password on update.
                if (isEditMode && (!userData.password || userData.password === user.password)) {
                     // If the user didn't change the password, don't send it.
                     // The backend will keep the old one.
                }

                if (!userData.password || userData.password.trim() === '') {
                    delete userData.password;
                }
                
                delete userData.id;
                delete userData._id;

                const savedData = await userService.updateUser(userId, userData);
                if (onSave) onSave(savedData);
            } else {
                let savedData;
                if (users.length > 1) {
                    savedData = await userService.createUsersBatch(users);
                } else {
                    savedData = await userService.createUser(users[0]);
                }
                if (onSave) onSave(savedData);
            }
        } catch (error) {
            console.error('Error saving user(s):', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {users.map((currentUser, index) => (
                <div className="card mb-4" key={index}>
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h3>{isEditMode ? 'Editar Usuario' : `Nuevo Usuario ${index + 1}`}</h3>
                        {!isEditMode && users.length > 1 && (
                            <button type="button" className="btn btn-danger btn-sm" onClick={() => removeUserForm(index)}>
                                Quitar
                            </button>
                        )}
                    </div>
                    <div className="card-body">
                         <h4 className="mt-4"><i className="fa fa-user"></i> Información Personal</h4>
                        <div className="row">
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label htmlFor={`firstName-${index}`}>Nombre<span className="text-danger">*</span></label>
                                    <input type="text" className={`form-control ${getValidationClass(index, 'firstName')}`} id={`firstName-${index}`} name="firstName" value={currentUser.firstName} onChange={(e) => handleUserChange(index, e)} onBlur={(e) => handleBlur(index, e)} required />
                                    {errors[index]?.firstName && <div className="invalid-feedback">{errors[index].firstName}</div>}
                                </div>
                            </div>
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label htmlFor={`lastName-${index}`}>Apellido<span className="text-danger">*</span></label>
                                    <input type="text" className={`form-control ${getValidationClass(index, 'lastName')}`} id={`lastName-${index}`} name="lastName" value={currentUser.lastName} onChange={(e) => handleUserChange(index, e)} onBlur={(e) => handleBlur(index, e)} required />
                                    {errors[index]?.lastName && <div className="invalid-feedback">{errors[index].lastName}</div>}
                                </div>
                            </div>
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label htmlFor={`email-${index}`}>Email<span className="text-danger">*</span></label>
                                    <div className="input-group">
                                        <span className="input-group-text"><i className="fa fa-envelope"></i></span>
                                        <input type="email" className={`form-control ${getValidationClass(index, 'email')}`} id={`email-${index}`} name="email" value={currentUser.email} onChange={(e) => handleUserChange(index, e)} onBlur={(e) => handleBlur(index, e)} required />
                                        {errors[index]?.email && <div className="invalid-feedback">{errors[index].email}</div>}
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label htmlFor={`phone-${index}`}>Teléfono<span className="text-danger">*</span></label>
                                    <div className="input-group">
                                        <span className="input-group-text"><i className="fa fa-phone"></i></span>
                                        <input type="text" className={`form-control ${getValidationClass(index, 'phone')}`} id={`phone-${index}`} name="phone" value={currentUser.phone} onChange={(e) => handleUserChange(index, e)} onBlur={(e) => handleBlur(index, e)} required />
                                        {errors[index]?.phone && <div className="invalid-feedback">{errors[index].phone}</div>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <h4 className="mt-4"><i className="fa fa-building"></i> Información Institucional</h4>
                        <div className="row">
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label htmlFor={`userName-${index}`}>Usuario<span className="text-danger">*</span></label>
                                    <input type="text" className={`form-control ${getValidationClass(index, 'userName')}`} id={`userName-${index}`} name="userName" value={currentUser.userName} onChange={(e) => handleUserChange(index, e)} onBlur={(e) => handleBlur(index, e)} required />
                                    {errors[index]?.userName && <div className="invalid-feedback">{errors[index].userName}</div>}
                                </div>
                            </div>
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label htmlFor={`password-${index}`}>Contraseña<span className="text-danger">{!isEditMode ? '*' : ''}</span></label>
                                    <div className="input-group">
                                        <input 
                                            type={passwordVisibility[index] ? 'text' : 'password'} 
                                            className={`form-control ${getValidationClass(index, 'password')}`} 
                                            id={`password-${index}`} 
                                            name="password" 
                                            value={currentUser.password} 
                                            onChange={(e) => handleUserChange(index, e)} 
                                            onBlur={(e) => handleBlur(index, e)}
                                            required={!isEditMode} 
                                            placeholder={isEditMode ? 'Dejar en blanco para no cambiar' : ''} 
                                        />
                                        <button 
                                            className="btn btn-outline-secondary" 
                                            type="button" 
                                            onClick={() => togglePasswordVisibility(index)}
                                        >
                                            <i className={`fa ${passwordVisibility[index] ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                        </button>
                                        {errors[index]?.password && <div className="invalid-feedback">{errors[index].password}</div>}
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label htmlFor={`documentType-${index}`}>Tipo de Documento<span className="text-danger">*</span></label>
                                    <select className={`form-control ${getValidationClass(index, 'documentType')}`} id={`documentType-${index}`} name="documentType" value={currentUser.documentType} onChange={(e) => handleUserChange(index, e)} onBlur={(e) => handleBlur(index, e)} required>
                                        <option value="">Seleccionar</option>
                                        <option value="DNI">DNI</option>
                                        <option value="CNE">CNE</option>
                                        <option value="PASSPORT">Pasaporte</option>
                                    </select>
                                    {errors[index]?.documentType && <div className="invalid-feedback">{errors[index].documentType}</div>}
                                </div>
                            </div>
                            <div className="col-sm-6">
                                <div className="form-group">
                                    <label htmlFor={`documentNumber-${index}`}>Número de Documento<span className="text-danger">*</span></label>
                                    <input type="text" className={`form-control ${getValidationClass(index, 'documentNumber')}`} id={`documentNumber-${index}`} name="documentNumber" value={currentUser.documentNumber} onChange={(e) => handleUserChange(index, e)} onBlur={(e) => handleBlur(index, e)} required />
                                    {errors[index]?.documentNumber && <div className="invalid-feedback">{errors[index].documentNumber}</div>}
                                </div>
                            </div>
                             <div className="col-sm-6">
                                 <div className="form-group">
                                    <label htmlFor={`role-${index}`}>Rol<span className="text-danger">*</span></label>
                                    <select className="form-control" id={`role-${index}`} name="role" value={currentUser.role} onChange={(e) => handleUserChange(index, e)} required>
                                         <option value="DIRECTOR">Director</option>
                                         <option value="PROFESOR">Profesor</option>
                                         <option value="ADMIN">Administrativo</option>
                                         <option value="AUXILIAR">Auxiliar</option>
                                    </select>
                                 </div>
                            </div>
                            <div className="col-sm-6">
                                 <div className="form-group">
                                    <label htmlFor={`status-${index}`}>Estado<span className="text-danger">*</span></label>
                                    <select className="form-control" id={`status-${index}`} name="status" value={currentUser.status} onChange={(e) => handleUserChange(index, e)} required>
                                         <option value="ACTIVE">Activo</option>
                                         <option value="INACTIVE">Inactivo</option>
                                    </select>
                                 </div>
                            </div>
                             <div className="col-sm-6">
                                <div className="form-group">
                                    <label htmlFor={`institutionId-${index}`}>ID Institución (Default)</label>
                                    <input 
                                        type="text" 
                                        className={`form-control ${getValidationClass(index, 'institutionId')}`}
                                        id={`institutionId-${index}`} 
                                        name="institutionId" 
                                        value={loadingInstitutions ? 'Cargando...' : currentUser.institutionId} 
                                        readOnly 
                                        disabled 
                                    />
                                </div>
                            </div>
                        </div>

                        <h4 className="mt-4"><i className="fa fa-lock"></i> Permisos</h4>
                        <div className="row">
                            <div className="col-sm-12">
                                <div className="form-group">
                                    <label htmlFor={`permissions-${index}`}>Seleccionar Permisos<span className="text-danger">*</span></label>
                                    <div className={getValidationClass(index, 'permissions') === 'is-invalid' ? 'is-invalid' : ''}>
                                      <Select
                                          isMulti
                                          name="permissions"
                                          options={AVAILABLE_PERMISSIONS.map(p => ({ value: p, label: p }))}
                                          value={currentUser.permissions.map(p => ({ value: p, label: p }))}
                                          onChange={(selected) => handlePermissionsChange(index, selected)}
                                          onBlur={() => handleBlur(index, { target: { name: 'permissions', value: currentUser.permissions } })}
                                          classNamePrefix="react-select"
                                      />
                                    </div>
                                    {errors[index]?.permissions && <div className="invalid-feedback" style={{ display: 'block' }}>{errors[index].permissions}</div>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            
            <div className="mt-4 d-flex justify-content-between">
                {!isEditMode && (
                    <button type="button" className="btn btn-secondary" onClick={addUserForm} disabled={loading}>
                        Añadir Otro Usuario
                    </button>
                )}
                
                <div className="ms-auto">
                    <button type="button" className="btn btn-light m-r-5" onClick={onCancel}>Cancelar</button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Guardando...' : (isEditMode ? 'Actualizar' : `Guardar ${users.length > 1 ? 'Usuarios' : 'Usuario'}`)}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default UserForm;