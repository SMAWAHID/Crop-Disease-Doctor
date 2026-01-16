import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'multipart/form-data',
    },
});

export const checkHealth = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/health`);
        return response.data;
    } catch (error) {
        console.error('API Connect Error:', error);
        return null;
    }
};

export const analyzeImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/analyze/image', formData);
    return response.data;
};

export const chatQuery = async (query) => {
    const formData = new FormData();
    formData.append('query', query);
    const response = await api.post('/chat', formData);
    return response.data;
};

export const analyzeVoice = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/analyze/voice', formData);
    return response.data;
};

export default api;
