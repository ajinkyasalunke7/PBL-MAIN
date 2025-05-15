import {
   User,
   Hackathon,
   Team,
   TeamInvitation,
   TeamMember,
   Project,
   Enrollment,
} from "../models/index.js";
import { sendInvitationEmail } from "../utils/mailer.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { Op } from "sequelize";
import Topic from "../models/topic.js";

export const getHackathonById = async (req, res) => {
   const { id } = req.params;

   if (!id) {
      return res.status(400).json({
         success: false,
         data: null,
         message: "Hackathon ID is required.",
      });
   }

   try {
      // const hackathon = await Hackathon.findByPk(id, {
      //    include: [
      //       {
      //          model: Team,
      //          include: [
      //             {
      //                model: TeamMember,
      //                include: [User],
      //             },
      //          ],
      //       },
      //    ],
      // });
      const hackathon = await Hackathon.findByPk(id);

      if (!hackathon) {
         return res.status(404).json({
            success: false,
            data: null,
            message: "Hackathon not found.",
         });
      }

      const current_user_already_enrolled = await Enrollment.findOne({
         where: {
            hackathon_id: id,
            user_id: req.user.user_id,
         },
      });

      const team = await Team.findOne({
         where: {
            hackathon_id: id,
            team_leader_id: req.user.user_id,
         },
      });
      // // console.log(team.team_id);

      let members_added = false;
      if (team) {
         const memberCount = await TeamMember.count({ where: { team_id: team.team_id } });
         members_added = memberCount === team.team_size;
      } else {
         members_added = false;
      }
      res.json({
         success: true,
         data: hackathon,
         user_already_enrolled: Boolean(current_user_already_enrolled),
         team_id: team?.team_id,
         message: "Hackathon retrieved successfully.",
         members_added,
      });
   } catch (error) {
      console.error("Error retrieving hackathon:", error);
      res.status(500).json({
         success: false,
         data: null,
         message: "Internal server error.",
      });
   }
};

export const getAllHackathons = async (req, res) => {
   const currentDate = new Date();
   try {
      const allHacks = await Hackathon.findAll({
         where: {
            registration_end_date: {
               [Op.gte]: currentDate,
            },
         },
         order: [["registration_start_date", "ASC"]],
      });

      if (allHacks.length === 0) {
         return res.json({
            success: false,
            data: null,
            message:
               "No active hackathons found (registration period over or not started).",
         });
      }

      res.json({
         success: true,
         data: allHacks,
         message: "Active hackathons retrieved.",
      });
   } catch (error) {
      console.error("Error retrieving hackathons:", error);
      res.status(500).json({
         success: false,
         data: null,
         message: "Internal server error.",
      });
   }
};

export const register = async (req, res) => {
   const {
      email,
      password,
      first_name,
      last_name,
      gender,
      user_type,
   } = req.body;
   const college_name = req.body.college;
   try {
      let user = await User.findOne({ where: { email } });
      if (user && !user.is_placeholder) {
         return res
            .status(400)
            .json({ success: false, message: "Email already registered" });
      }

      const password_hash = await bcrypt.hash(password, 10);
      const validUserTypes = ["participant", "organizer", "judge"];
      const finalUserType = validUserTypes.includes(user_type)
         ? user_type
         : "participant";

      if (user) {
         await user.update(
            {
               password_hash,
               first_name,
               last_name,
               college_name,
               gender,
               user_type: finalUserType,
               is_placeholder: false,
            },
            {
               attributes: {
                  exclude: ["password_hash"], // Exclude the password field
               },
            }
         );
      } else {
         user = await User.create(
            {
               email,
               password_hash,
               first_name,
               last_name,
               college_name,
               gender,
               user_type: finalUserType,
            },
            {
               attributes: {
                  exclude: ["password_hash"], // Exclude the password field
               },
            }
         );
      }

      const token = jwt.sign(
         { user_id: user.user_id, user_type: finalUserType },
         "your-secret-key"
      );
      res.status(201).json({
         success: true,
         data: { user, token, user_type: finalUserType },
         message: "Registration successful",
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: "Server error: " + error.message,
      });
   }
};

