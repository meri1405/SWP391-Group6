import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const createAuthAxios = (token) => {
    return axios.create({
        baseURL: API_BASE_URL,
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });
};

const getTokenFromStorage = () => localStorage.getItem("token");

export const managerApi = {
    getStudents: async (params = {}, token = getTokenFromStorage()) => {
        const authAxios = createAuthAxios(token);
        const response = await authAxios.get("/api/manager/students", { params });
        return response.data;
    },
    removeParentFromStudent: async (studentId, parentType, token = getTokenFromStorage()) => {
        const authAxios = createAuthAxios(token);
        const response = await authAxios.delete(`/api/manager/students/${studentId}/parents/${parentType}`);
        return response.data;
    },
    createStudentWithParents: async (data, token = getTokenFromStorage()) => {
        const authAxios = createAuthAxios(token);
        const response = await authAxios.post("/api/manager/students/create-with-parents", data);
        return response.data;
    },
    importStudentsExcel: async (file, token = getTokenFromStorage()) => {
        const authAxios = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                Authorization: `Bearer ${token}`,
                // Do NOT set Content-Type here, let browser set it for FormData
            },
        });
        const formData = new FormData();
        formData.append("file", file);
        const response = await authAxios.post("/api/manager/students/import-excel", formData);
        return response.data;
    },
    downloadStudentsTemplate: async (token = getTokenFromStorage()) => {
        const authAxios = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                Authorization: `Bearer ${token}`,
            },
            responseType: 'blob',
        });
        const response = await authAxios.get("/api/manager/students/excel-template");
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'student-template.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    },
    deleteStudent: async (studentId, token = getTokenFromStorage()) => {
        const authAxios = createAuthAxios(token);
        const response = await authAxios.delete(`/api/manager/students/${studentId}`);
        return response.data;
    },
}; 