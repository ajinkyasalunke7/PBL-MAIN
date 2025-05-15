import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define(
   "User",
   {
      user_id: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true,
      },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      password_hash: { type: DataTypes.STRING, allowNull: false },
      first_name: { type: DataTypes.STRING },
      last_name: { type: DataTypes.STRING },
      college_name: { type: DataTypes.STRING },
      gender: { type: DataTypes.STRING },
      user_type: { type: DataTypes.STRING, defaultValue: "participant" },
      is_placeholder: { type: DataTypes.BOOLEAN, defaultValue: false },
   },
   {
      indexes: [{ unique: true, fields: ["email"] }],
   }
);

export default User;
