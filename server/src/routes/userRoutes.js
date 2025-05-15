import express from "express";
import {
  register,
  login,
  getHackathons,
  enrollInHackathon,
  updateTeamMembers,
  getTeamMembers,
  resendInvitation,
  acceptInvitation,
  updateProfile,
  getProfile,
  getTeamDetails,
  getAllHackathons,
  getHackathonById,
  submitProject,
  changePassword,
  getUserDashboard,
  getUserTeams,
  getUserProjects,
  getEnrolledHackathons,
  getProfileById
} from "../controllers/userController.js";
import { authenticate } from "../utils/helper.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.get("/invitation/accept/:token", acceptInvitation);
router.get("/hackathons/all", getAllHackathons);

// Apply authentication middleware to all routes below
router.use(authenticate);

// Hackathon routes
router.get("/hackathons", getHackathons);
router.get("/hackathons/:id", getHackathonById);
router.get('/enrolled-hackathons', getEnrolledHackathons);
router.get('/enrolled-hackathons/:userId', getEnrolledHackathons);
router.post("/enroll", enrollInHackathon);

// Team routes
router.get("/teams", getUserTeams);
router.get("/teams/:teamId", getTeamDetails);
router.get("/teams/:teamId/members", getTeamMembers);
router.put("/teams/:teamId/members", updateTeamMembers);
router.post("/teams/:teamId/members/:memberId/resend", resendInvitation);


// Project routes
router.post("/projects", submitProject);
router.get("/projects", getUserProjects);

// Profile routes
router.get("/profile", getProfile);
router.get("/profile/:userId", getProfileById);
router.put("/profile", updateProfile);
router.put("/change-password", changePassword);

// Dashboard route
router.get("/dashboard", getUserDashboard);

export default router;