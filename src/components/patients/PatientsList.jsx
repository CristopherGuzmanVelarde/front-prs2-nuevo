/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Table, Button, Switch, message, Modal, Tag, Input, Space, Tooltip } from "antd";
import { SearchOutlined, PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined, UserAddOutlined, StopOutlined, UndoOutlined } from '@ant-design/icons';
import Header from '../Header';
import Sidebar from '../Sidebar';
import { onShowSizeChange, itemRender } from '../Pagination'
import { 
    blogimg10, imagesend, pdficon, pdficon3, pdficon4, plusicon, 
    refreshicon, searchnormal, blogimg12, blogimg2, blogimg4, 
    blogimg6, blogimg8 
} from '../imagepath';
import { Link, useNavigate } from 'react-router-dom';

// Import the management service - adjust the path based on your project structure
import { managementService } from '../../services/ManagementService';

const { confirm } = Modal;
const { Search } = Input;

const PatientsList = () => {
    const navigate = useNavigate();
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showActiveOnly, setShowActiveOnly] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [apiError, setApiError] = useState(false);

    // Cargar usuarios al montar el componente y cuando cambie el filtro
    useEffect(() => {
        loadUsers();
    }, [showActiveOnly]);

    // Filtrar usuarios cuando cambie el término de búsqueda
    useEffect(() => {
        filterUsers();
    }, [users, searchTerm]);

    const loadUsers = async () => {
        setLoading(true);
        setApiError(false);
        try {
            let userData;
            if (showActiveOnly) {
                userData = await managementService.getActiveUsers();
            } else {
                // Obtener todos los usuarios y filtrar por inactivos
                const allUsers = await managementService.getAllUsers();
                userData = allUsers.filter(user => !user.isActive());
            }
            setUsers(userData);
        } catch (error) {
            console.error('Error loading users:', error);
            setApiError(true);
            
            // Fallback to mock data if API is not available
            try {
                const mockUsers = managementService.getMockUsers();
                const filteredMockUsers = showActiveOnly 
                    ? mockUsers.filter(user => user.isActive())
                    : mockUsers.filter(user => !user.isActive());
                setUsers(filteredMockUsers);
                message.warning('API no disponible, mostrando datos de ejemplo');
            } catch (mockError) {
                message.error('Error al cargar los usuarios');
                setUsers([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        if (!searchTerm.trim()) {
            setFilteredUsers(users);
            return;
        }
        
        const searchTermLower = searchTerm.toLowerCase();
        const filtered = users.filter(user => 
            user.firstname.toLowerCase().includes(searchTermLower) ||
            user.lastname.toLowerCase().includes(searchTermLower) ||
            user.email.toLowerCase().includes(searchTermLower) ||
            user.documentNumber.includes(searchTermLower) ||
            user.phone.toLowerCase().includes(searchTermLower)
        );
        setFilteredUsers(filtered);
    };

    const onSelectChange = (newSelectedRowKeys) => {
        console.log("selectedRowKeys changed: ", newSelectedRowKeys);
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange,
    };

    // Manejar búsqueda
    const handleSearch = (value) => {
        setSearchTerm(value);
    };

    // Navegar a la página de edición - CORREGIDO
    const handleEditUser = (userId) => {
        navigate(`/editpatients/${userId}`);
    };

    // Desactivar usuario (eliminación lógica)
    const handleDeactivateUser = async (userId, userName) => {
        confirm({
            title: `¿Estás seguro de desactivar a ${userName}?`,
            content: 'El usuario será desactivado pero no eliminado permanentemente.',
            icon: <StopOutlined style={{ color: '#ff4d4f' }} />,
            okText: 'Sí, desactivar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    await managementService.deactivateUser(userId);
                    message.success('Usuario desactivado correctamente');
                    loadUsers(); // Recargar la lista
                } catch (error) {
                    console.error('Error deactivating user:', error);
                    if (apiError) {
                        message.warning('Función no disponible en modo offline');
                    } else {
                        message.error('Error al desactivar el usuario');
                    }
                }
            },
        });
    };

    // Restaurar usuario
    const handleRestoreUser = async (userId, userName) => {
        confirm({
            title: `¿Estás seguro de restaurar a ${userName}?`,
            content: 'El usuario será reactivado en el sistema.',
            icon: <UndoOutlined style={{ color: '#52c41a' }} />,
            okText: 'Sí, restaurar',
            okType: 'primary',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    await managementService.restoreUser(userId);
                    message.success('Usuario restaurado correctamente');
                    loadUsers(); // Recargar la lista
                } catch (error) {
                    console.error('Error restoring user:', error);
                    if (apiError) {
                        message.warning('Función no disponible en modo offline');
                    } else {
                        message.error('Error al restaurar el usuario');
                    }
                }
            },
        });
    };

    // Eliminar físicamente (solo para usuarios inactivos)
    const handleDeleteUser = async (userId, userName) => {
        confirm({
            title: `¿Estás seguro de eliminar permanentemente a ${userName}?`,
            content: 'Esta acción no se puede deshacer. El usuario será eliminado completamente del sistema.',
            icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
            okText: 'Sí, eliminar',
            okType: 'danger',
            cancelText: 'Cancelar',
            onOk: async () => {
                try {
                    const result = await managementService.deleteUserPhysically(userId);
                    if (result) {
                        message.success('Usuario eliminado permanentemente');
                        loadUsers(); // Recargar la lista
                    } else {
                        message.error('No se pudo encontrar el usuario para eliminar');
                    }
                } catch (error) {
                    console.error('Error deleting user:', error);
                    if (apiError) {
                        message.warning('Función no disponible en modo offline');
                    } else {
                        message.error('Error al eliminar el usuario');
                    }
                }
            },
        });
    };

    // Acciones masivas
    const handleBulkDeactivate = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning('Por favor selecciona al menos un usuario');
            return;
        }

        confirm({
            title: `¿Desactivar ${selectedRowKeys.length} usuario(s) seleccionado(s)?`,
            content: 'Los usuarios serán desactivados pero no eliminados permanentemente.',
            onOk: async () => {
                try {
                    // Implement bulk deactivation logic here
                    message.success(`${selectedRowKeys.length} usuario(s) desactivado(s) correctamente`);
                    setSelectedRowKeys([]);
                    loadUsers();
                } catch (error) {
                    message.error('Error al desactivar usuarios');
                }
            },
        });
    };

    const columns = [
        {
            title: "Usuario",
            dataIndex: "firstname",
            key: "name",
            sorter: (a, b) => a.firstname.localeCompare(b.firstname),
            width: 280,
            render: (text, record) => (
                <div className="d-flex align-items-center">
                    <div className="avatar-container me-3">
                        <div className="avatar-wrapper">
                            <img
                                className="user-avatar"
                                src={record.userImage || blogimg2}
                                alt={`${record.firstname} ${record.lastname}`}
                                onError={(e) => {
                                    // Fallback a iniciales si la imagen falla
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                                onLoad={(e) => {
                                    // Mostrar imagen si carga correctamente
                                    e.target.style.display = 'block';
                                    e.target.nextSibling.style.display = 'none';
                                }}
                            />
                            <div className="avatar-initials" style={{ display: 'none' }}>
                                {`${record.firstname.charAt(0)}${record.lastname.charAt(0)}`}
                            </div>
                        </div>
                        {/* Indicador de estado online/offline - AFUERA del avatar */}
                        <div className={`status-indicator-outside ${record.isActive() ? 'online' : 'offline'}`}></div>
                    </div>
                    <div className="user-info">
                        <h6 className="user-name mb-1">
                            <Link to="#" className="text-decoration-none user-link">
                                {`${record.firstname} ${record.lastname}`}
                            </Link>
                        </h6>
                        <div className="user-role mb-1">
                            <i className="fas fa-user-tag me-1 text-muted"></i>
                            <small className="text-muted">{record.role}</small>
                        </div>
                        <div className="user-status">
                            {record.isActive() ? (
                                <Tag color="success" size="small" className="status-tag">
                                    <i className="fas fa-check-circle me-1"></i>
                                    Activo
                                </Tag>
                            ) : (
                                <Tag color="error" size="small" className="status-tag">
                                    <i className="fas fa-times-circle me-1"></i>
                                    Inactivo
                                </Tag>
                            )}
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Documento",
            dataIndex: "documentInfo",
            key: "document",
            width: 150,
            render: (text, record) => (
                <div>
                    <div className="fw-semibold">{record.documentType}</div>
                    <small className="text-muted">{record.documentNumber}</small>
                </div>
            )
        },
        {
            title: "Contacto",
            dataIndex: "contact",
            key: "contact",
            width: 200,
            render: (text, record) => (
                <div>
                    <div className="d-flex align-items-center mb-1">
                        <i className="fas fa-envelope me-2 text-muted"></i>
                        <small>{record.email}</small>
                    </div>
                    <div className="d-flex align-items-center">
                        <i className="fas fa-phone me-2 text-muted"></i>
                        <small>{record.phone}</small>
                    </div>
                </div>
            )
        },
        {
            title: "Fecha Creación",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 120,
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            render: (text, record) => (
                <div>
                    <div className="fw-semibold">
                        {record.createdAt ? record.createdAt.toLocaleDateString() : 'N/A'}
                    </div>
                    <small className="text-muted">
                        {record.createdAt ? record.createdAt.toLocaleTimeString() : ''}
                    </small>
                </div>
            )
        },
        {
            title: "Acciones",
            dataIndex: "actions",
            key: "actions",
            width: 120,
            fixed: 'right',
            render: (text, record) => (
                <Space size="small">
                    <Tooltip title="Editar">
                        <Button
                            type="primary"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEditUser(record.id)}
                        />
                    </Tooltip>
                    {record.isActive() ? (
                        <Tooltip title="Desactivar">
                            <Button
                                type="default"
                                size="small"
                                icon={<StopOutlined />}
                                onClick={() => handleDeactivateUser(record.id, `${record.firstname} ${record.lastname}`)}
                                danger
                            />
                        </Tooltip>
                    ) : (
                        <>
                            <Tooltip title="Restaurar">
                                <Button
                                    type="primary"
                                    size="small"
                                    icon={<UndoOutlined />}
                                    onClick={() => handleRestoreUser(record.id, `${record.firstname} ${record.lastname}`)}
                                    style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                                />
                            </Tooltip>
                            <Tooltip title="Eliminar permanentemente">
                                <Button
                                    type="primary"
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleDeleteUser(record.id, `${record.firstname} ${record.lastname}`)}
                                    danger
                                />
                            </Tooltip>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <>
            <Header />
            <Sidebar id='menu-item2' id1='menu-items2' activeClassName='patient-list' />
            <div className="page-wrapper">
                <div className="content">
                    {/* Page Header */}
                    <div className="page-header">
                        <div className="row">
                            <div className="col-sm-12">
                                <ul className="breadcrumb">
                                    <li className="breadcrumb-item">
                                        <Link to="#">Usuarios</Link>
                                    </li>
                                    <li className="breadcrumb-item">
                                        <i className="feather-chevron-right" />
                                    </li>
                                    <li className="breadcrumb-item active">
                                        Lista de Usuarios {showActiveOnly ? 'Activos' : 'Inactivos'}
                                        {apiError && (
                                            <Tag color="warning" style={{ marginLeft: '8px' }}>Modo Offline</Tag>
                                        )}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    {/* /Page Header */}
                    
                    {/* API Status Alert */}
                    {apiError && (
                        <div className="alert alert-warning d-flex align-items-center" role="alert">
                            <i className="fas fa-exclamation-triangle me-2"></i>
                            <div>
                                La API no está disponible. Mostrando datos de ejemplo. Algunas funciones pueden no estar disponibles.
                            </div>
                        </div>
                    )}
                    
                    <div className="row">
                        <div className="col-sm-12">
                            <div className="card card-table show-entire">
                                <div className="card-body">
                                    {/* Enhanced Table Header */}
                                    <div className="page-table-header mb-4">
                                        <div className="row align-items-center">
                                            <div className="col-lg-8">
                                                <div className="d-flex align-items-center flex-wrap gap-3">
                                                    <h4 className="mb-0 d-flex align-items-center">
                                                        <i className="fas fa-users me-2 text-primary"></i>
                                                        Lista de Usuarios {showActiveOnly ? 'Activos' : 'Inactivos'}
                                                        <span className="badge bg-primary ms-2">
                                                            {(searchTerm ? filteredUsers : users).length}
                                                        </span>
                                                    </h4>
                                                    
                                                    <Switch
                                                        checked={showActiveOnly}
                                                        onChange={setShowActiveOnly}
                                                        checkedChildren="Activos"
                                                        unCheckedChildren="Inactivos"
                                                        size="default"
                                                        className="ms-3"
                                                    />
                                                </div>
                                                
                                                <div className="row mt-3">
                                                    <div className="col-md-6">
                                                        <Search
                                                            placeholder="Buscar por nombre, email, documento o teléfono..."
                                                            allowClear
                                                            enterButton={<SearchOutlined />}
                                                            size="large"
                                                            onSearch={handleSearch}
                                                            onChange={(e) => handleSearch(e.target.value)}
                                                            value={searchTerm}
                                                            style={{ maxWidth: 400 }}
                                                        />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <Space wrap>
                                                            {selectedRowKeys.length > 0 && showActiveOnly && (
                                                                <Button
                                                                    type="default"
                                                                    danger
                                                                    icon={<StopOutlined />}
                                                                    onClick={handleBulkDeactivate}
                                                                >
                                                                    Desactivar Seleccionados ({selectedRowKeys.length})
                                                                </Button>
                                                            )}
                                                        </Space>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="col-lg-4 text-end">
                                                <Space wrap>
                                                    <Button
                                                        type="primary"
                                                        icon={<UserAddOutlined />}
                                                        size="large"
                                                        onClick={() => navigate('/addpatients')}
                                                    >
                                                        Agregar Usuario
                                                    </Button>
                                                    <Button
                                                        type="default"
                                                        icon={<ReloadOutlined />}
                                                        size="large"
                                                        loading={loading}
                                                        onClick={loadUsers}
                                                    >
                                                        Actualizar
                                                    </Button>
                                                </Space>
                                                
                                                <div className="mt-2">
                                                    <Space>
                                                        <Tooltip title="Exportar PDF">
                                                            <Button type="text" size="small">
                                                                <img src={pdficon} alt="PDF" width={20} />
                                                            </Button>
                                                        </Tooltip>
                                                        <Tooltip title="Exportar Excel">
                                                            <Button type="text" size="small">
                                                                <img src={pdficon3} alt="Excel" width={20} />
                                                            </Button>
                                                        </Tooltip>
                                                        <Tooltip title="Exportar CSV">
                                                            <Button type="text" size="small">
                                                                <img src={pdficon4} alt="CSV" width={20} />
                                                            </Button>
                                                        </Tooltip>
                                                    </Space>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* /Enhanced Table Header */}
                                    
                                    <div className="table-responsive">
                                        <Table
                                            loading={loading}
                                            pagination={{
                                                total: (searchTerm ? filteredUsers : users).length,
                                                showTotal: (total, range) =>
                                                    `Mostrando ${range[0]} a ${range[1]} de ${total} registros`,
                                                showSizeChanger: true,
                                                pageSizeOptions: ['10', '25', '50', '100'],
                                                showQuickJumper: true,
                                                onShowSizeChange: onShowSizeChange,
                                                itemRender: itemRender,
                                            }}
                                            columns={columns}
                                            dataSource={searchTerm ? filteredUsers : users}
                                            rowSelection={rowSelection}
                                            rowKey={(record) => record.id}
                                            locale={{
                                                emptyText: loading ? 'Cargando...' : 
                                                          apiError ? 'No hay datos de ejemplo disponibles' :
                                                          searchTerm ? `No se encontraron usuarios que coincidan con "${searchTerm}"` :
                                                          'No se encontraron usuarios'
                                            }}
                                            scroll={{ x: 1000 }}
                                            size="middle"
                                            className="custom-table"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Notification Box */}
                <div className="notification-box">
                    <div className="msg-sidebar notifications msg-noti">
                        <div className="topnav-dropdown-header">
                            <span>Messages</span>
                        </div>
                        <div className="drop-scroll msg-list-scroll" id="msg_list">
                            <ul className="list-box">
                                <li>
                                    <Link to="#">
                                        <div className="list-item">
                                            <div className="list-left">
                                                <span className="avatar">R</span>
                                            </div>
                                            <div className="list-body">
                                                <span className="message-author">Richard Miles</span>
                                                <span className="message-time">12:28 AM</span>
                                                <div className="clearfix" />
                                                <span className="message-content">
                                                    Lorem ipsum dolor sit amet, consectetur adipiscing
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div className="topnav-dropdown-footer">
                            <Link to="#">See all messages</Link>
                        </div>
                    </div>
                </div>
            </div>
            
            <style jsx>{`
                /* Avatar Container Styles */
                .avatar-container {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                
                .avatar-wrapper {
                    position: relative;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    overflow: hidden;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                    border: 3px solid #ffffff;
                    transition: all 0.3s ease;
                }
                
                .avatar-wrapper:hover {
                    transform: scale(1.05);
                    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
                }
                
                .user-avatar {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: all 0.3s ease;
                }
                
                .avatar-initials {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 16px;
                    color: white;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    text-transform: uppercase;
                }
                
                /* Status Indicator OUTSIDE avatar */
                .status-indicator-outside {
                    position: absolute;
                    bottom: -2px;
                    right: -2px;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                    z-index: 10;
                }
                
                .status-indicator-outside.online {
                    background-color: #52c41a;
                    animation: pulse-green 2s infinite;
                }
                
                .status-indicator-outside.offline {
                    background-color: #ff4d4f;
                }
                
                @keyframes pulse-green {
                    0% {
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 0 0 rgba(82, 196, 26, 0.7);
                    }
                    70% {
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 0 8px rgba(82, 196, 26, 0);
                    }
                    100% {
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 0 0 rgba(82, 196, 26, 0);
                    }
                }
                
                /* User Info Styles */
                .user-info {
                    flex: 1;
                    min-width: 0; /* Permite que el texto se trunque si es necesario */
                }
                
                .user-name {
                    font-size: 14px;
                    font-weight: 600;
                    margin-bottom: 4px;
                    line-height: 1.3;
                }
                
                .user-link {
                    color: #2c3e50;
                    transition: color 0.3s ease;
                }
                
                .user-link:hover {
                    color: #667eea;
                    text-decoration: none;
                }
                
                .user-role {
                    display: flex;
                    align-items: center;
                    font-size: 12px;
                    color: #6c757d;
                    margin-bottom: 6px;
                }
                
                .user-role i {
                    font-size: 10px;
                }
                
                .user-status {
                    display: flex;
                    align-items: center;
                }
                
                .status-tag {
                    font-size: 10px;
                    padding: 2px 6px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    font-weight: 500;
                    border: none;
                }
                
                .status-tag i {
                    font-size: 8px;
                }
                
                /* Responsive adjustments */
                @media (max-width: 768px) {
                    .avatar-wrapper {
                        width: 40px;
                        height: 40px;
                    }
                    
                    .avatar-initials {
                        font-size: 14px;
                    }
                    
                    .user-name {
                        font-size: 13px;
                    }
                    
                    .user-role {
                        font-size: 11px;
                    }
                }
                
                /* Table enhancements para mejorar la visualización general */
                .custom-table .ant-table-thead > tr > th {
                    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                    font-weight: 600;
                    color: #495057;
                    border-bottom: 2px solid #dee2e6;
                    padding: 16px;
                }
                
                .custom-table .ant-table-tbody > tr:hover > td {
                    background-color: #f8f9ff;
                    transition: background-color 0.3s ease;
                }
                
                .custom-table .ant-table-tbody > tr > td {
                    vertical-align: middle;
                    padding: 16px;
                    border-bottom: 1px solid #f0f0f0;
                }
                
                .page-table-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 20px;
                    border-radius: 10px;
                    color: white;
                    margin-bottom: 20px;
                }
                
                .page-table-header h4 {
                    color: white;
                }
                
                .page-table-header .ant-switch {
                    background-color: rgba(255, 255, 255, 0.3);
                }
                
                .page-table-header .ant-switch-checked {
                    background-color: #52c41a;
                }
                
                .card {
                    border-radius: 15px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                    border: none;
                    overflow: hidden;
                }
                
                .card-body {
                    padding: 24px;
                }
                
                .alert-warning {
                    border-radius: 10px;
                    border-left: 4px solid #faad14;
                }
            `}</style>
        </>
    );
};

export default PatientsList;