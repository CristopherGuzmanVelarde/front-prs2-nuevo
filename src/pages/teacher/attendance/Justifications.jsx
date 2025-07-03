/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from "react";
import Header from "../../../components/Header";
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from "../../../components/Sidebar";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt, faPlus, faSave, faTimes, faUser, faCheck, faTrash } from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';



const Justifications = () => {
  const [activeJustifications, setActiveJustifications] = useState([]);
  const [inactiveJustifications, setInactiveJustifications] = useState([]);
  const [filteredActiveJustifications, setFilteredActiveJustifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [justificationToDelete, setJustificationToDelete] = useState(null);
  const [newJustification, setNewJustification] = useState({
    studentId: '',
    studentName: '',
    studentLastName: '',
    reason: '',
    requestDate: '',
    daysToJustify: [],
    status: 'PENDING',
    active: true,
    name: '',
    lastName: ''
  });
  const [studentsWithUnjustified, setStudentsWithUnjustified] = useState([]);
  const [allStudents, setAllStudents] = useState([]);

  // Date formatting function
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const months = {
      '01': 'ene', '02': 'feb', '03': 'mar', '04': 'abr',
      '05': 'may', '06': 'jun', '07': 'jul', '08': 'ago',
      '09': 'sep', '10': 'oct', '11': 'nov', '12': 'dic'
    };
    
    // Handle different date formats
    let date;
    if (dateString.includes('T')) {
      // ISO format with time
      date = new Date(dateString);
    } else if (dateString.includes('-')) {
      // YYYY-MM-DD format
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const [year, month, day] = parts;
        return `${year}-${months[month] || month}-${day.padStart(2, '0')}`;
      }
    }
    
    // If it's a Date object or can be converted to one
    if (date && !isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${months[month] || month}-${day}`;
    }
    
    return dateString; // Return original if formatting fails
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('https://ms.students.machashop.top/api/v1/students');
        if (!response.ok) {
          throw new Error('Failed to fetch students');
        }
        const students = await response.json();
        setAllStudents(students);
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };
    fetchStudents();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case 'APROBADA': return 'bg-success';
      case 'RECHAZADA': return 'bg-danger';
      case 'PENDING': return 'bg-warning';
      case 'COMPLETED': return 'bg-success';
      default: return 'bg-info';
    }
  };

  const changeJustificationStatus = async (justificationId, newStatus) => {
    try {
      const response = await fetch(`https://ms.attendance.machashop.top/justifications/${justificationId}/status?status=${newStatus}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to update justification status');
      }

      // Refresh data after successful update
      refreshData();
    } catch (error) {
      console.error('Error updating justification status:', error);
    }
  };

  // New function for logical delete
  const deleteJustification = async (justificationId) => {
    try {
      const response = await fetch(`https://ms.attendance.machashop.top/justifications/${justificationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete justification');
      }

      // Refresh data after successful deletion
      refreshData();
      setShowDeleteModal(false);
      setJustificationToDelete(null);
    } catch (error) {
      console.error('Error deleting justification:', error);
      alert('Error al eliminar la justificación. Por favor, intenta de nuevo.');
    }
  };

  // Function to show delete confirmation modal
  const confirmDelete = (justification) => {
    setJustificationToDelete(justification);
    setShowDeleteModal(true);
  };

  // Function to handle delete confirmation
  const handleDeleteConfirm = () => {
    if (justificationToDelete) {
      deleteJustification(justificationToDelete.id);
    }
  };

  // Function to cancel delete
  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setJustificationToDelete(null);
  };

  const prepareJustification = (student) => {
    // Set the new justification with student info and unjustified days
    const studentDetails = allStudents.find(s => s.id === student.studentId) || {};
    
    setNewJustification({
      studentId: student.studentId,
      studentName: studentDetails.name || student.studentName,
      studentLastName: studentDetails.lastName || student.studentLastName,
      reason: '',
      requestDate: new Date().toISOString().split('T')[0],
      daysToJustify: student.attendances.map(attendance => ({
        date: attendance.date,
        status: attendance.status,
        justified: false
      })),
      status: 'PENDING',
      active: true
    });

    setShowCreateModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewJustification(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addJustifiedDay = () => {
    setNewJustification(prev => ({
      ...prev,
      daysToJustify: [...prev.daysToJustify, {
        date: '',
        status: 'AUSENTE',
        justified: false
      }]
    }));
  };

  const removeJustifiedDay = (index) => {
    setNewJustification(prev => ({
      ...prev,
      daysToJustify: prev.daysToJustify.filter((_, i) => i !== index)
    }));
  };

  const handleDayInputChange = (index, field, value) => {
    setNewJustification(prev => ({
      ...prev,
      daysToJustify: prev.daysToJustify.map((day, i) => 
        i === index ? { ...day, [field]: value } : day
      )
    }));
  };

  
  
  const createJustification = async () => {
    const confirmed = window.confirm('¿Estás seguro de que deseas crear esta justificación?');
    if (!confirmed) return;
    

    try {
      const response = await fetch('https://ms.attendance.machashop.top/justifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newJustification)
      });

      if (!response.ok) throw new Error('Failed to create justification');

      await refreshData();
      setShowCreateModal(false);
      setNewJustification({
        studentId: '',
        studentName: '',
        studentLastName: '',
        reason: '',
        requestDate: '',
        daysToJustify: [],
        status: 'PENDING',
        active: true
      });
    } catch (error) {
      console.error('Error creating justification:', error);
    }
  };

  const fetchUnjustifiedStudents = async () => {
    try {
      const res = await fetch('https://ms.attendance.machashop.top/attendances');
      const attendances = await res.json();

      // Filter attendances for active and unjustified absences
      const activeUnjustifiedAttendances = attendances.filter(a => 
        !a.justified && 
        a.status === 'AUSENTE' && 
        a.active === true
      );

      // Get unique student IDs from filtered attendances
      const studentIds = [...new Set(activeUnjustifiedAttendances.map(a => a.studentId))];

      // Fetch student info for these IDs
      const studentsRes = await fetch('https://ms.students.machashop.top/api/v1/students');
      const students = await studentsRes.json();

      // Create a map of student info for quick lookup
      const studentMap = students.reduce((acc, student) => {
        acc[student.id] = student;
        return acc;
      }, {});

      // Prepare list of students with unjustified attendances
      const studentsWithUnjustified = studentIds.map(studentId => ({
        studentId,
        studentName: studentMap[studentId]?.name || '',
        studentLastName: studentMap[studentId]?.lastName || '',
        attendances: activeUnjustifiedAttendances
          .filter(a => a.studentId === studentId)
          .map(a => ({
            date: a.date,
            status: a.status,
            justified: a.justified
          }))
      }));
      setStudentsWithUnjustified(studentsWithUnjustified);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const fetchActiveJustifications = async () => {
    try {
      const res = await fetch('https://ms.attendance.machashop.top/justifications');
      if (!res.ok) throw new Error('Failed to fetch active justifications');
      const justifications = await res.json();
      const activeJust = justifications.filter(j => j.active);
      const inactiveJust = justifications.filter(j => !j.active);
      setActiveJustifications(activeJust);
      setFilteredActiveJustifications(activeJust);
      setInactiveJustifications(inactiveJust);
    } catch (err) {
      console.error(err.message);
    }
  };

  const fetchInactiveJustifications = async () => {
    try {
      const res = await fetch('https://ms.attendance.machashop.top/justifications/inactive');
      if (!res.ok) throw new Error('Failed to fetch inactive justifications');
      const data = await res.json();
      setInactiveJustifications(data);
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchActiveJustifications(),
        fetchUnjustifiedStudents(),
        fetchInactiveJustifications()
      ]);
    };
    fetchData();
  }, []);

  const refreshData = async () => {
    await fetchActiveJustifications();
    await fetchInactiveJustifications();
    await fetchUnjustifiedStudents();
  };

  const filterJustifications = (term) => {
    if (!term) {
      setFilteredActiveJustifications(activeJustifications);
      return;
    }

    const filteredActive = activeJustifications.filter(j =>
      j.studentName?.toLowerCase().includes(term.toLowerCase()) ||
      j.studentLastName?.toLowerCase().includes(term.toLowerCase()) ||
      j.studentId?.toLowerCase().includes(term.toLowerCase()) ||
      j.reason?.toLowerCase().includes(term.toLowerCase()) ||
      j.requestDate?.toLowerCase().includes(term.toLowerCase()) ||
      j.status?.toLowerCase().includes(term.toLowerCase()) ||
      j.active?.toString().toLowerCase().includes(term.toLowerCase()) ||
      (Array.isArray(j.daysToJustify) && j.daysToJustify.some(day => 
        day.date && day.date.toLowerCase().includes(term.toLowerCase())
      ))
    );
    setFilteredActiveJustifications(filteredActive);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    filterJustifications(value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setFilteredActiveJustifications(activeJustifications);
  };

  return (
    <div className="wrapper">
      <Sidebar />
      <div className="main">
        <Header />
        <div className="content">
          <div className="container-fluid">
            <div className="page-header">
              <h3 className="page-title">Justifications</h3>
              <div className="page-breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                  <li className="breadcrumb-item active">Justifications</li>
                </ol>
              </div>
            </div>

            {/* Create Justification Modal */}
            {showCreateModal && (
              <div className="modal fade show" tabIndex={-1} role="dialog" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                <div className="modal-dialog modal-lg" role="document">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Create New Justification</h5>
                      <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)} aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                      <div className="form-group mb-3">
                        <label>Select Student</label>
                        <Select
                          options={allStudents.map(student => ({
                            value: student.id,
                            label: `${student.name || ''} ${student.lastName || ''} (${student.id})`
                          }))}
                          value={newJustification.studentId ? {
                            value: newJustification.studentId,
                            label: `${newJustification.studentName || ''} ${newJustification.studentLastName || ''} (${newJustification.studentId})`
                          } : null}
                          onChange={(selected) => {
                            if (selected) {
                              const student = allStudents.find(s => s.id === selected.value);
                              setNewJustification(prev => ({
                                ...prev,
                                studentId: selected.value,
                                studentName: student?.name || '',
                                studentLastName: student?.lastName || ''
                              }));
                            }
                          }}
                          className="form-control"
                          placeholder="Select a student..."
                        />
                      </div>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group mb-3">
                            <label>Request Date</label>
                            <input type="date" className="form-control" name="requestDate" value={newJustification.requestDate} onChange={handleInputChange} />
                          </div>
                        </div>
                      </div>
                      <div className="form-group mb-3">
                        <label>Reason</label>
                        <textarea className="form-control" name="reason" value={newJustification.reason} onChange={handleInputChange} rows="3"></textarea>
                      </div>
                      <div className="form-group mb-3">
                        <label>Days to Justify</label>
                        {newJustification.daysToJustify.map((day, index) => (
                          <div key={index} className="mb-3">
                            <div className="row">
                              <div className="col-md-4">
                                <input type="date" className="form-control" value={day.date} onChange={(e) => handleDayInputChange(index, 'date', e.target.value)} />
                              </div>
                              <div className="col-md-4">
                                <select className="form-control" value={day.status} onChange={(e) => handleDayInputChange(index, 'status', e.target.value)}>
                                  <option value="AUSENTE">Absent</option>
                                  <option value="PRESENTE">Present</option>
                                  <option value="TARDE">Late</option>
                                </select>
                              </div>
                              <div className="col-md-3">
                                <div className="form-check">
                                  <input className="form-check-input" type="checkbox" checked={day.justified} onChange={(e) => handleDayInputChange(index, 'justified', e.target.checked)} />
                                  <label className="form-check-label">Justified</label>
                                </div>
                              </div>
                              <div className="col-md-1">
                                <button className="btn btn-danger" onClick={() => removeJustifiedDay(index)}>
                                  <FontAwesomeIcon icon={faTimes} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        <button className="btn btn-primary mt-3" onClick={addJustifiedDay}>
                          <FontAwesomeIcon icon={faPlus} /> Add Day
                        </button>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                        Cancel
                      </button>
                      <button type="button" className="btn btn-primary" onClick={createJustification}>
                        <FontAwesomeIcon icon={faSave} /> Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
              <div className="modal fade show" tabIndex={-1} role="dialog" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog" role="document">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Confirmar Eliminación</h5>
                      <button type="button" className="btn-close" onClick={handleDeleteCancel} aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                      <p>¿Estás seguro de que deseas eliminar esta justificación?</p>
                      {justificationToDelete && (
                        <div className="card">
                          <div className="card-body">
                            <h6 className="card-title">
                              Estudiante: {justificationToDelete.studentName} {justificationToDelete.studentLastName}
                            </h6>
                            <p className="card-text">
                              <strong>Razón:</strong> {justificationToDelete.reason}
                            </p>
                            <p className="card-text">
                              <strong>Fecha de solicitud:</strong> {formatDate(justificationToDelete.requestDate)}
                            </p>
                            <p className="card-text">
                              <strong>Estado:</strong> 
                              <span className={`badge ${getStatusClass(justificationToDelete.status)} ms-2`}>
                                {justificationToDelete.status}
                              </span>
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="alert alert-warning mt-3">
                        <strong>Nota:</strong> Esta acción moverá la justificación a la sección de inactivos. 
                        No se eliminará permanentemente.
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={handleDeleteCancel}>
                        Cancelar
                      </button>
                      <button type="button" className="btn btn-danger" onClick={handleDeleteConfirm}>
                        <FontAwesomeIcon icon={faTrash} /> Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

           <div className="card" style={{ width: '80%', marginLeft: 'auto' }}>
              <div className="card-header d-flex justify-content-between">
                <h4 className="card-title">Justifications Records</h4>
                <button className="btn btn-light" onClick={refreshData}>
                  <FontAwesomeIcon icon={faSyncAlt} /> Refresh
                </button>
              </div>

              <div className="card-body">
                <div className="row mb-4">
                  <div className="col-12">
                    <h5>Students with Unjustified Attendances</h5>
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Student ID</th>
                            <th>Name</th>
                            <th>Unjustified Days</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentsWithUnjustified.map(student => (
                            <tr key={student.studentId}>
                              <td>{student.studentId}</td>
                              <td>{student.studentName} {student.studentLastName}</td>
                              <td>{student.attendances.length}</td>
                              <td>
                                <button 
                                  className="btn btn-sm btn-primary" 
                                  onClick={() => prepareJustification(student)}
                                >
                                  <FontAwesomeIcon icon={faUser} /> Create Justification
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-header">
                <ul className="nav nav-tabs">
                  <li className="nav-item">
                    <a className="nav-link active" data-bs-toggle="tab" href="#active-tab">Active</a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" data-bs-toggle="tab" href="#inactive-tab">Inactive</a>
                  </li>
                </ul>
              </div>

              <div className="card-body">
                <div className="input-group mb-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search justifications..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  <button className="btn btn-outline-secondary" onClick={clearSearch}>Clear</button>
                </div>

                <div className="tab-content">
                  <div className="tab-pane fade show active" id="active-tab">
                    <div className="table-responsive">
                      <table className="table table-hover table-center mb-0">
                        <thead>
                          <tr>
                            <th>Actions</th>
                            <th>Student</th>
                            <th>Reason</th>
                            <th>Request Date</th>
                            <th>Status</th>
                            <th>Days to Justify</th>
                            <th>Active</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredActiveJustifications.map((justification) => (
                            <tr key={justification.id}>
                              <td>
                                <div className="d-flex flex-wrap gap-1">
                                  {justification.status === 'PENDING' && (
                                    <>
                                      <button 
                                        className="btn btn-sm btn-success"
                                        onClick={() => {
                                            const confirmed = window.confirm('¿Estás seguro de que deseas aprobar esta justificación?');
                                            if (confirmed) changeJustificationStatus(justification.id, 'APROBADA');
                                          }}
                                        title="Aprobar"
                                      >
                                        <FontAwesomeIcon icon={faCheck} />
                                      </button>
                                      <button 
                                        className="btn btn-sm btn-danger"
                                        onClick={() => {
                                            const confirmed = window.confirm('¿Estás seguro de que deseas rechazar esta justificación?');
                                            if (confirmed) changeJustificationStatus(justification.id, 'RECHAZADA');
                                          }}
                                        title="Rechazar"
                                      >
                                        <FontAwesomeIcon icon={faTimes} />
                                      </button>
                                      <button 
                                        className="btn btn-sm btn-info"
                                        onClick={() => {
                                            const confirmed = window.confirm('¿Estás seguro de que deseas completar esta justificación?');
                                            if (confirmed) changeJustificationStatus(justification.id, 'COMPLETED');
                                          }}
                                        title="Completar"
                                      >
                                        <FontAwesomeIcon icon={faCheck} />
                                      </button>
                                    </>
                                  )}
                                  {justification.status === 'APROBADA' && (
                                    <button 
                                      className="btn btn-sm btn-info"
                                      onClick={() => {
                                        const confirmed = window.confirm('¿Estás seguro de que deseas completar esta justificación?');
                                        if (confirmed) changeJustificationStatus(justification.id, 'COMPLETED');
                                      }}
                                      title="Completar"
                                    >
                                      <FontAwesomeIcon icon={faCheck} />
                                    </button>
                                  )}
                                  <button 
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => confirmDelete(justification)}
                                    title="Eliminar (mover a inactivos)"
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                </div>
                              </td>
                              <td>
                                {justification.studentName} {justification.studentLastName}
                              </td>
                              <td>{justification.reason}</td>
                              <td>{formatDate(justification.requestDate)}</td>
                              <td>
                                <span className={`badge ${getStatusClass(justification.status)}`}>
                                  {justification.status}
                                </span>
                              </td>
                              <td>
                                <div className="justified-days">
                                  {Array.isArray(justification.daysToJustify) && justification.daysToJustify.map((day, index) => (
                                    <div key={index} className="justified-day mb-1">
                                      <span className="date me-2">{formatDate(day.date)}</span>
                                      <span className="status me-2">
                                        <span className={`badge ${getStatusClass(day.status)}`}>
                                          {day.status}
                                        </span>
                                      </span>
                                      <span className={`badge ${day.justified ? 'bg-success' : 'bg-secondary'}`}>
                                        {day.justified ? 'Justified' : 'Not Justified'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td>
                                <span className={`badge ${justification.active ? 'bg-success' : 'bg-danger'}`}>
                                  {justification.active ? 'Yes' : 'No'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="tab-pane fade" id="inactive-tab">
                    <div className="table-responsive">
                      <table className="table table-hover table-center mb-0">
                        <thead>
                          <tr>
                            <th>Student</th>
                            <th>Reason</th>
                            <th>Request Date</th>
                            <th>Status</th>
                            <th>Days to Justify</th>
                            <th>Active</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inactiveJustifications.map((justification) => (
                            <tr key={justification.id}>
                              <td>
                                {justification.studentName} {justification.studentLastName}
                              </td>
                              <td>{justification.reason}</td>
                              <td>{formatDate(justification.requestDate)}</td>
                              <td>
                                <span className={`badge ${getStatusClass(justification.status)}`}>
                                  {justification.status}
                                </span>
                              </td>
                              <td>
                                <div className="justified-days">
                                  {Array.isArray(justification.daysToJustify) && justification.daysToJustify.map((day, index) => (
                                    <div key={index} className="justified-day mb-1">
                                      <span className="date me-2">{formatDate(day.date)}</span>
                                      <span className="status me-2">
                                        <span className={`badge ${getStatusClass(day.status)}`}>
                                          {day.status}
                                        </span>
                                      </span>
                                      <span className={`badge ${day.justified ? 'bg-success' : 'bg-secondary'}`}>
                                        {day.justified ? 'Justified' : 'Not Justified'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td>
                                <span className={`badge ${justification.active ? 'bg-success' : 'bg-danger'}`}>
                                  {justification.active ? 'Yes' : 'No'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Justifications;