import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';

if (!process.env.API_KEY && nodeEnv !== 'development') {
  throw new Error('API_KEY environment variable is required in non-development environments');
}

export const env = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/dynamic-forms',
  API_KEY: process.env.API_KEY || 'default-api-key',
  NODE_ENV: nodeEnv,
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
};
