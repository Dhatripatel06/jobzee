import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import { sendToken } from "../utils/jwtToken.js";
import { OTP } from "../models/otpSchema.js";
import { generateOTP, sendOTPEmail, sendOTPSMS, validateOTPFormat, isOTPExpired } from "../utils/otpService.js";
import cloudinary from "cloudinary";

export const register = catchAsyncError(async (req, res, next) => {
  const { name, email, phone, role, password } = req.body;
  if (!name || !email || !phone || !role || !password) {
    return next(new ErrorHandler("Please fill full registration form!"));
  }
  const isEmail = await User.findOne({ email });
  if (isEmail) {
    return next(new ErrorHandler("Email already exists!"));
  }
  const user = await User.create({
    name,
    email,
    phone,
    role,
    password,
  });
  sendToken(user, 200, res, "User Registered! Successfully");
});

export const login = catchAsyncError(async (req, res, next) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return next(new ErrorHandler("Please provide email ,password and role."));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid Email Or Password.", 400));
  }
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Email Or Password.", 400));
  }
  if (user.role !== role) {
    return next(
      new ErrorHandler("User with this role not found!", 400)
    );
  }
  sendToken(user, 200, res, "User Logged in successfully!");
});

export const logout = catchAsyncError(async (req, res, next) => {
  res
    .status(201)
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
      secure: true,
      sameSite: "None",
    })
    .json({
      success: true,
      message: " User Logged Out Successfully!",
    });
});


export const getUser = catchAsyncError((req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});

export const updateProfile = catchAsyncError(async (req, res, next) => {
  const { name, email, phone, password } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return next(new ErrorHandler("Email already in use", 400));
    }
    user.email = email;
  }

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (password) user.password = password;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    }
  });
});

// ==================== EMPLOYEE PROFILE ENDPOINTS ====================

// Get all employees (Job Seekers) for browsing
export const getAllEmployees = catchAsyncError(async (req, res, next) => {
  const { search, skills, page = 1, limit = 20 } = req.query;

  let query = { role: "Job Seeker" };

  // Add search filter
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { bio: { $regex: search, $options: "i" } },
    ];
  }

  // Add skills filter
  if (skills) {
    const skillsArray = skills.split(",");
    query.skills = { $in: skillsArray };
  }

  const employees = await User.find(query)
    .select("name email phone profilePhoto bio skills experience role isOnline lastSeen showEmail showPhone headline education")
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(query);

  // Add connection status if user is authenticated
  let employeesWithStatus = employees;
  if (req.user) {
    const currentUser = await User.findById(req.user._id).select("connections");
    employeesWithStatus = employees.map(emp => {
      const empObj = emp.toObject();
      empObj.isConnected = currentUser.connections.some(
        connId => connId.toString() === emp._id.toString()
      );
      return empObj;
    });
  }

  res.status(200).json({
    success: true,
    employees: employeesWithStatus,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total,
    },
  });
});

// Get single employee profile by ID
export const getEmployeeProfile = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const employee = await User.findById(id)
    .select("name email phone profilePhoto bio skills experience education headline role isOnline lastSeen showEmail showPhone createdAt companyWebsite industry companySize");

  if (!employee) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Respect privacy settings
  if (!employee.showEmail) {
    employee.email = undefined;
  }
  if (!employee.showPhone) {
    employee.phone = undefined;
  }

  res.status(200).json({
    success: true,
    employee,
  });
});

// Update employee profile (extended)
export const updateEmployeeProfile = catchAsyncError(async (req, res, next) => {
  const {
    name,
    bio,
    skills,
    experience,
    education,
    headline,
    companyWebsite,
    industry,
    companySize,
    showEmail,
    showPhone
  } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  if (name) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (headline !== undefined) user.headline = headline;
  if (skills) user.skills = Array.isArray(skills) ? skills : skills.split(",").map(s => s.trim());

  // Handle experience - parse if it's a JSON string
  if (experience !== undefined) {
    user.experience = typeof experience === 'string' ? JSON.parse(experience) : experience;
  }

  // Handle education - parse if it's a JSON string
  if (education !== undefined) {
    user.education = typeof education === 'string' ? JSON.parse(education) : education;
  }

  // Employer-specific fields
  if (user.role === "Employer") {
    if (companyWebsite !== undefined) user.companyWebsite = companyWebsite;
    if (industry !== undefined) user.industry = industry;
    if (companySize !== undefined) user.companySize = companySize;
  }

  if (showEmail !== undefined) user.showEmail = showEmail;
  if (showPhone !== undefined) user.showPhone = showPhone;

  // Handle profile photo upload
  if (req.files && req.files.profilePhoto) {
    const { profilePhoto } = req.files;

    // Delete old profile photo if exists
    if (user.profilePhoto && user.profilePhoto.public_id) {
      await cloudinary.v2.uploader.destroy(user.profilePhoto.public_id);
    }

    // Upload new photo
    const cloudinaryResponse = await cloudinary.v2.uploader.upload(
      profilePhoto.tempFilePath,
      { folder: "jobzee_profiles" }
    );

    user.profilePhoto = {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    };
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user,
  });
});

