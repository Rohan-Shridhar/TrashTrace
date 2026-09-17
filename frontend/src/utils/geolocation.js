/**
 * Requests the current geographical position of the user.
 * Promisifies the browser's geolocation API.
 * 
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        switch(error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Location permission denied. Please allow location access.'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Location information is unavailable.'));
            break;
          case error.TIMEOUT:
            reject(new Error('The request to get user location timed out.'));
            break;
          default:
            reject(new Error('An unknown error occurred while getting location.'));
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};
