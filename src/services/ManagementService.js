// ManagementService.js - User Management Service
import axios from 'axios';
import User from '../types/User'; // Asumiendo que la clase User está en un archivo separado

// URL base de la API - Gitpod environment
const API_BASE_URL = 'https://8085-vallegrande-vgmseducati-56wb82ru26t.ws-us121.gitpod.io/api/users';

export const managementService = {
    /**
     * Obtiene todos los usuarios del sistema.
     * @returns {Promise<User[]>} Lista de todos los usuarios
     */
    getAllUsers: async () => {
        try {
            const response = await axios.get(API_BASE_URL);
            return response.data.map(userData => new User(userData));
        } catch (error) {
            console.error('Error fetching all users:', error);
            throw error;
        }
    },

    /**
     * Obtiene solo los usuarios activos (status = 'A').
     * @returns {Promise<User[]>} Lista de usuarios activos
     */
    getActiveUsers: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/active`);
            return response.data.map(userData => new User(userData));
        } catch (error) {
            console.error('Error fetching active users:', error);
            throw error;
        }
    },

    /**
     * Obtiene un usuario por su ID.
     * @param {string} id - ID del usuario
     * @returns {Promise<User|null>} Usuario encontrado o null
     */
    getUserById: async (id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/${id}`);
            return new User(response.data);
        } catch (error) {
            if (error.response?.status === 404) {
                return null;
            }
            console.error(`Error fetching user by ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Obtiene un usuario activo por su ID.
     * @param {string} id - ID del usuario
     * @returns {Promise<User|null>} Usuario activo encontrado o null
     */
    getActiveUserById: async (id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/active/${id}`);
            return new User(response.data);
        } catch (error) {
            if (error.response?.status === 404) {
                return null;
            }
            console.error(`Error fetching active user by ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Crea un nuevo usuario.
     * @param {Object} userData - Datos del usuario a crear
     * @param {string} userData.firstname - Nombre
     * @param {string} userData.lastname - Apellido
     * @param {string} userData.documentType - Tipo de documento
     * @param {string} userData.documentNumber - Número de documento
     * @param {string} userData.email - Email
     * @param {string} userData.phone - Teléfono
     * @param {string} userData.password - Contraseña
     * @param {string} userData.userImage - Imagen del usuario
     * @param {string} userData.role - Rol del usuario
     * @returns {Promise<User>} Usuario creado
     */
    createUser: async (userData) => {
        try {
            const createUserRequest = {
                firstname: userData.firstname,
                lastname: userData.lastname,
                documentType: userData.documentType,
                documentNumber: userData.documentNumber,
                email: userData.email,
                phone: userData.phone,
                password: userData.password,
                userImage: userData.userImage,
                role: userData.role
            };

            const response = await axios.post(API_BASE_URL, createUserRequest);
            return new User(response.data);
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    },

    /**
     * Actualiza un usuario existente.
     * @param {string} id - ID del usuario a actualizar
     * @param {Object} userData - Nuevos datos del usuario
     * @returns {Promise<User|null>} Usuario actualizado o null si no se encuentra
     */
    updateUser: async (id, userData) => {
        try {
            const updateUserRequest = {
                firstname: userData.firstname,
                lastname: userData.lastname,
                documentType: userData.documentType,
                documentNumber: userData.documentNumber,
                email: userData.email,
                phone: userData.phone,
                password: userData.password,
                userImage: userData.userImage,
                role: userData.role
            };

            const response = await axios.put(`${API_BASE_URL}/${id}`, updateUserRequest);
            return new User(response.data);
        } catch (error) {
            if (error.response?.status === 404) {
                return null;
            }
            console.error(`Error updating user ${id}:`, error);
            throw error;
        }
    },

    /**
     * Elimina físicamente un usuario del sistema.
     * @param {string} id - ID del usuario a eliminar
     * @returns {Promise<boolean>} true si se eliminó correctamente, false si no se encontró
     */
    deleteUserPhysically: async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/${id}`);
            return true;
        } catch (error) {
            if (error.response?.status === 404) {
                return false;
            }
            console.error(`Error physically deleting user ${id}:`, error);
            throw error;
        }
    },

    /**
     * Desactiva un usuario (eliminación lógica - cambia status a 'I').
     * @param {string} id - ID del usuario a desactivar
     * @returns {Promise<User|null>} Usuario desactivado o null si no se encuentra
     */
    deactivateUser: async (id) => {
        try {
            const response = await axios.patch(`${API_BASE_URL}/${id}/deactivate`);
            return new User(response.data);
        } catch (error) {
            if (error.response?.status === 404) {
                return null;
            }
            console.error(`Error deactivating user ${id}:`, error);
            throw error;
        }
    },

    /**
     * Restaura un usuario desactivado (cambia status a 'A').
     * @param {string} id - ID del usuario a restaurar
     * @returns {Promise<User|null>} Usuario restaurado o null si no se encuentra
     */
    restoreUser: async (id) => {
        try {
            const response = await axios.patch(`${API_BASE_URL}/${id}/restore`);
            return new User(response.data);
        } catch (error) {
            if (error.response?.status === 404) {
                return null;
            }
            console.error(`Error restoring user ${id}:`, error);
            throw error;
        }
    },

    /**
     * Busca usuarios por nombre o apellido.
     * @param {string} term - Término de búsqueda
     * @returns {Promise<User[]>} Lista de usuarios que coinciden con la búsqueda
     */
    searchUsers: async (term) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/search`, {
                params: { term }
            });
            return response.data.map(userData => new User(userData));
        } catch (error) {
            console.error(`Error searching users with term "${term}":`, error);
            throw error;
        }
    },

    /**
     * Busca un usuario por su email.
     * @param {string} email - Email del usuario
     * @returns {Promise<User|null>} Usuario encontrado o null
     */
    findByEmail: async (email) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/email/${encodeURIComponent(email)}`);
            return new User(response.data);
        } catch (error) {
            if (error.response?.status === 404) {
                return null;
            }
            console.error(`Error finding user by email ${email}:`, error);
            throw error;
        }
    },

    /**
     * Busca un usuario por su número de documento.
     * @param {string} documentNumber - Número de documento del usuario
     * @returns {Promise<User|null>} Usuario encontrado o null
     */
    findByDocumentNumber: async (documentNumber) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/document/${encodeURIComponent(documentNumber)}`);
            return new User(response.data);
        } catch (error) {
            if (error.response?.status === 404) {
                return null;
            }
            console.error(`Error finding user by document number ${documentNumber}:`, error);
            throw error;
        }
    },

    // Métodos de conveniencia adicionales usando la clase User

    /**
     * Crea un nuevo usuario usando el método estático de la clase User.
     * @param {string} firstname - Nombre
     * @param {string} lastname - Apellido
     * @param {string} documentType - Tipo de documento
     * @param {string} documentNumber - Número de documento
     * @param {string} email - Email
     * @param {string} phone - Teléfono
     * @param {string} password - Contraseña
     * @param {string} userImage - Imagen del usuario
     * @param {string} role - Rol del usuario
     * @returns {Promise<User>} Usuario creado
     */
    createNewUser: async (firstname, lastname, documentType, documentNumber, 
                         email, phone, password, userImage, role) => {
        const newUser = User.createNew(
            firstname, lastname, documentType, documentNumber,
            email, phone, password, userImage, role
        );
        
        return await managementService.createUser(newUser);
    },

    /**
     * Verifica si existe un usuario con el email dado.
     * @param {string} email - Email a verificar
     * @returns {Promise<boolean>} true si existe, false si no
     */
    emailExists: async (email) => {
        try {
            const user = await managementService.findByEmail(email);
            return user !== null;
        } catch (error) {
            console.error(`Error checking if email ${email} exists:`, error);
            return false;
        }
    },

    /**
     * Verifica si existe un usuario con el número de documento dado.
     * @param {string} documentNumber - Número de documento a verificar
     * @returns {Promise<boolean>} true si existe, false si no
     */
    documentNumberExists: async (documentNumber) => {
        try {
            const user = await managementService.findByDocumentNumber(documentNumber);
            return user !== null;
        } catch (error) {
            console.error(`Error checking if document number ${documentNumber} exists:`, error);
            return false;
        }
    }
};