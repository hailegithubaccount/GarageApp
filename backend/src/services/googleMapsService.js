const axios = require('axios');

/**
 * Get road distances and travel times between an origin and multiple destinations
 * @param {Object} origin - { lat, lng }
 * @param {Array} destinations - Array of { _id, latitude, longitude }
 * @returns {Promise<Array>} List of destinations with roadDistance and duration
 */
const getDistancesAndDurations = async (origin, destinations) => {
    try {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            console.warn('GOOGLE_MAPS_API_KEY is missing in .env. Falling back to basic distance.');
            return null;
        }

        const originsStr = `${origin.lat},${origin.lng}`;
        const destinationsStr = destinations
            .map((d) => `${d.latitude},${d.longitude}`)
            .join('|');

        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originsStr}&destinations=${destinationsStr}&key=${apiKey}`;

        const response = await axios.get(url);

        if (response.data.status !== 'OK') {
            console.error('Google Distance Matrix API error:', response.data.error_message || response.data.status);
            return null;
        }

        const results = response.data.rows[0].elements;

        return destinations.map((dest, index) => {
            const googleData = results[index];
            if (googleData.status === 'OK') {
                return {
                    ...dest,
                    roadDistance: googleData.distance.text,
                    duration: googleData.duration.text,
                    roadDistanceValue: googleData.distance.value, // in meters
                    durationValue: googleData.duration.value, // in seconds
                };
            }
            return {
                ...dest,
                roadDistance: null,
                duration: null,
            };
        });
    } catch (error) {
        console.error('Failed to fetch distance from Google:', error.message);
        return null;
    }
};

module.exports = { getDistancesAndDurations };
