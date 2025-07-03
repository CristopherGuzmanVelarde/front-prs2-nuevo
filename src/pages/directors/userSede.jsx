
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { userSedeService } from '../../services/userSedeService';
import { hasPermission } from '../../config/permissions';

const UserSede = () => {
  const [userSedes, setUserSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');

  const loadUserSedes = useCallback(async (filterStatus) => {
      setLoading(true);
      setError(null);
      try {
          const data = await userSedeService.getAllUserSedes(filterStatus || undefined);
          setUserSedes(data || []);
      } catch (err) {
          console.error('Error al cargar las asignaciones de User Sede:', err);
          setError('Error al cargar las asignaciones de User Sede.');
          alert('Error al cargar las asignaciones de User Sede');
      } finally {
          setLoading(false);
      }
  }, []);

  useEffect(() => {
    loadUserSedes(statusFilter);
  }, [statusFilter, loadUserSedes]);

  const handleAddUserSede = () => navigate('/directors/userSede/add');
  
  const handleEditUserSede = (userSede) => {
     const userSedeId = userSede.id || userSede._id;
     if (userSedeId) {
         navigate(`/directors/userSede/edit/${userSedeId}`);
     } else {
         console.error('User Sede object is missing ID for editing:', userSede);
         alert('No se pudo editar la asignación: ID no encontrado.');
     }
  };

  const handleViewUserSede = (userSede) => {
      const userSedeId = userSede.id || userSede._id;
      if (userSedeId) {
          navigate(`/directors/userSede/view/${userSedeId}`);
      } else {
          console.error('User Sede object is missing ID for viewing:', userSede);
          alert('No se pudo ver la asignación: ID no encontrado.');
      }
  };

  const handleDeleteUserSede = async (id) => {
      if (window.confirm('¿Está seguro de que desea desactivar esta asignación?')) {
          setLoading(true);
          try {
              await userSedeService.deleteUserSede(id);
              alert('Asignación desactivada exitosamente');
              loadUserSedes(statusFilter);
          } catch (error) {
              console.error('Error al desactivar la asignación:', error);
              alert('Error al desactivar la asignación.');
          } finally {
            setLoading(false);
          }
      }
  };

  const handleRestoreUserSede = async (id) => {
      if (window.confirm('¿Está seguro de que desea restaurar esta asignación?')) {
          setLoading(true);
          try {
              await userSedeService.restoreUserSede(id);
              alert('Asignación restaurada exitosamente');
              loadUserSedes(statusFilter);
          } catch (error) {
              console.error('Error al restaurar la asignación:', error);
              alert('Error al restaurar la asignación.');
          } finally {
            setLoading(false);
          }
      }
  };

  const handleFilterChange = (e) => setStatusFilter(e.target.value);

  return (
    <div>
      <h2>User Sede Management</h2>
      <div className="d-flex justify-content-between w-100 mb-3 align-items-center">
          {hasPermission(userRole, 'create', 'userSedes') && (
              <button className="btn btn-primary" onClick={handleAddUserSede} disabled={loading}>
                  NUEVA ASIGNACIÓN
              </button>
          )}
            <div className="form-group">
                <label htmlFor="statusFilter" className="form-label">Filtrar por Estado</label>
                <select id="statusFilter" className="form-select" value={statusFilter} onChange={handleFilterChange} style={{ width: 200 }} disabled={loading}>
                    <option value="">Todos</option>
                    <option value="Activo">Activos</option>
                    <option value="Inactivo">Inactivos</option>
                </select>
            </div>
      </div>
      <div className="card mt-4">
        <div className="card-header">
          <h3>User Sede List</h3>
           {loading && <span className="ms-2"><i className="fas fa-sync fa-spin"></i> Cargando...</span>}
        </div>
        <div className="card-body">
            {error && !loading && (<div className="alert alert-danger" role="alert">{error}</div>)}
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>ID Asignación</th>
                  <th>ID Usuario</th>
                  <th>Roles</th>
                  <th>Observaciones</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading && userSedes.length === 0 ? (
                     <tr><td colSpan="6" className="text-center">Cargando...</td></tr>
                ) : userSedes.length > 0 ? (
                    userSedes.map((userSede) => (
                        <tr key={userSede.id || userSede._id}>
                          <td>{userSede.id || userSede._id}</td>
                          <td>{userSede.userId}</td>
                          <td>
                            {userSede.details && userSede.details.map((detail, index) => (
                              <span key={index} className="badge bg-secondary me-1">{detail.role || 'Sin Rol'}</span>
                            ))}
                          </td>
                          <td>{userSede.observations || 'N/A'}</td>
                          <td>
                               <span className={`badge ${userSede.status?.toUpperCase() === 'ACTIVO' ? 'bg-success' : 'bg-secondary'}`}>
                                  {userSede.status}
                               </span>
                          </td>
                          <td>
                             {hasPermission(userRole, 'read', 'userSedes') && (
                                 <button onClick={() => handleViewUserSede(userSede)} className="btn btn-sm btn-info me-1" title="Ver"><i className="fas fa-eye"></i></button>
                             )}
                             {userSede.status?.toUpperCase() === 'ACTIVO' ? (
                                 <>
                                     {hasPermission(userRole, 'update', 'userSedes') && (
                                         <button onClick={() => handleEditUserSede(userSede)} className="btn btn-sm btn-warning me-1" title="Editar"><i className="fas fa-edit"></i></button>
                                     )}
                                     {hasPermission(userRole, 'delete', 'userSedes') && (
                                          <button onClick={() => handleDeleteUserSede(userSede.id || userSede._id)} className="btn btn-sm btn-danger" title="Desactivar"><i className="fas fa-ban"></i></button>
                                     )}
                                 </>
                             ) : (
                                 <>
                                     {hasPermission(userRole, 'update', 'userSedes') && (
                                         <button onClick={() => handleRestoreUserSede(userSede.id || userSede._id)} className="btn btn-sm btn-success" title="Restaurar"><i className="fas fa-check-circle"></i></button>
                                     )}
                                 </>
                             )}
                          </td>
                        </tr>
                    ))
                ) : (
                    <tr><td colSpan="6" className="text-center">{error ? 'Error al cargar datos.' : 'No hay User Sedes disponibles.'}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default UserSede;
