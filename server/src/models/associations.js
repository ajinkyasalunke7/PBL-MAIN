import User from "./user.js";
import Hackathon from "./hackathon.js";
import Team from "./team.js";
import TeamMember from "./teamMember.js";
import TeamInvitation from "./teamInvitation.js";
import Project from "./project.js";
import Enrollment from "./enrollment.js";
import JudgeAssignment from "./judgeAssignment.js";
import ProjectScore from "./projectScore.js";
import Prize from "./prize.js";
import Winner from "./winner.js";
import Topic from "./topic.js";

const defineAssociations = () => {
   // User associations
   User.hasMany(Topic, { foreignKey: "created_by", constraints: false });
   User.hasMany(Team, {
      foreignKey: "team_leader_id",
      as: "ledTeams",
      constraints: false,
   });
   User.hasMany(TeamMember, { foreignKey: "user_id", constraints: false });
   User.hasMany(Hackathon, { foreignKey: "organizer_id", constraints: false });
   User.hasMany(Enrollment, { foreignKey: "user_id", constraints: false });
   User.hasMany(JudgeAssignment, {
      foreignKey: "judge_id",
      constraints: false,
   });
   User.hasMany(ProjectScore, { foreignKey: "judge_id", constraints: false });

   // Hackathon associations
   Hackathon.belongsTo(User, {
      foreignKey: "organizer_id",
      constraints: false,
   });
   Hackathon.hasMany(Team, { foreignKey: "hackathon_id", constraints: false });
   Hackathon.hasMany(Enrollment, {
      foreignKey: "hackathon_id",
      constraints: false,
   });
   Hackathon.hasMany(Project, {
      foreignKey: "hackathon_id",
      constraints: false,
   });
   Hackathon.hasMany(JudgeAssignment, {
      foreignKey: "hackathon_id",
      constraints: false,
   });
   Hackathon.hasMany(Prize, { foreignKey: "hackathon_id", constraints: false });
   Hackathon.hasMany(Topic, { foreignKey: "hackathon_id", constraints: false });

   // Team associations
   Team.belongsTo(Hackathon, {
      foreignKey: "hackathon_id",
      constraints: false,
   });
   Team.belongsTo(User, {
      foreignKey: "team_leader_id",
      as: "teamLeader",
      constraints: false,
   });
   Team.hasMany(TeamMember, { foreignKey: "team_id", constraints: false });
   Team.hasMany(TeamInvitation, { foreignKey: "team_id", constraints: false });
   Team.hasMany(Project, { foreignKey: "team_id", constraints: false });
   Team.hasMany(Winner, { foreignKey: "team_id", constraints: false });

   // Other associations
   Topic.belongsTo(User, { foreignKey: "created_by", constraints: false });
   Topic.belongsTo(Hackathon, {
      foreignKey: "hackathon_id",
      constraints: false,
   });
   
   Team.belongsTo(Topic, { foreignKey: 'topic_id' });
Topic.hasMany(Team, { foreignKey: 'topic_id' });

   TeamMember.belongsTo(Team, { foreignKey: "team_id", constraints: false });
   TeamMember.belongsTo(User, { foreignKey: "user_id", constraints: false });

   TeamInvitation.belongsTo(Team, {
      foreignKey: "team_id",
      constraints: false,
   });
   TeamInvitation.belongsTo(User, {
      foreignKey: "invited_user_id",
      as: "invitedUser",
      constraints: false,
   });

   Project.belongsTo(Team, { foreignKey: "team_id", constraints: false });
   Project.belongsTo(Hackathon, {
      foreignKey: "hackathon_id",
      constraints: false,
   });
   Project.hasMany(ProjectScore, {
      foreignKey: "project_id",
      constraints: false,
   });

   Enrollment.belongsTo(User, { foreignKey: "user_id", constraints: false });
   Enrollment.belongsTo(Hackathon, {
      foreignKey: "hackathon_id",
      constraints: false,
   });

   JudgeAssignment.belongsTo(User, {
      foreignKey: "judge_id",
      as: 'Judge',
      constraints: false,
   });
   JudgeAssignment.belongsTo(Hackathon, {
      foreignKey: "hackathon_id",
      constraints: false,
   });
   JudgeAssignment.belongsTo(Team, {
      foreignKey: "team_id",
      as: 'Team',
      constraints: false,
   });
   Team.hasMany(JudgeAssignment, {
      foreignKey: "team_id",
      constraints: false,
   });

   ProjectScore.belongsTo(Project, {
      foreignKey: "project_id",
      constraints: false,
   });
   ProjectScore.belongsTo(User, { foreignKey: "judge_id", constraints: false });

   Prize.belongsTo(Hackathon, {
      foreignKey: "hackathon_id",
      constraints: false,
   });
   Prize.hasOne(Winner, { foreignKey: "prize_id", constraints: false });

   Winner.belongsTo(Prize, { foreignKey: "prize_id", constraints: false });
   Winner.belongsTo(Team, { foreignKey: "team_id", constraints: false });
};

export default defineAssociations;
