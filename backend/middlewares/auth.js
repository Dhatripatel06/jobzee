import { User } from "../models/userSchema.js";
import { catchAsyncError } from "./catchAsyncError.js";
import ErrorHandler from "./error.js";
import jwt from "jsonwebtoken";

export const isAuthorized = catchAsyncError(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler("User Not Authorized", 401));
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  req.user = await User.findById(decoded.id);

  next();
});

// Middleware that accepts token from cookies OR query params (for iframe PDF viewing)
export const isAuthorizedWithToken = catchAsyncError(async (req, res, next) => {
  // Try to get token from cookies first, then from query params
  const token = req.cookies.token || req.query.token;
  
  console.log('isAuthorizedWithToken - token from cookies:', req.cookies.token ? 'exists' : 'missing');
  console.log('isAuthorizedWithToken - token from query:', req.query.token ? 'exists' : 'missing');
  console.log('isAuthorizedWithToken - final token:', token ? 'exists (length: ' + token.length + ')' : 'missing');
  
  if (!token) {
    console.log('isAuthorizedWithToken - no token found, returning 401');
    return next(new ErrorHandler("User Not Authorized", 401));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log('isAuthorizedWithToken - token decoded successfully, user ID:', decoded.id);
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      console.log('isAuthorizedWithToken - user not found in database');
      return next(new ErrorHandler("User Not Authorized", 401));
    }
    
    console.log('isAuthorizedWithToken - authentication successful for user:', req.user._id);
    next();
  } catch (error) {
    console.log('isAuthorizedWithToken - token verification failed:', error.message);
    return next(new ErrorHandler("User Not Authorized", 401));
  }
});