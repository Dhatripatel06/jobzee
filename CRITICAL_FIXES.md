# 🚨 CRITICAL FIXES - Ready to Implement

These are the must-fix issues with complete code solutions.

---

## Fix #1: OTP Reuse Vulnerability ⚠️ CRITICAL

### Files to Modify:
- `backend/controllers/userController.js` (Line 263-293 and 388-425)

### Changes:

**In `verifyOTPAndLogin` function:**
```javascript
// REPLACE THIS:
otpRecord.verified = true;
await otpRecord.save();

// WITH THIS:
await OTP.deleteOne({ _id: otpRecord._id });
```

**In `verifyOTPAndResetPassword` function:**
```javascript
// REPLACE THIS:
otpRecord.verified = true;
await otpRecord.save();

// WITH THIS:
await OTP.deleteOne({ _id: otpRecord._id });
```

---

## Fix #2: Conversation Authorization Check ⚠️ CRITICAL

### File to Modify:
- `backend/server.js` (Line 71-108)

### Replace entire `sendMessage` handler:

```javascript
socket.on("sendMessage", async (data) => {
  try {
    const { receiverId, content, conversationId, messageType = "text" } = data;
    const senderId = socket.userId;

    // Validate inputs
    if (!receiverId || !content || content.trim().length === 0) {
      socket.emit("messageError", { error: "Invalid message data" });
      return;
    }

    if (content.length > 5000) {
      socket.emit("messageError", { error: "Message too long (max 5000 characters)" });
      return;
    }

    // Prevent self-messaging
    if (senderId === receiverId) {
      socket.emit("messageError", { error: "Cannot send message to yourself" });
      return;
    }

    // Verify receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      socket.emit("messageError", { error: "User not found" });
      return;
    }

    let conversation;

    if (conversationId) {
      // Verify sender is participant of this conversation
      conversation = await Conversation.findOne({
        _id: conversationId,
        participants: senderId
      });

      if (!conversation) {
        socket.emit("messageError", { error: "Unauthorized: Not a participant" });
        return;
      }

      // Verify receiver is also a participant
      if (!conversation.participants.includes(receiverId)) {
        socket.emit("messageError", { error: "Invalid receiver for this conversation" });
        return;
      }
    } else {
      // Find or create conversation
      conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [senderId, receiverId],
          unreadCount: new Map(),
        });
      }
    }

    // Create message
    const message = await Message.create({
      conversationId: conversation._id,
      sender: senderId,
      receiver: receiverId,
      content: content.trim(),
      messageType,
      status: "sent",
    });

    // Populate sender and receiver details
    await message.populate("sender", "name email profilePhoto");
    await message.populate("receiver", "name email profilePhoto");

    // Update conversation
    const updateObj = {};
    updateObj[`unreadCount.${receiverId}`] = 1;

    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessage: message._id,
      $inc: updateObj,
    });

    // Emit to sender
    io.to(senderId).emit("messageSent", message);

    // Check if receiver is online and deliver
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", message);

      // Auto-mark as delivered
      message.status = "delivered";
      message.deliveredAt = new Date();
      await message.save();

      io.to(senderId).emit("messageDelivered", {
        messageId: message._id,
        conversationId: conversation._id,
      });
    }
  } catch (error) {
    console.error("Error in sendMessage:", error);
    if (socket.connected) {
      socket.emit("messageError", { error: "Failed to send message" });
    }
  }
});
```

---

## Fix #3: Rate Limiting on OTP Endpoints ⚠️ CRITICAL

### Files to Create/Modify:

#### 1. Install package:
```bash
cd backend
npm install express-rate-limit
```

#### 2. Create `backend/middlewares/rateLimiter.js`:
```javascript
import rateLimit from "express-rate-limit";

// OTP request limiter - 3 requests per 15 minutes
export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3,
  message: {
    success: false,
    message: "Too many OTP requests. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

// Login limiter - 10 attempts per 15 minutes
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API limiter - 100 requests per 15 minutes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
```

#### 3. Modify `backend/routes/userRouter.js`:
```javascript
import { otpLimiter, loginLimiter } from "../middlewares/rateLimiter.js";

// Add limiters to routes:
router.post("/login", loginLimiter, login);
router.post("/otp/send", otpLimiter, sendOTPForLogin);
router.post("/otp/verify", loginLimiter, verifyOTPAndLogin);
router.post("/password/forgot", otpLimiter, forgotPassword);
router.post("/password/reset", loginLimiter, verifyOTPAndResetPassword);
```

---

## Fix #4: Input Sanitization ⚠️ CRITICAL

### Install packages:
```bash
cd backend
npm install express-mongo-sanitize xss-clean helmet
```

### Modify `backend/app.js`:

Add imports at the top:
```javascript
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import helmet from "helmet";
```

Add middleware after `express.json()`:
```javascript
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Security middleware
app.use(helmet()); // Security headers
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(xss()); // Prevent XSS attacks

// CORS
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);
```

---

## Fix #5: Message Content Validation

### Modify `backend/controllers/messageController.js`:

