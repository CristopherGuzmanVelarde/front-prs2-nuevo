
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import axios from 'axios';
import { userSedeService } from '../../services/userSedeService';
import { userService } from '../../services/userService';

const UserSedeView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [userSede, setUserSede] = useState(null);
  const [user, setUser] = useState(null);
  const [headquartersMap, setHeadquartersMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('No se proporcionó un ID de Asignación.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // Fetch all necessary data in parallel
        const [userSedeData, headquartersData] = await Promise.all([
          userSedeService.getUserSedeById(id),
          axios.get('https://lab.vallegrande.edu.pe/school/ms-institution/api/v1/headquarters')
        ]);

        setUserSede(userSedeData);

        // Fetch user details if userId is present
        if (userSedeData.userId) {
          const userData = await userService.getUserById(userSedeData.userId);
          setUser(userData);
        }

        // Create a map for easy lookup of headquarters names
        const hqMap = new Map();
        if (headquartersData.data && Array.isArray(headquartersData.data)) {
          headquartersData.data.forEach(hq => {
            hqMap.set(hq.id, hq.headquartersName);
          });
        }
        setHeadquartersMap(hqMap);

      } catch (err) {
        console.error('Error fetching details:', err);
        setError('Error al cargar los detalles de la Asignación.');
        setUserSede(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleCancel = () => {
    navigate(-1); // Go back to the previous page
  };

  if (loading) {
    return <div className="text-center p-4">Cargando detalles de la Asignación...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <p>{error}</p>
        <button className="btn btn-secondary mt-3" onClick={handleCancel}>Volver</button>
      </div>
    );
  }

  if (!userSede) {
    return (
      <div className="alert alert-warning" role="alert">
        <p>No se encontraron detalles para esta Asignación.</p>
         <button className="btn btn-secondary mt-3" onClick={handleCancel}>Volver</button>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>Detalles de la Asignación: {user ? `${user.firstName} ${user.lastName}`: userSede.userId}</h3>
      </div>
      <div className="card-body">
        {/* Main Header Data */}
        <div className="row p-3 mb-3 border rounded bg-light">
            <h4 className="mb-3">Información General</h4>
            <div className="col-md-6 mb-3">
                <strong className="d-block">ID Asignación:</strong> {userSede.id || userSede._id}
            </div>
            <div className="col-md-6 mb-3">
                <strong className="d-block">Usuario:</strong> {user ? `${user.firstName} ${user.lastName}` : userSede.userId}
            </div>
             <div className="col-md-6 mb-3">
                 <strong className="d-block">Estado:</strong> 
                 <span className={`badge ${userSede.status === 'Activo' ? 'bg-success' : 'bg-secondary'}`}> 
                    {userSede.status}
                 </span>
            </div>
             <div className="col-md-6 mb-3">
                 <strong className="d-block">Motivo de Asignación:</strong> {userSede.assignmentReason || 'N/A'}
            </div>
             <div className="col-md-12 mb-3">
                 <strong className="d-block">Observaciones:</strong> {userSede.observations || 'N/A'}
            </div>
        </div>

        {/* Details Section */}
        <h4 className="mt-4">Sedes Asignadas</h4>
        {userSede.details && userSede.details.length > 0 ? (
            userSede.details.map((detail, index) => (
                <div key={detail.id || index} className="card mb-3">
                    <div className="card-header">
                       <strong>Sede: {headquartersMap.get(detail.sedeId) || detail.sedeId}</strong>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-4 mb-2">
                                <strong className="d-block">Rol Asignado:</strong> {detail.role || 'N/A'}
                            </div>
                            <div className="col-md-4 mb-2">
                                <strong className="d-block">Jornada:</strong> {detail.schedule || 'N/A'}
                            </div>
                             <div className="col-md-4 mb-2">
                                <strong className="d-block">Orden:</strong> {detail.sortOrder ?? 'N/A'}
                            </div>
                            <div className="col-md-4 mb-2">
                                <strong className="d-block">Fecha de Asignación:</strong> 
                                {detail.assignedAt ? dayjs(detail.assignedAt).format('YYYY-MM-DD') : 'N/A'}
                            </div>
                            <div className="col-md-4 mb-2">
                                <strong className="d-block">Activo Hasta:</strong> 
                                {detail.activeUntil ? dayjs(detail.activeUntil).format('YYYY-MM-DD') : 'N/A'}
                            </div>
                            <div className="col-md-12 mb-2">
                                <strong className="d-block">Responsabilidades:</strong> 
                                {Array.isArray(detail.responsibilities) && detail.responsibilities.length > 0 ? detail.responsibilities.join(', ') : 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>
            ))
        ) : (
            <p>No hay detalles de sede para esta asignación.</p>
        )}

        <div className="m-t-20 text-center mt-4"> 
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                Volver
            </button>
        </div>
      </div>
    </div>
  );
};

export default UserSedeView;
