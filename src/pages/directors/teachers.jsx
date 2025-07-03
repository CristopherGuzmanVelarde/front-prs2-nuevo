import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { teacherService } from '../../services/teacherService'; // Import the teacher service
import { hasPermission } from '../../config/permissions'; // Assuming permissions are used here too

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState(''); // Added status filter based on users page

  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole'); // Get user role for permissions


  // Function to load teachers, memoized with useCallback
  const loadTeachers = useCallback(async (filterStatus) => {
      setLoading(true);
      setError(null);
      try {
          // Use the teacherService to fetch data, potentially with status filter
          const data = await teacherService.getAllTeachers(filterStatus || null);
          // Filter data client-side if the service doesn't support filtering directly,
          // but the service seems to support it based on its definition.
          // const filteredData = filterStatus ? data.filter(teacher => teacher.status === filterStatus) : data;
          setTeachers(data || []); // Set the fetched data
      } catch (err) {
          console.error('Error al cargar los profesores:', err);
          setError('Error al cargar los profesores.');
          alert('Error al cargar los profesores.'); // Use alert for now as seen in users page
      } finally {
          setLoading(false);
      }
  }, []); // Dependencies for useCallback: empty array means it's created once

  // Effect to load teachers when the component mounts or statusFilter changes
  useEffect(() => {
    loadTeachers(statusFilter);
  }, [statusFilter, loadTeachers]); // Rerun effect if statusFilter or loadTeachers changes

  // Handlers for actions
  const handleAddTeacher = () => {
    navigate('/directors/teachers/add'); // Navigate to the add form route
  };

  const handleEditTeacher = (teacher) => {
    navigate(`/directors/teachers/edit/${teacher.id}`); // Navigate to the edit form route with ID
  };

  const handleViewTeacher = (teacher) => {
    navigate(`/directors/teachers/view/${teacher.id}`); // Navigate to the view page route with ID
  };

    // Handler for changing teacher status (activate/deactivate)
    const handleStatusChange = async (id, currentStatus) => {
        setLoading(true); // Optional: show loading while status is changing
        setError(null);
        try {
            if (currentStatus === 'ACTIVE') {
                await teacherService.deactivateTeacher(id);
                 alert('Profesor desactivado exitosamente');
            } else {
                await teacherService.activateTeacher(id);
                 alert('Profesor activado exitosamente');
            }
            loadTeachers(statusFilter); // Refresh list after status change
        } catch (error) {
            console.error('Error al cambiar el estado del profesor:', error);
            setError('Error al cambiar el estado del profesor.');
            alert('Error al cambiar el estado del profesor.');
             setLoading(false); // Stop loading on error
        }
    };

    // Handler for deleting a teacher
    const handleDeleteTeacher = async (teacherId) => {
        // TODO: Implement a confirmation dialog (like Swal.fire or a custom modal)
        if (window.confirm('¿Está seguro de que desea eliminar este profesor?')) { // Using basic confirm for now
            setLoading(true); // Optional: show loading
            setError(null);
            try {
                // Assuming your teacherService has a delete function (it wasn't in the provided service code)
                // If not, you'll need to add it to teacherService.js or use userService if it handles teacher deletion
                // await teacherService.deleteTeacher(teacherId); // <--- Uncomment/implement this
                 console.log(`Simulating deletion of teacher with ID: ${teacherId}`); // Placeholder
                 await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call delay

                 alert('Profesor eliminado exitosamente.');
                 loadTeachers(statusFilter); // Refresh list after deletion
            } catch (error) {
                console.error('Error al eliminar el profesor:', error);
                 setError('Error al eliminar el profesor.');
                alert('Error al eliminar el profesor.');
                 setLoading(false); // Stop loading on error
            }
        }
    };


  return (
    <div>
      <h2>Teacher Management</h2>

      {/* Controls and Add Button - Only shown when the form is hidden (which is always now in this component) */}
       {/* Added flex layout for button and filter */}
      <div className="d-flex justify-content-between w-100 mb-3">
          {/* Check permission for adding teachers */}
          {hasPermission(userRole, 'create', 'teachers') && ( // Assuming permission check for 'teachers'
              <button
                  className="btn btn-primary"
                  onClick={handleAddTeacher} // Call the handler to navigate to the add form
                  disabled={loading} // Disable button while loading
              >
                  NUEVO PROFESOR
              </button>
          )}
           {/* Status Filter */}
            <div className="form-group">
                <label htmlFor="statusFilter" className="form-label">Filtrar por Estado</label>
                <select
                    id="statusFilter"
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ width: 200 }}
                    disabled={loading} // Disable filter while loading
                >
                    <option value="">Todos</option>
                    <option value="ACTIVE">Activos</option>
                    <option value="INACTIVE">Inactivos</option>
                </select>
            </div>
      </div>


      {/* Teacher List Table */}
      <div className="card mt-4">
        <div className="card-header">
          <h3>Teacher List</h3>
           {/* Optional: Loading indicator in header */}
           {loading && <span className="ms-2"><i className="fas fa-sync fa-spin"></i> Cargando...</span>}
        </div>
        <div className="card-body">
             {/* Display general error message */}
            {error && !loading && ( // Only show error if not currently loading
                 <div className="alert alert-danger" role="alert">
                     {error}
                 </div>
            )}

          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  {/* Updated table headers */}
                  <th>Especialidad</th>
                  <th>Biografía</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {/* Render teachers data */}
                {teachers.length > 0 ? (
                    teachers.map((teacher) => (
                        <tr key={teacher.id || teacher._id}> {/* Use id or _id depending on API response */}
                          {/* Updated table cells */}
                          <td>{teacher.specialty}</td>
                          <td>{teacher.bio}</td>
                           <td>
                               <span className={`badge ${teacher.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}>
                                  {teacher.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                               </span>
                           </td>
                          <td>
                             {/* View Button */}
                             {/* Assuming view permission is needed */}
                             {hasPermission(userRole, 'read', 'teachers') && (
                                 <button onClick={() => handleViewTeacher(teacher)} className="btn btn-sm btn-info me-1" title="Ver">
                                      <i className="fas fa-eye"></i>
                                 </button>
                             )}
                             {/* Edit Button */}
                             {/* Assuming edit permission is needed and not disabled for INACTIVE */}
                             {hasPermission(userRole, 'update', 'teachers') && (
                                 <button onClick={() => handleEditTeacher(teacher)} className="btn btn-sm btn-warning me-1" title="Editar">
                                      <i className="fas fa-edit"></i>
                                 </button>
                             )}
                             {/* Status Change Button */}
                             {/* Assuming update permission is needed for status change */}
                              {hasPermission(userRole, 'update', 'teachers') && (
                                   <button onClick={() => handleStatusChange(teacher.id || teacher._id, teacher.status)} className={`btn btn-sm ${teacher.status === 'ACTIVE' ? 'btn-danger' : 'btn-success'}`} title={teacher.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}>
                                        <i className={`fas ${teacher.status === 'ACTIVE' ? 'fa-ban' : 'fa-check-circle'}`}></i>
                                   </button>
                              )}
                          </td>
                        </tr>
                    ))
                ) : (
                    // Message when no teachers are available
                    <tr>
                        {/* Updated colSpan */}
                        <td colSpan="4" className="text-center">
                             {loading ? 'Cargando...' : (error ? 'Error al cargar datos.' : 'No hay profesores disponibles.')}
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Teachers;
