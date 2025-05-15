// models/topic.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Topic = sequelize.define("Topic", {
   topic_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
   title: { type: DataTypes.STRING, allowNull: false },
   description: { type: DataTypes.TEXT },
   hackathon_id: { type: DataTypes.INTEGER, allowNull: false },
   created_by: { type: DataTypes.INTEGER, allowNull: false }, // organizer (user_id)
});

export default Topic;