export const login = async (req, res) => {
   const { email, password } = req.body;
   try {
      const user = await User.findOne({ where: { email } });
      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
         return res
            .status(401)
            .json({ success: false, message: "Invalid credentials" });
      }
      // // console.log(user)
      const token = jwt.sign(
         { user_id: user.user_id, user_type: user.user_type, first_name: user.first_name, last_name: user.last_name },
         "your-secret-key"
      );
      res.json({
         success: true,
         data: { token, user_type: user.user_type },
         message: "Login successful",
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: "Server error: " + error.message,
      });
   }
};

export const getHackathons = async (req, res) => {
   try {
      const hackathons = await Hackathon.findAll({
         where: {
            registration_start_date: { [Op.lte]: new Date() },
            registration_end_date: { [Op.gte]: new Date() },
         },
      });
      res.json({
         success: true,
         data: hackathons,
         message: "Hackathons retrieved successfully",
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: "Server error: " + error.message,
      });
   }
};

// export const enrollInHackathon = async (req, res) => {
//    try {
//       const { hackathon_id, team_name, description, team_size } = req.body;
//       const user_id = req.user.user_id; // From auth middleware

//       // Validate hackathon exists
//       const hackathon = await Hackathon.findByPk(hackathon_id);
//       if (!hackathon) {
//          return res
//             .status(404)
//             .json({ success: false, message: "Hackathon not found" });
//       }

//       // Create team
//       const team = await Team.create({
//          hackathon_id,
//          team_name,
//          description,
//          team_size,
//          team_leader_id: user_id,
//       });

//       // Add user as team member (assuming a TeamMembers junction table exists)
//       await TeamMembers.create({
//          team_id: team.team_id,
//          user_id,
//          verified: true,
//       });

//       res.json({
//          success: true,
//          data: {
//             team_id: team.team_id,
//             redirect: `/teams/${team.team_id}/members`, // Explicit redirect path
//          },
//          message: "Successfully enrolled in hackathon",
//       });
//    } catch (error) {
//       console.error("Error enrolling in hackathon:", error);
//       res.status(500).json({
//          success: false,
//          message: "Server error: " + error.message,
//       });
//    }
// };

export const enrollInHackathon = async (req, res) => {
   const { hackathon_id, team_name, description, team_size } = req.body;
   // console.log(hackathon_id, team_name, description, team_size);
   try {
      const hackathon = await Hackathon.findByPk(hackathon_id);
      if (
         !hackathon ||
         hackathon.registration_start_date > new Date() ||
         hackathon.registration_end_date < new Date()
      ) {
         return res.status(400).json({
            success: false,
            message: "Registration period is not active",
         });
      }
      if (team_size > hackathon.max_team_size) {
         return res.status(400).json({
            success: false,
            message: "Team size exceeds hackathon limit",
         });
      }

      const team = await Team.create({
         hackathon_id,
         team_name,
         description,
         team_leader_id: req.user.user_id,
         team_size,
         topic_id: req.body.topic_id,
      });

      // console.log("Team created")
      await Enrollment.create({ user_id: req.user.user_id, hackathon_id });
      // console.log("Enrolled");

      await TeamMember.create({
         team_id: team.team_id,
         user_id: req.user.user_id,
         verified: true,
      });

      // console.log("Team leader added");
      res.status(201).json({
         success: true,
         data: {
            team_id: team.team_id,
            redirect: `/api/user/teams/${team.team_id}/members`,
         },
         message: "Team created, add members next",
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: "Server error: " + error.message,
      });
   }
};

