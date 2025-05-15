import { Sequelize } from "sequelize";
import { config } from "./config.js";
import "../models/associations.js";

const sequelize = new Sequelize(
   config.DB_NAME,
   config.DB_USER,
   config.DB_PASSWORD,
   {
      host: config.DB_HOST,
      port: config.DB_PORT,
      dialect: "mysql",
      logging: false,
      define: { timestamps: false },
   }
);
// // console.log(sequelize)

export default sequelize;
