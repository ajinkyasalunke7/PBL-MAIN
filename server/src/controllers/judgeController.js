import {
   User,
   JudgeAssignment,
   Team,
   TeamMember,
   Project,
   Hackathon,
   ProjectScore
} from "../models/index.js";

// Get judge profile information
export const getJudgeProfile = async (req, res) => {
   try {
      // Ensure the user is a judge
      if (req.user.user_type !== 'judge') {
         return res.status(403).json({
            success: false,
            message: "Access denied. Only judges can access this resource."
         });
      }

      const judge = await User.findByPk(req.user.user_id, {
         attributes: ['user_id', 'first_name', 'last_name', 'email', 'user_type']
      });

      if (!judge) {
         return res.status(404).json({
            success: false,
            message: "Judge profile not found"
         });
      }

      res.status(200).json({
         success: true,
         data: judge,
         message: "Judge profile retrieved successfully"
      });
   } catch (error) {
      console.error("Error retrieving judge profile:", error);
      res.status(500).json({
         success: false,
         message: "Server error: " + error.message
      });
   }
};

// Get all assignments for a judge
export const getJudgeAssignments = async (req, res) => {
   try {
      // Ensure the user is a judge
      if (req.user.user_type !== 'judge') {
         return res.status(403).json({
            success: false,
            message: "Access denied. Only judges can access this resource."
         });
      }

      const assignments = await JudgeAssignment.findAll({
         where: { judge_id: req.user.user_id },
         include: [
            {
               model: Team,
               as: 'Team',
               attributes: ['team_id', 'team_name', 'description', 'project_status'],
               include: [
                  {
                     model: Project,
                     attributes: ['project_id', 'project_name', 'description', 'github_url', 'demo_url']
                  },
                  {
                     model: User,
                     as: 'teamLeader',
                     attributes: ['user_id', 'first_name', 'last_name', 'email']
                  }
               ]
            },
            {
               model: Hackathon,
               attributes: ['hackathon_id', 'title', 'description', 'start_date', 'end_date']
            }
         ]
      });

      res.status(200).json({
         success: true,
         data: assignments,
         message: "Judge assignments retrieved successfully"
      });
   } catch (error) {
      console.error("Error retrieving judge assignments:", error);
      res.status(500).json({
         success: false,
         message: "Server error: " + error.message
      });
   }
};

// Update assignment status (accept/reject)
export const updateAssignmentStatus = async (req, res) => {
   const { assignmentId } = req.params;
   const { status } = req.body;

   // Validate status
   if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
         success: false,
         message: "Invalid status. Status must be 'accepted' or 'rejected'."
      });
   }

   try {
      // Ensure the user is a judge
      if (req.user.user_type !== 'judge') {
         return res.status(403).json({
            success: false,
            message: "Access denied. Only judges can access this resource."
         });
      }

      // Find the assignment
      const assignment = await JudgeAssignment.findOne({
         where: {
            id: assignmentId,
            judge_id: req.user.user_id
         }
      });

      if (!assignment) {
         return res.status(404).json({
            success: false,
            message: "Assignment not found or you don't have permission to update it."
         });
      }

      // Update the status
      assignment.status = status;
      await assignment.save();

      res.status(200).json({
         success: true,
         data: assignment,
         message: `Assignment ${status} successfully`
      });
   } catch (error) {
      console.error("Error updating assignment status:", error);
      res.status(500).json({
         success: false,
         message: "Server error: " + error.message
      });
   }
};

// Get team details for a specific team
export const getTeamDetails = async (req, res) => {
   const { teamId } = req.params;

   try {
      // Ensure the user is a judge
      if (req.user.user_type !== 'judge') {
         return res.status(403).json({
            success: false,
            message: "Access denied. Only judges can access this resource."
         });
      }

      // Check if the judge is assigned to this team
      const assignment = await JudgeAssignment.findOne({
         where: {
            judge_id: req.user.user_id,
            team_id: teamId
         }
      });

      if (!assignment) {
         return res.status(403).json({
            success: false,
            message: "You are not assigned to judge this team."
         });
      }

      // Get team details
      const team = await Team.findByPk(teamId, {
         include: [
            {
               model: User,
               as: 'teamLeader',
               attributes: ['user_id', 'first_name', 'last_name', 'email']
            },
            {
               model: TeamMember,
               include: [
                  {
                     model: User,
                     attributes: ['user_id', 'first_name', 'last_name', 'email']
                  }
               ]
            },
            {
               model: Project,
               attributes: ['project_id', 'project_name', 'description', 'github_url', 'demo_url']
            },
            {
               model: Hackathon,
               attributes: ['hackathon_id', 'title', 'description']
            }
         ]
      });

      if (!team) {
         return res.status(404).json({
            success: false,
            message: "Team not found"
         });
      }

      res.status(200).json({
         success: true,
         data: team,
         message: "Team details retrieved successfully"
      });
   } catch (error) {
      console.error("Error retrieving team details:", error);
      res.status(500).json({
         success: false,
         message: "Server error: " + error.message
      });
   }
};

