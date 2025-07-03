import React from 'react';
import PropTypes from 'prop-types';
import 'react-calendar/dist/Calendar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const AttendanceForm = ({ newAttendance, setNewAttendance, createAttendance, setShowForm, students }) => {

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validaciones básicas
    const specialCharRegex = /[^a-zA-Z0-9\\s]/;

    if (!newAttendance.studentId || !newAttendance.status || !newAttendance.date ||
        !newAttendance.classroomId || !newAttendance.institutionId) {
      alert('Todos los campos son obligatorios.');
      return;
    }
    // Validar que la fecha no sea anterior a hoy
    const today = new Date().toISOString().split('T')[0];
    if (newAttendance.date < today) {
      alert('No puedes registrar una asistencia con fecha pasada.');
      return;
    }

    if (specialCharRegex.test(newAttendance.classroomId) || specialCharRegex.test(newAttendance.institutionId)) {
      alert('Los campos "Classroom" e "Institution" no deben contener caracteres especiales.');
      return;
    }

    // Validar formato de fecha (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(newAttendance.date)) {
      alert('La fecha no tiene un formato válido (YYYY-MM-DD).');
      return;
    }

    // Crear asistencia
    createAttendance(newAttendance);
    alert('Asistencia registrada correctamente.');
    setShowForm(false);
  };

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h5 className="card-title mb-0">Create New Attendance</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Student</label>
                <select
                  className="form-select"
                  value={newAttendance.studentId}
                  onChange={(e) => setNewAttendance(prev => ({
                    ...prev,
                    studentId: e.target.value
                  }))}
                  required
                >
                  <option value="">Select a student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.firstName} {student.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-md-3">
              <div className="mb-3">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={newAttendance.status}
                  onChange={(e) => setNewAttendance(prev => ({
                    ...prev,
                    status: e.target.value
                  }))}
                  required
                >
                  <option value="PRESENTE">Present</option>
                  <option value="TARDE">Late</option>
                  <option value="AUSENTE">Absent</option>
                </select>
              </div>
            </div>
            <div className="col-md-3">
              <div className="mb-3">
                <label className="form-label">Date</label>
                <input
  type="date"
  className="form-control"
  value={newAttendance.date}
  onChange={(e) => setNewAttendance(prev => ({
    ...prev,
    date: e.target.value
  }))}
  min={new Date().toISOString().split('T')[0]}
  max={new Date().toISOString().split('T')[0]}
  required
/>


              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Classroom</label>
                <input
                  type="text"
                  className="form-control"
                  value={newAttendance.classroomId}
                  onChange={(e) => setNewAttendance(prev => ({
                    ...prev,
                    classroomId: e.target.value
                  }))}
                  required
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="mb-3">
                <label className="form-label">Institution</label>
                <input
                  type="text"
                  className="form-control"
                  value={newAttendance.institutionId}
                  onChange={(e) => setNewAttendance(prev => ({
                    ...prev,
                    institutionId: e.target.value
                  }))}
                  required
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="mb-3">
                <label className="form-label">Active</label>
                <select
                  className="form-select"
                  value={newAttendance.active}
                  onChange={(e) => setNewAttendance(prev => ({
                    ...prev,
                    active: e.target.value === 'true'
                  }))}
                  required
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-3">
              <div className="mb-3">
                <label className="form-label">Justified</label>
                <select
                  className="form-select"
                  value={newAttendance.justified}
                  onChange={(e) => setNewAttendance(prev => ({
                    ...prev,
                    justified: e.target.value === 'true'
                  }))}
                  required
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
            </div>
          </div>
          <div className="d-flex justify-content-end">
            <button type="button" className="btn btn-secondary me-2" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Attendance</button>
          </div>
        </form>
      </div>
    </div>
  );
};

AttendanceForm.propTypes = {
  newAttendance: PropTypes.shape({
    studentId: PropTypes.string,
    status: PropTypes.string,
    date: PropTypes.string,
    classroomId: PropTypes.string,
    institutionId: PropTypes.string,
    active: PropTypes.bool,
    justified: PropTypes.bool
  }).isRequired,
  setNewAttendance: PropTypes.func.isRequired,
  createAttendance: PropTypes.func.isRequired,
  setShowForm: PropTypes.func.isRequired,
  students: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired
    })
  ).isRequired
};

export default AttendanceForm;