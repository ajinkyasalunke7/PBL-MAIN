import {
   Hackathon,
   Project,
   Prize,
   Winner,
   JudgeAssignment,
   User,
   Team,
   TeamMember,
} from "../models/index.js";
import Topic from "../models/topic.js";
import bcrypt from "bcrypt";
import { sendWinnerAnnouncementEmail } from "../utils/mailer.js";


export const createJudge = async (req, res) => {
   const { first_name, last_name, email } = req.body;
   try {
      // Check if judge already exists
      const existing = await User.findOne({ where: { email } });
      if (existing) {
         return res.status(400).json({ success: false, message: "Judge already exists with this email" });
      }
      const password_hash = await bcrypt.hash("123456", 10);
      const judge = await User.create({
         first_name,
         last_name,
         password_hash,
         email,
         user_type: "judge",
         verified: false
      });
      res.status(201).json({ success: true, data: judge, message: "Judge created successfully" });
   } catch (error) {
      res.status(500).json({ success: false, message: "Server error: " + error.message });
   }
};

export const createHackathon = async (req, res) => {
   const {
      title,
      description,
      start_date,
      end_date,
      max_team_size,
      registration_start_date,
      registration_end_date,
   } = req.body;
   try {
      const hackathon = await Hackathon.create({
         organizer_id: req.user.user_id,
         title,
         description,
         start_date,
         end_date,
         max_team_size,
         registration_start_date,
         registration_end_date,
      });
      res.status(201).json({
         success: true,
         data: hackathon,
         message: "Hackathon created successfully",
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: "Server error: " + error.message,
      });
   }
};

export const getHackathonProjects = async (req, res) => {
   const { id } = req.params;
   try {
      const projects = await Project.findAll({ where: { hackathon_id: id } });
      res.json({
         success: true,
         data: projects,
         message: "Projects retrieved successfully",
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: "Server error: " + error.message,
      });
   }
};

export const assignJudge = async (req, res) => {
   const { id, teamId } = req.params;
   const { judge_id } = req.body;
   // // console.log("Judge ID:", judge_id);
   // // console.log("Team ID:", teamId);
   // // console.log("Hackathon ID:", id);

   try {
      // Validate that the judge exists
      const judge = await User.findOne({
         where: { user_id: judge_id, user_type: 'judge' }
      });

      if (!judge) {
         return res.status(404).json({
            success: false,
            message: "Judge not found"
         });
      }

      // Validate that the team exists and belongs to the hackathon
      const team = await Team.findOne({
         where: { team_id: teamId, hackathon_id: id }
      });

      if (!team) {
         return res.status(404).json({
            success: false,
            message: "Team not found or does not belong to this hackathon"
         });
      }

      // Check if this judge is already assigned to this team
      const existingAssignment = await JudgeAssignment.findOne({
         where: { judge_id, team_id: teamId }
      });

      if (existingAssignment) {
         return res.status(400).json({
            success: false,
            message: "This judge is already assigned to this team"
         });
      }

      // Create the assignment
      const assignment = await JudgeAssignment.create({
         judge_id,
         team_id: teamId,
         hackathon_id: id,
         assigned_at: new Date()
      });

      res.status(201).json({
         success: true,
         data: assignment,
         message: "Judge assigned to team successfully"
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: "Server error: " + error.message,
      });
   }
};

export const addPrize = async (req, res) => {
   const { id } = req.params;
   const { prize_name, description, position } = req.body;
   try {
      const prize = await Prize.create({
         hackathon_id: id,
         prize_name,
         description,
         position,
      });
      res.status(201).json({
         success: true,
         data: prize,
         message: "Prize added successfully",
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: "Server error: " + error.message,
      });
   }
};

export const declareWinner = async (req, res) => {
   const { id } = req.params;
   const { prize_id, team_id } = req.body;
   try {
      const winner = await Winner.create({ prize_id, team_id });
      // // console.log(winner);
      res.status(201).json({
         success: true,
         data: winner,
         message: "Winner declared successfully",
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: "Server error: " + error.message,
      });
   }
};

