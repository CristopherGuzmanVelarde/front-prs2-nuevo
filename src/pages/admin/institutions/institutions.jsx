/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Table, message, Spin } from "antd";
import { Link } from 'react-router-dom';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import { itemRender, onShowSizeChange } from '../../../components/Pagination';
import { blogimg10, imagesend, pdficon, pdficon3, pdficon4, plusicon, refreshicon, searchnormal, blogimg12,
     blogimg2, blogimg4, blogimg6, blogimg8} from '../../../components/imagepath';
import InstitutionService from '../../../services/institutionService';
import Institution from '../../../types/institution';
const InstitutionsAll = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [operatingInstitution, setOperatingInstitution] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Cargar instituciones al montar el componente
    useEffect(() => {
        loadInstitutions();
    }, []);

    const loadInstitutions = async () => {
        try {
            console.log('Loading institutions...');
            setLoading(true);
            const institutionsData = await InstitutionService.getAllInstitutions();
            console.log('Institutions loaded:', institutionsData.length, 'items');
            setInstitutions(institutionsData);
            console.log('State updated with new institutions');
        } catch (error) {
            message.error('Error al cargar las instituciones');
            console.error('Error loading institutions:', error);
        } finally {
            setLoading(false);
            console.log('Loading finished');
        }
    };

    const onSelectChange = (newSelectedRowKeys) => {
        console.log("selectedRowKeys changed: ", selectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleRefresh = () => {
        loadInstitutions();
        setSearchTerm('');
    };

    const handleDelete = async (institutionId) => {
        try {
            // Prevenir múltiples clics mientras se procesa
            if (operatingInstitution === institutionId) return;
            
            setOperatingInstitution(institutionId);
            
            // Buscar la institución para conocer su estado actual
            const institution = institutions.find(inst => inst.id === institutionId);
            
            if (!institution) {
                message.error('Institución no encontrada');
                setOperatingInstitution(null);
                return;
            }

            const isActive = institution.status === 'A';
            console.log(`Institution ${institutionId} current status: ${institution.status}, isActive: ${isActive}`);

            if (isActive) {
                // Si está activa, inactivarla (DELETE)
                console.log('Calling deleteInstitution...');
                const success = await InstitutionService.deleteInstitution(institutionId);
                
                if (success) {
                    // Actualizar el estado local inmediatamente
                    setInstitutions(prevInstitutions => 
                        prevInstitutions.map(inst => 
                            inst.id === institutionId 
                                ? new Institution({ ...inst, status: 'I' })
                                : inst
                        )
                    );
                    
                    message.success('Institución inactivada correctamente');
                }
            } else {
                // Si está inactiva, restaurarla (restore)
                console.log('Calling restoreInstitution...');
                const restoredInstitution = await InstitutionService.restoreInstitution(institutionId);
                
                // Actualizar el estado local con los datos actualizados del servidor
                setInstitutions(prevInstitutions => 
                    prevInstitutions.map(inst => 
                        inst.id === institutionId 
                            ? restoredInstitution
                            : inst
                    )
                );
                
                message.success('Institución activada correctamente');
            }
            
            console.log('Institution status updated locally');
            
        } catch (error) {
            const institution = institutions.find(inst => inst.id === institutionId);
            const action = institution?.status === 'A' ? 'inactivar' : 'activar';
            message.error(`Error al ${action} la institución: ${error.message || 'Error de conexión con el servidor'}`);
            console.error('Error updating institution status:', error);
            // En caso de error, recargar las instituciones para mantener la sincronización con el servidor
            if (institution) {
                await loadInstitutions();
            }
        } finally {
            // Siempre limpiar el estado de operación, sin importar si hubo éxito o error
            setOperatingInstitution(null);
        }
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    // Filtrar instituciones basado en el término de búsqueda
    const filteredInstitutions = institutions.filter(institution =>
        institution.institutionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        institution.codeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        institution.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Preparar datos para la tabla
    const datasource = filteredInstitutions.map(institution => ({
        id: institution.id,
        key: institution.id,
        institutionName: institution.institutionName,
        codeName: institution.codeName,
        modularCode: institution.modularCode,
        address: institution.address,
        contactEmail: institution.contactEmail,
        contactPhone: institution.contactPhone,
        status: institution.getStatusText(),
        statusValue: institution.status,
        createdAt: institution.createdAt ? new Date(institution.createdAt).toLocaleDateString() : '',
    }));
    const columns = [
        {
            title: "Institución",
            dataIndex: "institutionName",
            sorter: (a, b) => a.institutionName.localeCompare(b.institutionName),
            render: (text, record) => (
                <>
                    <h2 className="profile-image">
                        <Link to={`/institution/${record.id}`} className="avatar avatar-sm me-2">
                            <div className="avatar-img rounded-circle bg-primary text-white d-flex align-items-center justify-content-center">
                                {record.codeName.charAt(0)}
                            </div>
                        </Link>
                        <Link to={`/institution/${record.id}`}>{record.institutionName}</Link>
                    </h2>
                </>
            )
        },
        {
            title: "Código",
            dataIndex: "codeName",
            sorter: (a, b) => a.codeName.localeCompare(b.codeName)
        },
        {
            title: "Cod.Modular",
            dataIndex: "modularCode",
            sorter: (a, b) => a.modularCode.localeCompare(b.modularCode)
        },
        {
            title: "Dirección",
            dataIndex: "address",
            sorter: (a, b) => a.address.localeCompare(b.address),
            render: (text) => (
                <span title={text}>
                    {text && text.length > 30 ? `${text.substring(0, 30)}...` : text}
                </span>
            )
        },
        {
            title: "Email",
            dataIndex: "contactEmail",
            sorter: (a, b) => a.contactEmail.localeCompare(b.contactEmail),
            render: (text, record) => (
                <Link to={`mailto:${record.contactEmail}`}>{record.contactEmail}</Link>
            )
        },
        {
            title: "Teléfono",
            dataIndex: "contactPhone",
            sorter: (a, b) => a.contactPhone.localeCompare(b.contactPhone),
            render: (text, record) => (
                <Link to={`tel:${record.contactPhone}`}>{record.contactPhone}</Link>
            )
        },
        {
            title: "Estado",
            dataIndex: "status",
            sorter: (a, b) => a.status.localeCompare(b.status),
            render: (text, record) => (
                <span className={`badge ${record.statusValue === 'A' ? 'bg-success' : 'bg-danger'}`}>
                    {record.status}
                </span>
            )
        },
        {
            title: "",
            dataIndex: "actions",
            render: (text, record) => (
                <>
                    <div className="text-end">
                        <div className="dropdown dropdown-action">
                            <Link
                                to="#"
                                className="action-icon dropdown-toggle"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                <i className="fas fa-ellipsis-v" />
                            </Link>
                            <div className="dropdown-menu dropdown-menu-end">
                                <Link className="dropdown-item" to={`/edit-institution/${record.id}`}>
                                    <i className="far fa-edit me-2" />
                                    Editar
                                </Link>
                                <Link className="dropdown-item" to={`/institution-directors/${record.id}`}>
                                    <i className="fas fa-users me-2" />
                                    Directores
                                </Link>
                                <Link className="dropdown-item" to={`/institution-headquarters/${record.id}`}>
                                    <i className="fas fa-building me-2" />
                                    Sedes
                                </Link>
                                <Link 
                                     className="dropdown-item" 
                                     to="#" 
                                     onClick={() => handleDelete(record.id)}
                                     style={{ 
                                        opacity: operatingInstitution === record.id ? 0.6 : 1,
                                        pointerEvents: operatingInstitution === record.id ? 'none' : 'auto'
                                     }}
                                 >
                                     {operatingInstitution === record.id ? (
                                         <>
                                             <i className="fa fa-spinner fa-spin me-2"></i>
                                             Procesando...
                                         </>
                                     ) : (
                                         <>
                                             <i className="fa fa-trash-alt me-2"></i> 
                                             {record.statusValue === 'A' ? 'Inactivar' : 'Activar'}
                                         </>
                                     )}
                                 </Link>
                            </div>
                        </div>
                    </div>
                </>
            ),
        },
    ];


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
              <li className="breadcrumb-item active">Lista de Instituciones</li>
            </ul>
          </div>
        </div>
      </div>
      {/* /Page Header */}
      <div className="row">
        <div className="col-sm-12">
          <div className="card card-table show-entire">
            <div className="card-body">
              {/* Table Header */}
              <div className="page-table-header mb-2">
                <div className="row align-items-center">
                  <div className="col">
                    <div className="doctor-table-blk">
                      <h3>Lista de Instituciones</h3>
                      <div className="doctor-search-blk">
                        <div className="top-nav-search table-search-blk">
                          <form onSubmit={(e) => e.preventDefault()}>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Buscar instituciones..."
                              value={searchTerm}
                              onChange={handleSearch}
                            />
                            <Link className="btn">
                              <img
                                src={searchnormal}
                                alt="#"
                              />
                            </Link>
                          </form>
                        </div>
                        <div className="add-group">
                          <Link
                           to="/add-institution"
                            className="btn btn-primary add-pluss ms-2"
                            title="Agregar Institución"
                          >
                            <img src={plusicon} alt="#" />
                          </Link>
                          <button
                            onClick={handleRefresh}
                            className="btn btn-primary doctor-refresh ms-2"
                            title="Actualizar"
                          >
                            <img src={refreshicon} alt="#" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-auto text-end float-end ms-auto download-grp">
                    <Link to="#" className=" me-2">
                      <img src={pdficon} alt="#" />
                    </Link>
                    <Link to="#" className=" me-2">
                    </Link>
                    <Link to="#" className=" me-2">
                      <img src={pdficon3} alt="#" />
                    </Link>
                    <Link to="#">
                      <img src={pdficon4} alt="#" />
                    </Link>
                  </div>
                </div>
              </div>
              {/* /Table Header */}
              <div className="table-responsive doctor-list">
                {loading ? (
                  <div className="text-center py-4">
                    <Spin size="large" />
                    <p className="mt-2">Cargando instituciones...</p>
                  </div>
                ) : (
                  <Table
                    pagination={{
                      total: datasource.length,
                      showTotal: (total, range) =>
                        `Mostrando ${range[0]} a ${range[1]} de ${total} entradas`,
                      showSizeChanger: true,
                      onShowSizeChange: onShowSizeChange,
                      itemRender: itemRender,
                      pageSizeOptions: ['10', '25', '50', '100'],
                      showQuickJumper: true,
                    }}
                    columns={columns}
                    dataSource={datasource}
                    rowSelection={rowSelection}
                    rowKey={(record) => record.id}
                    locale={{
                      emptyText: searchTerm ? 'No se encontraron instituciones que coincidan con la búsqueda' : 'No hay instituciones registradas'
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div id="delete_institution" className="modal fade delete-modal" role="dialog">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-body text-center">
          <img src={imagesend} alt="#" width={50} height={46} />
          <h3>¿Está seguro que desea cambiar el estado de esta institución?</h3>
          <div className="m-t-20">
            {" "}
            <Link to="#" className="btn btn-white me-2" data-bs-dismiss="modal">
              Cancelar
            </Link>
            <button type="submit" className="btn btn-danger">
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</>

  )
}

export default InstitutionsAll;
