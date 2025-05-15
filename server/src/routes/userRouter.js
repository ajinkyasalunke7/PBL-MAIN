// import express from "express";
// import {
//    register,
//    login,
//    getHackathons,
//    enrollInHackathon,
//    updateTeamMembers,
//    getTeamMembers,
//    resendInvitation,
//    acceptInvitation,
//    updateProfile,
//    getTeamDetails,
//    submitProject,
//    getProfile,
//    getAllHackathons,
//    getHackathonById,
// } from "../controllers/userController.js";
// import { authenticate, restrictToOrganizer } from "../utils/helper.js";

// const router = express.Router();

// router.post("/register", register);
// router.post("/login", login);
// router.get("/get-all-hackathons", getAllHackathons);
// router.get("/hackathons", authenticate, getHackathons);
// router.post("/get-hackathon-by-id", authenticate, getHackathonById);
// router.post("/enroll", authenticate, enrollInHackathon);
// router.put("/teams/:id/members", authenticate, updateTeamMembers);
// router.get("/teams/:id/members", authenticate, getTeamMembers);
// router.post(
//    "/teams/:id/members/:memberId/resend",
//    authenticate,
//    resendInvitation
// );
// router.get("/invitation/accept/:token", acceptInvitation);
// router.put("/profile", authenticate, updateProfile);
// router.get("/teams/:id", authenticate, getTeamDetails);
// router.post("/projects", authenticate, submitProject);
// router.get("/profile", authenticate, getProfile);

// export default router;
