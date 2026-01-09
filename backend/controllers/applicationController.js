import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Application } from "../models/applicationSchema.js";
import { Job } from "../models/jobSchema.js";
import cloudinary from "cloudinary";

// Helper function to generate authenticated URL for Cloudinary resources
const getAuthenticatedUrl = (publicId, resourceType = 'raw') => {
  try {
    // For raw files (PDFs, docs), use private_cdn with signed URLs
    const timestamp = Math.floor(Date.now() / 1000);
    const signedUrl = cloudinary.v2.utils.private_download_url(publicId, null, {
      resource_type: resourceType,
      expires_at: timestamp + 3600, // 1 hour expiry
    });
    return signedUrl;
  } catch (error) {
    console.error('Error generating authenticated URL:', error);
    // Fallback: try regular signed URL
    try {
      return cloudinary.v2.url(publicId, {
        resource_type: resourceType,
        type: 'upload',
        sign_url: true,
        secure: true,
      });
    } catch (fallbackError) {
      console.error('Fallback URL generation also failed:', fallbackError);
      return null;
    }
  }
};

// Helper function to process applications and add proxy URLs
const processApplications = (applications) => {
  console.log('processApplications called with', applications.length, 'applications');
  return applications.map(app => {
    const appObj = app.toObject();
    if (appObj.resume && appObj.resume.url) {
      const url = appObj.resume.url.toLowerCase();
      console.log('Processing resume URL:', appObj.resume.url);

      // Check if it's a PDF or document - more comprehensive detection
      const isPDF = url.includes('.pdf') || url.endsWith('.pdf');
      const isDoc = url.includes('.doc') || url.includes('.docx') || url.endsWith('.doc') || url.endsWith('.docx');
      const isCloudinaryFile = url.includes('cloudinary.com') && (url.includes('/upload/') || url.includes('/raw/upload/') || url.includes('/image/upload/'));

      // For all PDFs/Docs OR any Cloudinary upload (to be safe), use backend proxy URL
      const isPDFOrDoc = isPDF || isDoc || (isCloudinaryFile && !url.includes('/image/upload/') && !url.includes('.jpg') && !url.includes('.jpeg') && !url.includes('.png') && !url.includes('.webp'));

      console.log('Detection results - isPDF:', isPDF, 'isDoc:', isDoc, 'isCloudinaryFile:', isCloudinaryFile, 'isPDFOrDoc:', isPDFOrDoc);

      // For all PDFs/Docs and Cloudinary files (except images), use backend proxy URL
      if (isPDFOrDoc || isCloudinaryFile) {
        appObj.resume.proxyUrl = `http://localhost:4000/api/v1/application/resume/${appObj._id}`;
        appObj.resume.originalUrl = appObj.resume.url; // Keep original for fallback
        console.log('Added proxyUrl:', appObj.resume.proxyUrl);
      } else {
        console.log('No proxyUrl added - appears to be an image');
      }
    } else {
      console.log('No resume URL found for application:', appObj._id);
    }
    return appObj;
  });
};

export const employerGetAllApplications = catchAsyncError(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Job Seeker") {
      return next(
        new ErrorHandler("Job Seeker not allowed to access this resource.", 400)
      );
    }
    const { _id } = req.user;
    const applications = await Application.find({ "employerID.user": _id });
    
    // Process applications to add signed URLs for PDFs
    const processedApplications = processApplications(applications);
    
    res.status(200).json({
      success: true,
      applications: processedApplications,
    });
  }
);

export const jobseekerGetAllApplications = catchAsyncError(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
      return next(
        new ErrorHandler("Employer not allowed to access this resource.", 400)
      );
    }
    const { _id } = req.user;
    const applications = await Application.find({ "applicantID.user": _id });
    
    // Process applications to add signed URLs for PDFs
    const processedApplications = processApplications(applications);
    
    res.status(200).json({
      success: true,
      applications: processedApplications,
    });
  }
);

export const jobseekerDeleteApplication = catchAsyncError(
  async (req, res, next) => {
    const { role } = req.user;
    if (role === "Employer") {
      return next(
        new ErrorHandler("Employer is not allowed to access this resources.", 400)
      );
    }
    const { id } = req.params;
    const application = await Application.findById(id);
    if (!application) {
      return next(new ErrorHandler("Oops, Application not found!", 404));
    }
    if (application.applicantID.user.toString() !== req.user._id.toString()) {
      return next(new ErrorHandler("You are not authorized to delete this application.", 403));
    }
    await application.deleteOne();
    res.status(200).json({
      success: true,
      message: "Application Deleted Successfully!",
    });
  }
);