// Submit a score for a project
export const submitProjectScore = async (req, res) => {
   const { projectId } = req.params;
   const { score, comments } = req.body;

   // Validate score
   if (!score || score < 1 || score > 10) {
      return res.status(400).json({
         success: false,
         message: "Score must be between 1 and 10"
      });
   }

   try {
      // Ensure the user is a judge
      if (req.user.user_type !== 'judge') {
         return res.status(403).json({
            success: false,
            message: "Access denied. Only judges can access this resource."
         });
      }

      // Check if the project exists
      const project = await Project.findByPk(projectId);
      if (!project) {
         return res.status(404).json({
            success: false,
            message: "Project not found"
         });
      }

      // Check if the judge is assigned to the team that owns this project
      const team = await Team.findByPk(project.team_id);
      if (!team) {
         return res.status(404).json({
            success: false,
            message: "Team not found for this project"
         });
      }

      const assignment = await JudgeAssignment.findOne({
         where: {
            judge_id: req.user.user_id,
            team_id: team.team_id
         }
      });

      if (!assignment) {
         return res.status(403).json({
            success: false,
            message: "You are not assigned to judge this team's project"
         });
      }

      // Check if the judge has already scored this project
      const existingScore = await ProjectScore.findOne({
         where: {
            project_id: projectId,
            judge_id: req.user.user_id
         }
      });

      if (existingScore) {
         return res.status(400).json({
            success: false,
            message: "You have already scored this project. Use the update endpoint instead."
         });
      }

      // Create the score
      const projectScore = await ProjectScore.create({
         project_id: projectId,
         judge_id: req.user.user_id,
         score,
         comments: comments || null
      });

      res.status(201).json({
         success: true,
         data: projectScore,
         message: "Project scored successfully"
      });
   } catch (error) {
      console.error("Error submitting project score:", error);
      res.status(500).json({
         success: false,
         message: "Server error: " + error.message
      });
   }
};

// Get a judge's score for a project
export const getProjectScore = async (req, res) => {
   const { projectId } = req.params;

   try {
      // Ensure the user is a judge
      if (req.user.user_type !== 'judge') {
         return res.status(403).json({
            success: false,
            message: "Access denied. Only judges can access this resource."
         });
      }

      // Find the score
      const projectScore = await ProjectScore.findOne({
         where: {
            project_id: projectId,
            judge_id: req.user.user_id
         }
      });

      if (!projectScore) {
         return res.status(404).json({
            success: false,
            message: "You have not scored this project yet"
         });
      }

      res.status(200).json({
         success: true,
         data: projectScore,
         message: "Project score retrieved successfully"
      });
   } catch (error) {
      console.error("Error retrieving project score:", error);
      res.status(500).json({
         success: false,
         message: "Server error: " + error.message
      });
   }
};

// Update a score for a project
export const updateProjectScore = async (req, res) => {
   const { projectId } = req.params;
   const { score, comments } = req.body;

   // Validate score
   if (!score || score < 1 || score > 10) {
      return res.status(400).json({
         success: false,
         message: "Score must be between 1 and 10"
      });
   }

   try {
      // Ensure the user is a judge
      if (req.user.user_type !== 'judge') {
         return res.status(403).json({
            success: false,
            message: "Access denied. Only judges can access this resource."
         });
      }

      // Find the existing score
      const projectScore = await ProjectScore.findOne({
         where: {
            project_id: projectId,
            judge_id: req.user.user_id
         }
      });

      if (!projectScore) {
         return res.status(404).json({
            success: false,
            message: "You have not scored this project yet. Use the submit endpoint instead."
         });
      }

      // Update the score
      projectScore.score = score;
      if (comments !== undefined) {
         projectScore.comments = comments;
      }
      await projectScore.save();

      res.status(200).json({
         success: true,
         data: projectScore,
         message: "Project score updated successfully"
      });
   } catch (error) {
      console.error("Error updating project score:", error);
      res.status(500).json({
         success: false,
         message: "Server error: " + error.message
      });
   }
};
