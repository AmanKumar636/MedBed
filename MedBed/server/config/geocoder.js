const NodeGeocoder = require('node-geocoder');

const options = {
  provider: 'openstreetmap',
  httpAdapter: 'https',
  userAgent: 'medbed-server', // Required for Nominatim
  language: 'en',
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;
