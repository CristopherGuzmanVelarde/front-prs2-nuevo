
import React, { useState, useEffect, useCallback } from 'react';
// Assuming UserForm is in the same directory
import { useNavigate } from 'react-router-dom';
import UserForm from './UserForm';
import { userService } from '../../services/userService';
import { hasPermission } from '../../config/permissions';


const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null); // State to hold user data for editing

    const navigate = useNavigate();

    const loadUsers = useCallback(async () => {
        try {
            const data = await userService.getAllUsers(statusFilter || null);
            // Filtramos los resultados según el estado seleccionado
            const filteredData = statusFilter
                ? data.filter(user => user.status === statusFilter)
                : data;
            setUsers(filteredData);
        } catch (error) {
            console.error('Error al cargar los usuarios:', error);
            // Replace Swal.fire with alert
            alert('Error al cargar los usuarios');
        }
    }, [statusFilter]);

    useEffect(() => {
        loadUsers();
    }, [statusFilter, loadUsers]);

    const handleShowAddForm = () => {
        setEditingUser(null); // Clear editing user data for add form
        setShowForm(true);
    };

    const handleEditUser = (user) => {
        setEditingUser(user); // Set user data for edit form
        setShowForm(true);
    };

    const handleViewUser = (user) => {
        navigate(`/directors/users/view/${user.id}`);
    };


    const handleSaveUser = (savedData) => {
        try {
            // The user/users have already been saved by the UserForm component.
            // This function's role is now just to update the UI.
            const isUpdate = !!editingUser;
            
            if (isUpdate) {
                alert('Guardado: Usuario actualizado exitosamente');
            } else {
                const count = Array.isArray(savedData) ? savedData.length : 1;
                alert(`Guardado: Se ha(n) creado ${count} usuario(s) exitosamente.`);
            }

            setShowForm(false);
            setEditingUser(null);
            loadUsers(); // Refresh the user list
        } catch (error) {
            console.error('Error actualizando la UI después de guardar:', error);
            alert('Error: Ocurrió un problema al refrescar la lista de usuarios.');
        }
    };

     const handleCancelForm = () => {
        setShowForm(false);
        setEditingUser(null); // Clear editing user data
    };

    const handleStatusChange = async (id, currentStatus) => {
        try {
            if (currentStatus === 'ACTIVE') {
                await userService.deactivateUser(id);
                // Replace Swal.fire with alert
                alert('Desactivado: Usuario desactivado exitosamente');
            } else {
                await userService.activateUser(id);
                // Replace Swal.fire with alert
                 alert('Activado: Usuario activado exitosamente');
            }
            loadUsers(); // Refresh the user list
        } catch (error) {
            console.error('Error al cambiar el estado del usuario:', error);
            // Replace Swal.fire with alert
             alert('Error: Error al cambiar el estado del usuario');
        }
    };


    const userRole = localStorage.getItem('userRole');

    return (
        <div>
            <h2>User Management</h2>

            {/* Conditionally render the UserForm or the User List */}
            {showForm ? (
                <UserForm
                    user={editingUser} // Pass the user data for editing (or null for add)
                    onSave={handleSaveUser}
                    onCancel={handleCancelForm}
                />
            ) : (
                <>
                    {/* Controls and Add Button - Only shown when the form is hidden */}
                    <div className="d-flex justify-content-between w-100 mb-3">
                        {hasPermission(userRole, 'create', 'users') && (
                            <button
                                className="btn btn-primary"
                                onClick={handleShowAddForm} // Call the handler to show the form
                            >
                                NUEVO USUARIO
                            </button>
                        )}
                        <div className="form-group">
                            <label htmlFor="statusFilter" className="form-label">Filtrar por Estado</label>
                            <select
                                id="statusFilter"
                                className="form-select"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={{ width: 200 }}
                            >
                                <option value="">Todos</option>
                                <option value="ACTIVE">Activos</option>
                                <option value="INACTIVE">Inactivos</option>
                            </select>
                        </div>
                    </div>

                    {/* User List Table - Only shown when the form is hidden */}
                    <div className="card mt-4">
                      <div className="card-header">
                        <h3>User List</h3>
                      </div>
                      <div className="card-body">
                        <div className="table-responsive">
                          <table className="table table-striped">
                            <thead>
                              <tr>
                                <th>Nombre</th>
                                <th>Apellido</th>
                                <th>Email</th>
                                <th>Usuario</th>
                                <th>Rol</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                              </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.firstName}</td>
                                        <td>{user.lastName}</td>
                                        <td>{user.email}</td>
                                        <td>{user.userName}</td>
                                        <td>
                                            <span className={`badge ${user.role === 'DIRECTOR' ? 'bg-danger' : user.role === 'PROFESOR' ? 'bg-success' : 'bg-info'}`}>
                                               {user.role}
                                            </span>
                                        </td>
                                        <td>
                                             <span className={`badge ${user.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}>
                                                {user.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                                             </span>
                                        </td>
                                        <td>
                                            {/* View Button */}
                                            <button onClick={() => handleViewUser(user)} className="btn btn-sm btn-info me-1" title="Ver">
                                                 <i className="fas fa-eye"></i>
                                            </button>
                                            {/* Edit Button */}
                                            <button onClick={() => handleEditUser(user)} className="btn btn-sm btn-warning me-1" title="Editar" disabled={user.status === 'INACTIVE'} style={{ display: user.status === 'INACTIVE' ? 'none' : 'inline-block' }}>
                                                 <i className="fas fa-edit"></i>
                                            </button>
                                            {/* Status Change Button */}
                                            <button onClick={() => handleStatusChange(user.id, user.status)} className={`btn btn-sm ${user.status === 'ACTIVE' ? 'btn-danger' : 'btn-success'}`} title={user.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}>
                                                 <i className={`fas ${user.status === 'ACTIVE' ? 'fa-ban' : 'fa-check-circle'}`}></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default UserManagementPage;
