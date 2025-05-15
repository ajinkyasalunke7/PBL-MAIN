import { config } from "dotenv";

const requiredEnvVars = [
   "DB_NAME",
   "DB_USER",
   "DB_PASSWORD",
   "DB_HOST",
   "JWT_SECRET",
   "NODE_ENV",
];

export const validateEnv = () => {
   config();
   const missing = requiredEnvVars.filter((key) => !process.env[key]);
   if (missing.length) {
      throw new Error(
         `Missing required environment variables: ${missing.join(", ")}`
      );
   }
};
