/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Table, message, Spin } from "antd";
import { Link, useParams } from 'react-router-dom';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import { itemRender, onShowSizeChange } from '../../../components/Pagination';
import { plusicon, refreshicon, searchnormal, pdficon, pdficon3, pdficon4 } from '../../../components/imagepath';
import InstitutionService from '../../../services/institutionService';

const HeadquartersAll = () => {
    const { id } = useParams();
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [headquarters, setHeadquarters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [operatingHeadquarter, setOperatingHeadquarter] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [institutionName, setInstitutionName] = useState('');

    // Cargar sedes al montar el componente
    useEffect(() => {
        loadInstitutionData();
        loadHeadquarters();
    }, [id]);

    const loadInstitutionData = async () => {
        try {
            console.log('Loading institution data...');
            const institutionData = await InstitutionService.getInstitutionById(id);
            setInstitutionName(institutionData.institutionName);
        } catch (error) {
            message.error('Error al cargar la información de la institución');
            console.error('Error loading institution:', error);
        }
    };

    const loadHeadquarters = async () => {
        try {
            console.log('Loading headquarters...');
            setLoading(true);
            const headquartersData = await InstitutionService.getInstitutionHeadquarters(id);
            console.log('Headquarters loaded:', headquartersData.length, 'items');
            setHeadquarters(headquartersData);
            console.log('State updated with new headquarters');
        } catch (error) {
            message.error('Error al cargar las sedes');
            console.error('Error loading headquarters:', error);
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
        loadHeadquarters();
        setSearchTerm('');
    };

    const handleDelete = async (headquarterId) => {
        try {
            // Prevenir múltiples clics mientras se procesa
            if (operatingHeadquarter === headquarterId) return;
            
            setOperatingHeadquarter(headquarterId);
            
            // Buscar la sede para conocer su estado actual
            const headquarter = headquarters.find(hq => hq.id === headquarterId);
            
            if (!headquarter) {
                message.error('Sede no encontrada');
                setOperatingHeadquarter(null);
                return;
            }

            const isActive = headquarter.status === 'A';
            console.log(`Headquarter ${headquarterId} current status: ${headquarter.status}, isActive: ${isActive}`);

            if (isActive) {
                // Si está activa, inactivarla (DELETE)
                console.log('Calling deleteHeadquarter...');
                const success = await InstitutionService.deleteHeadquarter(headquarterId);
                
                if (success) {
                    // Actualizar el estado local inmediatamente
                    setHeadquarters(prevHeadquarters => 
                        prevHeadquarters.map(hq => 
                            hq.id === headquarterId 
                                ? { ...hq, status: 'I' }
                                : hq
                        )
                    );
                    
                    message.success('Sede inactivada correctamente');
                }
            } else {
                // Si está inactiva, restaurarla (restore)
                console.log('Calling restoreHeadquarter...');
                const restoredHeadquarter = await InstitutionService.restoreHeadquarter(headquarterId);
                
                // Actualizar el estado local con los datos actualizados del servidor
                if (restoredHeadquarter) {
                    setHeadquarters(prevHeadquarters => 
                        prevHeadquarters.map(hq => 
                            hq.id === headquarterId 
                                ? { ...hq, ...restoredHeadquarter, status: 'A' }
                                : hq
                        )
                    );
                } else {
                    // Si no se reciben datos actualizados, simplemente cambiar el estado
                    setHeadquarters(prevHeadquarters => 
                        prevHeadquarters.map(hq => 
                            hq.id === headquarterId 
                                ? { ...hq, status: 'A' }
                                : hq
                        )
                    );
                }
                
                message.success('Sede activada correctamente');
            }
            
            console.log('Headquarter status updated locally');
            
        } catch (error) {
            const headquarter = headquarters.find(hq => hq.id === headquarterId);
            const action = headquarter?.status === 'A' ? 'inactivar' : 'activar';
            message.error(`Error al ${action} la sede: ${error.message || 'Error de conexión con el servidor'}`);
            console.error('Error updating headquarter status:', error);
            
            // En caso de error, recargar las sedes para mantener la sincronización con el servidor
            if (headquarter) {
                await loadHeadquarters();
            }
        } finally {
            // Siempre limpiar el estado de operación, sin importar si hubo éxito o error
            setOperatingHeadquarter(null);
        }
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    // Filtrar sedes basado en el término de búsqueda
    const filteredHeadquarters = headquarters.filter(headquarter =>
        headquarter.headquartersName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        headquarter.headquartersCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        headquarter.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        headquarter.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Preparar datos para la tabla
    const datasource = filteredHeadquarters.map(headquarter => ({
        id: headquarter.id,
        key: headquarter.id,
        headquartersName: headquarter.headquartersName,
        headquartersCode: headquarter.headquartersCode,
        address: headquarter.address,
        contactPerson: headquarter.contactPerson,
        contactEmail: headquarter.contactEmail,
        contactPhone: headquarter.contactPhone,
        status: headquarter.status === 'A' ? 'Activo' : 'Inactivo',
        statusValue: headquarter.status
    }));

    const columns = [
        {
            title: "Nombre de Sede",
            dataIndex: "headquartersName",
            sorter: (a, b) => a.headquartersName.localeCompare(b.headquartersName),
            render: (text, record) => (
                <>
                    <h2 className="profile-image">
                        <Link to="#" className="avatar avatar-sm me-2">
                            <div className="avatar-img rounded-circle bg-primary text-white d-flex align-items-center justify-content-center">
                                {record.headquartersName.charAt(0)}
                            </div>
                        </Link>
                        <Link to="#">{record.headquartersName}</Link>
                    </h2>
                </>
            ),
        },
        {
            title: "Código",
            dataIndex: "headquartersCode",
            sorter: (a, b) => a.headquartersCode.localeCompare(b.headquartersCode)
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
            title: "Persona de Contacto",
            dataIndex: "contactPerson",
            sorter: (a, b) => a.contactPerson.localeCompare(b.contactPerson)
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
                                <Link className="dropdown-item" to={`/edit-headquarter/${record.id}`}>
                                    <i className="far fa-edit me-2" />
                                    Editar
                                </Link>
                                <Link 
                                    className="dropdown-item" 
                                    to="#" 
                                    onClick={() => handleDelete(record.id)}
                                    style={{ 
                                        opacity: operatingHeadquarter === record.id ? 0.6 : 1,
                                        pointerEvents: operatingHeadquarter === record.id ? 'none' : 'auto'
                                    }}
                                >
                                    {operatingHeadquarter === record.id ? (
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
                                    <li className="breadcrumb-item">
                                        <Link to="/institution">Instituciones </Link>
                                    </li>
                                    <li className="breadcrumb-item">
                                        <i className="feather-chevron-right" />
                                    </li>
                                    <li className="breadcrumb-item active">Sedes</li>
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
                                                    <h3>Sedes de {institutionName}</h3>
                                                    <div className="doctor-search-blk">
                                                        <div className="top-nav-search table-search-blk">
                                                            <form onSubmit={(e) => e.preventDefault()}>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    placeholder="Buscar sedes..."
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
                                                                to={`/add-headquarter/${id}`}
                                                                className="btn btn-primary add-pluss ms-2"
                                                                title="Agregar Sede"
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
                                                <p className="mt-2">Cargando sedes...</p>
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
                                                    emptyText: searchTerm ? 'No se encontraron sedes que coincidan con la búsqueda' : 'No hay sedes registradas'
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
        </>
    );
};

export default HeadquartersAll;
