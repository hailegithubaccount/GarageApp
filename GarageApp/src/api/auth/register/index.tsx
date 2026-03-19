import { AUTH_URI } from '../../constants';

/**
 * Registration service using the user's specific template pattern
 */
export const registerLogin$ = async (
    fullName: any,
    email: any,
    phoneNumber: any,
    password: any,
    role: string = 'customer',
) => {
    return AUTH_URI.post(
        'register',
        {
            fullName,
            email,
            phoneNumber,
            password,
            role,
        },
        {
            headers: {
                'Content-Type': 'application/json',
            },
        },
    );
};
