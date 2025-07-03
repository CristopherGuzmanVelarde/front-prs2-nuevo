import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Tag, Avatar } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { studentService } from '../../services';
import moment from 'moment';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { 
  UserOutlined, 
  IdcardOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  HomeOutlined, 
  CalendarOutlined,
  QrcodeOutlined,
  EditOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import './StudentProfile.css';

const StudentProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudent();
  }, [id]);

  const loadStudent = async () => {
    try {
      const data = await studentService.getStudentById(id);
      setStudent(data);
    } catch (error) {
      console.error('Error al cargar el estudiante:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!student) {
    return <div>No se encontró el estudiante</div>;
  }

  return (
    <>
      <Header />
      <Sidebar activeClassName="student-list" />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="profile-header">
            <Button 
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/studentlist')}
              className="back-button"
            >
              Volver
            </Button>
          </div>

          <div className="profile-container">
            <div className="profile-banner">
              <div className="profile-avatar-container">
                <Avatar 
                  size={120} 
                  icon={<UserOutlined />} 
                  className="profile-avatar"
                />
                <div className="profile-main-info">
                  <h2>{student.firstName} {student.lastName}</h2>
                  <Tag color={student.status === 'A' ? 'success' : 'error'} className="status-tag">
                    {student.status === 'A' ? 'Activo' : 'Inactivo'}
                  </Tag>
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => navigate(`/editstudent/${student.id}`)}
                    className="edit-button"
                  >
                    Editar Perfil
                  </Button>
                </div>
              </div>
            </div>

            <Row gutter={[24, 24]} className="profile-content">
              <Col xs={24} lg={12}>
                <Card 
                  title={
                    <div className="card-title">
                      <UserOutlined className="card-icon" />
                      <span>Información Personal</span>
                    </div>
                  }
                  className="profile-card"
                >
                  <div className="info-grid">
                    <div className="info-item">
                      <IdcardOutlined className="info-icon" />
                      <div>
                        <label>Documento</label>
                        <p>{student.documentType} - {student.documentNumber}</p>
                      </div>
                    </div>
                    <div className="info-item">
                      <CalendarOutlined className="info-icon" />
                      <div>
                        <label>Fecha de Nacimiento</label>
                        <p>{moment(student.birthDate).format('DD/MM/YYYY')}</p>
                      </div>
                    </div>
                    <div className="info-item">
                      <MailOutlined className="info-icon" />
                      <div>
                        <label>Email</label>
                        <p>{student.email}</p>
                      </div>
                    </div>
                    <div className="info-item">
                      <PhoneOutlined className="info-icon" />
                      <div>
                        <label>Teléfono</label>
                        <p>{student.phone}</p>
                      </div>
                    </div>
                    <div className="info-item">
                      <HomeOutlined className="info-icon" />
                      <div>
                        <label>Dirección</label>
                        <p>{student.address}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card 
                  title={
                    <div className="card-title">
                      <QrcodeOutlined className="card-icon" />
                      <span>Información Institucional</span>
                    </div>
                  }
                  className="profile-card"
                >
                  <div className="info-grid">
                    <div className="info-item">
                      <IdcardOutlined className="info-icon" />
                      <div>
                        <label>ID Institución</label>
                        <p>{student.institutionId}</p>
                      </div>
                    </div>
                    <div className="info-item">
                      <QrcodeOutlined className="info-icon" />
                      <div>
                        <label>Código QR</label>
                        <p>{student.nameQr}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentProfile; 