**Replace `sendMessage` function (Line 13-55) with:**
```javascript
export const sendMessage = catchAsyncError(async (req, res, next) => {
  const { receiverId, content, messageType = "text" } = req.body;
  const senderId = req.user._id;

  // Validation
  if (!receiverId) {
    return next(new ErrorHandler("Receiver ID is required", 400));
  }

  if (!content || content.trim().length === 0) {
    return next(new ErrorHandler("Message content cannot be empty", 400));
  }

  if (content.length > 5000) {
    return next(new ErrorHandler("Message too long (max 5000 characters)", 400));
  }

  // Prevent self-messaging
  if (senderId.toString() === receiverId) {
    return next(new ErrorHandler("Cannot send message to yourself", 400));
  }

  // Verify receiver exists
  const receiver = await User.findById(receiverId);
  if (!receiver) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Sanitize content
  const sanitizedContent = content.trim();

  // Find or create conversation
  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, receiverId],
      unreadCount: new Map(),
    });
  }

  // Create message
  const message = await Message.create({
    conversationId: conversation._id,
    sender: senderId,
    receiver: receiverId,
    content: sanitizedContent,
    messageType,
    status: "sent",
  });

  // Populate sender and receiver
  await message.populate("sender", "name email profilePhoto");
  await message.populate("receiver", "name email profilePhoto");

  // Update conversation
  const updateObj = {};
  updateObj[`unreadCount.${receiverId}`] = 1;

  await Conversation.findByIdAndUpdate(conversation._id, {
    lastMessage: message._id,
    $inc: updateObj,
  });

  res.status(201).json({
    success: true,
    message: message,
  });
});
```

---

## Fix #6: Profile Photo Validation

### Modify `backend/controllers/userController.js`:

**In `updateEmployeeProfile` function (around Line 166-178), REPLACE:**
```javascript
if (req.files && req.files.profilePhoto) {
  const { profilePhoto } = req.files;

  // If user already has a photo, delete it from Cloudinary
  if (user.profilePhoto && user.profilePhoto.public_id) {
    await cloudinary.v2.uploader.destroy(user.profilePhoto.public_id);
  }

  // Upload new photo
  const cloudinaryResponse = await cloudinary.v2.uploader.upload(
    profilePhoto.tempFilePath,
    { folder: "JOB_PORTAL_PROFILES" }
  );

  user.profilePhoto = {
    public_id: cloudinaryResponse.public_id,
    url: cloudinaryResponse.secure_url,
  };
}
```

**WITH:**
```javascript
if (req.files && req.files.profilePhoto) {
  const { profilePhoto } = req.files;

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (!allowedTypes.includes(profilePhoto.mimetype)) {
    return next(
      new ErrorHandler(
        "Only image files (JPEG, PNG, WebP) are allowed",
        400
      )
    );
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (profilePhoto.size > maxSize) {
    return next(
      new ErrorHandler("Image size must be less than 5MB", 400)
    );
  }

  // If user already has a photo, delete it from Cloudinary
  if (user.profilePhoto && user.profilePhoto.public_id) {
    await cloudinary.v2.uploader.destroy(user.profilePhoto.public_id);
  }

  // Upload new photo with additional options
  const cloudinaryResponse = await cloudinary.v2.uploader.upload(
    profilePhoto.tempFilePath,
    {
      folder: "JOB_PORTAL_PROFILES",
      transformation: [
        { width: 500, height: 500, crop: "limit" },
        { quality: "auto:good" },
      ],
    }
  );

  user.profilePhoto = {
    public_id: cloudinaryResponse.public_id,
    url: cloudinaryResponse.secure_url,
  };
}
```

---

## Fix #7: Email Enumeration Prevention

### Modify `backend/controllers/userController.js`:

**In `login` function, REPLACE:**
```javascript
if (!user) {
  return next(new ErrorHandler("User not found!", 404));
}

const isPasswordMatched = await user.comparePassword(password);
if (!isPasswordMatched) {
  return next(new ErrorHandler("Invalid Password!", 401));
}
```

**WITH:**
```javascript
if (!user) {
  return next(new ErrorHandler("Invalid credentials", 401));
}

const isPasswordMatched = await user.comparePassword(password);
if (!isPasswordMatched) {
  return next(new ErrorHandler("Invalid credentials", 401));
}
```

**In `sendOTPForLogin` function, REPLACE:**
```javascript
if (!user) {
  return next(new ErrorHandler("User not found with this email/phone", 404));
}
```

**WITH:**
```javascript
if (!user) {
  // Don't reveal if user exists - send generic message
  return res.status(200).json({
    success: true,
    message: "If this email/phone is registered, you will receive an OTP.",
  });
}
```

---

## Fix #8: Database Indexes

### Modify Schema Files:

#### `backend/models/conversationSchema.js`:
Add after schema definition:
```javascript
conversationSchema.index({ participants: 1, updatedAt: -1 });
conversationSchema.index({ updatedAt: -1 });
```

