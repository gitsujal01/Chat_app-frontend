import axios from 'axios';
export const baseUrl = 'https://chatapp-egww.onrender.com'; 
export const httpClient = axios.create(
    {
        baseURL: baseUrl,
    }
);
