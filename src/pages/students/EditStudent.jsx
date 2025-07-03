import React, { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, Button, Card, Spin } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { studentService } from '../../services';
import institutionService from '../../services/institution.service';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import CustomAlert from '../common/CustomAlert';
import dayjs from 'dayjs';

const { Option } = Select;

const EditStudent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [documentType, setDocumentType] = useState('DNI');
  const [institutions, setInstitutions] = useState([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);
  const [alert, setAlert] = useState({
    show: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null
  });

  useEffect(() => {
    const loadInstitutions = async () => {
      try {
        const data = await institutionService.getAllInstitutions();
        setInstitutions(data);
      } catch (error) {
        console.error('Error al cargar instituciones:', error);
        showAlert({
          title: 'Error',
          message: 'Error al cargar las instituciones',
          type: 'error',
          showCancel: false
        });
      } finally {
        setLoadingInstitutions(false);
      }
    };

    loadInstitutions();
  }, []);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoadingData(true);
        const data = await studentService.getStudentById(id);
        if (!data) {
          showAlert({
            title: 'Error',
            message: 'No se encontró el estudiante',
            type: 'error',
            showCancel: false
          });
          navigate('/studentlist');
          return;
        }
        setDocumentType(data.documentType);
        setInitialValues({
          ...data,
          birthDate: dayjs(data.birthDate)
        });
        form.setFieldsValue({
          ...data,
          birthDate: dayjs(data.birthDate)
        });
      } catch (error) {
        console.error('Error al cargar el estudiante:', error);
        showAlert({
          title: 'Error',
          message: 'Error al cargar los datos del estudiante',
          type: 'error',
          showCancel: false
        });
        navigate('/studentlist');
      } finally {
        setLoadingData(false);
      }
    };
    fetchStudent();
  }, [id, form, navigate]);

  const validateNames = (_, value) => {
    if (!value) {
      return Promise.reject('Este campo es requerido');
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
      return Promise.reject('Solo se permiten letras y espacios');
    }
    return Promise.resolve();
  };

  const validateDocument = (_, value) => {
    if (!value) {
      return Promise.reject('El número de documento es requerido');
    }
    if (documentType === 'DNI') {
      if (!/^\d{8}$/.test(value)) {
        return Promise.reject('El DNI debe tener 8 dígitos');
      }
    } else if (documentType === 'CE') {
      if (!/^\d{9,12}$/.test(value)) {
        return Promise.reject('El CE debe tener entre 9 y 12 dígitos');
      }
    }
    return Promise.resolve();
  };

  const validatePhone = (_, value) => {
    if (!value) {
      return Promise.reject('El teléfono es requerido');
    }
    if (!/^9\d{8}$/.test(value)) {
      return Promise.reject('El teléfono debe empezar con 9 y tener 9 dígitos');
    }
    return Promise.resolve();
  };

  const showAlert = (config) => {
    setAlert({ ...config, show: true });
  };

  const hideAlert = () => {
    setAlert(prev => ({ ...prev, show: false }));
  };

  const handleUpdate = async (values) => {
    setLoading(true);
    try {
      const studentData = {
        ...values,
        birthDate: values.birthDate.format('YYYY-MM-DD'),
        nameQr: `${values.firstName}_${values.lastName}_${values.documentNumber}`,
        status: initialValues.status
      };

      await studentService.updateStudent(id, studentData);
      showAlert({
        title: 'Éxito',
        message: 'Estudiante actualizado correctamente',
        type: 'success',
        showCancel: false,
        autoClose: true,
        onConfirm: () => navigate('/studentlist')
      });
    } catch (error) {
      console.error('Error al actualizar:', error);
      showAlert({
        title: 'Error',
        message: error.message || 'Error al actualizar el estudiante',
        type: 'error',
        showCancel: false
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    showAlert({
      title: 'Confirmación',
      message: '¿Está seguro de cancelar la edición?',
      type: 'warning',
      showCancel: true,
      onConfirm: () => navigate('/studentlist'),
      onCancel: hideAlert
    });
  };

  if (loadingData || loadingInstitutions) {
    return (
      <>
        <Header />
        <Sidebar activeClassName="edit-student" />
        <div className="page-wrapper">
          <div className="content container-fluid">
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Spin size="large" />
              <p style={{ marginTop: '20px' }}>Cargando datos...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <Sidebar activeClassName="edit-student" />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row">
              <div className="col">
                <h3 className="page-title">Editar Estudiante</h3>
              </div>
            </div>
          </div>

          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdate}
              initialValues={initialValues}
            >
              <div className="row">
                <div className="col-md-12">
                  <Form.Item
                    name="institutionId"
                    label="Institución"
                    rules={[{ required: true, message: 'Por favor seleccione una institución' }]}
                  >
                    <Select
                      placeholder="Seleccione una institución"
                      loading={loadingInstitutions}
                    >
                      {institutions.map(institution => (
                        <Option key={institution.id} value={institution.id}>
                          {institution.institutionName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <Form.Item
                    name="firstName"
                    label="Nombre"
                    rules={[{ validator: validateNames }]}
                  >
                    <Input />
                  </Form.Item>
                </div>
                <div className="col-md-6">
                  <Form.Item
                    name="lastName"
                    label="Apellido"
                    rules={[{ validator: validateNames }]}
                  >
                    <Input />
                  </Form.Item>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <Form.Item
                    name="documentType"
                    label="Tipo de Documento"
                    rules={[{ required: true, message: 'El tipo de documento es requerido' }]}
                  >
                    <Select onChange={value => setDocumentType(value)}>
                      <Option value="DNI">DNI</Option>
                      <Option value="CE">Carné de Extranjería</Option>
                    </Select>
                  </Form.Item>
                </div>
                <div className="col-md-6">
                  <Form.Item
                    name="documentNumber"
                    label="Número de Documento"
                    rules={[{ validator: validateDocument }]}
                  >
                    <Input maxLength={documentType === 'DNI' ? 8 : 12} />
                  </Form.Item>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <Form.Item
                    name="gender"
                    label="Género"
                    rules={[{ required: true, message: 'El género es requerido' }]}
                  >
                    <Select>
                      <Option value="M">Masculino</Option>
                      <Option value="F">Femenino</Option>
                    </Select>
                  </Form.Item>
                </div>
                <div className="col-md-6">
                  <Form.Item
                    name="birthDate"
                    label="Fecha de Nacimiento"
                    rules={[{ required: true, message: 'La fecha de nacimiento es requerida' }]}
                  >
                    <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                  </Form.Item>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'El email es requerido' },
                      { type: 'email', message: 'Ingrese un email válido' }
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </div>
                <div className="col-md-6">
                  <Form.Item
                    name="phone"
                    label="Teléfono"
                    rules={[{ validator: validatePhone }]}
                  >
                    <Input maxLength={9} />
                  </Form.Item>
                </div>
              </div>

              <div className="row">
                <div className="col-md-12">
                  <Form.Item
                    name="address"
                    label="Dirección"
                    rules={[{ required: true, message: 'La dirección es requerida' }]}
                  >
                    <Input />
                  </Form.Item>
                </div>
              </div>

              <div className="form-actions">
                <Button type="primary" onClick={form.submit} loading={loading}>
                  Guardar Cambios
                </Button>
                <Button className="cancel-button" onClick={handleCancel}>
                  Cancelar
                </Button>
              </div>
            </Form>
          </Card>
        </div>
      </div>
      <CustomAlert
        show={alert.show}
        onClose={hideAlert}
        onConfirm={alert.onConfirm}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        showCancel={alert.showCancel}
        autoClose={alert.autoClose}
      />
    </>
  );
};

export default EditStudent;