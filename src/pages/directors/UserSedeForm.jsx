
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { userService } from '../../services/userService';
import { userSedeService } from '../../services/userSedeService';
import { 
    validateUserId, 
    validateSedeId,
    validateAssignedAt,
    validateActiveUntil,
    validateOptionalTextField
} from '../../utils/userSedeValidations';

const UserSedeForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [userId, setUserId] = useState('');
    const [userRole, setUserRole] = useState('');
    const [assignmentReason, setAssignmentReason] = useState('');
    const [observations, setObservations] = useState('');
    const [status, setStatus] = useState('Activo');
    const [details, setDetails] = useState([]);
    
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [headquarters, setHeadquarters] = useState([]);

    const [isLoading, setIsLoading] = useState(false);
    const [isUsersLoading, setIsUsersLoading] = useState(true);
    const [isHeadquartersLoading, setIsHeadquartersLoading] = useState(true);
    const [formError, setFormError] = useState(null);

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [detailsErrors, setDetailsErrors] = useState([]);
    const [detailsTouched, setDetailsTouched] = useState([]);

    const initialDetailState = {
        key: `key-${Date.now()}`,
        sedeId: '',
        assignedAt: new Date().toISOString().split('T')[0],
        sortOrder: '',
        schedule: '',
        activeUntil: '',
        responsibilities: '',
    };

    useEffect(() => {
        const fetchUsers = async () => {
            setIsUsersLoading(true);
            try {
                const usersData = await userService.getAllUsers(undefined, 'ACTIVE');
                setUsers(Array.isArray(usersData) ? usersData : []);
            } catch (err) {
                console.error('Error al cargar usuarios:', err);
                setFormError('Error al cargar la lista de usuarios activos.');
            } finally {
                setIsUsersLoading(false);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        const fetchHeadquarters = async () => {
            setIsHeadquartersLoading(true);
            try {
                const response = await axios.get('https://lab.vallegrande.edu.pe/school/ms-institution/api/v1/headquarters');
                setHeadquarters(response.data || []);
            } catch (err) {
                console.error('Error al cargar las sedes:', err);
                setFormError('No se pudieron cargar las sedes desde el microservicio.');
            } finally {
                setIsHeadquartersLoading(false);
            }
        };
        fetchHeadquarters();
    }, []);

    useEffect(() => {
        const fetchInitialData = async () => {
            if (isEditMode) {
                setIsLoading(true);
                try {
                    const userSedeData = await userSedeService.getUserSedeById(id);
                    setUserId(userSedeData.userId);
                    setAssignmentReason(userSedeData.assignmentReason || '');
                    setObservations(userSedeData.observations || '');
                    setStatus(userSedeData.status || 'Activo');
                    const formattedDetails = userSedeData.details.map((d, index) => ({
                        key: d.id || `key-${index}-${Date.now()}`,
                        sedeId: d.sedeId,
                        assignedAt: d.assignedAt ? new Date(d.assignedAt).toISOString().split('T')[0] : '',
                        sortOrder: d.sortOrder ?? '',
                        schedule: d.schedule ?? '',
                        activeUntil: d.activeUntil ? new Date(d.activeUntil).toISOString().split('T')[0] : '',
                        responsibilities: Array.isArray(d.responsibilities) ? d.responsibilities.join(', ') : '',
                    }));
                    setDetails(formattedDetails);
                    setDetailsErrors(Array(formattedDetails.length).fill({}));
                    setDetailsTouched(Array(formattedDetails.length).fill({}));

                    const userData = await userService.getUserById(userSedeData.userId);
                    setSelectedUser(userData);
                    const role = await userService.getActiveRoleByUserId(userSedeData.userId);
                    setUserRole(role || 'No definido');
                } catch (err) {
                     console.error("Error fetching data for edit", err);
                     setFormError("No se pudieron cargar los datos de la asignación para editar.");
                } finally {
                    setIsLoading(false);
                }
            } else {
                setDetails([{ ...initialDetailState, key: `key-0-${Date.now()}` }]);
                setDetailsErrors([{}]);
                setDetailsTouched([{}]);
            }
        };
        fetchInitialData();
    }, [id, isEditMode]);
    
    const validateField = (name, value) => {
        let error = '';
        if (name === 'userId') error = validateUserId(value);
        else if (name === 'assignmentReason') error = validateOptionalTextField(value, 'Motivo de Asignación', 255);
        else if (name === 'observations') error = validateOptionalTextField(value, 'Observaciones', 500);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const validateDetailField = (index, name, value) => {
        const detail = details[index];
        let error = '';
        if (name === 'sedeId') error = validateSedeId(value);
        else if (name === 'assignedAt') error = validateAssignedAt(value);
        else if (name === 'activeUntil') error = validateActiveUntil(value, detail.assignedAt);
        else if (name === 'schedule') error = validateOptionalTextField(value, 'Jornada', 100);
        else if (name === 'responsibilities') error = validateOptionalTextField(value, 'Responsabilidades', 255);
        
        const newDetailsErrors = [...detailsErrors];
        if (!newDetailsErrors[index]) newDetailsErrors[index] = {};
        newDetailsErrors[index][name] = error;
        setDetailsErrors(newDetailsErrors);
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        validateField(name, value);
    };

    const handleDetailBlur = (index, e) => {
        const { name, value } = e.target;
        const newDetailsTouched = [...detailsTouched];
        if (!newDetailsTouched[index]) newDetailsTouched[index] = {};
        newDetailsTouched[index][name] = true;
        setDetailsTouched(newDetailsTouched);
        validateDetailField(index, name, value);
    };

    const getValidationClass = (fieldName) => {
        if (!touched[fieldName]) return '';
        return errors[fieldName] ? 'is-invalid' : 'is-valid';
    };

    const getDetailValidationClass = (index, fieldName) => {
        if (!detailsTouched[index]?.[fieldName]) return '';
        return detailsErrors[index]?.[fieldName] ? 'is-invalid' : 'is-valid';
    };

    const handleUserChange = async (selectedUserId) => {
        setUserId(selectedUserId);
        if (touched.userId) validateField('userId', selectedUserId);

        if (!selectedUserId) {
            setUserRole('');
            setSelectedUser(null);
            return;
        }

        const userObject = users.find(u => (u.id || u._id) === selectedUserId);
        setSelectedUser(userObject);

        setUserRole('Cargando rol...');
        try {
            const role = await userService.getActiveRoleByUserId(selectedUserId);
            setUserRole(role || 'No definido');
        } catch (err) {
            setUserRole('Error al obtener rol');
            console.error('Error al obtener el rol del usuario:', err);
            setFormError('Error al obtener el rol del usuario.');
        }
    };

    const handleDetailChange = (key, field, value) => {
        const detailIndex = details.findIndex(d => d.key === key);
        const updatedDetails = details.map(d => (d.key === key ? { ...d, [field]: value } : d));
        setDetails(updatedDetails);

        if (detailsTouched[detailIndex]?.[field]) {
            validateDetailField(detailIndex, field, value);
        }
    };

    const addDetailRow = () => {
        setDetails([...details, { ...initialDetailState, key: `key-${details.length}-${Date.now()}` }]);
        setDetailsErrors([...detailsErrors, {}]);
        setDetailsTouched([...detailsTouched, {}]);
    };

    const removeDetailRow = (key) => {
        const indexToRemove = details.findIndex(d => d.key === key);
        if (details.length > 1) {
            setDetails(details.filter(d => d.key !== key));
            setDetailsErrors(detailsErrors.filter((_, i) => i !== indexToRemove));
            setDetailsTouched(detailsTouched.filter((_, i) => i !== indexToRemove));
        } else {
            setFormError('Debe haber al menos una asignación de sede.');
        }
    };

    const validateForm = () => {
        let isFormValid = true;
        const mainErrors = { userId: validateUserId(userId) };
        setErrors(mainErrors);
        setTouched({ userId: true });
        if (mainErrors.userId) isFormValid = false;
        
        const newDetailsErrors = details.map(d => ({
            sedeId: validateSedeId(d.sedeId),
            assignedAt: validateAssignedAt(d.assignedAt),
            activeUntil: validateActiveUntil(d.activeUntil, d.assignedAt),
        }));
        setDetailsErrors(newDetailsErrors);
        const newDetailsTouched = Array(details.length).fill({ sedeId: true, assignedAt: true, activeUntil: true });
        setDetailsTouched(newDetailsTouched);

        if (newDetailsErrors.some(errs => Object.values(errs).some(e => e))) isFormValid = false;

        return isFormValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);

        if (!validateForm()) {
            setFormError('Por favor, corrija los errores del formulario antes de guardar.');
            return;
        }

        setIsLoading(true);

        const payload = {
            userId,
            assignmentReason,
            observations,
            status,
            details: details.map(d => ({
                sedeId: d.sedeId,
                sortOrder: d.sortOrder ? parseInt(d.sortOrder, 10) : null,
                role: userRole,
                schedule: d.schedule,
                assignedAt: d.assignedAt ? new Date(d.assignedAt).toISOString() : new Date().toISOString(),
                activeUntil: d.activeUntil ? new Date(d.activeUntil).toISOString() : null,
                responsibilities: d.responsibilities.split(',').map(r => r.trim()).filter(Boolean),
            })),
        };

        try {
            if (isEditMode) {
                await userSedeService.updateUserSede(id, payload);
            } else {
                await userSedeService.createUserSede(payload);
            }
            navigate('/directors/userSede');
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'No se pudo conectar al servicio.';
            setFormError(`Error al guardar: ${message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => navigate('/directors/userSede');
    
    return (
        <div className="card">
            <div className="card-header">
                <h3>{isEditMode ? 'Editar Asignación' : 'Crear Nueva Asignación de Sede'}</h3>
            </div>
            <div className="card-body">
                {formError && <div className="alert alert-danger">{formError}</div>}
                <form onSubmit={handleSubmit} noValidate>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="userId" className="form-label">Usuario</label>
                             {!isEditMode ? (
                                <select 
                                    id="userId" 
                                    className={`form-control ${getValidationClass('userId')}`}
                                    value={userId} 
                                    onChange={(e) => handleUserChange(e.target.value)}
                                    onBlur={handleBlur}
                                    name="userId"
                                    disabled={isLoading || isUsersLoading}
                                    required
                                >
                                    <option value="">Seleccione un usuario</option>
                                    {isUsersLoading ? <option disabled>Cargando...</option> : users.map(user => (
                                        <option key={user.id || user._id} value={user.id || user._id}>{`${user.firstName} ${user.lastName}`}</option>
                                    ))}
                                </select>
                             ) : (
                                 <input type="text" className="form-control" value={selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : 'Cargando...'} readOnly disabled />
                             )}
                            {errors.userId && <div className="invalid-feedback">{errors.userId}</div>}
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="userRole" className="form-label">Rol del Usuario (Automático)</label>
                            <input id="userRole" type="text" className="form-control" value={userRole} readOnly disabled />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="assignmentReason" className="form-label">Motivo de Asignación</label>
                        <textarea id="assignmentReason" className={`form-control ${getValidationClass('assignmentReason')}`} name="assignmentReason" value={assignmentReason} onChange={(e) => {setAssignmentReason(e.target.value); validateField('assignmentReason', e.target.value)}} onBlur={handleBlur} disabled={isLoading} />
                        {errors.assignmentReason && <div className="invalid-feedback">{errors.assignmentReason}</div>}
                    </div>

                    <h4 className="mt-4">Detalles de Asignación de Sede</h4>
                    {details.map((detail, index) => (
                        <div key={detail.key} className="p-3 mb-3 border rounded">
                            <div className="row align-items-center mb-2"><div className='col'><h5>Detalle {index + 1}</h5></div><div className="col-auto"><button type="button" className="btn btn-danger btn-sm" onClick={() => removeDetailRow(detail.key)} disabled={isLoading || details.length <= 1}>Quitar</button></div></div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor={`sedeId-${detail.key}`} className="form-label">Sede</label>
                                    <select 
                                        id={`sedeId-${detail.key}`} 
                                        className={`form-control ${getDetailValidationClass(index, 'sedeId')}`} 
                                        name="sedeId"
                                        value={detail.sedeId}
                                        onChange={(e) => handleDetailChange(detail.key, 'sedeId', e.target.value)}
                                        onBlur={(e) => handleDetailBlur(index, e)}
                                        disabled={isLoading || isHeadquartersLoading} required>
                                        <option value="">Seleccione una sede</option>
                                        {isHeadquartersLoading ? <option disabled>Cargando...</option> : headquarters.map(hq => (<option key={hq.id} value={hq.id}>{hq.headquartersName}</option>))}
                                    </select>
                                    {detailsErrors[index]?.sedeId && <div className="invalid-feedback">{detailsErrors[index].sedeId}</div>}
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor={`assignedAt-${detail.key}`} className="form-label">Fecha de Asignación</label>
                                    <input id={`assignedAt-${detail.key}`} type="date" className={`form-control ${getDetailValidationClass(index, 'assignedAt')}`} name="assignedAt" value={detail.assignedAt} onChange={(e) => handleDetailChange(detail.key, 'assignedAt', e.target.value)} onBlur={(e) => handleDetailBlur(index, e)} disabled={isLoading} required/>
                                    {detailsErrors[index]?.assignedAt && <div className="invalid-feedback">{detailsErrors[index].assignedAt}</div>}
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor={`sortOrder-${detail.key}`} className="form-label">Orden</label>
                                    <input id={`sortOrder-${detail.key}`} type="number" className="form-control" name="sortOrder" value={detail.sortOrder} onChange={(e) => handleDetailChange(detail.key, 'sortOrder', e.target.value)} disabled={isLoading} />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor={`schedule-${detail.key}`} className="form-label">Jornada</label>
                                    <input id={`schedule-${detail.key}`} type="text" className={`form-control ${getDetailValidationClass(index, 'schedule')}`} name="schedule" value={detail.schedule} onChange={(e) => handleDetailChange(detail.key, 'schedule', e.target.value)} onBlur={(e) => handleDetailBlur(index, e)} disabled={isLoading} />
                                    {detailsErrors[index]?.schedule && <div className="invalid-feedback">{detailsErrors[index].schedule}</div>}
                                </div>
                                <div className="col-md-12 mb-3">
                                    <label htmlFor={`activeUntil-${detail.key}`} className="form-label">Activo Hasta</label>
                                    <input id={`activeUntil-${detail.key}`} type="date" className={`form-control ${getDetailValidationClass(index, 'activeUntil')}`} name="activeUntil" value={detail.activeUntil} onChange={(e) => handleDetailChange(detail.key, 'activeUntil', e.target.value)} onBlur={(e) => handleDetailBlur(index, e)} disabled={isLoading} />
                                    {detailsErrors[index]?.activeUntil && <div className="invalid-feedback">{detailsErrors[index].activeUntil}</div>}
                                </div>
                                <div className="col-md-12 mb-3">
                                    <label htmlFor={`responsibilities-${detail.key}`} className="form-label">Responsabilidades</label>
                                    <textarea id={`responsibilities-${detail.key}`} className={`form-control ${getDetailValidationClass(index, 'responsibilities')}`} name="responsibilities" rows="2" value={detail.responsibilities} onChange={(e) => handleDetailChange(detail.key, 'responsibilities', e.target.value)} onBlur={(e) => handleDetailBlur(index, e)} disabled={isLoading}></textarea>
                                    <small className="form-text text-muted">Separar con comas.</small>
                                    {detailsErrors[index]?.responsibilities && <div className="invalid-feedback">{detailsErrors[index].responsibilities}</div>}
                                </div>
                            </div>
                        </div>
                    ))}
                    <button type="button" className="btn btn-outline-primary mb-3" onClick={addDetailRow} disabled={isLoading}>Añadir Asignación de Sede</button>

                    <div className="mb-3">
                        <label htmlFor="observations" className="form-label">Observaciones</label>
                        <textarea id="observations" className={`form-control ${getValidationClass('observations')}`} name="observations" value={observations} onChange={(e) => {setObservations(e.target.value); validateField('observations', e.target.value)}} onBlur={handleBlur} disabled={isLoading} />
                        {errors.observations && <div className="invalid-feedback">{errors.observations}</div>}
                    </div>
                    
                    {isEditMode && <div className="col-md-6 mb-3"><label htmlFor="status" className="form-label">Estado</label><select className="form-control" id="status" name="status" value={status} onChange={(e) => setStatus(e.target.value)} required disabled={isLoading}><option value="Activo">Activo</option><option value="Inactivo">Inactivo</option></select></div>}
                    <div className="mt-4 text-center"><button type="button" className="btn btn-secondary me-2" onClick={handleCancel} disabled={isLoading}>Cancelar</button><button type="submit" className="btn btn-primary" disabled={isLoading || isUsersLoading || isHeadquartersLoading}>{isLoading ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Crear Asignación')}</button></div>
                </form>
            </div>
        </div>
    );
};
export default UserSedeForm;

    