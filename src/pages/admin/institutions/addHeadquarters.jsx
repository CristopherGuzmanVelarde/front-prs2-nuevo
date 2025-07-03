/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Row, Col, message, Spin } from 'antd';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import InstitutionService from '../../../services/institutionService';

const AddHeadquarters = () => {
  const { id } = useParams(); // ID de la institución
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
    headquartersName: '',
    headquartersCode: '',
    address: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
  };

  // Manejar el envío del formulario
  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      
      // Agregar el ID de la institución y establecer el estado como activo
      const headquarterData = {
        ...values,
        institutionId: id,
        status: 'A' // Establecer explícitamente como Activo
      };
      
      console.log('Enviando datos de la sede:', headquarterData);
      
      await InstitutionService.createHeadquarter(headquarterData);
      message.success('Sede agregada correctamente');
      navigate(`/institution-headquarters/${id}`);
    } catch (error) {
      message.error(`Error al agregar sede: ${error.message}`);
      console.error('Error submitting headquarter data:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/institution-headquarters/${id}`);
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
                    <Link to={`/institution-headquarters/${id}`}>Sedes</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <i className="feather-chevron-right" />
                  </li>
                  <li className="breadcrumb-item active">Agregar Sede</li>
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
                    <h4 className="card-title">Agregar Sede a {institutionName}</h4>
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
                            name="headquartersName"
                            label="Nombre de la Sede"
                            rules={[
                              {
                                required: true,
                                message: 'El nombre de la sede es obligatorio',
                              },
                              {
                                min: 3,
                                max: 100,
                                message: 'El nombre debe tener entre 3 y 100 caracteres',
                              },
                            ]}
                          >
                            <Input placeholder="Ingrese el nombre de la sede" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name="headquartersCode"
                            label="Código de la Sede"
                            rules={[
                              {
                                required: true,
                                message: 'El código de la sede es obligatorio',
                              },
                              {
                                min: 2,
                                max: 15,
                                message: 'El código debe tener entre 2 y 15 caracteres',
                              },
                            ]}
                          >
                            <Input placeholder="Ingrese el código de la sede" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col span={24}>
                          <Form.Item
                            name="address"
                            label="Dirección"
                            rules={[
                              {
                                required: true,
                                message: 'La dirección no puede estar vacía',
                              },
                            ]}
                          >
                            <Input placeholder="Ingrese la dirección completa" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col span={24}>
                          <Form.Item
                            name="contactPerson"
                            label="Persona de Contacto"
                            rules={[
                              {
                                required: true,
                                message: 'El nombre de la persona de contacto es obligatorio',
                              },
                            ]}
                          >
                            <Input placeholder="Ingrese el nombre de la persona de contacto" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            name="contactEmail"
                            label="Correo Electrónico de Contacto"
                            rules={[
                              {
                                required: true,
                                message: 'El correo de contacto es obligatorio',
                              },
                              {
                                type: 'email',
                                message: 'Formato de correo inválido',
                              },
                            ]}
                          >
                            <Input placeholder="Ingrese el correo electrónico" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name="contactPhone"
                            label="Teléfono de Contacto"
                            rules={[
                              {
                                required: false,
                              },
                              {
                                pattern: /^[0-9]{9,12}$/,
                                message: 'El teléfono debe contener entre 9 y 12 dígitos',
                              },
                            ]}
                          >
                            <Input placeholder="Ingrese el número telefónico" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <div className="d-flex justify-content-end mt-4">
                        <Button onClick={handleCancel} style={{ marginRight: 10 }}>
                          Cancelar
                        </Button>
                        <Button type="primary" htmlType="submit" loading={submitting}>
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

export default AddHeadquarters;
