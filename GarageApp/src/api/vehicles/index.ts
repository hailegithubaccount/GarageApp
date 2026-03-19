import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { baseURL, API } from '../constants';

const VEHICLE_URI = axios.create({
    baseURL: `${baseURL}/vehicles`,
});

export const createVehicle$ = async (formData: any) => {
    const token = await AsyncStorage.getItem('userToken');

    // Normalize URL: ensure it ends with / because router.route('/') in backend 
    // often works best with the exact path if nested under app.use('/api/vehicles')
    const url = `${baseURL}/vehicles/`;

    console.log('--- Registering Vehicle via Fetch ---');
    console.log('Sending to URL:', url);
    console.log('Token exists:', !!token);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
            body: formData,
        });

        const text = await response.text();
        console.log('Raw response:', text);

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            data = { message: text };
        }

        if (!response.ok) {
            console.error('Fetch Error:', response.status, data);
            throw {
                response: {
                    data,
                    status: response.status
                }
            };
        }

        return { data };
    } catch (error: any) {
        console.error('Fetch Fatal Error:', error);
        throw error;
    }
};

export const getVehicles$ = async () => {
    const token = await AsyncStorage.getItem('userToken');
    return VEHICLE_URI.get('/', {
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    });
};
