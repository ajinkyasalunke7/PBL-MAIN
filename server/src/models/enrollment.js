import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Enrollment = sequelize.define("Enrollment", {
   user_id: { type: DataTypes.INTEGER, primaryKey: true },
   hackathon_id: { type: DataTypes.INTEGER, primaryKey: true },
   enrolled_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

export default Enrollment;
