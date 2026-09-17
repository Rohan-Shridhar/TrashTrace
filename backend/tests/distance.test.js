const { calculateDistance } = require('../utils/distance');

describe('calculateDistance (Haversine)', () => {
  test('same point returns 0', () => {
    const d = calculateDistance(12.9716, 77.5946, 12.9716, 77.5946);
    expect(d).toBe(0);
  });

  test('known distance: NYC to London ~5570 km', () => {
    // New York (40.7128, -74.0060) to London (51.5074, -0.1278)
    const d = calculateDistance(40.7128, -74.006, 51.5074, -0.1278);
    // Allow 1% tolerance
    expect(d).toBeGreaterThan(5500000);
    expect(d).toBeLessThan(5700000);
  });

  test('close points within 500m radius', () => {
    // Two points ~200 metres apart
    const d = calculateDistance(12.9716, 77.5946, 12.9730, 77.5946);
    expect(d).toBeLessThan(500);
  });

  test('points >500m apart are outside delivery radius', () => {
    // ~2km apart
    const d = calculateDistance(12.9716, 77.5946, 12.9896, 77.5946);
    expect(d).toBeGreaterThan(500);
  });
});

describe('Coordinate Validation', () => {
  const isValidCoordinate = (lat, lon) => {
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    return (
      !isNaN(latNum) && !isNaN(lonNum) &&
      latNum >= -90 && latNum <= 90 &&
      lonNum >= -180 && lonNum <= 180
    );
  };

  test('valid coordinates pass', () => {
    expect(isValidCoordinate(12.9716, 77.5946)).toBe(true);
    expect(isValidCoordinate(-33.8688, 151.2093)).toBe(true);
    expect(isValidCoordinate(0, 0)).toBe(true);
  });

  test('out-of-range latitude fails', () => {
    expect(isValidCoordinate(91, 77)).toBe(false);
    expect(isValidCoordinate(-91, 77)).toBe(false);
  });

  test('out-of-range longitude fails', () => {
    expect(isValidCoordinate(12, 181)).toBe(false);
    expect(isValidCoordinate(12, -181)).toBe(false);
  });

  test('non-numeric values fail', () => {
    expect(isValidCoordinate('abc', 77)).toBe(false);
    expect(isValidCoordinate(null, null)).toBe(false);
    expect(isValidCoordinate(undefined, undefined)).toBe(false);
  });
});

describe('Delivery Radius Logic', () => {
  const DELIVERY_RADIUS_METERS = 500;

  test('scan within radius marks as near destination', () => {
    const distance = calculateDistance(12.9716, 77.5946, 12.9718, 77.5948); // ~30m
    expect(distance <= DELIVERY_RADIUS_METERS).toBe(true);
  });

  test('scan outside radius does not mark as delivered', () => {
    const distance = calculateDistance(12.9716, 77.5946, 13.0827, 80.2707); // Chennai
    expect(distance <= DELIVERY_RADIUS_METERS).toBe(false);
  });
});
