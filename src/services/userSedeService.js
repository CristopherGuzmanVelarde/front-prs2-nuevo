import axios from 'axios';

const API_URL = 'https://ms.user.machashop.top/user-sedes';

export const userSedeService = {
    // Modify getAllUserSedes to accept status parameter
    getAllUserSedes: async (status) => {
        try {
            // Construct the URL with status parameter if provided
            const url = status ? `${API_URL}?status=${status}` : API_URL;
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            console.error('Error fetching user sedes:', error);
            throw error;
        }
    },

    getUserSedeById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user sede:', error);
            throw error;
        }
    },

    createUserSede: async (userSedeData) => {
        try {
            const response = await axios.post(API_URL, userSedeData);
            return response.data;
        } catch (error) {
            console.error('Error creating user sede:', error);
            throw error;
        }
    },

    updateUserSede: async (id, userSedeData) => {
        try {
            const response = await axios.put(`${API_URL}/${id}`, userSedeData);
            return response.data;
        } catch (error) {
            console.error('Error updating user sede:', error);
            throw error;
        }
    },

    // Assuming deleteUserSede in the backend performs logical deletion via a PATCH to /deactivate
    deleteUserSede: async (id) => {
        try {
            // Call the backend endpoint for logical deletion (deactivate)
            await axios.patch(`${API_URL}/${id}/deactivate`);
        } catch (error) {
            console.error('Error deactivating user sede:', error);
            throw error;
        }
    },

    // New service method to restore an inactive user sede assignment
    restoreUserSede: async (id) => {
        try {
            // Assuming the backend has a PATCH endpoint like /{id}/activate to restore
            // If the backend uses a different endpoint or method, this needs adjustment.
            await axios.patch(`${API_URL}/${id}/activate`); // This endpoint needs to exist in backend
        } catch (error) {
            console.error('Error restoring user sede:', error);
            throw error;
        }
    },
};