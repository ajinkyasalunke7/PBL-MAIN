import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Winner = sequelize.define("Winner", {
   winner_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
   },
   prize_id: { type: DataTypes.INTEGER, allowNull: false },
   team_id: { type: DataTypes.INTEGER, allowNull: false },
   awarded_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

export default Winner;
