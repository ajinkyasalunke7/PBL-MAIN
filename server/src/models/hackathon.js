import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Hackathon = sequelize.define("Hackathon", {
   hackathon_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
   },
   organizer_id: { type: DataTypes.INTEGER, allowNull: false },
   title: { type: DataTypes.STRING, allowNull: false },
   description: { type: DataTypes.TEXT },
   start_date: { type: DataTypes.DATE, allowNull: false },
   end_date: { type: DataTypes.DATE, allowNull: false },
   max_team_size: { type: DataTypes.INTEGER },
   registration_start_date: { type: DataTypes.DATE, allowNull: false },
   registration_end_date: { type: DataTypes.DATE, allowNull: false },
});

export default Hackathon;
