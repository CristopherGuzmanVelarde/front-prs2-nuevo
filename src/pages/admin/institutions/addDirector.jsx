/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Select, Button, Checkbox, Row, Col, Card, message, Spin } from 'antd';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import InstitutionService from '../../../services/institutionService';

const { Option } = Select;

const AddDirector = () => {
  const { id } = useParams(); // ID de la institución
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [institutionName, setInstitutionName] = useState('');
  const [form] = Form.useForm();

  // Cargar información de la institución
  useEffect(() => {
    loadInstitutionData();
  }, [id]);

  const loadInstitutionData = async () => {
    try {
      setLoading(true);
      const institutionData = await InstitutionService.getInstitutionById(id);
      setInstitutionName(institutionData.institutionName);
    } catch (error) {
      message.error('Error al cargar la información de la institución');
      console.error('Error loading institution:', error);
    } finally {
      setLoading(false);
    }
  };

  // Valores iniciales del formulario
  const initialValues = {
    firstName: '',
    lastName: '',
    documentType: 'DNI',
    documentNumber: '',
    email: '',
    phone: '',
    password: '',
    userName: '',
    role: 'DIRECTOR',
    view: 'DEFAULT',
    status: 'ACTIVE',
    permissions: ['CREAR', 'VER', 'EDITAR', 'ELIMINAR', 'RESTAURAR']
  };

  // Manejar el envío del formulario
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      console.log('Enviando datos del director:', values);
      await InstitutionService.assignDirector(id, values);
      message.success('Director agregado correctamente');
      navigate(`/institution-directors/${id}`);
    } catch (error) {
      message.error(`Error al agregar director: ${error.message}`);
      console.error('Error submitting director data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/institution-directors/${id}`);
  };

  return (
    <>
      <Header />
      <Sidebar id='menu-item2' id1='menu-items2' activeClassName='institutions-list' />
      <div className="page-wrapper">
        <div className="content">
          {/* Page Header */}
          <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/admin">Administración </Link>
                  </li>
                  <li className="breadcrumb-item">
                    <i className="feather-chevron-right" />
                  </li>
                  <li className="breadcrumb-item">
                    <Link to="/institution">Instituciones</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <i className="feather-chevron-right" />
                  </li>
                  <li className="breadcrumb-item">
                    <Link to={`/institution-directors/${id}`}>Directores</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <i className="feather-chevron-right" />
                  </li>
                  <li className="breadcrumb-item active">Agregar Director</li>
                </ul>
              </div>
            </div>
          </div>
          {/* /Page Header */}

          <div className="row">
            <div className="col-sm-12">
              <div className="card">
                <div className="card-body">
                  <div className="card-header">
                    <h4 className="card-title">Agregar Director a {institutionName}</h4>
                  </div>

                  {loading ? (
                    <div className="text-center py-4">
                      <Spin size="large" />
                      <p className="mt-2">Cargando...</p>
                    </div>
                  ) : (
                    <Form
                      layout="vertical"
                      form={form}
                      initialValues={initialValues}
                      onFinish={handleSubmit}
                      className="mt-4"
                    >
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            name="firstName"
                            label="Nombres"
                            rules={[
                              {
                                required: true,
                                message: 'Por favor ingrese los nombres',
                              },
                            ]}
                          >
                            <Input placeholder="Ingrese los nombres" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name="lastName"
                            label="Apellidos"
                            rules={[
                              {
                                required: true,
                                message: 'Por favor ingrese los apellidos',
                              },
                            ]}
                          >
                            <Input placeholder="Ingrese los apellidos" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col span={8}>
                          <Form.Item
                            name="documentType"
                            label="Tipo de Documento"
                            rules={[
                              {
                                required: true,
                                message: 'Por favor seleccione el tipo de documento',
                              },
                            ]}
                          >
                            <Select placeholder="Seleccione un tipo">
                              <Option value="DNI">DNI</Option>
                              <Option value="CNE">Carné de Extranjería</Option>
                              <Option value="PASSPORT">Pasaporte</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={16}>
                          <Form.Item
                            name="documentNumber"
                            label="Número de Documento"
                            rules={[
                              {
                                required: true,
                                message: 'Por favor ingrese el número de documento',
                              },
                            ]}
                          >
                            <Input placeholder="Ingrese el número de documento" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            name="email"
                            label="Correo Electrónico"
                            rules={[
                              {
                                required: true,
                                message: 'Por favor ingrese el correo electrónico',
                              },
                              {
                                type: 'email',
                                message: 'El correo electrónico no es válido',
                              },
                            ]}
                          >
                            <Input placeholder="Ingrese el correo electrónico" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name="phone"
                            label="Teléfono"
                            rules={[
                              {
                                required: true,
                                message: 'Por favor ingrese el número telefónico',
                              },
                            ]}
                          >
                            <Input placeholder="Ingrese el número telefónico" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            name="userName"
                            label="Nombre de Usuario"
                            rules={[
                              {
                                required: true,
                                message: 'Por favor ingrese el nombre de usuario',
                              },
                            ]}
                          >
                            <Input placeholder="Ingrese el nombre de usuario" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name="password"
                            label="Contraseña"
                            rules={[
                              {
                                required: true,
                                message: 'Por favor ingrese una contraseña',
                              },
                              {
                                min: 6,
                                message: 'La contraseña debe tener al menos 6 caracteres',
                              },
                            ]}
                          >
                            <Input.Password placeholder="Ingrese la contraseña" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col span={24}>
                          <Form.Item
                            name="permissions"
                            label="Permisos"
                            rules={[
                              {
                                required: true,
                                message: 'Por favor seleccione al menos un permiso',
                              },
                            ]}
                          >
                            <Checkbox.Group style={{ width: '100%' }}>
                              <Row>
                                <Col span={6}>
                                  <Checkbox value="CREAR">CREAR</Checkbox>
                                </Col>
                                <Col span={6}>
                                  <Checkbox value="VER">VER</Checkbox>
                                </Col>
                                <Col span={6}>
                                  <Checkbox value="EDITAR">EDITAR</Checkbox>
                                </Col>
                                <Col span={6}>
                                  <Checkbox value="ELIMINAR">ELIMINAR</Checkbox>
                                </Col>
                                <Col span={6}>
                                  <Checkbox value="RESTAURAR">RESTAURAR</Checkbox>
                                </Col>
                              </Row>
                            </Checkbox.Group>
                          </Form.Item>
                        </Col>
                      </Row>

                      <div className="d-flex justify-content-end mt-4">
                        <Button onClick={handleCancel} style={{ marginRight: 10 }}>
                          Cancelar
                        </Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
                          Guardar
                        </Button>
                      </div>
                    </Form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddDirector;