export const getAllJudges = async (req, res) => {
   try {
      const judges = await User.findAll({
         where: {
            user_type: "judge",
         },
      });

      if (!judges || judges.length === 0) {
         return res
            .status(200)
            .json({ success: true, data: [], message: "No judges found." });
      }

      res.status(200).json({ success: true, data: judges, message: "Judges retrieved successfully" });
   } catch (error) {
      console.error("Error getting judges:", error);
      res.status(500).json({ success: false, message: "Internal server error: " + error.message });
   }
};

export const addTopicsToHackathon = async (req, res) => {
   const { id } = req.params;
   const { topics } = req.body;

   // console.log("Received request to add topics:", { id, topics });

   try {
      const hackathon_id = req.body.hackathon_id || id;

      const hackathon = await Hackathon.findOne({
         where: { hackathon_id, organizer_id: req.user.user_id },
      });

      if (!hackathon) {
         return res.status(403).json({
            success: false,
            message: "Hackathon not found or unauthorized",
         });
      }

      const createdTopics = await Promise.all(
         topics.map((topic) =>
            Topic.create({
               title: topic.title,
               description: topic.description,
               hackathon_id,
               created_by: req.user.user_id,
            })
         )
      );

      res.status(201).json({
         success: true,
         data: createdTopics,
         message: "Topics added successfully",
      });
   } catch (error) {
      console.error("Error adding topics:", error);
      res.status(500).json({
         success: false,
         message: "Server error: " + error.message,
      });
   }
};

export const getHackathonTeams = async (req, res) => {
   const { id } = req.params;
   try {
      const teams = await Team.findAll({
         where: { hackathon_id: id },
         include: [
            {
               model: User,
               as: "teamLeader",
               attributes: [
                  "user_id",
                  "first_name",
                  "last_name",
                  "email",
                  "user_type",
               ],
            },
            {
               model: TeamMember,
               include: [
                  {
                     model: User,
                     attributes: [
                        "user_id",
                        "first_name",
                        "last_name",
                        "email",
                        "user_type",
                     ],
                  },
               ],
            },
            {
               model: Project,
               attributes: ["project_name", "description"],
            },
            {
               model: Topic,
               attributes: ["title"],
            },
         ],
      });

      // // console.log(teams);

      if (!teams || teams.length === 0) {
         return res.json({
            success: true,
            teams: [],
         });
      }

      const formattedTeams = teams.map((team) => {
         // Find the TeamMember entry for the team leader
         const leaderMemberEntry = (team.TeamMembers || []).find(
            (member) => member.User?.user_id === team.teamLeader?.user_id
         );
         const filteredMembers = (team.TeamMembers || []).filter(
            (member) => member.User?.user_id !== team.teamLeader?.user_id
         );
         return {
            id: team.team_id,
            team_name: team.team_name,
            team_size: team.team_size,
            project_title: team.Project?.project_name || null,
            topic_title: team.Topic?.title || null,
            project_status: team.project_status,
            members: [
               {
                  id: team.teamLeader?.user_id,
                  first_name: team.teamLeader?.first_name,
                  last_name: team.teamLeader?.last_name,
                  email: team.teamLeader?.email,
                  verified: leaderMemberEntry ? leaderMemberEntry.verified : true, // fallback to true if not found
                  role: "Team Leader",
               },
               ...filteredMembers.map((member) => ({
                  id: member.User?.user_id,
                  first_name: member.User?.first_name,
                  last_name: member.User?.last_name,
                  email: member.User?.email,
                  verified: member.verified,
                  role: "Member",
               })),
            ],
         };
      });

      res.json({
         success: true,
         teams: formattedTeams,
      });
   } catch (error) {
      console.error("Error fetching hackathon teams:", error);
      res.status(500).json({
         success: false,
         message: "Failed to fetch hackathon teams: " + error.message,
      });
   }
};

