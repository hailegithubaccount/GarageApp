import { API } from '../constants';

/**
 * Get reviews for a garage
 */
export const getGarageReviews$ = async (garageId: string, page = 1, limit = 20) => {
    return API.get(`reviews/garage/${garageId}?page=${page}&limit=${limit}`);
};

/**
 * Submit a new review
 */
export const submitReview$ = async (data: { garageId: string, serviceRequestId?: string, rating: number, comment: string }) => {
    return API.post('reviews', data);
};

/**
 * Get current user's reviews
 */
export const getMyReviews$ = async () => {
    return API.get('reviews/my-reviews');
};
