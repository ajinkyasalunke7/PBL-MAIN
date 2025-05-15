import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Team = sequelize.define("Team", {
   team_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
   hackathon_id: { type: DataTypes.INTEGER, allowNull: false },
   team_name: { type: DataTypes.STRING, allowNull: false },
   description: { type: DataTypes.TEXT },
   project_status: { type: DataTypes.ENUM("Submitted", "Not submitted"), defaultValue: "Not submitted" },
   team_leader_id: { type: DataTypes.INTEGER, allowNull: false },
   team_size: { type: DataTypes.INTEGER, allowNull: false },
   topic_id: { type: DataTypes.INTEGER, allowNull: false },
});

export default Team;