export const updateTeamMembers = async (req, res) => {
   const { teamId } = req.params;
   const { members } = req.body;
   // // console.log(teamId);
   // // console.log(members);
   try {
      const team = await Team.findOne({
         where: { team_id: teamId, team_leader_id: req.user.user_id },
      });
      // console.log(team);
      if (!team)
         return res.status(403).json({
            success: false,
            message: "Not authorized or team not found",
         });

      const hackathon = await Hackathon.findByPk(team.hackathon_id);
      if (
         members.length + 1 > team.team_size ||
         members.length + 1 > hackathon.max_team_size
      ) {
         return res.status(400).json({
            success: false,
            message: "Too many members for team size",
         });
      }

      const invitations = [];
      for (const member of members) {
         let user = await User.findOne({ where: { email: member.email } });
         if (!user) {
            user = await User.create({
               email: member.email,
               password_hash: "placeholder",
               first_name: member.first_name,
               last_name: member.last_name,
               college_name: member.college_name,
               gender: member.gender,
               is_placeholder: true,
            });
         }

         const existingMember = await TeamMember.findOne({
            where: { team_id: teamId, user_id: user.user_id },
         });
         if (!existingMember) {
            await TeamMember.create({
               team_id: teamId,
               user_id: user.user_id,
               verified: false,
            });
            const token = uuidv4();
            const expires_at = new Date(Date.now() + 48 * 60 * 60 * 1000);
            await TeamInvitation.create({
               team_id: teamId,
               invited_user_id: user.user_id,
               invitation_token: token,
               expires_at,
            });
            await sendInvitationEmail(
               member.email,
               token,
               team.team_name,
               hackathon.title
            );
            invitations.push({ email: member.email, token });
         }
      }

      res.json({
         success: true,
         data: { invitations },
         message: "Team members updated, invitations sent",
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: "Server error: " + error,
      });
   }
};

export const getTeamMembers = async (req, res) => {
   const { id } = req.params; // team_id
   try {
      const team = await Team.findOne({
         where: { team_id: id, team_leader_id: req.user.user_id },
      });
      if (!team)
         return res.status(403).json({
            success: false,
            message: "Not authorized or team not found",
         });

      const members = await TeamMember.findAll({
         where: { team_id: id },
         include: [
            {
               model: User,
               attributes: [
                  "email",
                  "first_name",
                  "last_name",
                  "college_name",
                  "gender",
               ],
            },
         ],
      });

      res.json({
         success: true,
         data: members,
         message: "Team members retrieved",
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: "Server error: " + error.message,
      });
   }
};

export const resendInvitation = async (req, res) => {
   // console.log(req.user);
   const { memberId } = req.params;
   const id = req.params.teamId;
   // console.log(id, memberId);
   try {
      const team = await Team.findOne({
         where: { team_id: id },
      });
      if (!team)
         return res.status(403).json({
            success: false,
            message: "Not authorized or team not found",
         });

      const member = await TeamMember.findOne({
         where: { team_id: id, user_id: memberId, verified: false },
      });
      if (!member)
         return res.status(400).json({
            success: false,
            message: "Member not found or already verified",
         });

      const user = await User.findByPk(memberId);
      const token = uuidv4();
      const expires_at = new Date(Date.now() + 48 * 60 * 60 * 1000);
      await TeamInvitation.create({
         team_id: id,
         invited_user_id: memberId,
         invitation_token: token,
         expires_at,
      });

      const hackathon = await Hackathon.findByPk(team.hackathon_id);
      await sendInvitationEmail(
         user.email,
         token,
         team.team_name,
         hackathon.title
      );
      res.json({
         success: true,
         data: { token },
         message: "Invitation resent",
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: "Server error: " + error.message,
      });
   }
};

