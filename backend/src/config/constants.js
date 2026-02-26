module.exports = {
    ROLES: {
        CUSTOMER: 'customer',
        MECHANIC: 'mechanic',
        ADMIN: 'admin',
        SUPER_ADMIN: 'super_admin',
    },

    USER_STATUS: {
        ACTIVE: 'active',
        INACTIVE: 'inactive',
        PENDING: 'pending',
        SUSPENDED: 'suspended',
    },

    GARAGE_STATUS: {
        ACTIVE: 'active',
        PENDING: 'pending',
        SUSPENDED: 'suspended',
    },

    SERVICE_CATEGORIES: [
        'diagnostics',
        'oil_change',
        'tires',
        'brakes',
        'engine',
        'body_work',
        'electrical',
        'general',
    ],

    REQUEST_STATUS: {
        PENDING: 'pending',
        APPROVED: 'approved',
        REJECTED: 'rejected',
        IN_PROGRESS: 'in_progress',
        WAITING_FOR_PARTS: 'waiting_for_parts',
        COMPLETED: 'completed',
        CANCELLED: 'cancelled',
    },

    ASSIGNMENT_STATUS: {
        ASSIGNED: 'assigned',
        IN_PROGRESS: 'in_progress',
        WAITING_FOR_PARTS: 'waiting_for_parts',
        COMPLETED: 'completed',
    },

    PAYMENT_METHOD: {
        CHAPA: 'chapa',
        CASH: 'cash',
    },

    PAYMENT_STATUS: {
        PENDING: 'pending',
        COMPLETED: 'completed',
        FAILED: 'failed',
        REFUNDED: 'refunded',
    },

    NOTIFICATION_TYPES: [
        'service_update',
        'payment',
        'assignment',
        'inventory_alert',
        'system',
        'emergency',
    ],

    LANGUAGES: ['en', 'am', 'om'],

    MAX_ACTIVE_JOBS_PER_MECHANIC: 5,
};
