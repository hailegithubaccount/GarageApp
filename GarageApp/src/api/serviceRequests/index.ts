import { API } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Service Request API
 */
export const createServiceRequest$ = async (requestData: {
    vehicleId: string;
    garageId: string;
    serviceId?: string;
    serviceType: string;
    description: string;
    preferredDate: string;
    preferredTime: string;
    isEmergency?: boolean;
}) => {
    const token = await AsyncStorage.getItem('userToken');

    return API.post('service-requests', requestData, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
};

export const getMyServiceRequests$ = async () => {
    const token = await AsyncStorage.getItem('userToken');

    return API.get('service-requests', {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
};