export const acceptInvitation = async (req, res) => {
   const { token } = req.params;
   // // console.log(token);
   try {
      const invitation = await TeamInvitation.findOne({
         where: { invitation_token: token, invitation_status: "pending" },
      });
      if (!invitation || invitation.expires_at < new Date()) {
         return res
            .status(400)
            .json({ success: false, message: "Invalid or expired invitation" });
      }

      const user = await User.findByPk(invitation.invited_user_id);

      await TeamMember.update(
         { verified: true },
         {
            where: {
               team_id: invitation.team_id,
               user_id: invitation.invited_user_id,
            },
         }
      );
      await invitation.update({ invitation_status: "accepted" });
      res.json({ success: true, message: "Invitation accepted" });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: "Server error: " + error.message,
      });
   }
};

export const updateProfile = async (req, res) => {
   const { first_name, last_name, college_name, gender } = req.body;
   try {
      const user = await User.findByPk(req.user.user_id, {
         attributes: {
            exclude: ["password_hash"], // Exclude the password field
         },
      });
      if (!user)
         return res
            .status(404)
            .json({ success: false, message: "User not found" });

      await user.update({ first_name, last_name, college_name, gender });
      res.json({
         success: true,
         data: user,
         message: "Profile updated successfully",
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: "Server error: " + error.message,
      });
   }
};

export const getTeamDetails = async (req, res) => {
   const { teamId } = req.params;

   if (!teamId) {
      return res.status(400).json({
         success: false,
         data: null,
         message: "Team ID is required.",
      });
   }

   try {
      const team = await Team.findByPk(teamId, {
         include: [
            {
               model: TeamMember,
               include: [User],
            },
            {
               model: User,
               as: "teamLeader",
            },
            {
               model: Hackathon,
            },
            {
               model: Project,
            },
         ],
      });

      if (!team) {
         return res.status(404).json({
            success: false,
            data: null,
            message: "Team not found.",
         });
      }

      // Structure the response
      const hackathon = team.Hackathon ? {
         hackathon_id: team.Hackathon.hackathon_id,
         title: team.Hackathon.title,
         description: team.Hackathon.description,
         start_date: team.Hackathon.start_date,
         end_date: team.Hackathon.end_date,
         max_team_size: team.Hackathon.max_team_size,
         registration_start_date: team.Hackathon.registration_start_date,
         registration_end_date: team.Hackathon.registration_end_date,
      } : null;

      const teamLeader = team.teamLeader ? {
         user_id: team.teamLeader.user_id,
         first_name: team.teamLeader.first_name,
         last_name: team.teamLeader.last_name,
         email: team.teamLeader.email,
         college_name: team.teamLeader.college_name,
         gender: team.teamLeader.gender,
      } : null;

      const members = team.TeamMembers ? team.TeamMembers.map(tm => ({
         user_id: tm.User ? tm.User.user_id : null,
         first_name: tm.User ? tm.User.first_name : null,
         last_name: tm.User ? tm.User.last_name : null,
         email: tm.User ? tm.User.email : null,
         college_name: tm.User ? tm.User.college_name : null,
         gender: tm.User ? tm.User.gender : null,
         verified: tm.verified,
         joined_at: tm.joined_at,
      })) : [];

      const project = team.Projects && team.Projects.length > 0 ? {
         project_id: team.Projects[0].project_id,
         project_name: team.Projects[0].project_name,
         description: team.Projects[0].description,
         github_url: team.Projects[0].github_url,
         demo_url: team.Projects[0].demo_url,
         submitted_at: team.Projects[0].submitted_at,
      } : null;

      // // console.log(team.project_status);

      const { title: topic_title } = await Topic.findOne({
         where: { topic_id: team.topic_id },
      });

      // Calculate if all members are added
      const all_members_added = members.length === team.team_size;

      const teamDetails = {
         team_id: team.team_id,
         team_name: team.team_name,
         description: team.description,
         project_status: team.project_status,
         team_size: team.team_size,
         topic_id: team.topic_id,
         topic_title,
         hackathon,
         team_leader: teamLeader,
         members,
         project,
         all_members_added,
      };


      res.json({
         success: true,
         data: teamDetails,
         message: "Team details retrieved successfully.",
      });
   } catch (error) {
      console.error("Error retrieving team details:", error);
      res.status(500).json({
         success: false,
         data: null,
         message: "Internal server error.",
      });
   }
};

