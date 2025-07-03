// este es el service de user actualizado

import axios from 'axios';

// NOTA: Esta URL es un ejemplo y debe ser configurada para tu entorno.
const API_URL = 'https://ms.user.machashop.top/users';

export const userService = {
    /**
     * Crea un único usuario.
     */
    createUser: async (userData) => {
        try {
            const response = await axios.post(API_URL, userData);
            return response.data;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    },

    /**
     * Crea múltiples usuarios en una única solicitud por lotes.
     */
    createUsersBatch: async (usersData) => {
        try {
            const response = await axios.post(`${API_URL}/batch`, usersData);
            return response.data;
        } catch (error) {
            console.error('Error creating users in batch:', error);
            throw error;
        }
    },

    /**
     * Obtiene todos los usuarios, con filtrado opcional por rol y/o estado.
     */
    getAllUsers: async (role, status) => {
        try {
            let url = API_URL;
            const params = new URLSearchParams();
            
            if (role) {
                params.append('role', role);
            }
            if (status) {
                params.append('status', status);
            }

            const queryString = params.toString();
            if (queryString) {
                url += '?' + queryString;
            }

            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    },

    /**
     * Obtiene todos los profesores, con filtrado opcional por estado.
     */
    getTeachers: async (status) => {
        try {
            const url = `${API_URL}/teachers${status ? `?status=${status}` : ''}`;
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            console.error('Error fetching teachers:', error);
            throw error;
        }
    },
    
    /**
     * Obtiene el rol activo de un usuario específico.
     */
    getActiveRoleByUserId: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/users/${id}/role`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching role for user ${id}:`, error);
            throw error;
        }
    },

    /**
     * Obtiene un único usuario por su ID.
     */
    getUserById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    },

    /**
     * Actualiza un usuario existente.
     */
    updateUser: async (id, userData) => {
        try {
            const response = await axios.put(`${API_URL}/${id}`, userData);
            return response.data;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    },
    
    /**
     * Desactiva un usuario (eliminación lógica).
     */
    deactivateUser: async (id) => {
        try {
            const response = await axios.patch(`${API_URL}/${id}/deactivate`);
            return response.data;
        } catch (error) {
            console.error('Error deactivating user:', error);
            throw error;
        }
    },

    /**
     * Activa un usuario previamente desactivado.
     */
    activateUser: async (id) => {
        try {
            const response = await axios.patch(`${API_URL}/${id}/activate`);
            return response.data;
        } catch (error) {
            console.error('Error activating user:', error);
            throw error;
        }
    },

    /**
     * Añade un único permiso a un usuario.
     */
    addPermissionToUser: async (userId, permission) => {
        try {
            const response = await axios.post(`${API_URL}/${userId}/permissions/${permission}`);
            return response.data;
        } catch (error) {
            console.error('Error adding permission:', error);
            throw error;
        }
    },

    /**
     * Añade un conjunto de permisos a un usuario en un lote.
     */
    addPermissionsToUser: async (userId, permissions) => {
        try {
            const response = await axios.post(`${API_URL}/${userId}/permissions/batch`, permissions);
            return response.data;
        } catch (error) {
            console.error('Error adding permissions batch:', error);
            throw error;
        }
    },

    /**
     * Elimina un único permiso de un usuario.
     */
    removePermissionFromUser: async (userId, permission) => {
        try {
            const response = await axios.delete(`${API_URL}/${userId}/permissions/${permission}`);
            return response.data;
        } catch (error) {
            console.error('Error removing permission:', error);
            throw error;
        }
    },

    /**
     * Sobrescribe todos los permisos de un usuario con un nuevo conjunto.
     */
    setUserPermissions: async (userId, permissions) => {
        try {
            const response = await axios.put(`${API_URL}/${userId}/permissions`, permissions);
            return response.data;
        } catch (error) {
            console.error('Error setting user permissions:', error);
            throw error;
        }
    },
    
    /**
     * Desencadena una migración para aplicar permisos por defecto a los usuarios.
     */
    migrateUsersWithDefaultPermissions: async () => {
        try {
            const response = await axios.post(`${API_URL}/migrate-permissions`);
            return response.data;
        } catch (error) {
            console.error('Error migrating permissions:', error);
            throw error;
        }
    }
};