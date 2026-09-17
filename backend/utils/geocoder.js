// Use global fetch (available in Node 18+)
// If running on older Node versions, consider using 'node-fetch' or 'axios'

/**
 * Geocodes a destination string into coordinates using OpenStreetMap's Nominatim API.
 * @param {string} address The destination string
 * @returns {Promise<{latitude: number, longitude: number}>}
 * @throws {Error} When Nominatim cannot be reached or returns no usable result
 */
const geocodeAddress = async (address) => {
  const encodedAddress = encodeURIComponent(address);
  const requestUrl = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`;

  console.log('[TrashTrace DEBUG]', 'Nominatim geocoding request started', {
    addressLength: address.length,
  });

  try {
    // Note: Nominatim requires a User-Agent header, identifying the app to avoid rate limits
    const response = await fetch(requestUrl, {
      headers: {
        'User-Agent': 'TrashTraceApp/1.0',
      },
    });

    console.log('[TrashTrace DEBUG]', 'Nominatim response received', {
      status: response.status,
      ok: response.ok,
    });

    if (!response.ok) {
      const error = new Error(`Nominatim geocoding request failed with HTTP status ${response.status}.`);
      console.error('[TrashTrace DEBUG]', error);
      throw error;
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      const error = new Error('Nominatim returned no matching destination for the supplied address.');
      console.error('[TrashTrace DEBUG]', error);
      throw error;
    }

    const latitude = parseFloat(data[0].lat);
    const longitude = parseFloat(data[0].lon);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      const error = new Error('Nominatim returned invalid coordinates for the supplied address.');
      console.error('[TrashTrace DEBUG]', error);
      throw error;
    }

    console.log('[TrashTrace DEBUG]', 'Nominatim geocoding result parsed', {
      hasCoordinates: true,
    });

    return { latitude, longitude };
  } catch (error) {
    console.error('[TrashTrace DEBUG]', error);

    if (error instanceof Error && error.message.startsWith('Nominatim ')) {
      throw error;
    }

    throw new Error(
      `Nominatim geocoding request could not be completed: ${error instanceof Error ? error.message : 'Unknown error'}.`
    );
  }
};

module.exports = { geocodeAddress };