export const submitProject = async (req, res) => {
   const { team_id, project_name, description, github_url, demo_url } =
      req.body;

   try {
      // Check if team exists and the user is the team leader
      const team = await Team.findOne({
         where: {
            team_id,
            team_leader_id: req.user.user_id,
         },
      });

      if (!team) {
         return res.status(403).json({
            success: false,
            message: "Not authorized or team not found",
         });
      }

      // Check if a project has already been submitted by this team
      const existingProject = await Project.findOne({
         where: { team_id },
      });

      if (existingProject) {
         return res.status(400).json({
            success: false,
            message: "Project already submitted by this team",
         });
      }

      // If no project exists, proceed to create it
      const project = await Project.create({
         team_id,
         hackathon_id: team.hackathon_id,
         project_name,
         description,
         github_url,
         demo_url,
      });

      await Team.update({ project_status: "Submitted" }, {
         where: { team_id }
      });

      res.status(201).json({
         success: true,
         data: project,
         message: "Project submitted successfully",
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: "Server error: " + error.message,
      });
   }
};

export const getProfile = async (req, res) => {
   try {
      // req.user is populated by the auth middleware (e.g., verifyToken)
      const user = await User.findByPk(req.user.user_id, {
         attributes: [
            "email",
            "first_name",
            "last_name",
            "college_name",
            "gender",
            "user_type",
         ], // Exclude sensitive fields like password
      });

      if (!user) {
         return res
            .status(404)
            .json({ success: false, message: "User not found" });
      }

      res.json({
         success: true,
         data: user,
         message: "Profile retrieved successfully",
      });
   } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({
         success: false,
         message: "Server error: " + error.message,
      });
   }
};

export const getProfileById = async (req, res) => {
   try {
      const { userId } = req.params;
      if (!userId) {
         return res.status(400).json({
            success: false,
            message: "User ID is required",
         });
      }

      // 1. User profile info
      const userInstance = await User.findByPk(userId, {
         attributes: [
            "user_id",
            "email",
            "first_name",
            "last_name",
            "college_name",
            "gender",
            "user_type",
         ],
      });
      if (!userInstance) {
         return res.status(404).json({ success: false, message: "User not found" });
      }
      const user = userInstance.get({ plain: true });

      // 2. Enrolled hackathons (via Enrollment)
      const enrollments = await Enrollment.findAll({
         where: { user_id: userId },
         include: [
            {
               model: Hackathon,
               attributes: [
                  "hackathon_id",
                  "title",
                  "description",
                  "start_date",
                  "end_date",
                  "registration_start_date",
                  "registration_end_date",
                  "max_team_size",
                  "organizer_id"
               ]
            }
         ]
      });
      const enrolled_hackathons = enrollments
         .map(e => e.Hackathon ? e.Hackathon.get({ plain: true }) : null)
         .filter(h => h); // Only valid hackathons

      // 3. Teams (led or joined)
      // Teams where user is leader
      const leaderTeamsInstances = await Team.findAll({
         where: { team_leader_id: userId },
         include: [
            {
               model: Hackathon,
               attributes: ["hackathon_id", "title"]
            },
            {
               model: TeamMember,
               include: [{ model: User, attributes: ["user_id", "first_name", "last_name", "email"] }]
            }
         ]
      });
      const leaderTeams = leaderTeamsInstances.map(t => t.get({ plain: true }));
      // Teams where user is member (not leader)
      const memberTeamMembers = await TeamMember.findAll({
         where: { user_id: userId },
         include: [
            {
               model: Team,
               include: [
                  {
                     model: Hackathon,
                     attributes: ["hackathon_id", "title"]
                  },
                  {
                     model: TeamMember,
                     include: [{ model: User, attributes: ["user_id", "first_name", "last_name", "email"] }]
                  }
               ]
            }
         ]
      });
      // Extract teams from memberTeamMembers
      const memberTeams = memberTeamMembers
         .map(tm => tm.Team ? tm.Team.get({ plain: true }) : null)
         .filter(team => team && team.team_leader_id != userId); // Avoid duplicate if already leader

      // Merge teams (avoid duplicates)
      const allTeams = [
         ...leaderTeams,
         ...memberTeams.filter(mt => !leaderTeams.some(lt => lt.team_id === mt.team_id))
      ];

      res.json({
         success: true,
         data: {
            user,
            enrolled_hackathons,
            teams: allTeams
         },
         message: "Profile retrieved successfully",
      });
   } catch (error) {
      console.error("Error fetching profile by ID:", error);
      res.status(500).json({
         success: false,
         message: "Server error: " + error.message,
      });
   }
};

