import express from "express";
import {
   createHackathon,
   getOrganizerHackathons,
   getHackathonProjects,
   assignJudge,
   addPrize,
   getAllJudges,
   addTopicsToHackathon,
   getHackathonTeams,
   getHackathonPrizes,
   declareWinnerWithValidation,
   getHackathonById,
   getTeamById,
   getTeamProject,
   getHackathonStats,
   getHackathonParticipants,
   updateHackathon,
   getHackathonJudges,
   createJudge,
} from "../controllers/organizerController.js";
import { resendInvitation } from "../controllers/userController.js";

const router = express.Router();

// Hackathon routes
router.post("/hackathons", createHackathon);
router.get("/hackathons", getOrganizerHackathons);
router.get("/hackathons/:id", getHackathonById);
router.put("/hackathons/:id", updateHackathon);
router.get("/hackathons/:id/projects", getHackathonProjects);
router.post("/hackathons/:id/topics", addTopicsToHackathon);
router.get("/hackathons/:id/stats", getHackathonStats);
router.get("/hackathons/:id/participants", getHackathonParticipants);
router.get("/hackathons/:id/teams", getHackathonTeams);

// Team routes
router.get("/teams/:id", getTeamById);
router.get("/teams/:id/project", getTeamProject);

// Team invitation resend (Organizer privilege)
router.post("/teams/:teamId/members/:memberId/resend", resendInvitation);

// Judge routes
router.post("/hackathons/:id/teams/:teamId/judges", assignJudge);
router.get("/hackathons/:id/judges", getHackathonJudges);
router.get("/judges", getAllJudges);
router.post("/judges", createJudge);

// Prize routes
router.post("/hackathons/:id/prizes", addPrize);
router.get("/hackathons/:id/prizes", getHackathonPrizes);

// Winner routes
router.post("/hackathons/:id/winners", declareWinnerWithValidation);

export default router;
