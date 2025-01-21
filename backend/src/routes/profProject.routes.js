import express from "express";
import {
  addNewProject, 
  getAllProjectsSummary, 
  getProjectDetails,
  editProject, 
  applyToProject, 
  getPendingApplications, 
  getAcceptedApplications, 
  getRejectedApplications, 
  updateApplicationStatus, 
  getStudentApplications,
  closeProject
} from "../controllers/profProject.controller.js";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post("/apply", verifyJWT, upload.array('files'), applyToProject);
router.get("/student/applications", verifyJWT, getStudentApplications);

//both for admin and students
router.get(
  "/projects/summary",
  async (req, res, next) => {
    let jwtPassed = false;
    let adminPassed = false;

    // Run verifyJWT
    await new Promise((resolve) => {
      verifyJWT(req, res, (err) => {
        if (!err) jwtPassed = true;
        resolve();
      });
    });

    // Run verifyAdmin
    await new Promise((resolve) => {
      verifyAdmin(req, res, (err) => {
        if (!err) adminPassed = true;
        resolve();
      });
    });

    // Check if both failed
    if (!jwtPassed && !adminPassed) {
      return res.status(403).json({
        message: "Authentication and Authorization both failed.",
      });
    }

    // Continue to the next middleware
    next();
  },
  getAllProjectsSummary
);

router.get(
  "/projects/:id",
  async (req, res, next) => {
    let jwtPassed = false;
    let adminPassed = false;

    // Run verifyJWT
    await new Promise((resolve) => {
      verifyJWT(req, res, (err) => {
        if (!err) jwtPassed = true;
        resolve();
      });
    });

    // Run verifyAdmin
    await new Promise((resolve) => {
      verifyAdmin(req, res, (err) => {
        if (!err) adminPassed = true;
        resolve();
      });
    });

    // Check if both failed
    if (!jwtPassed && !adminPassed) {
      return res.status(403).json({
        message: "Authentication and Authorization both failed.",
      });
    }

    // Continue to the next middleware
    next();
  },
  getProjectDetails
);

// admin routes
router.post("/projects", verifyAdmin, upload.array('files'), addNewProject);
router.get("/applications/pending", verifyAdmin, getPendingApplications);
router.get("/applications/accepted", verifyAdmin, getAcceptedApplications);
router.get("/applications/rejected", verifyAdmin, getRejectedApplications);
router.put("/projects/close/:id", verifyAdmin, closeProject);
router.put("/projects/:id", verifyAdmin, upload.array('files'), editProject);
router.put("/applications/:applicationId", verifyAdmin, updateApplicationStatus);


export default router;