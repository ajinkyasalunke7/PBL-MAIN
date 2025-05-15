import express from "express";
import {
   getTotalColleges,
   searchColleges,
   getCollegesByState,
   getCollegesByDistrict,
   getAllStates,
   getDistrictsByState,
   getCurrentUser,
} from "../controllers/utilsController.js";

const router = express.Router();
router.post("/", (req, res) => {
   // console.log("oo");
   res.json({ "/test": "Working" });
});

router.post("/total", getTotalColleges);

router.post("/search", searchColleges);

router.post("/state", getCollegesByState);

router.post("/district", getCollegesByDistrict);

router.post("/allstates", getAllStates);

router.post("/districts", getDistrictsByState);

router.get("/me", getCurrentUser);

export default router;
