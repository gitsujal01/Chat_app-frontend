import axios from 'axios';
export const baseUrl = 'chatapp-backend-production-ceef.up.railway.app'; 
export const httpClient = axios.create(
    {
        baseURL: baseUrl,
    }
);
