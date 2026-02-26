require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const axios = require('axios');

const testChapa = async () => {
    const amount = "500";
    const email = "michael.gms.test@gmail.com";
    const firstName = "Michael";
    const lastName = "Eshetu";
    const txRef = `test-gms-${Date.now()}`;

    // We'll use a placeholder for the callback to see if it's the URL causing issues
    const callbackUrl = "https://webhook.site/placeholder";

    console.log('🚀 Testing Chapa Initialization...');
    console.log(`URL: ${process.env.CHAPA_BASE_URL}/transaction/initialize`);
    console.log(`Key: ${process.env.CHAPA_SECRET_KEY?.substring(0, 15)}...`);

    try {
        const response = await axios.post(
            `${process.env.CHAPA_BASE_URL}/transaction/initialize`,
            {
                amount,
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
        console.log('✅ SUCCESS!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('❌ FAILED');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Message:', error.message);
        }
    }
};

testChapa();
