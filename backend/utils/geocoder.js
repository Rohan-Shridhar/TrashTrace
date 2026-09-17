// Use global fetch (available in Node 18+)
// If running on older Node versions, consider using 'node-fetch' or 'axios'

/**
 * Geocodes a destination string into coordinates using OpenStreetMap's Nominatim API.
 * @param {string} address The destination string
 * @returns {Promise<{latitude: number, longitude: number} | null>}
 */
const geocodeAddress = async (address) => {
  try {
    const encodedAddress = encodeURIComponent(address);
    // Note: Nominatim requires a User-Agent header, identifying the app to avoid rate limits
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'TrashTraceApp/1.0',
        },
      }
    );

    if (!response.ok) {
      console.error(`Geocoding API responded with status: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error in geocoding:', error);
    return null;
  }
};

module.exports = { geocodeAddress };
