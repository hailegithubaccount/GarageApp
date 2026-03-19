import { API } from '../constants';

/**
 * Get notifications for current user
 */
export const getNotifications$ = async (page = 1, limit = 20) => {
    return API.get(`notifications?page=${page}&limit=${limit}`);
};

/**
 * Mark notification as read
 */
export const markAsRead$ = async (id: string) => {
    return API.put(`notifications/${id}/read`);
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead$ = async () => {
    return API.put('notifications/read-all');
};