#### `backend/models/messageSchema.js`:
Add after schema definition:
```javascript
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, status: 1 });
messageSchema.index({ sender: 1, createdAt: -1 });
```

#### `backend/models/userSchema.js`:
Add after schema definition:
```javascript
userSchema.index({ email: 1, role: 1 });
userSchema.index({ role: 1, skills: 1 });
userSchema.index({ role: 1 });
```

---

## Fix #9: Skills Array Validation

### Modify `backend/controllers/userController.js`:

**In `updateEmployeeProfile` function, REPLACE:**
```javascript
if (skills) {
  user.skills = Array.isArray(skills)
    ? skills
    : skills.split(",").map((skill) => skill.trim());
}
```

**WITH:**
```javascript
if (skills) {
  const skillsArray = Array.isArray(skills)
    ? skills
    : skills.split(",").map((s) => s.trim());

  // Validate skills array length
  if (skillsArray.length > 50) {
    return next(new ErrorHandler("Maximum 50 skills allowed", 400));
  }

  // Validate each skill length and remove empty/invalid entries
  const validSkills = skillsArray.filter(
    (skill) => skill.length > 0 && skill.length <= 50
  );

  if (validSkills.length === 0) {
    return next(new ErrorHandler("At least one valid skill is required", 400));
  }

  user.skills = validSkills;
}
```

---

## Fix #10: Typing Indicator Timeout

### Modify `frontend/src/components/Chat/MessageBox.jsx`:

Add this useEffect after line 118:
```javascript
// Auto-clear typing indicator after 5 seconds
useEffect(() => {
  let typingTimeout;
  if (isTyping) {
    typingTimeout = setTimeout(() => {
      setIsTyping(false);
    }, 5000);
  }
  return () => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
  };
}, [isTyping]);
```

---

## 🔧 IMPLEMENTATION ORDER

Execute fixes in this order:

1. **Fix #3** - Install rate limiting packages
2. **Fix #4** - Install security packages and update app.js
3. **Fix #8** - Add database indexes (quick, no dependencies)
4. **Fix #1** - Fix OTP reuse vulnerability
5. **Fix #7** - Fix email enumeration
6. **Fix #6** - Add profile photo validation
7. **Fix #9** - Add skills validation
8. **Fix #5** - Add message content validation
9. **Fix #2** - Update socket message handler (most complex)
10. **Fix #10** - Add typing indicator timeout

---

## 🧪 TESTING AFTER FIXES

### Test OTP Security:
```javascript
// Test 1: Try reusing same OTP after verification
// Expected: Should fail with "Invalid or expired OTP"

// Test 2: Try sending 4 OTP requests in 15 minutes
// Expected: 4th request should be rate limited

// Test 3: Send OTP to non-existent email
// Expected: Generic success message (no enumeration)
```

### Test Message Authorization:
```javascript
// Test 1: Try sending message to conversation you're not part of
// Expected: "Unauthorized: Not a participant"

// Test 2: Try sending message longer than 5000 chars
// Expected: "Message too long"

// Test 3: Try sending message to yourself
// Expected: "Cannot send message to yourself"
```

### Test Input Sanitization:
```javascript
// Test 1: Send message with <script>alert('xss')</script>
// Expected: Should be sanitized

// Test 2: Try NoSQL injection in login: {"email": {"$gt": ""}}
// Expected: Should be sanitized
```

---

## 📊 VERIFICATION CHECKLIST

After implementing all fixes:

- [ ] Run `npm install` in backend
- [ ] Restart backend server
- [ ] Check MongoDB indexes: `db.users.getIndexes()`
- [ ] Test OTP rate limiting (3 requests should work, 4th should fail)
- [ ] Test message sending with invalid conversation ID
- [ ] Test profile photo upload with large file (should fail)
- [ ] Test profile photo upload with .exe file (should fail)
- [ ] Test sending very long message (should fail at 5001 chars)
- [ ] Test reusing OTP after verification (should fail)
- [ ] Test login with wrong email (should get generic error)
- [ ] Check typing indicator disappears after 5 seconds
- [ ] Test sending 51 skills (should fail)

---

## ⚠️ IMPORTANT NOTES

1. **Backup Database** before implementing index changes
2. **Test in Development** first - do not deploy directly to production
3. **Monitor Rate Limits** - adjust windowMs and max based on real usage
4. **Check Cloudinary Quota** - image compression may increase processing
5. **Update Frontend Error Handling** - some error messages have changed

---

## 🚀 DEPLOYMENT CHECKLIST

Before deploying to production:

1. [ ] All 10 fixes implemented
2. [ ] All tests passing
3. [ ] Rate limiters configured correctly
4. [ ] MongoDB indexes created
5. [ ] Environment variables updated
6. [ ] Error logging configured
7. [ ] Security headers verified (helmet)
8. [ ] CORS origins configured
9. [ ] Socket.IO CORS configured
10. [ ] Documentation updated

---

**Status**: ✅ Ready to implement  
**Estimated Time**: 2-3 hours  
**Risk Level**: Medium (requires careful testing)  
**Rollback Plan**: Keep database backup and previous code version in git
