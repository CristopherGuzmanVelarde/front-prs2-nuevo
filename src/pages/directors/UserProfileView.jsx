import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams
import { userService } from '../../services/userService';

const UserProfileView = ({ onClose }) => {
    const { id } = useParams();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                const userData = await userService.getUserById(id);
                setUser(userData);
                setError(null);
            } catch (err) {
                console.error('Error fetching user details:', err);
                setError('Error al cargar los detalles del usuario.');
                alert('Error al cargar los detalles del usuario.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchUser();
        } else {
            setUser(null);
            setLoading(false);
            setError('No se proporcionó un ID de usuario.');
        }

    }, [id]);

    if (loading) {
        return <div>Cargando detalles del usuario...</div>;
    }

    if (error) {
        return (
            <div>
                <p>{error}</p>
                {onClose && <button className="btn btn-primary mt-3" onClick={onClose}>Cerrar</button>}
            </div>
        );
    }

    if (!user) {
        return (
             <div>
                <p>No se encontraron detalles del usuario.</p>
                {onClose && <button className="btn btn-primary mt-3" onClick={onClose}>Cerrar</button>}
            </div>
        );
    }

    return (
        <div className="card">
            <div className="card-header">
                <h3>Detalles del Usuario: {user.firstName} {user.lastName}</h3>
            </div>
            <div className="card-body">
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <strong className="d-block">Nombre:</strong> {user.firstName}
                    </div>
                    <div className="col-md-6 mb-3">
                        <strong className="d-block">Apellido:</strong> {user.lastName}
                    </div>
                    <div className="col-md-6 mb-3">
                        <strong className="d-block">Email:</strong> {user.email}
                    </div>
                     <div className="col-md-6 mb-3">
                        <strong className="d-block">Teléfono:</strong> {user.phone}
                    </div>
                    <div className="col-md-6 mb-3">
                        <strong className="d-block">Usuario:</strong> {user.userName}
                    </div>
                    <div className="col-md-6 mb-3">
                         <strong className="d-block">Tipo de Documento:</strong> {user.documentType}
                    </div>
                    <div className="col-md-6 mb-3">
                         <strong className="d-block">Número de Documento:</strong> {user.documentNumber}
                    </div>
                     <div className="col-md-6 mb-3">
                         <strong className="d-block">Rol:</strong> {user.role}
                    </div>
                    <div className="col-md-6 mb-3">
                         <strong className="d-block">Estado:</strong> {user.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                    </div>
                     <div className="col-md-6 mb-3">
                        <strong className="d-block">ID Institución:</strong> {user.institutionId}
                    </div>
                     <div className="col-md-12 mb-3">
                        <strong className="d-block">Permisos:</strong> {user.permissions ? user.permissions.join(', ') : 'No tiene permisos asignados'}
                    </div>
                </div>

                <div className="m-t-20 text-center">
                    {onClose && <button type="button" className="btn btn-primary" onClick={onClose}>Cerrar</button>}
                </div>
            </div>
        </div>
    );
};

export default UserProfileView;