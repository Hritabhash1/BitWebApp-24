import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ProfProject } from "../models/profProject.model.js";
import { RequestProj } from "../models/requestProj.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/Cloudinary.js";

const addNewProject = asyncHandler(async (req, res) => {
  const { profId, profName, profEmail, title, desc, categories, startDate, endDate, relevantLinks } = req.body;

  const docsURL = [];
  if (req.files &&  req.files.length) {
    for (const file of req.files) {
      const cloudinaryResponse = await uploadOnCloudinary(file.path);
      docsURL.push(cloudinaryResponse.secure_url);
    }
  }

  const newProject = await ProfProject.create({
    profId, profName, profEmail, title, desc, categories, startDate, endDate, doc: docsURL, relevantLinks
  });

  res.status(201).json({ 
    success: true, 
    data: newProject 
  });
});

const getAllProjectsSummary = asyncHandler(async (req, res) => {
    const projects = await ProfProject.find().select('profName title startDate endDate closed');
    res.status(200).json({ success: true, data: projects });
});

const getProjectDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const project = await ProfProject.findById(id);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    res.status(200).json({ success: true, data: project });
});

const editProject = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, desc, categories, startDate, endDate, relevantLinks, deleteUrls, status } = req.body;
  
    try {
      const project = await ProfProject.findById(id);
  
      if (!project) {
        throw new ApiError(404, "Project not found");
      }
  
      project.title = title || project.title;
      project.desc = desc || project.desc;
      project.categories = categories || project.categories;
      project.startDate = startDate || project.startDate;
      project.endDate = endDate || project.endDate;
      project.relevantLinks = relevantLinks || project.relevantLinks;
      project.closed = status || project.closed;
  
      if (deleteUrls && Array.isArray(deleteUrls) && deleteUrls.length > 0) {
        for (const url of deleteUrls) {
          try {
            const publicId = url.split("/").pop().split(".")[0];
            await deleteFromCloudinary(publicId);
          } catch (error) {
            console.error("Error deleting file from Cloudinary:", error);
          }
        }
  
        project.doc = project.doc.filter(docUrl => !deleteUrls.includes(docUrl));
      }
  
      const newDocsURL = [];
      if (req.files && req.files.length) {
        for (const file of req.files) {
          try {
            const cloudinaryResponse = await uploadOnCloudinary(file.path);
            console.log("Uploaded file to Cloudinary:", cloudinaryResponse);
            newDocsURL.push(cloudinaryResponse.secure_url);
          } catch (error) {
            console.error("Error uploading file to Cloudinary:", error);
            throw new Error("Failed to upload file to Cloudinary");
          }
        }
      }
  
      if (newDocsURL.length > 0) {
        project.doc = [...project.doc, ...newDocsURL];
      }
  
      await project.save();
  
      res.status(200).json({
        success: true,
        data: project,
      });
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ error: "Internal server error" });
    }
});
const applyToProject = asyncHandler(async (req, res) => {
  const { projectId } = req.body;
  
  // Check if the project exists
  const project = await ProfProject.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  
  // Check if the project is closed
  if (project.closed) {
    throw new ApiError(400, "This project is closed and no longer accepting applications");
  }
  
  // Check if the student has already applied for this project
  const existingApplication = await RequestProj.findOne({
    projectId,
    studentId: req.user._id
  });

  if (existingApplication) {
    throw new ApiError(400, "You have already applied to this project");
  }

  // Process uploaded files
  const docsURL = [];
  if (req.files && req.files.length) {
    for (const file of req.files) {
      const cloudinaryResponse = await uploadOnCloudinary(file.path);
      docsURL.push(cloudinaryResponse.secure_url);
    }
  }

  // Create a new application
  const request = await RequestProj.create({
    projectId, studentId: req.user._id, doc: docsURL
  });

  res.status(201).json({
    success: true,
    data: request
  });
});


const getPendingApplications = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const applications = await RequestProj.find({ projectId, status: 'pending' })
      .populate('studentId', 'fullName email rollNumber mobileNumber') 
      .select('status applicationDate docs');
  
    res.status(200).json({ success: true, data: applications });
});

const getAcceptedApplications = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
      const applications = await RequestProj.find({ projectId, status: 'accepted' })
      .populate('studentId', 'fullName email rollNumber mobileNumber') 
      .select('status applicationDate docs');
  
    res.status(200).json({ success: true, data: applications });
});

const getRejectedApplications = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const applications = await RequestProj.find({ projectId, status: 'rejected' })
      .populate('studentId', 'fullName email rollNumber mobileNumber') 
      .select('status applicationDate docs');
  
    res.status(200).json({ success: true, data: applications });
});

const updateApplicationStatus = asyncHandler(async (req, res) => {
    const { applicationId } = req.params; 
    const { status } = req.body;
  
    if (!["accepted", "rejected"].includes(status)) {
      throw new ApiError(400, "Invalid status value. Allowed values are 'accepted', or 'rejected'.");
    }

    const updatedApplication = await RequestProj.findByIdAndUpdate(
      applicationId,
      { status },
      { new: true }  
    );
  
    if (!updatedApplication) {
      throw new ApiError(404, "Application not found");
    }
    res.status(200).json({ success: true, data: updatedApplication });
});

const getStudentApplications = asyncHandler(async (req, res) => {
  try {
    const studentId = req.user._id; 
    const { projId } = req.query;

    const application = await RequestProj.findOne({ studentId, projectId: projId }).select('status');
    if (!application) {
      return res.status(200).json({ success: true, data: "notapplied" });
    }

    res.status(200).json({ success: true, data: application.status });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

const closeProject = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const project = await ProfProject.findById(id);
    if (!project) {
      throw new ApiError(404, "Project not found");
    }
  
    project.closed = true;
    await project.save();
  
    res.status(200).json({ 
      success: true, 
      message: "Project marked as closed" 
    });
});

export { 
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
};