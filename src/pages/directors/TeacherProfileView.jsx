
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { teacherService } from '../../services/teacherService';
import { userService } from '../../services/userService';

const TeacherProfileView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [teacher, setTeacher] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeacherDetails = async () => {
        if (!id) {
            setError('No se proporcionó un ID de profesor.');
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            // Primero, obtenemos los datos específicos del profesor (especialidad, biografía)
            const teacherData = await teacherService.getTeacherById(id);
            setTeacher(teacherData);

            // Luego, con el userId del profesor, obtenemos los datos generales del usuario
            if (teacherData && teacherData.userId) {
                const userData = await userService.getUserById(teacherData.userId);
                setUser(userData);
            } else {
                throw new Error("El registro del profesor no tiene un usuario asociado.");
            }
            setError(null);
        } catch (err) {
            console.error('Error fetching teacher details:', err);
            setError('Error al cargar los detalles del profesor.');
        } finally {
            setLoading(false);
        }
    };

    fetchTeacherDetails();
  }, [id]);

   if (loading) {
        return <div className="text-center p-4">Cargando detalles del profesor...</div>;
    }

    if (error) {
        return (
            <div className="alert alert-danger" role="alert">
                <p>{error}</p>
                <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>Volver</button>
            </div>
        );
    }

    if (!teacher || !user) {
        return (
             <div className="alert alert-warning" role="alert">
                <p>No se encontraron todos los detalles para el profesor seleccionado.</p>
                <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>Volver</button>
            </div>
        );
    }

  return (
    <div className="card">
      <div className="card-header">
        <h3>Detalles del Profesor: {user.firstName} {user.lastName}</h3>
      </div>
      <div className="card-body">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div className="mb-3">
                <strong className="d-block text-muted">Nombre:</strong> 
                <p className="fs-5">{user.firstName}</p>
            </div>
            <div className="mb-3">
                <strong className="d-block text-muted">Apellido:</strong> 
                <p className="fs-5">{user.lastName}</p>
            </div>
            <div className="mb-3">
                <strong className="d-block text-muted">Email:</strong> 
                <p className="fs-5">{user.email}</p>
            </div>
             <div className="mb-3">
                <strong className="d-block text-muted">Teléfono:</strong> 
                <p className="fs-5">{user.phone}</p>
            </div>
            <div className="mb-3">
                <strong className="d-block text-muted">Usuario:</strong> 
                <p className="fs-5">{user.userName}</p>
            </div>
            <div className="mb-3">
                <strong className="d-block text-muted">Especialidad:</strong> 
                <p className="fs-5">{teacher.specialty || 'No especificada'}</p>
            </div>
            <div className="mb-3">
                 <strong className="d-block text-muted">Tipo de Documento:</strong> 
                 <p className="fs-5">{user.documentType}</p>
            </div>
            <div className="mb-3">
                 <strong className="d-block text-muted">Número de Documento:</strong> 
                 <p className="fs-5">{user.documentNumber}</p>
            </div>
             <div className="mb-3">
                 <strong className="d-block text-muted">Rol:</strong> 
                 <p className="fs-5">{user.role}</p>
            </div>
            <div className="mb-3">
                 <strong className="d-block text-muted">Estado:</strong> 
                 <span className={`badge fs-6 ${teacher.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}>
                    {teacher.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                 </span>
            </div>
            <div className="col-md-12 mb-3">
                <strong className="d-block text-muted">Biografía:</strong> 
                <p className="fs-5">{teacher.bio || 'Sin biografía.'}</p>
            </div>
             <div className="col-md-12 mb-3">
                <strong className="d-block text-muted">Permisos:</strong> 
                <p className="fs-5">{user.permissions ? user.permissions.join(', ') : 'No tiene permisos asignados'}</p>
            </div>
        </div>
        <div className="m-t-20 text-center mt-4">
             <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Volver</button>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfileView;