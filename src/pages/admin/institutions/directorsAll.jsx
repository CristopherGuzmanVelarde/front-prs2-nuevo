/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Table, message, Spin } from "antd";
import { Link, useParams } from 'react-router-dom';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import { itemRender, onShowSizeChange } from '../../../components/Pagination';
import { plusicon, refreshicon, searchnormal, pdficon, pdficon3, pdficon4 } from '../../../components/imagepath';
import InstitutionService from '../../../services/institutionService';

const DirectorsAll = () => {
    const { id } = useParams();
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [directors, setDirectors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [operatingDirector, setOperatingDirector] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [institutionName, setInstitutionName] = useState('');

    // Cargar directores al montar el componente
    useEffect(() => {
        loadInstitutionData();
        loadDirectors();
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

    const loadDirectors = async () => {
        try {
            console.log('Loading directors...');
            setLoading(true);
            const directorsData = await InstitutionService.getInstitutionDirectors(id);
            console.log('Directors loaded:', directorsData.length, 'items');
            setDirectors(directorsData);
            console.log('State updated with new directors');
        } catch (error) {
            message.error('Error al cargar los directores');
            console.error('Error loading directors:', error);
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
        loadDirectors();
        setSearchTerm('');
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    // Filtrar directores basado en el término de búsqueda
    const filteredDirectors = directors.filter(director =>
        director.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        director.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        director.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        director.documentNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Preparar datos para la tabla
    const datasource = filteredDirectors.map(director => ({
        id: director.id,
        key: director.id,
        fullName: `${director.firstName} ${director.lastName}`,
        documentType: director.documentType,
        documentNumber: director.documentNumber,
        email: director.email,
        phone: director.phone,
        userName: director.userName,
        role: director.role,
        status: director.status === 'ACTIVE' ? 'Activo' : 'Inactivo',
        statusValue: director.status,
        permissions: director.permissions.join(', ')
    }));

    const columns = [
        {
            title: "Nombre Completo",
            dataIndex: "fullName",
            sorter: (a, b) => a.fullName.localeCompare(b.fullName),
            render: (text, record) => (
                <>
                    <h2 className="profile-image">
                        <Link to="#" className="avatar avatar-sm me-2">
                            <div className="avatar-img rounded-circle bg-primary text-white d-flex align-items-center justify-content-center">
                                {record.fullName.charAt(0)}
                            </div>
                        </Link>
                        <Link to="#">{record.fullName}</Link>
                    </h2>
                </>
            ),
        },
        {
            title: "Documento",
            render: (text, record) => (
                <>
                    {record.documentType}: {record.documentNumber}
                </>
            )
        },
        {
            title: "Email",
            dataIndex: "email",
            sorter: (a, b) => a.email.localeCompare(b.email),
        },
        {
            title: "Teléfono",
            dataIndex: "phone",
        },
        {
            title: "Usuario",
            dataIndex: "userName",
        },
        {
            title: "Rol",
            dataIndex: "role",
            sorter: (a, b) => a.role.localeCompare(b.role),
        },
        {
            title: "Estado",
            dataIndex: "status",
            sorter: (a, b) => a.status.localeCompare(b.status),
            render: (text, record) => (
                <span className={`badge ${record.statusValue === 'ACTIVE' ? 'bg-success' : 'bg-danger'}`}>
                    {record.status}
                </span>
            )
        },
        {
            title: "Permisos",
            dataIndex: "permissions",
        }
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
                                    <li className="breadcrumb-item active">Directores</li>
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
                                                    <h3>Directores de {institutionName}</h3>
                                                    <div className="doctor-search-blk">
                                                        <div className="top-nav-search table-search-blk">
                                                            <form onSubmit={(e) => e.preventDefault()}>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    placeholder="Buscar directores..."
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
                                                                to={`/add-director/${id}`}
                                                                className="btn btn-primary add-pluss ms-2"
                                                                title="Agregar Director"
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
                                    {/* /Table Header */}
                                    <div className="table-responsive doctor-list">
                                        {loading ? (
                                            <div className="text-center py-4">
                                                <Spin size="large" />
                                                <p className="mt-2">Cargando directores...</p>
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
                                                    emptyText: searchTerm ? 'No se encontraron directores que coincidan con la búsqueda' : 'No hay directores registrados'
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

export default DirectorsAll;
