const axios = require('axios');

/**
 * Initialize a Chapa payment transaction
 * @param {Object} paymentData
 * @returns {Object} Chapa checkout response
 */
const initializePayment = async ({ amount, email, firstName, lastName, txRef, callbackUrl }) => {
    try {
        const response = await axios.post(
            `${process.env.CHAPA_BASE_URL}/transaction/initialize`,
            {
                amount: amount.toString(),
                currency: 'ETB',
                email,
                first_name: firstName,
                last_name: lastName,
                tx_ref: txRef,
                callback_url: callbackUrl,
                return_url: `${process.env.FRONTEND_URL}/payment/success`,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Chapa initialization error:', error.response?.data || error.message);
        throw new Error('Payment initialization failed');
    }
};

/**
 * Verify a Chapa payment transaction
 * @param {string} txRef - Transaction reference
 * @returns {Object} Chapa verification response
 */
const verifyPayment = async (txRef) => {
    try {
        const response = await axios.get(
            `${process.env.CHAPA_BASE_URL}/transaction/verify/${txRef}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Chapa verification error:', error.response?.data || error.message);
        throw new Error('Payment verification failed');
    }
};

module.exports = { initializePayment, verifyPayment };
