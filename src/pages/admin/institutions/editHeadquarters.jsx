/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Row, Col, message, Spin } from 'antd';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import InstitutionService from '../../../services/institutionService';

const EditHeadquarters = () => {
  const { id } = useParams(); // ID de la sede
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [headquarter, setHeadquarter] = useState(null);
  const [institutionId, setInstitutionId] = useState(null);
  const [form] = Form.useForm();

  // Cargar información de la sede
  useEffect(() => {
    loadHeadquarterData();
  }, [id]);

  const loadHeadquarterData = async () => {
    try {
      setLoading(true);
      const headquarterData = await InstitutionService.getHeadquarterById(id);
      setHeadquarter(headquarterData);
      setInstitutionId(headquarterData.institutionId);
      
      console.log('Headquarter data loaded:', headquarterData);
      
      // Inicializar el formulario con los datos de la sede
      form.setFieldsValue({
        headquartersName: headquarterData.headquartersName,
        headquartersCode: headquarterData.headquartersCode,
        address: headquarterData.address,
        contactPerson: headquarterData.contactPerson,
        contactEmail: headquarterData.contactEmail,
        contactPhone: headquarterData.contactPhone,
      });
    } catch (error) {
      message.error('Error al cargar la información de la sede');
      console.error('Error loading headquarter:', error);
    } finally {
      setLoading(false);
    }
  };

  // Manejar el envío del formulario
  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      
      // Asegurar que mantenemos el ID de la institución y el estado
      const headquarterData = {
        ...values,
        institutionId: institutionId,
        status: headquarter.status || 'A' // Mantener el estado actual o establecer 'A' si no existe
      };
      
      console.log('Enviando datos actualizados de la sede:', headquarterData);
      
      await InstitutionService.updateHeadquarter(id, headquarterData);
      message.success('Sede actualizada correctamente');
      navigate(`/institution-headquarters/${institutionId}`);
    } catch (error) {
      message.error(`Error al actualizar sede: ${error.message}`);
      console.error('Error submitting updated headquarter data:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/institution-headquarters/${institutionId}`);
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
                    {institutionId && (
                      <Link to={`/institution-headquarters/${institutionId}`}>Sedes</Link>
                    )}
                    {!institutionId && <span>Sedes</span>}
                  </li>
                  <li className="breadcrumb-item">
                    <i className="feather-chevron-right" />
                  </li>
                  <li className="breadcrumb-item active">Editar Sede</li>
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
                    <h4 className="card-title">
                      {loading ? 'Cargando...' : `Editar Sede: ${headquarter?.headquartersName}`}
                    </h4>
                  </div>

                  {loading ? (
                    <div className="text-center py-4">
                      <Spin size="large" />
                      <p className="mt-2">Cargando información de la sede...</p>
                    </div>
                  ) : (
                    <Form
                      layout="vertical"
                      form={form}
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
                          Guardar Cambios
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

export default EditHeadquarters;
