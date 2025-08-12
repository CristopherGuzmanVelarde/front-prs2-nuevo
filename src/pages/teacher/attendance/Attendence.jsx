/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect, Fragment } from "react";
import Header from "../../../components/Header";
import 'react-calendar/dist/Calendar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import Sidebar from "../../../components/Sidebar";
import { Link } from "react-router-dom";
import AttendanceForm from "./AttendanceForm";
import EditAttendanceForm from "./EditAttendanceForm";

const getStatusClass = (status) => {
  switch (status) {
    case 'PRESENTE':
      return 'bg-success';
    case 'TARDE':
      return 'bg-warning';
    case 'AUSENTE':
      return 'bg-danger';
    default:
      return 'bg-secondary';
  }
};

const Attendence = () => {
  const [students, setStudents] = useState([]);
  const [activeAttendances, setActiveAttendances] = useState([]);
  const [inactiveAttendances, setInactiveAttendances] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editAttendance, setEditAttendance] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newAttendance, setNewAttendance] = useState({
    studentId: '',
    institutionId: '001',
    classroomId: 'A1',
    date: new Date().toISOString().split('T')[0],
    status: 'PRESENTE',
    active: true,
    justified: false
  });

  const fetchStudents = async () => {
    try {
      const res = await fetch('https://lab.vallegrande.edu.pe/school/ms-attendance/students');
      if (!res.ok) throw new Error('Failed to fetch students');
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error(err.message);
    }
  };

  const fetchActiveAttendances = async () => {
    try {
      const res = await fetch('https://lab.vallegrande.edu.pe/school/ms-attendance/attendances');
      if (!res.ok) throw new Error('Failed to fetch active attendances');
      const data = await res.json();
      const combined = data.map(att => {
        const student = students.find(s => s.id === att.studentId);
        return {
          ...att,
          studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown Student',
        };
      });
      setActiveAttendances(combined);
    } catch (err) {
      console.error(err.message);
    }
  };

  const fetchInactiveAttendances = async () => {
    try {
      const res = await fetch('https://lab.vallegrande.edu.pe/school/ms-attendance/attendances/inactive');
      if (!res.ok) throw new Error('Failed to fetch inactive attendances');
      const data = await res.json();
      const combined = data.map(att => {
        const student = students.find(s => s.id === att.studentId);
        return {
          ...att,
          studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown Student',
        };
      });
      setInactiveAttendances(combined);
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (students.length > 0) {
      fetchActiveAttendances();
      fetchInactiveAttendances();
    }
  }, [students]);

  const createAttendance = async (attendanceData) => {
    try {
      const res = await fetch('https://lab.vallegrande.edu.pe/school/ms-attendance/attendances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attendanceData)
      });

      if (!res.ok) throw new Error('Failed to create attendance');

      const created = await res.json();
      setActiveAttendances(prev => [...prev, created]);

      setShowForm(false);
      setNewAttendance({
        studentId: '',
        institutionId: '001',
        classroomId: 'A1',
        date: new Date().toISOString().split('T')[0],
        status: 'PRESENTE',
        active: true,
        justified: false
      });
    } catch (err) {
      console.error('Error creating attendance:', err.message);
    }
  };

  const refreshData = async () => {
    await fetchActiveAttendances();
    await fetchInactiveAttendances();
  };

  const deleteAttendance = async (id) => {
    try {
      const response = await fetch(`https://lab.vallegrande.edu.pe/school/ms-attendance/attendances/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete attendance');
      }

      setActiveAttendances(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting attendance:', error.message);
    }
  };

  const restoreAttendance = async (id) => {
    try {
      const response = await fetch(`https://lab.vallegrande.edu.pe/school/ms-attendance/attendance/${id}/restore`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to restore attendance');
      }

      // Update both active and inactive lists
      setInactiveAttendances(prev => prev.filter(a => a.id !== id));
      const responseActive = await fetch('https://lab.vallegrande.edu.pe/school/ms-attendance/attendances');
      if (!responseActive.ok) throw new Error('Failed to fetch updated active attendances');
      const data = await responseActive.json();
      const combined = data.map(att => {
        const student = students.find(s => s.id === att.studentId);
        return {
          ...att,
          studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown Student',
        };
      });
      setActiveAttendances(combined);
    } catch (error) {
      console.error('Error restoring attendance:', error.message);
    }
  };

  const filterAttendances = (term) => {
    const filtered = activeAttendances.filter(a =>
      a.studentName?.toLowerCase().includes(term.toLowerCase()) ||
      a.studentId?.toLowerCase().includes(term.toLowerCase()) ||
      a.classroomId?.toLowerCase().includes(term.toLowerCase()) ||
      a.date?.toLowerCase().includes(term.toLowerCase()) ||
      a.status?.toLowerCase().includes(term.toLowerCase()) ||
      a.institutionId?.toLowerCase().includes(term.toLowerCase())
    );
    setActiveAttendances(filtered);
  };

  return (
    <Fragment>
      <div className="main-wrapper">
        <Header />
        <Sidebar id="menu-item3" id1="menu-items3" activeClassName="attendance" />
        <div className="page-wrapper">
          <div className="content">
            <div className="page-header">
              <div className="row">
                <div className="col-sm-12">
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="#">Staffs</Link></li>
                    <li className="breadcrumb-item">Attendance</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header d-flex justify-content-between">
                <h4 className="card-title">Attendance Records</h4>
                <div>
                  <button className="btn btn-primary me-2" onClick={() => setShowForm(true)}>Create Attendance</button>
                  <button className="btn btn-light" onClick={refreshData}>
                    <FontAwesomeIcon icon={faSyncAlt} /> Refresh
                  </button>
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
                {showForm && (
                  <AttendanceForm
                    newAttendance={newAttendance}
                    setNewAttendance={setNewAttendance}
                    createAttendance={createAttendance}
                    setShowForm={setShowForm}
                    students={students}
                  />
                )}
                {showEditForm && editAttendance && (
                  <EditAttendanceForm
                    attendance={editAttendance}
                    onEdit={(updated) => {
                      setActiveAttendances(prev =>
                        prev.map(a => a.id === updated.id ? updated : a)
                      );
                    }}
                    onClose={() => {
                      setEditAttendance(null);
                      setShowEditForm(false);
                    }}
                    students={students}
                  />
                )}

                <div className="input-group mb-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search attendances..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      filterAttendances(e.target.value);
                    }}
                  />
                  <button className="btn btn-outline-secondary" onClick={() => setSearchTerm('')}>Clear</button>
                </div>

                <div className="tab-content">
                  <div className="tab-pane fade show active" id="active-tab">
                    <div className="table-responsive">
                      <table className="table table-hover table-center mb-0">
                        <thead>
                          <tr>
                            <th>Student Name</th>
                            <th>Student ID</th>
                            <th>Classroom</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Institution</th>
                            <th>Active</th>
                            <th>Justified</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeAttendances.map((attendance) => (
                            <tr key={attendance.id}>
                              <td>{attendance.studentName}</td>
                              <td>{attendance.studentId}</td>
                              <td>{attendance.classroomId}</td>
                              <td>{attendance.date}</td>
                              <td><span className={`badge ${getStatusClass(attendance.status)}`}>{attendance.status}</span></td>
                              <td>{attendance.institutionId || 'N/A'}</td>
                              <td><span className={`badge ${attendance.active ? 'bg-success' : 'bg-danger'}`}>{attendance.active ? 'Yes' : 'No'}</span></td>
                              <td><span className={`badge ${attendance.justified ? 'bg-success' : 'bg-danger'}`}>{attendance.justified ? 'Yes' : 'No'}</span></td>
                              <td>
                                <button
                                  className="btn btn-sm btn-primary me-2"
                                  onClick={() => {
                                    setEditAttendance(attendance);
                                    setShowEditForm(true);
                                  }}
                                >
                                  <i className="bi bi-pencil"></i> Edit
                                </button>
                                <button 
  className="btn btn-sm btn-danger" 
  onClick={() => {
    const confirmDelete = confirm('¿Estás seguro de que quieres eliminar esta asistencia?');
    if (confirmDelete) {
      deleteAttendance(attendance.id);
    }
  }}
>
  <i className="bi bi-trash"></i> Delete
</button>
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
                            <th>Student Name</th>
                            <th>Student ID</th>
                            <th>Classroom</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Institution</th>
                            <th>Active</th>
                            <th>Justified</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inactiveAttendances.map((attendance) => (
                            <tr key={attendance.id}>
                              <td>{attendance.studentName}</td>
                              <td>{attendance.studentId}</td>
                              <td>{attendance.classroomId}</td>
                              <td>{attendance.date}</td>
                              <td><span className={`badge ${getStatusClass(attendance.status)}`}>{attendance.status}</span></td>
                              <td>{attendance.institutionId || 'N/A'}</td>
                              <td><span className={`badge ${attendance.active ? 'bg-success' : 'bg-danger'}`}>{attendance.active ? 'Yes' : 'No'}</span></td>
                              <td><span className={`badge ${attendance.justified ? 'bg-success' : 'bg-danger'}`}>{attendance.justified ? 'Yes' : 'No'}</span></td>
                              <td>
                                <button
                                  className="btn btn-sm btn-primary me-2"
                                  onClick={() => {
                                    setEditAttendance(attendance);
                                    setShowEditForm(true);
                                  }}
                                >
                                  <i className="bi bi-pencil"></i> Edit
                                </button>
                                <button 
  className="btn btn-sm btn-success me-2" 
  onClick={() => {
    const confirmRestore = confirm('¿Estás seguro de que quieres restaurar esta asistencia?');
    if (confirmRestore) {
      restoreAttendance(attendance.id);
    }
  }}
>
  <i className="bi bi-arrow-counterclockwise"></i> Restore
</button>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => deleteAttendance(attendance.id)}
                                >
                                  <i className="bi bi-trash"></i> Delete
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
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Attendence;