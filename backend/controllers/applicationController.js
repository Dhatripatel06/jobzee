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
const processApplications = (applications, req) => {
  console.log('processApplications called with', applications.length, 'applications');
  return applications.map(app => {
    const appObj = app.toObject();
    if (appObj.resume && appObj.resume.url) {
      const url = appObj.resume.url.toLowerCase();
      console.log('Processing resume URL:', appObj.resume.url);

      // Check if it's a PDF or document
      const isPDF = url.includes('.pdf') || url.endsWith('.pdf');
      const isDoc = url.includes('.doc') || url.includes('.docx') || url.endsWith('.doc') || url.endsWith('.docx');
      const isCloudinaryFile = url.includes('cloudinary.com');
      const isRawUpload = url.includes('/raw/upload/');
      const isImageUpload = url.includes('/image/upload/');

      console.log('Detection results - isPDF:', isPDF, 'isDoc:', isDoc, 'isCloudinaryFile:', isCloudinaryFile, 'isRawUpload:', isRawUpload);

      // For PDFs/Docs from Cloudinary, use backend proxy URL
      // This handles both old (/image/upload/) and new (/raw/upload/) uploads
      if ((isPDF || isDoc) && isCloudinaryFile) {
        appObj.resume.proxyUrl = `${req.protocol}://${req.get("host")}/api/v1/application/resume/${appObj._id}`;
        appObj.resume.originalUrl = appObj.resume.url;

        // Mark old restricted uploads
        if (isImageUpload && isPDF) {
          appObj.resume.isRestricted = true;
          appObj.resume.errorMessage = 'This resume has restricted access. Please re-upload.';
        }

        console.log('Added proxyUrl:', appObj.resume.proxyUrl, 'isRestricted:', appObj.resume.isRestricted || false);
      } else if (!isPDF && !isDoc && isCloudinaryFile) {
        // For images, use direct URL
        console.log('Image file - using direct URL');
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
    const processedApplications = processApplications(applications, req);

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
    const processedApplications = processApplications(applications, req);

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

  console.log('Testing direct URL access for resume:', application.resume.url);

  try {
    const https = await import('https');

    // Use getAuthenticatedUrl to generate a signed URL for fetching
    // This handles both proper private_cdn access and fallback signed URLs
    let directUrl = getAuthenticatedUrl(application.resume.public_id);

    if (!directUrl) {
      console.log('Failed to generate authenticated URL, falling back to stored URL');
      directUrl = application.resume.url.replace('http://', 'https://');
    }

    console.log('Attempting direct access to:', directUrl);

    // Try direct access first - if access_control: anonymous worked, this should succeed
    https.get(directUrl, (response) => {
      console.log('Direct URL response status:', response.statusCode);
      console.log('Response headers:', JSON.stringify(response.headers, null, 2));

      if (response.statusCode === 200) {
        console.log('✓ SUCCESS! Direct URL is publicly accessible');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Access-Control-Allow-Origin', '*');

        response.pipe(res);

        response.on('end', () => {
          console.log('PDF streamed successfully via direct URL');
        });
      } else if (response.statusCode === 401) {
        console.error('✗ FAILED: Still getting 401 - access_control setting did not work');
        console.error('x-cld-error:', response.headers['x-cld-error']);
        return next(new ErrorHandler(
          "PDF access denied. Your Cloudinary account has ACL restrictions. " +
          "Please go to Cloudinary Dashboard → Settings → Security → Access Control " +
          "and enable public access for uploads, or use a different Cloudinary account.",
          401
        ));
      } else {
        console.error('Unexpected status:', response.statusCode);
        return next(new ErrorHandler("Unable to access resume file.", response.statusCode));
      }
    }).on('error', (error) => {
      console.error('Request error:', error);
      return next(new ErrorHandler("Failed to load resume", 500));
    });

  } catch (error) {
    console.error('Error in getResume:', error);
    return next(new ErrorHandler("Failed to load resume", 500));
  }
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

  // CRITICAL FIX: Cloudinary auto-detects PDFs as 'image' type
  // We must use the explicit 'raw' upload API endpoint
  console.log('=== CLOUDINARY UPLOAD START ===');
  console.log('File info:', {
    name: resume.name,
    mimetype: resume.mimetype,
    size: resume.size
  });

  // Use upload with access_control set to anonymous (public)
  const cloudinaryResponse = await cloudinary.v2.uploader.upload(
    resume.tempFilePath,
    {
      resource_type: "raw",     // ✅ FORCE raw
      type: "upload",           // ✅ PUBLIC delivery
      folder: "job_resumes",
      use_filename: true,
      unique_filename: true,
      overwrite: false
    }
  );


  console.log('=== CLOUDINARY UPLOAD COMPLETE ===');
  console.log('Response URL:', cloudinaryResponse.secure_url);
  console.log('Contains /raw/upload/:', cloudinaryResponse.secure_url.includes('/raw/upload/'));
  console.log('Contains /image/upload/:', cloudinaryResponse.secure_url.includes('/image/upload/'));

  // VERIFY the upload worked correctly
  if (cloudinaryResponse.secure_url.includes('/image/upload/')) {
    console.error('ERROR: Cloudinary uploaded as image type despite resource_type: raw');
    console.error('This is a Cloudinary account configuration issue');
    // But continue anyway and try to work with it
  }

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