// ==================== OTP-BASED LOGIN ENDPOINTS ====================

// Send OTP for login
export const sendOTPForLogin = catchAsyncError(async (req, res, next) => {
  const { email, phone, method, role } = req.body; // method: 'email' or 'sms'

  if (!method || !role) {
    return next(new ErrorHandler("Please provide method and role", 400));
  }

  if (method === "email" && !email) {
    return next(new ErrorHandler("Please provide email", 400));
  }

  if (method === "sms" && !phone) {
    return next(new ErrorHandler("Please provide phone number", 400));
  }

  // Find user
  let user;
  if (method === "email") {
    user = await User.findOne({ email, role });
  } else {
    user = await User.findOne({ phone, role });
  }

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Generate OTP
  const otp = generateOTP();

  // Save OTP to database
  await OTP.create({
    userId: user._id,
    email: method === "email" ? email : undefined,
    phone: method === "sms" ? phone : undefined,
    otp,
    type: "login",
  });

  // Send OTP
  let result;
  if (method === "email") {
    result = await sendOTPEmail(email, otp, "login");
  } else {
    result = await sendOTPSMS(phone, otp, "login");
  }

  if (!result.success) {
    return next(new ErrorHandler("Failed to send OTP", 500));
  }

  res.status(200).json({
    success: true,
    message: `OTP sent successfully to your ${method === "email" ? "email" : "phone"}`,
    identifier: method === "email" ? email : phone,
  });
});

// Verify OTP and login
export const verifyOTPAndLogin = catchAsyncError(async (req, res, next) => {
  const { email, phone, otp, method } = req.body;

  if (!otp || !method) {
    return next(new ErrorHandler("Please provide OTP and method", 400));
  }

  if (!validateOTPFormat(otp)) {
    return next(new ErrorHandler("Invalid OTP format", 400));
  }

  // Find OTP record
  let otpRecord;
  if (method === "email") {
    otpRecord = await OTP.findOne({ email, otp, type: "login", verified: false })
      .sort({ createdAt: -1 });
  } else {
    otpRecord = await OTP.findOne({ phone, otp, type: "login", verified: false })
      .sort({ createdAt: -1 });
  }

  if (!otpRecord) {
    return next(new ErrorHandler("Invalid or expired OTP", 400));
  }

  // Check if OTP is expired
  if (isOTPExpired(otpRecord.expiresAt)) {
    return next(new ErrorHandler("OTP has expired", 400));
  }

  // Mark OTP as verified
  otpRecord.verified = true;
  await otpRecord.save();

  // Get user and send token
  const user = await User.findById(otpRecord.userId);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Update verification status
  if (method === "email") {
    user.emailVerified = true;
  } else {
    user.phoneVerified = true;
  }
  await user.save();

  sendToken(user, 200, res, "Login successful!");
});

// ==================== FORGOT PASSWORD ENDPOINTS ====================

// Send OTP for password reset
export const forgotPassword = catchAsyncError(async (req, res, next) => {
  const { email, phone, method } = req.body; // method: 'email' or 'sms'

  if (!method) {
    return next(new ErrorHandler("Please provide method (email or sms)", 400));
  }

  if (method === "email" && !email) {
    return next(new ErrorHandler("Please provide email", 400));
  }

  if (method === "sms" && !phone) {
    return next(new ErrorHandler("Please provide phone number", 400));
  }

  // Find user
  let user;
  if (method === "email") {
    user = await User.findOne({ email });
  } else {
    user = await User.findOne({ phone });
  }

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Generate OTP
  const otp = generateOTP();

  // Save OTP to database
  await OTP.create({
    userId: user._id,
    email: method === "email" ? email : undefined,
    phone: method === "sms" ? phone : undefined,
    otp,
    type: "forgotPassword",
  });

  // Send OTP
  let result;
  if (method === "email") {
    result = await sendOTPEmail(email, otp, "forgotPassword");
  } else {
    result = await sendOTPSMS(phone, otp, "forgotPassword");
  }

  if (!result.success) {
    return next(new ErrorHandler("Failed to send OTP", 500));
  }

  res.status(200).json({
    success: true,
    message: `Password reset OTP sent to your ${method === "email" ? "email" : "phone"}`,
    identifier: method === "email" ? email : phone,
  });
});

