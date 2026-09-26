jest.mock('mongoose', () => ({
  connection: { readyState: 0 },
  connect: jest.fn(),
}));

const mongoose = require('mongoose');
const connectDB = require('../config/db');

describe('connectDB', () => {
  const originalMongoUri = process.env.MONGO_URI;

  beforeEach(() => {
    process.env.MONGO_URI = 'mongodb://test-host/trashtrace';
    mongoose.connection.readyState = 0;
    mongoose.connect.mockReset();
    global.mongoose.conn = { stale: true };
    global.mongoose.promise = null;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    if (originalMongoUri === undefined) {
      delete process.env.MONGO_URI;
    } else {
      process.env.MONGO_URI = originalMongoUri;
    }
  });

  test('reconnects when a cached connection is no longer connected', async () => {
    mongoose.connect.mockImplementation(async () => {
      mongoose.connection.readyState = 1;
      return mongoose;
    });

    const connection = await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith(
      'mongodb://test-host/trashtrace',
      expect.objectContaining({ bufferCommands: false })
    );
    expect(connection).toBe(mongoose.connection);
    expect(global.mongoose.conn).toBe(mongoose.connection);
  });

  test('reuses a live connection without reconnecting', async () => {
    mongoose.connection.readyState = 1;

    const connection = await connectDB();

    expect(mongoose.connect).not.toHaveBeenCalled();
    expect(connection).toBe(mongoose.connection);
  });

  test('clears a failed connection promise so a later call can retry', async () => {
    const connectionError = new Error('temporary connection failure');
    const logError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mongoose.connect
      .mockRejectedValueOnce(connectionError)
      .mockImplementation(async () => {
        mongoose.connection.readyState = 1;
        return mongoose;
      });

    await expect(connectDB()).rejects.toThrow('temporary connection failure');
    expect(global.mongoose.conn).toBeNull();
    expect(global.mongoose.promise).toBeNull();

    await expect(connectDB()).resolves.toBe(mongoose.connection);
    expect(mongoose.connect).toHaveBeenCalledTimes(2);
    logError.mockRestore();
  });
});
