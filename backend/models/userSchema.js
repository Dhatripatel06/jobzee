import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide your Name!"],
    minLength: [3, "Name must contain at least 3 Characters!"],
    maxLength: [30, "Name cannot exceed 30 Characters!"],
  },
  email: {
    type: String,
    required: [true, "Please provide your Email!"],
    validate: [validator.isEmail, "Please provide a valid Email!"],
  },
  phone: {
    type: Number,
    required: [true, "Please provide your Phone Number!"],
  },
  password: {
    type: String,
    required: [true, "Please provide your Password!"],
    minLength: [8, "Password must contain at least 8 characters!"],
    maxLength: [32, "Password cannot exceed 32 characters!"],
    select: false,
  },
  role: {
    type: String,
    required: [true, "Please provide your role"],
    enum: ["Job Seeker", "Employer"],
  },
  // Profile fields for employee profiles
  profilePhoto: {
    public_id: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  bio: {
    type: String,
    maxLength: [500, "Bio cannot exceed 500 characters"],
    default: "",
  },
  
  // LinkedIn-style Professional Headline
  headline: {
    type: String,
    maxLength: [120, "Headline cannot exceed 120 characters"],
    default: "",
  },
  
  // Skills - simple array for Job Seekers
  skills: {
    type: [String],
    default: [],
  },
  
  // Experience - detailed array of objects for Job Seekers
  experience: [
    {
      company: {
        type: String,
        trim: true,
      },
      role: {
        type: String,
        trim: true,
      },
      location: {
        type: String,
        trim: true,
      },
      startDate: {
        type: Date,
      },
      endDate: {
        type: Date,
      },
      current: {
        type: Boolean,
        default: false,
      },
      description: {
        type: String,
        maxLength: [1000, "Experience description cannot exceed 1000 characters"],
      },
    },
  ],
  
  // Education - for Job Seekers
  education: [
    {
      school: {
        type: String,
        trim: true,
      },
      degree: {
        type: String,
        trim: true,
      },
      fieldOfStudy: {
        type: String,
        trim: true,
      },
      startDate: {
        type: Date,
      },
      endDate: {
        type: Date,
      },
      current: {
        type: Boolean,
        default: false,
      },
      grade: {
        type: String,
        trim: true,
      },
      description: {
        type: String,
        maxLength: [500, "Education description cannot exceed 500 characters"],
      },
    },
  ],
  
  // Connections - LinkedIn-style professional network
  connections: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  
  // Employer-specific fields
  companyWebsite: {
    type: String,
    validate: {
      validator: function (v) {
        if (!v) return true; // Allow empty
        return validator.isURL(v);
      },
      message: "Please provide a valid URL",
    },
  },
  industry: {
    type: String,
    trim: true,
  },
  companySize: {
    type: String,
    enum: [
      "",
      "1-10 employees",
      "11-50 employees",
      "51-200 employees",
      "201-500 employees",
      "501-1000 employees",
      "1001-5000 employees",
      "5001-10000 employees",
      "10000+ employees",
    ],
    default: "",
  },
  
  // Privacy settings
  showEmail: {
    type: Boolean,
    default: false,
  },
  showPhone: {
    type: Boolean,
    default: false,
  },
  // Online status for real-time chat
  isOnline: {
    type: Boolean,
    default: false,
  },
  lastSeen: {
    type: Date,
    default: Date.now,
  },
  // For OTP verification
  phoneVerified: {
    type: Boolean,
    default: false,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


//ENCRYPTING THE PASSWORD WHEN THE USER REGISTERS OR MODIFIES HIS PASSWORD
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

//COMPARING THE USER PASSWORD ENTERED BY USER WITH THE USER SAVED PASSWORD
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//GENERATING A JWT TOKEN WHEN A USER REGISTERS OR LOGINS, IT DEPENDS ON OUR CODE THAT WHEN DO WE NEED TO GENERATE THE JWT TOKEN WHEN THE USER LOGIN OR REGISTER OR FOR BOTH. 
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

export const User = mongoose.model("User", userSchema);