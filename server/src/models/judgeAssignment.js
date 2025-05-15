import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const JudgeAssignment = sequelize.define("JudgeAssignment", {
   id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
   },
   judge_id: { 
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
         model: 'Users',
         key: 'user_id'
      }
   },
   team_id: { 
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
         model: 'Teams',
         key: 'team_id'
      }
   },
   hackathon_id: { 
      type: DataTypes.INTEGER,
      allowNull: false 
   },
   assigned_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
   },
   status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
      defaultValue: 'pending'
   }
});

export default JudgeAssignment;
