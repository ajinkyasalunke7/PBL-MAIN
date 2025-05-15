import { config as configEnv } from "dotenv";

configEnv();

const _config = {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  BACKEND_URL: process.env.BACKEND_URL,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
};

// Freeze the object to prevent any changes
export const config = Object.freeze(_config);
