import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const TeamInvitation = sequelize.define("TeamInvitation", {
   invitation_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
   },
   team_id: { type: DataTypes.INTEGER, allowNull: false },
   invited_user_id: { type: DataTypes.INTEGER, allowNull: false },
   invitation_token: { type: DataTypes.STRING, allowNull: false },
   invitation_status: { type: DataTypes.STRING, defaultValue: "pending" },
   expires_at: { type: DataTypes.DATE, allowNull: false },
});

export default TeamInvitation;
