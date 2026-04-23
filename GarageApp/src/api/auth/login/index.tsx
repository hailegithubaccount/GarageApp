import { AUTH_URI } from '../../constants';

/**
 * Login service using the user's specific template pattern
 */
export const loginLogin$ = async (
    email: any,
    password: any,

) => {


    return AUTH_URI.post(
        '/login',
        {
            email,
            password,
        },
        {
            headers: {
                // optfor: optfor,
                'Content-Type': 'application/json',
                // 'x-csg-cvd': 'yes',
                // deviceuuid: uuid,
                // Authorization: `Bearer ${token}`,
                // appversion: appVersion,
                // platform: platform,
                // sourceapp: 'garageapp',
            },
        },
    );
};
