import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

const apiClient = axios.create({
    baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("talkshow_access");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export { apiClient };

function getApiBase(){
    return API_BASE_URL;
}

export function getMediaBase(){
    return import.meta.env.VITE_API_BASE_URL;
}

export default getApiBase;