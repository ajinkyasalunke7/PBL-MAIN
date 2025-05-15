import express from "express";
import { getHackathonTopics } from "../controllers/topicController.js";
import { authenticate } from "../utils/helper.js";

const router = express.Router();

// Get topics for a specific hackathon (accessible to both users and organizers)
router.get(
   "/hackathons/:hackathon_id/topics",
   authenticate,
   getHackathonTopics
);

export default router;
