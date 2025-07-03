
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { teacherService } from '../../services/teacherService';
import { validateSpecialty, validateBio, validateUserId } from '../../utils/teacherValidations';

const TeacherForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        userId: '',
        specialty: '',
        bio: '',
        status: 'ACTIVE'
    });
    
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingTeacher, setLoadingTeacher] = useState(!!id);
    const [formError, setFormError] = useState(null);

    useEffect(() => {
        const loadUsers = async () => {
            if (id) return; // Don't load users separately if editing, will be handled in fetchTeacher
            setLoadingUsers(true);
            try {
                const data = await userService.getAllUsers('PROFESOR', 'ACTIVE'); 
                setUsers(data || []);
            } catch (error) {
                console.error('Error al cargar usuarios:', error);
                setFormError('No se pudieron cargar los usuarios para seleccionar.');
            } finally {
                setLoadingUsers(false);
            }
        };
        loadUsers();
    }, [id]);

    useEffect(() => {
        const fetchTeacher = async () => {
            if (id) {
                setLoadingTeacher(true);
                try {
                    const [teacherData, allUsers] = await Promise.all([
                        teacherService.getTeacherById(id),
                        userService.getAllUsers() // Fetch all users to find the one associated with the teacher
                    ]);
                    
                    setFormData({
                        userId: teacherData.userId,
                        specialty: teacherData.specialty || '',
                        bio: teacherData.bio || '',
                        status: teacherData.status || 'ACTIVE'
                    });
                    
                    setUsers(allUsers || []);

                    if (teacherData.userId) {
                         const userData = await userService.getUserById(teacherData.userId);
                         setSelectedUser(userData || null);
                    }
                    setFormError(null);
                } catch (err) {
                    console.error('Error fetching teacher for editing:', err);
                    setFormError('Error al cargar los datos del profesor para edición.');
                    setFormData(null);
                } finally {
                    setLoadingTeacher(false);
                }
            }
        };

        if (id) {
            fetchTeacher();
        }
    }, [id]);

    const validateField = (name, value) => {
        let error = '';
        if (name === 'userId') {
            error = validateUserId(value);
        } else if (name === 'specialty') {
            error = validateSpecialty(value);
        } else if (name === 'bio') {
            error = validateBio(value);
        }
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        validateField(name, value);
    };
    
    const getValidationClass = (fieldName) => {
        if (!touched[fieldName]) return '';
        return errors[fieldName] ? 'is-invalid' : 'is-valid';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (touched[name]) {
            validateField(name, value);
        }
    };

    const handleUserSelect = (e) => {
        const selectedUserId = e.target.value;
        setFormData(prev => ({ ...prev, userId: selectedUserId }));
        const user = users.find(u => (u.id || u._id) == selectedUserId); 
        setSelectedUser(user || null);
        if (touched.userId) {
            validateField('userId', selectedUserId);
        }
    };

    const validateForm = () => {
        const newErrors = {
            userId: id ? '' : validateUserId(formData.userId),
            specialty: validateSpecialty(formData.specialty),
            bio: validateBio(formData.bio),
        };
        setErrors(newErrors);
        setTouched({ userId: true, specialty: true, bio: true });
        return !Object.values(newErrors).some(error => error);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            setFormError('Por favor, corrija los errores del formulario antes de guardar.');
            return;
        }

        setLoading(true);
        setFormError(null);

        try {
            const dataToSend = { ...formData };
            if (id) {
                await teacherService.updateTeacher(id, dataToSend);
            } else {
                delete dataToSend.id;
                await teacherService.createTeacher(dataToSend);
            }
            navigate('/directors/teachers');
        } catch (err) {
            console.error('Error al guardar el profesor:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Error desconocido al guardar.';
            setFormError(`Error al guardar: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/directors/teachers');
    };
    
    if (loadingTeacher) {
        return <div>Cargando datos del profesor...</div>;
    }

    if (formError && !loadingTeacher && (!formData || !id)) {
        return (
            <div className="alert alert-danger" role="alert">
                <p>{formError}</p>
                <button className="btn btn-secondary mt-3" onClick={handleCancel}>Volver a la lista</button>
            </div>
        );
    }
    
    return (
        <div className="card">
            <div className="card-header">
                <h3>{id ? 'Editar Profesor' : 'Nuevo Profesor'}</h3>
            </div>
            <div className="card-body">
                {formError && (
                   <div className="alert alert-danger" role="alert">{formError}</div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="row">
                        {!id ? ( 
                            <div className="col-md-6 mb-3">
                                <label htmlFor="userId" className="form-label">Seleccionar Usuario</label>
                                <select
                                    className={`form-select ${getValidationClass('userId')}`}
                                    id="userId"
                                    name="userId"
                                    value={formData.userId}
                                    onChange={handleUserSelect}
                                    onBlur={handleBlur}
                                    required
                                    disabled={loadingUsers || loading}
                                >
                                    <option value="">-- Seleccionar usuario --</option>
                                    {loadingUsers ? (
                                         <option value="" disabled>Cargando usuarios...</option>
                                    ) : users.length > 0 ? (
                                        users.map(user => (
                                            <option key={user.id || user._id} value={user.id || user._id}>
                                                {`${user.firstName} ${user.lastName} (${user.userName})`}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="" disabled>No se encontraron usuarios con rol PROFESOR activo.</option>
                                    )}
                                </select>
                                {errors.userId && <div className="invalid-feedback">{errors.userId}</div>}
                            </div>
                        ) : null}

                        {(selectedUser || (id && !loadingTeacher && formData?.userId)) && ( 
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Información del Usuario</label>
                                <div className="card bg-light">
                                    <div className="card-body">
                                        <p className="card-text mb-1"><strong>Nombre:</strong> {selectedUser?.firstName} {selectedUser?.lastName}</p>
                                        <p className="card-text mb-1"><strong>Usuario:</strong> {selectedUser?.userName}</p>
                                        <p className="card-text mb-0"><strong>Email:</strong> {selectedUser?.email}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="col-md-6 mb-3">
                            <label htmlFor="specialty" className="form-label">Especialidad</label>
                            <input
                                type="text"
                                className={`form-control ${getValidationClass('specialty')}`}
                                id="specialty"
                                name="specialty"
                                value={formData?.specialty || ''}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                disabled={loading}
                            />
                            {errors.specialty && <div className="invalid-feedback">{errors.specialty}</div>}
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="bio" className="form-label">Biografía</label>
                            <textarea
                                className={`form-control ${getValidationClass('bio')}`}
                                id="bio"
                                name="bio"
                                value={formData?.bio || ''}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                rows="3"
                                disabled={loading}
                            ></textarea>
                            <small className="form-text text-muted">Describe la experiencia y trayectoria del profesor.</small>
                            {errors.bio && <div className="invalid-feedback">{errors.bio}</div>}
                        </div>

                        {id && (
                            <div className="col-md-6 mb-3"> 
                                <label htmlFor="status" className="form-label">Estado</label>
                                <select className="form-select" id="status" name="status" value={formData?.status || 'ACTIVE'} onChange={handleChange} required disabled={loading}>
                                    <option value="ACTIVE">Activo</option>
                                    <option value="INACTIVE">Inactivo</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="m-t-20 text-center mt-4">
                        <button type="button" className="btn btn-secondary me-2" onClick={handleCancel} disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading || loadingTeacher || loadingUsers || (!id && !formData.userId)}>
                             {loading ? 'Guardando...' : (id ? 'Actualizar Profesor' : 'Crear Profesor')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TeacherForm;