// Verify OTP and reset password
export const verifyOTPAndResetPassword = catchAsyncError(async (req, res, next) => {
  const { email, phone, otp, newPassword, method } = req.body;

  if (!otp || !newPassword || !method) {
    return next(new ErrorHandler("Please provide OTP, new password, and method", 400));
  }

  if (!validateOTPFormat(otp)) {
    return next(new ErrorHandler("Invalid OTP format", 400));
  }

  if (newPassword.length < 8) {
    return next(new ErrorHandler("Password must be at least 8 characters", 400));
  }

  // Find OTP record
  let otpRecord;
  if (method === "email") {
    otpRecord = await OTP.findOne({ email, otp, type: "forgotPassword", verified: false })
      .sort({ createdAt: -1 });
  } else {
    otpRecord = await OTP.findOne({ phone, otp, type: "forgotPassword", verified: false })
      .sort({ createdAt: -1 });
  }

  if (!otpRecord) {
    return next(new ErrorHandler("Invalid or expired OTP", 400));
  }

  // Check if OTP is expired
  if (isOTPExpired(otpRecord.expiresAt)) {
    return next(new ErrorHandler("OTP has expired", 400));
  }

  // Mark OTP as verified
  otpRecord.verified = true;
  await otpRecord.save();

  // Update user password
  const user = await User.findById(otpRecord.userId).select("+password");
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successfully! Please login with your new password.",
  });
});

// ==================== CONNECTION SYSTEM ENDPOINTS ====================

// Add a connection
export const addConnection = catchAsyncError(async (req, res, next) => {
  const { id } = req.params; // User to connect with
  const currentUserId = req.user._id;

  // Check if trying to connect with self
  if (id === currentUserId.toString()) {
    return next(new ErrorHandler("You cannot connect with yourself", 400));
  }

  // Find both users
  const currentUser = await User.findById(currentUserId);
  const targetUser = await User.findById(id);

  if (!targetUser) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Check if already connected
  if (currentUser.connections.includes(id)) {
    return next(new ErrorHandler("Already connected with this user", 400));
  }

  // Add to current user's connections
  currentUser.connections.push(id);
  await currentUser.save();

  // Add reciprocal connection (both users are connected)
  if (!targetUser.connections.includes(currentUserId)) {
    targetUser.connections.push(currentUserId);
    await targetUser.save();
  }

  res.status(200).json({
    success: true,
    message: `Successfully connected with ${targetUser.name}`,
    connections: currentUser.connections,
  });
});

// Remove a connection
export const removeConnection = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const currentUserId = req.user._id;

  const currentUser = await User.findById(currentUserId);
  const targetUser = await User.findById(id);

  if (!targetUser) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Remove from current user's connections
  currentUser.connections = currentUser.connections.filter(
    connId => connId.toString() !== id
  );
  await currentUser.save();

  // Remove reciprocal connection
  targetUser.connections = targetUser.connections.filter(
    connId => connId.toString() !== currentUserId.toString()
  );
  await targetUser.save();

  res.status(200).json({
    success: true,
    message: `Connection removed with ${targetUser.name}`,
    connections: currentUser.connections,
  });
});

// Get all connections with full profiles
export const getConnections = catchAsyncError(async (req, res, next) => {
  const currentUser = await User.findById(req.user._id).populate({
    path: "connections",
    select: "name email phone profilePhoto bio skills headline role isOnline lastSeen showEmail showPhone createdAt experience education",
  });

  if (!currentUser) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Filter connections and respect privacy settings
  const connectionsWithPrivacy = currentUser.connections.map(conn => {
    const connObj = conn.toObject();

    if (!connObj.showEmail) {
      delete connObj.email;
    }
    if (!connObj.showPhone) {
      delete connObj.phone;
    }

    return connObj;
  });

  res.status(200).json({
    success: true,
    connections: connectionsWithPrivacy,
    total: connectionsWithPrivacy.length,
  });
});

// Get connection status with a specific user
export const getConnectionStatus = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const currentUserId = req.user._id;

  const currentUser = await User.findById(currentUserId);

  const isConnected = currentUser.connections.includes(id);

  res.status(200).json({
    success: true,
    isConnected,
  });
});