export const getHackathonPrizes = async (req, res) => {
   const { id } = req.params;
   try {
      const prizes = await Prize.findAll({
         where: { hackathon_id: id },
         include: [
            {
               model: Winner,
               include: [
                  {
                     model: Team,
                     include: [
                        {
                           model: User,
                           as: "teamLeader",
                           attributes: [
                              "user_id",
                              "first_name",
                              "last_name",
                              "email",
                              "user_type",
                           ],
                        },
                        {
                           model: TeamMember,
                           include: [
                              {
                                 model: User,
                                 attributes: [
                                    "user_id",
                                    "first_name",
                                    "last_name",
                                    "email",
                                    "user_type",
                                 ],
                              },
                           ],
                        },
                     ],
                  },
               ],
            },
         ],
         order: [["position", "ASC"]],
      });

      // Format the response to include winner information
      const formattedPrizes = prizes.map((prize) => ({
         prize_id: prize.prize_id,
         prize_name: prize.prize_name,
         description: prize.description,
         position: prize.position,
         hackathon_id: prize.hackathon_id,
         created_at: prize.created_at,
         winner: prize.Winner
            ? {
               team_id: prize.Winner.team_id,
               team_name: prize.Winner.Team.team_name,
               members: [
                  {
                     id: prize.Winner.Team.teamLeader?.user_id,
                     first_name: prize.Winner.Team.teamLeader?.first_name,
                     last_name: prize.Winner.Team.teamLeader?.last_name,
                     email: prize.Winner.Team.teamLeader?.email,
                     role: "Team Leader",
                  },
                  ...(prize.Winner.Team.TeamMembers?.map((member) => ({
                     id: member.User?.user_id,
                     first_name: member.User?.first_name,
                     last_name: member.User?.last_name,
                     email: member.User?.email,
                     role: "Member",
                  })) || []),
               ],
               awarded_at: prize.Winner.awarded_at,
            }
            : null,
      }));

      res.json({
         success: true,
         data: formattedPrizes,
         message:
            prizes.length === 0
               ? "No prizes found for this hackathon"
               : "Prizes retrieved successfully",
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: "Failed to fetch prizes: " + error.message,
      });
   }
};

export const declareWinnerWithValidation = async (req, res) => {
   const { hackathon_id, team_id, prize_id } = req.body;

   try {
      // Validate Hackathon
      const hackathon = await Hackathon.findByPk(hackathon_id);
      if (!hackathon) {
         return res.status(404).json({
            success: false,
            message: "Hackathon not found",
         });
      }

      // Validate Team
      const team = await Team.findByPk(team_id);
      if (!team) {
         return res.status(404).json({
            success: false,
            message: "Team not found",
         });
      }

      // Check if prize is already assigned
      const existingWinner = await Winner.findOne({
         where: { prize_id },
      });
      if (existingWinner) {
         return res.status(400).json({
            success: false,
            message: "This prize has already been awarded",
         });
      }

      // Create Winner record

      // Notify all hackathon team leaders about the winner
      const teams = await Team.findAll({ where: { hackathon_id } });
      const leaderIds = teams.map(team => team.team_leader_id);
      const leaders = await User.findAll({ where: { user_id: leaderIds } });
      const allLeaderEmails = leaders.map(user => user.email);

      // Get winning team and leader
      const winningTeam = await Team.findByPk(team_id);
      const winningLeader = await User.findByPk(winningTeam.team_leader_id);
      const prize = await Prize.findByPk(prize_id);

      // Notify all leaders
      await sendWinnerAnnouncementEmail(
         allLeaderEmails,
         prize,
         hackathon,
         { type: "announcement", winningTeamName: winningTeam.team_name }
      );
      // Congratulate the winner
      await sendWinnerAnnouncementEmail(
         [winningLeader.email],
         prize,
         hackathon,
         { type: "congratulation", winningTeamName: winningTeam.team_name }
      );

      const winner = await Winner.create({
         prize_id,
         team_id,
         awarded_at: new Date(),
      });

      res.status(200).json({
         success: true,
         data: winner,
         message: "Winner declared successfully",
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: "Failed to declare winner: " + error.message,
      });
   }
};

