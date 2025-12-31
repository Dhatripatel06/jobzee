import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer;

export const connectDB = async () => {
  try {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    await mongoose.connect(mongoUri);
    console.log('Connected to in-memory MongoDB for testing');
  } catch (error) {
    console.error('Error connecting to test database:', error);
    throw error;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
    console.log('Disconnected from test database');
  } catch (error) {
    console.error('Error disconnecting from test database:', error);
    throw error;
  }
};

export const clearDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
};
