import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const ProjectScore = sequelize.define("ProjectScore", {
   score_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
   project_id: { type: DataTypes.INTEGER, allowNull: false },
   judge_id: { type: DataTypes.INTEGER, allowNull: false },
   score: { type: DataTypes.INTEGER, allowNull: false },
   comments: { type: DataTypes.TEXT },
});

export default ProjectScore;