export const getHackathonById = async (req, res) => {
   const { id } = req.params;
   // // console.log("id: ", id);
   try {
      const hackathon = await Hackathon.findByPk(id, {
         include: [
            {
               model: Team,
               include: [
                  {
                     model: User,
                     as: "teamLeader",
                     attributes: [
                        "user_id",
                        "first_name",
                        "last_name",
                        "email",
                        "user_type",
                     ],
                  },
                  {
                     model: TeamMember,
                     include: [
                        {
                           model: User,
                           attributes: [
                              "user_id",
                              "first_name",
                              "last_name",
                              "email",
                              "user_type",
                           ],
                        },
                     ],
                  },
               ],
            },
            {
               model: Prize,
            },
            {
               model: Topic,
            },
            {
               model: JudgeAssignment,
               include: [
                  {
                     model: User,
                     as: 'Judge',
                     attributes: [
                        "user_id",
                        "first_name",
                        "last_name",
                        "email",
                        "user_type",
                     ],
                  },
                  {
                     model: Team,
                     as: 'Team',
                     attributes: ["team_id", "team_name"],
                  }
               ],
            },
         ],
      });

      if (!hackathon) {
         return res.status(404).json({
            success: false,
            message: "Hackathon not found",
         });
      }

      // // console.log("Hackathon data: ", hackathon);
      res.json({
         success: true,
         data: hackathon,
         message: "Hackathon retrieved successfully",
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: "Failed to fetch hackathon: " + error.message,
      });
   }
};

export const getTeamById = async (req, res) => {
   const { id } = req.params;
   try {
      const team = await Team.findByPk(id, {
         include: [
            {
               model: User,
               as: "members",
               attributes: [
                  "user_id",
                  "name",
                  "email",
                  "verified_status",
                  "role",
               ],
            },
            {
               model: Project,
               attributes: [
                  "project_id",
                  "title",
                  "description",
                  "github_link",
                  "status",
               ],
            },
            {
               model: Hackathon,
               attributes: ["hackathon_id", "title", "start_date", "end_date"],
            },
         ],
      });

      if (!team) {
         return res.status(404).json({
            success: false,
            message: "Team not found",
         });
      }

      res.json({
         success: true,
         data: team,
         message: "Team retrieved successfully",
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: "Failed to fetch team: " + error.message,
      });
   }
};

export const getTeamProject = async (req, res) => {
   const { team_id } = req.params;
   try {
      const project = await Project.findOne({
         where: { team_id },
         include: [
            {
               model: Team,
               include: [
                  {
                     model: User,
                     as: "members",
                     attributes: ["user_id", "name", "email", "role"],
                  },
               ],
            },
         ],
      });

      if (!project) {
         return res.status(404).json({
            success: false,
            message: "Project not found",
         });
      }

      res.json({
         success: true,
         data: project,
         message: "Project retrieved successfully",
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: "Failed to fetch project: " + error.message,
      });
   }
};

export const getHackathonStats = async (req, res) => {
   const { id } = req.params;
   try {
      const hackathon = await Hackathon.findByPk(id);
      if (!hackathon) {
         return res.status(404).json({
            success: false,
            message: "Hackathon not found",
         });
      }

      const stats = {
         total_teams: await Team.count({ where: { hackathon_id: id } }),
         total_participants: await User.count({
            include: [
               {
                  model: Team,
                  where: { hackathon_id: id },
               },
            ],
         }),
         total_projects: await Project.count({
            include: [
               {
                  model: Team,
                  where: { hackathon_id: id },
               },
            ],
         }),
         total_prizes: await Prize.count({ where: { hackathon_id: id } }),
         total_judges: await User.count({
            include: [
               {
                  model: Hackathon,
                  where: { hackathon_id: id },
                  through: { attributes: [] },
               },
            ],
         }),
      };

      res.json({
         success: true,
         data: stats,
         message: "Hackathon statistics retrieved successfully",
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: "Failed to fetch hackathon statistics: " + error.message,
      });
   }
};

export const getHackathonParticipants = async (req, res) => {
   try {
      const { hackathon_id } = req.params;

      const participants = await User.findAll({
         include: [
            {
               model: Team,
               where: { hackathon_id },
               through: { attributes: ["role"] },
               required: true,
            },
         ],
         attributes: ["id", "name", "email", "verification_status"],
      });

      res.json({
         success: true,
         participants: participants.map((participant) => ({
            id: participant.id,
            name: participant.name,
            email: participant.email,
            verification_status: participant.verification_status,
            team_role: participant.Teams[0]?.TeamMember.role,
         })),
      });
   } catch (error) {
      console.error("Error fetching hackathon participants:", error);
      res.status(500).json({
         success: false,
         message: "Failed to fetch hackathon participants",
      });
   }
};

