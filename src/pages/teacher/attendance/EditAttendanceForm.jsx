import React from 'react';
import PropTypes from 'prop-types';
import 'react-calendar/dist/Calendar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const EditAttendanceForm = ({ attendance, onEdit, onClose, students }) => {
  const [editAttendance, setEditAttendance] = React.useState(attendance);

  React.useEffect(() => {
    setEditAttendance(attendance);
  }, [attendance]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    const specialCharRegex = /[^a-zA-Z0-9\\s]/;

    if (!editAttendance.studentId || !editAttendance.status || !editAttendance.date ||
        !editAttendance.classroomId || !editAttendance.institutionId) {
      alert('Todos los campos son obligatorios');
      return;
    }

    if (specialCharRegex.test(editAttendance.classroomId) || specialCharRegex.test(editAttendance.institutionId)) {
      alert('Los campos Classroom e Institution no deben contener caracteres especiales');
      return;
    }

    // Mensaje de confirmación antes de actualizar
    const confirmUpdate = confirm('¿Estás seguro de que deseas actualizar esta asistencia?');
    if (!confirmUpdate) {
      return;
    }

    try {
      const response = await fetch(`https://lab.vallegrande.edu.pe/school/ms-attendance/attendances/${attendance.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editAttendance),
      });

      if (!response.ok) {
        throw new Error('Failed to update attendance');
      }

      await response.json();
      alert('Asistencia actualizada correctamente');
      onEdit(editAttendance);
      onClose();
    } catch (error) {
      alert('Error al actualizar la asistencia: ' + error.message);
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h5 className="card-title mb-0">Edit Attendance</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Student</label>
                <select
                  className="form-select"
                  value={editAttendance.studentId}
                  onChange={(e) => setEditAttendance(prev => ({
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
                  value={editAttendance.status}
                  onChange={(e) => setEditAttendance(prev => ({
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
                  value={editAttendance.date}
                  onChange={(e) => setEditAttendance(prev => ({
                    ...prev,
                    date: e.target.value
                  }))}
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
                  value={editAttendance.classroomId}
                  onChange={(e) => setEditAttendance(prev => ({
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
                  value={editAttendance.institutionId}
                  onChange={(e) => setEditAttendance(prev => ({
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
                  value={editAttendance.active}
                  onChange={(e) => setEditAttendance(prev => ({
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
                  value={editAttendance.justified}
                  onChange={(e) => setEditAttendance(prev => ({
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
            <button 
              type="button" 
              className="btn btn-secondary me-2" 
              onClick={() => {
                const confirmCancel = confirm('¿Estás seguro de que deseas cancelar? Se perderán los cambios.');
                if (confirmCancel) {
                  onClose();
                }
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">Update Attendance</button>
          </div>
        </form>
      </div>
    </div>
  );
};

EditAttendanceForm.propTypes = {
  attendance: PropTypes.shape({
    id: PropTypes.string.isRequired,
    studentId: PropTypes.string,
    status: PropTypes.string,
    date: PropTypes.string,
    classroomId: PropTypes.string,
    institutionId: PropTypes.string,
    active: PropTypes.bool,
    justified: PropTypes.bool
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  students: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired
    })
  ).isRequired
};

export default EditAttendanceForm;