import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { Job } from "../models/jobSchema.js";
import ErrorHandler from "../middlewares/error.js";

export const getAllJobs = catchAsyncError(async (req, res, next) => {
  const jobs = await Job.find({ expired: false });
  res.status(200).json({
    success: true,
    jobs,
  });
});

export const postJob = catchAsyncError(async (req, res, next) => {
  const {role} = req.user;
  if (role === "Job Seeker") {
    return next(
      new ErrorHandler(
        "Job Seeker not allowed to access this resource.", 400
        )
        );
      }
    const {
        title,
        description,
        category,
        country,
        city,
        location,
        fixedSalary,
        salaryFrom,
        salaryTo,
      } = req.body;
    
      if (!title || !description || !category || !country || !city || !location) {
          return next(new ErrorHandler("Please provide full job details.", 400));
        }
            
      if ((!salaryFrom || !salaryTo) && !fixedSalary) {
          return next(
              new ErrorHandler(
                  "Please either provide fixed salary or ranged salary.",
                  400
                )
              );
            }
            
      if (salaryFrom && salaryTo && fixedSalary) {
          return next(
              new ErrorHandler("Cannot Enter Fixed and Ranged Salary together.", 400)
            );
          }
      const postedBy = req.user._id;
      const job = await Job.create({
          title,
          description,
          category,
          country,
          city,
          location,
          fixedSalary,
          salaryFrom,
          salaryTo,
          postedBy,
        });

        res.status(200).json({
            success: true,
            message: "Job Posted Successfully!",
            job,
          });            
});
export const getMyJobs = catchAsyncError(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(
      new ErrorHandler("Job Seeker not allowed to access this resource.", 400)
    );
  }
  const myJobs = await Job.find({ postedBy: req.user._id });
  res.status(200).json({
    success: true,
    myJobs,
  });
});

export const updateJob = catchAsyncError(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(
      new ErrorHandler("Job Seeker not allowed to access this resource.", 400)
    );
  }
  const { id } = req.params;
  let job = await Job.findById(id);
  if (!job) {
    return next(new ErrorHandler("OOPS! Job not found.", 404));
  }
  if (job.postedBy.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("You are not authorized to update this job.", 403));
  }
  job = await Job.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    job,
    message: "Job Updated! Successfully!",
  });
});

export const deleteJob = catchAsyncError(async (req, res, next) => {
  const { role } = req.user;
  if (role === "Job Seeker") {
    return next(
      new ErrorHandler("Job Seeker not allowed to access this resource.", 400)
    );
  }
  const { id } = req.params;
  const job = await Job.findById(id);
  if (!job) {
    return next(new ErrorHandler("OOPS! Job not found.", 404));
  }
  if (job.postedBy.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("You are not authorized to delete this job.", 403));
  }
  await job.deleteOne();
  res.status(200).json({
    success: true,
    message: "Job Deleted Successfully!",
  });
});

export const getSingleJob = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  try {
    const job = await Job.findById(id);
    if (!job) {
      return next(new ErrorHandler("Job not found.", 404));
    }
    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    return next(new ErrorHandler(`Invalid ID / CastError`, 404));
  }
});