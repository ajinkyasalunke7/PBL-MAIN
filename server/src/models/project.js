import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Project = sequelize.define("Project", {
   project_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
   },
   team_id: { type: DataTypes.INTEGER, allowNull: false },
   hackathon_id: { type: DataTypes.INTEGER, allowNull: false },
   project_name: { type: DataTypes.STRING, allowNull: false },
   description: { type: DataTypes.TEXT },
   github_url: { type: DataTypes.STRING },
   demo_url: { type: DataTypes.STRING },
   submitted_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

export default Project;
