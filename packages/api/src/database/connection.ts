import mongoose, { ConnectOptions } from 'mongoose';

const connectDatabase = async (): Promise<typeof mongoose> => {
  const username = process.env.MONGO_USERNAME || '';
  const password = process.env.MONGO_PASSWORD || '';
  const host = process.env.MONGO_HOST || '';
  const port = process.env.MONGO_PORT || '';
  const dbName = process.env.MONGO_DB || '';
  const uri = `mongodb://${username}:${password}@${host}:${port}/${dbName}`;

  try {
    const db = await mongoose.connect(uri, {
      useNewUrlParser: true,
    } as ConnectOptions);

    return db;
  } catch (error) {
    throw Error('Could not connect to database');
  }
};

export { connectDatabase };
