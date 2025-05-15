import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Prize = sequelize.define("Prize", {
   prize_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
   hackathon_id: { type: DataTypes.INTEGER, allowNull: false },
   prize_name: { type: DataTypes.STRING, allowNull: false },
   description: { type: DataTypes.TEXT },
   position: { type: DataTypes.INTEGER, allowNull: false },
});

export default Prize;
