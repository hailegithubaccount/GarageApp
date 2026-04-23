import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// For Android emulator, use 10.0.2.2
export const baseURL = 'http://localhost:5000/api';

export const API = axios.create({
    baseURL: `${baseURL}/`,
});

export const AUTH_URI = axios.create({
    baseURL: `${baseURL}/auth/`,
});

export const VEHICLE_URI = axios.create({
    baseURL: `${baseURL}/vehicles`,
});

// Centralized Interceptor for Auth
const setupInterceptors = (instance: any) => {
    instance.interceptors.request.use(
        async (config: any) => {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error: any) => {
            return Promise.reject(error);
        }
    );
};

setupInterceptors(API);
setupInterceptors(AUTH_URI);
setupInterceptors(VEHICLE_URI);
