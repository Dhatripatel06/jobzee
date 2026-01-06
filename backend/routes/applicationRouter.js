import express from "express";
import {
  employerGetAllApplications,
  jobseekerDeleteApplication,
  jobseekerGetAllApplications,
  postApplication,
  getResume,
} from "../controllers/applicationController.js";
import { isAuthorized, isAuthorizedWithToken } from "../middlewares/auth.js";

const router = express.Router();

router.post("/post", isAuthorized, postApplication);  
router.get("/jobseeker/getall", isAuthorized, jobseekerGetAllApplications);
router.get("/employer/getall", isAuthorized, employerGetAllApplications);
router.delete("/delete/:id", isAuthorized, jobseekerDeleteApplication);
router.get("/resume/:id", isAuthorizedWithToken, getResume);

export default router;