export const updateUserProfile = async (req, res) => {
   const { user_id } = req.user;
   const { name, email, bio, skills, github_url, linkedin_url, portfolio_url } =
      req.body;

   try {
      const user = await User.findByPk(user_id);
      if (!user) {
         return res.status(404).json({
            success: false,
            message: "User not found",
         });
      }

      // Update user profile
      await user.update({
         name: name || user.name,
         email: email || user.email,
         bio: bio || user.bio,
         skills: skills || user.skills,
         github_url: github_url || user.github_url,
         linkedin_url: linkedin_url || user.linkedin_url,
         portfolio_url: portfolio_url || user.portfolio_url,
      });

      res.json({
         success: true,
         data: user,
         message: "Profile updated successfully",
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: "Failed to update profile: " + error.message,
      });
   }
};

export const changePassword = async (req, res) => {
   const { user_id } = req.user;
   const { currentPassword, newPassword } = req.body;

   // console.log(user_id, currentPassword);

   try {
      const user = await User.findByPk(user_id);
      if (!user) {
         return res.status(404).json({
            success: false,
            message: "User not found",
         });
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) {
         return res.status(200).json({
            success: false,
            message: "Current password is incorrect",
         });
      }

      // Hash and update new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await user.update({ password_hash: hashedPassword });

      res.json({
         success: true,
         message: "Password changed successfully",
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: "Failed to change password: " + error.message,
      });
   }
};

export const getUserDashboard = async (req, res) => {
   const { user_id } = req.user;

   try {
      const user = await User.findByPk(user_id, {
         include: [
            {
               model: Team,
               include: [
                  {
                     model: Hackathon,
                     attributes: [
                        "hackathon_id",
                        "title",
                        "start_date",
                        "end_date",
                     ],
                  },
                  {
                     model: Project,
                     attributes: ["project_id", "title", "status"],
                  },
               ],
            },
         ],
      });

      if (!user) {
         return res.status(404).json({
            success: false,
            message: "User not found",
         });
      }

      res.json({
         success: true,
         data: user,
         message: "Dashboard data retrieved successfully",
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: "Failed to fetch dashboard data: " + error.message,
      });
   }
};

export const getUserTeams = async (req, res) => {
   try {
      const userId = req.user.id;

      const teams = await Team.findAll({
         where: {
            team_leader_id: userId,
         },
         include: [
            {
               model: TeamMember,
               include: [User],
            },
            {
               model: Hackathon,
            },
         ],
      });

      res.json({
         success: true,
         data: teams,
         message: "User teams retrieved successfully.",
      });
   } catch (error) {
      console.error("Error retrieving user teams:", error);
      res.status(500).json({
         success: false,
         data: null,
         message: "Internal server error.",
      });
   }
};

