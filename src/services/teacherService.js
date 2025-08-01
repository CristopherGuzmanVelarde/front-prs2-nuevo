import axios from 'axios';

const API_URL = 'https://lab.vallegrande.edu.pe/school/ms-user/api/v1/teachers';

export const teacherService = {
    getAllTeachers: async (status) => {
        try {
            let url = API_URL;
            if (status === 'ACTIVE' || status === 'INACTIVE') {
                url += `?status=${status}`;
            }
            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            console.error('Error fetching teachers:', error);
            throw error;
        }
    },

    getTeacherById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching teacher:', error);
            throw error;
        }
    },

    createTeacher: async (teacherData) => {
        try {
            const response = await axios.post(API_URL, teacherData);
            return response.data;
        } catch (error) {
            console.error('Error creating teacher:', error);
            throw error;
        }
    },

    updateTeacher: async (id, teacherData) => {
        try {
            const response = await axios.put(`${API_URL}/${id}`, teacherData);
            return response.data;
        } catch (error) {
            console.error('Error updating teacher:', error);
            throw error;
        }
    },

    activateTeacher: async (id) => {
        try {
            const response = await axios.patch(`${API_URL}/${id}/activate`);
            return response.data;
        } catch (error) {
            console.error('Error activating teacher:', error);
            throw error;
        }
    },

    deactivateTeacher: async (id) => {
        try {
            const response = await axios.patch(`${API_URL}/${id}/deactivate`);
            return response.data;
        } catch (error) {
            console.error('Error deactivating teacher:', error);
            throw error;
        }
    }
};