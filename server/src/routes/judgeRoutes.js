import express from "express";
import { authenticate } from "../utils/helper.js";
import {
   getJudgeAssignments,
   updateAssignmentStatus,
   getJudgeProfile,
   getTeamDetails,
   submitProjectScore,
   getProjectScore,
   updateProjectScore
} from "../controllers/judgeController.js";

const router = express.Router();

// Apply authentication middleware to all judge routes
router.use(authenticate);

// Judge dashboard routes
router.get("/profile", getJudgeProfile);
router.get("/assignments", getJudgeAssignments);
router.put("/assignments/:assignmentId/status", updateAssignmentStatus);
router.get("/teams/:teamId", getTeamDetails);

// Project scoring routes
router.post("/projects/:projectId/score", submitProjectScore);
router.get("/projects/:projectId/score", getProjectScore);
router.put("/projects/:projectId/score", updateProjectScore);

export default router;
