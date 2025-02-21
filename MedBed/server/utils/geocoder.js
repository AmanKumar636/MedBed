const NodeGeocoder = require('node-geocoder');
const axios = require('axios');

const geocode = async (address) => {
  const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`, {
    params: {
      access_token: process.env.MAPBOX_API_KEY,
      country: 'IN',
      limit: 1
    }
  });

  if (!response.data.features.length) {
    throw new Error('Invalid address');
  }

  const [lng, lat] = response.data.features[0].center;
  return { lat, lng };
};

module.exports = geocode;