export const getOrganizerHackathons = async (req, res) => {
   try {
      const hackathons = await Hackathon.findAll({
         where: { organizer_id: req.user.user_id },
         include: [
            {
               model: Team,
               attributes: ["team_id"],
               include: [
                  {
                     model: User,
                     as: "teamLeader",
                     attributes: ["user_id"],
                  },
                  {
                     model: TeamMember,
                     include: [
                        {
                           model: User,
                           attributes: ["user_id"],
                        },
                     ],
                  },
               ],
            },
         ],
      });

      const formattedHackathons = hackathons.map((hackathon) => ({
         id: hackathon.hackathon_id,
         title: hackathon.title,
         description: hackathon.description,
         start_date: hackathon.start_date,
         end_date: hackathon.end_date,
         registration_start_date: hackathon.registration_start_date,
         registration_end_date: hackathon.registration_end_date,
         max_team_size: hackathon.max_team_size,
         status: getHackathonStatus(hackathon),
         participant_count:
            hackathon.Teams?.reduce(
               (count, team) => count + (team.TeamMembers?.length || 0), // +1 for team leader
               0
            ) || 0,
         total_team_count: hackathon.Teams?.length || 0,
      }));

      res.json({
         success: true,
         hackathons: formattedHackathons,
      });
   } catch (error) {
      console.error("Error fetching organizer hackathons:", error);
      res.status(500).json({
         success: false,
         message: "Failed to fetch hackathons",
      });
   }
};

// Helper function to determine hackathon status
const getHackathonStatus = (hackathon) => {
   const now = new Date();
   const startDate = new Date(hackathon.start_date);
   const endDate = new Date(hackathon.end_date);

   if (now < startDate) return "upcoming";
   if (now > endDate) return "completed";
   return "active";
};



export const updateHackathon = async (req, res) => {
   const { id } = req.params;
   const {
      title,
      description,
      start_date,
      end_date,
      max_team_size,
      registration_start_date,
      registration_end_date,
   } = req.body;

   try {
      const hackathon = await Hackathon.findOne({
         where: { hackathon_id: id, organizer_id: req.user.user_id },
      });

      if (!hackathon) {
         return res.status(404).json({
            success: false,
            message: "Hackathon not found or unauthorized",
         });
      }

      await hackathon.update({
         title,
         description,
         start_date,
         end_date,
         max_team_size,
         registration_start_date,
         registration_end_date,
      });

      res.json({
         success: true,
         data: hackathon,
         message: "Hackathon updated successfully",
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: "Server error: " + error.message,
      });
   }
};

export const getHackathonJudges = async (req, res) => {
   const { id } = req.params;
   try {
      const judgeAssignments = await JudgeAssignment.findAll({
         where: { hackathon_id: id },
         include: [
            {
               model: User,
               as: 'Judge',  // Using the alias we defined in associations.js
               attributes: ["user_id", "email", "first_name", "last_name", "user_type"],
            },
            {
               model: Team,
               as: 'Team',  // Using the alias we defined in associations.js
               attributes: ["team_id", "team_name"],
            }
         ],
      });

      if (!judgeAssignments || judgeAssignments.length === 0) {
         return res.json({
            success: true,
            data: [],
            message: "No judges assigned to this hackathon yet",
         });
      }

      // Format the response to include both judge and team information
      const formattedAssignments = judgeAssignments.map(assignment => ({
         assignment_id: assignment.id,
         judge: assignment.Judge,
         team: assignment.Team,
         status: assignment.status,
         assigned_at: assignment.assigned_at
      }));

      res.json({
         success: true,
         data: formattedAssignments,
         message: "Judge assignments retrieved successfully",
      });
   } catch (error) {
      console.error("Error retrieving judges:", error);
      res.status(500).json({
         success: false,
         message: "Server error: " + error.message,
      });
   }
};