export const getUserProjects = async (req, res) => {
   const { user_id } = req.user;

   try {
      const projects = await Project.findAll({
         include: [
            {
               model: Team,
               include: [
                  {
                     model: User,
                     as: "members",
                     where: { user_id },
                     attributes: ["user_id", "name", "email", "role"],
                  },
               ],
            },
            {
               model: Hackathon,
               attributes: ["hackathon_id", "title", "start_date", "end_date"],
            },
         ],
      });

      res.json({
         success: true,
         data: projects,
         message: "Projects retrieved successfully",
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: "Failed to fetch projects: " + error.message,
      });
   }
};

export const getEnrolledHackathons = async (req, res) => {
   // console.log("getting enrolled hackathons");
   try {
      // Get user_id from params if provided, otherwise use authenticated user's ID
      const userId = req.params.userId || req.user.user_id;
      // console.log("User ID:", userId);

      // Find all teams where the user is either a leader or a member
      const teams = await Team.findAll({
         where: {
            [Op.or]: [
               { team_leader_id: userId },
               // Teams where user is a member
            ],
         },
         include: [
            {
               model: TeamMember,
               where: { user_id: userId },
               required: false, // So we get teams where user is leader even if not a member
            },
            {
               model: Hackathon,
               attributes: [
                  "hackathon_id",
                  "title",
                  "description",
                  "start_date",
                  "end_date",
                  "registration_start_date",
                  "registration_end_date",
                  "max_team_size",
                  "organizer_id"
               ]
            },
         ],
      });

      // Initialize data structures to collect hackathons and teams
      const hackathons = [];
      const hackathonIds = new Set();
      const hackathonToTeamMap = {};

      // First pass: collect all hackathons
      teams.forEach(team => {
         if (team.Hackathon && !hackathonIds.has(team.Hackathon.hackathon_id)) {
            // Create a plain object from the Hackathon instance
            const hackathon = team.Hackathon.get({ plain: true });
            hackathons.push(hackathon);
            hackathonIds.add(hackathon.hackathon_id);
            // Initialize the teams array for this hackathon
            hackathonToTeamMap[hackathon.hackathon_id] = [];
         }
      });

      // Second pass: collect all teams for each hackathon
      teams.forEach(team => {
         if (team.Hackathon) {
            const hackathonId = team.Hackathon.hackathon_id;
            // Add this team to the map (for all teams, not just where user is leader)
            const isLeader = team.team_leader_id == userId;

            hackathonToTeamMap[hackathonId].push({
               team_id: team.team_id,
               team_name: team.team_name,
               description: team.description,
               project_status: team.project_status,
               team_size: team.team_size,
               is_leader: isLeader  // Flag to indicate if user is leader of this team
            });
         }
      });

      // Add team details to each hackathon
      hackathons.forEach(hackathon => {
         hackathon.user_id = userId; // Add user_id to each hackathon for reference
         hackathon.teams = hackathonToTeamMap[hackathon.hackathon_id] || [];
      });

      res.json({
         success: true,
         data: hackathons,
         message: "Enrolled hackathons retrieved successfully.",
      });
   } catch (error) {
      console.error("Error getting enrolled hackathons:", error);
      res.status(500).json({
         success: false,
         data: null,
         message: "Internal server error: " + error.message,
      });
   }
};

// export const getEnrolledHackathons = async (req, res) => {
//    try {
//       const userId = req.user.id;

//       const enrollments = await Enrollment.findAll({
//          where: { user_id: userId },
//          include: [
//             {
//                model: Hackathon,
//                include: [
//                   {
//                      model: Team,
//                      where: { team_leader_id: userId },
//                      include: [
//                         {
//                            model: TeamMember,
//                            include: [User],
//                         },
//                      ],
//                   },
//                ],
//             },
//          ],
//       });

//       const hackathons = enrollments.map((enrollment) => enrollment.Hackathon);

//       res.json({
//          success: true,
//          data: hackathons,
//          message: "Enrolled hackathons retrieved successfully.",
//       });
//    } catch (error) {
//       console.error("Error retrieving enrolled hackathons:", error);
//       res.status(500).json({
//          success: false,
//          data: null,
//          message: "Internal server error.",
//       });
//    }
// };