// Proxy endpoint to serve resume files with authentication
export const getResume = catchAsyncError(async (req, res, next) => {
  console.log('getResume called with params:', req.params);
  console.log('getResume query:', req.query);
  console.log('getResume cookies:', req.cookies);
  console.log('getResume user:', req.user ? 'authenticated' : 'not authenticated');
  
  const { id } = req.params;
  const application = await Application.findById(id);
  
  if (!application) {
    console.log('Application not found for id:', id);
    return next(new ErrorHandler("Application not found!", 404));
  }
  
  console.log('Application found:', application._id);
  console.log('Resume URL:', application.resume.url);
  
  // Check authorization
  const isApplicant = application.applicantID.user.toString() === req.user._id.toString();
  const isEmployer = application.employerID.user.toString() === req.user._id.toString();
  
  console.log('Authorization check - isApplicant:', isApplicant, 'isEmployer:', isEmployer);
  
  if (!isApplicant && !isEmployer) {
    console.log('User not authorized to view this resume');
    return next(new ErrorHandler("You are not authorized to view this resume.", 403));
  }
  
  // For images, redirect directly
  const url = application.resume.url.toLowerCase();
  const isImageFile = url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.webp') || url.includes('.gif');
  const isCloudinaryImage = url.includes('cloudinary.com') && url.includes('/image/upload/') && isImageFile;

  if (isCloudinaryImage) {
    console.log('Redirecting to direct image URL:', application.resume.url);
    return res.redirect(application.resume.url);
  }

  // For PDFs/documents - redirect directly to Cloudinary (bypass ACL with direct access)
  console.log('Processing PDF from Cloudinary:', application.resume.url);
  
  let publicUrl = application.resume.url;
  
  // For Cloudinary URLs, ensure they use secure HTTPS
  if (publicUrl.includes('cloudinary.com')) {
    publicUrl = publicUrl.replace('http://', 'https://');
  }
  
  console.log('Redirecting to Cloudinary URL:', publicUrl);
  
  // Instead of streaming, redirect directly - this bypasses our auth but uses Cloudinary's
  return res.redirect(publicUrl);
});

export const postApplication = catchAsyncError(async (req, res, next) => {
    console.log('postApplication called');
    console.log('Cloudinary config check:', {
      cloud_name: cloudinary.v2.config().cloud_name,
      api_key: cloudinary.v2.config().api_key,
      api_secret: cloudinary.v2.config().api_secret ? '***set***' : 'missing'
    });
    
    const { role } = req.user;
    if (role === "Employer") {
      return next(
        new ErrorHandler("Employer not allowed to access this resource.", 400)
      );
    }
    if (!req.files || Object.keys(req.files).length === 0) {
      return next(new ErrorHandler("Resume File Required!", 400));
    }
  
    const { resume } = req.files;
    const allowedFormats = ["image/png", "image/jpeg", "image/webp", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedFormats.includes(resume.mimetype)) {
      return next(
        new ErrorHandler("Invalid file type. Please upload your resume in PDF, DOC, DOCX, PNG, JPG, OR WEBP Format.", 400)
      );
    }
    
    // Determine resource type based on file type
    // Use 'raw' for PDFs and docs to avoid Cloudinary strict transformation restrictions
    const resourceType = 'raw';
    
    const cloudinaryResponse = await cloudinary.uploader.upload(
      resume.tempFilePath,
      { 
        resource_type: resourceType,
        type: 'upload',
        access_mode: 'public', // Make files publicly accessible
        invalidate: true
      }
    );
  
    if (!cloudinaryResponse || cloudinaryResponse.error) {
      console.error(
        "Cloudinary Error:",
        cloudinaryResponse.error || "Unknown Cloudinary error"
      );
      return next(new ErrorHandler("Failed to upload Resume", 500));
    }
    const { name, email, coverLetter, phone, address, jobId } = req.body;
    const applicantID = {
      user: req.user._id,
      role: "Job Seeker",
    };
    if (!jobId) {
      return next(new ErrorHandler("Job Id not found!", 404));
    }
    const jobDetails = await Job.findById(jobId);
    if (!jobDetails) {
      return next(new ErrorHandler("Job Details not found!", 404));
    }
  
    const employerID = {
      user: jobDetails.postedBy,
      role: "Employer",
    };
    if (
      !name ||
      !email ||
      !coverLetter ||
      !phone ||
      !address ||
      !applicantID ||
      !employerID ||
      !resume
    ) {
      return next(new ErrorHandler("Please fill all fields.", 400));
    }
    const application = await Application.create({
      name,
      email,
      coverLetter,
      phone,
      address,
      applicantID,
      employerID,
      resume: {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
      },
    });
    res.status(200).json({
      success: true,
      message: "Application Submitted!",
      application,
    });
  });