# Jobzee - MERN Job Portal (Enhanced Features)

## New Features Implemented

### 1. Employee Profile Viewing
- **Browse Employees**: Employers can browse all job seekers with search and filter capabilities
- **Detailed Profiles**: View comprehensive profiles with:
  - Profile photo
  - Bio and introduction
  - Skills list
  - Work experience
  - Contact information (with privacy controls)
  - Online/offline status
- **Privacy Controls**: Users can choose to show/hide email and phone number
- **Search & Filter**: Search by name, bio, or filter by skills

**Routes**:
- `/employees` - Browse all employees
- `/employee/:id` - View specific employee profile

**Backend APIs**:
- `GET /api/v1/user/employees` - Get all employees with pagination
- `GET /api/v1/user/employee/:id` - Get employee profile by ID
- `PUT /api/v1/user/employee/profile` - Update employee profile

---

### 2. In-App Messaging System
- **Persistent Storage**: All messages stored in MongoDB
- **Conversation Management**: Organized conversation list with:
  - Last message preview
  - Unread message count
  - User online status
  - Timestamp
- **Message History**: Load and view complete chat history
- **Search Conversations**: Find specific conversations quickly

**Routes**:
- `/chat` - Main chat interface

**Backend APIs**:
- `POST /api/v1/message/send` - Send a new message
- `GET /api/v1/message/conversations` - Get all conversations
- `GET /api/v1/message/conversation/:id` - Get messages for a conversation
- `PUT /api/v1/message/conversation/:id/read` - Mark messages as read
- `DELETE /api/v1/message/message/:id` - Delete a message

**Database Schemas**:
- `Conversation`: Manages chat conversations between users
- `Message`: Stores individual messages with status tracking

---

### 3. Live Chat Using WebSockets (Socket.IO)
- **Real-Time Messaging**: Instant message delivery without page refresh
- **Online Status**: See who's online/offline in real-time
- **Typing Indicators**: Know when the other person is typing
- **Message Status**: Track message delivery and read status
  - Single checkmark (✓): Sent
  - Double checkmark (✓✓): Delivered
  - Blue double checkmark: Read
- **JWT Authentication**: Secure WebSocket connections

**Socket Events**:
- `connection` - User connects
- `sendMessage` - Send a message
- `newMessage` - Receive a message
- `typing` - Typing indicator
- `userOnline`/`userOffline` - Online status updates
- `markAsRead` - Message read status
- `messageDelivered` - Delivery confirmation

---

### 4. OTP-Based Secure Login
- **Dual Method Support**:
  - Email OTP (via Gmail)
  - SMS OTP (via Twilio)
- **Security Features**:
  - 6-digit OTP generation
  - 10-minute expiry time
  - One-time use validation
  - Automatic cleanup of expired OTPs
- **User Experience**:
  - Choose login method (Password or OTP)
  - Select OTP delivery method (Email or SMS)
  - Enter OTP for verification

**Backend APIs**:
- `POST /api/v1/user/otp/send` - Request OTP for login
- `POST /api/v1/user/otp/verify` - Verify OTP and login

**Database Schema**:
- `OTP`: Stores OTPs with expiry and type tracking

---

### 5. Forgot Password Functionality
- **Reset Flow**:
  1. User requests password reset
  2. Choose delivery method (Email or SMS)
  3. Receive OTP
  4. Verify OTP
  5. Set new password
- **Security**:
  - OTP verification required
  - Password hashing with bcrypt
  - Password validation (minimum 8 characters)

**Routes**:
- `/forgot-password` - Forgot password page

**Backend APIs**:
- `POST /api/v1/user/password/forgot` - Request password reset OTP
- `POST /api/v1/user/password/reset` - Reset password with OTP

---

### 6. Multi-Platform Friendly UI
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Mobile-First Approach**: 
  - Touch-friendly interfaces
  - Optimized layouts for small screens
  - Hamburger menu for mobile navigation
- **Chat UI**: Special attention to mobile chat experience
  - Full-screen chat on mobile
  - Split view on desktop
  - Smooth transitions
- **Tailwind CSS**: Modern, utility-first styling
- **Smooth Animations**: Framer Motion for enhanced UX

---

## Setup Instructions

### Backend Setup

1. **Install Dependencies**:
```bash
cd backend
npm install
```

2. **Configure Environment Variables**:
Create a `config/config.env` file:
```env
# Database
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET_KEY=your_jwt_secret_key
JWT_EXPIRE=7d

# Server
PORT=4000

# Cloudinary
CLOUDINARY_CLIENT_NAME=your_cloudinary_name
CLOUDINARY_CLIENT_API=your_cloudinary_api_key
CLOUDINARY_CLIENT_SECRET=your_cloudinary_api_secret

# Email (Gmail) - For OTP
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

# Twilio (Optional - for SMS OTP)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

3. **Gmail App Password Setup** (for Email OTP):
   - Enable 2-factor authentication in your Google account
   - Go to Google Account → Security → App passwords
   - Generate an app password for "Mail"
   - Use this password in `EMAIL_PASSWORD`

4. **Twilio Setup** (Optional - for SMS OTP):
   - Sign up at [twilio.com](https://www.twilio.com/)
   - Get your Account SID and Auth Token
   - Get a Twilio phone number
   - Add credentials to config

5. **Start Backend Server**:
```bash
npm run dev
```

---

### Frontend Setup

1. **Install Dependencies**:
```bash
cd frontend
npm install
```

2. **Configure Environment Variables**:
Create a `.env` file:
```env
VITE_API_URL=http://localhost:4000/api/v1
VITE_SOCKET_URL=http://localhost:4000
```

3. **Start Frontend Dev Server**:
```bash
npm run dev
```

---

## Feature Usage Guide

### For Job Seekers:

1. **Update Your Profile**:
   - Click on your profile
   - Add profile photo, bio, skills, and experience
   - Set privacy preferences for email/phone visibility

2. **Chat with Employers**:
   - Navigate to Messages
   - Start conversations from job applications
   - Receive real-time notifications

3. **Login with OTP**:
   - Select "OTP" tab on login page
   - Choose Email or SMS
   - Enter the 6-digit OTP received

### For Employers:

1. **Browse Talent**:
   - Click "Browse Talent" in navigation
   - Search and filter candidates
   - View detailed profiles
   - Start conversations with candidates

2. **Message Candidates**:
   - Navigate to Messages
   - View all conversations
   - Send instant messages
   - See online status and typing indicators

3. **Password Recovery**:
   - Click "Forgot Password" on login
   - Choose Email or SMS
   - Verify OTP
   - Set new password

---

## Technology Stack

### Backend:
- **Node.js & Express.js**: Server framework
- **MongoDB & Mongoose**: Database
- **Socket.IO**: Real-time WebSocket communication
- **JWT**: Authentication
- **Nodemailer**: Email OTP delivery
- **Twilio**: SMS OTP delivery (optional)
- **Bcrypt**: Password hashing
- **Cloudinary**: Image storage

### Frontend:
- **React**: UI library
- **React Router**: Navigation
- **Socket.IO Client**: WebSocket client
- **Axios**: HTTP requests
- **Tailwind CSS**: Styling
- **Framer Motion**: Animations
- **React Hot Toast**: Notifications
- **js-cookie**: Cookie management

---

## API Endpoints Summary

### User/Profile APIs:
- `GET /api/v1/user/employees` - List all employees
- `GET /api/v1/user/employee/:id` - Get employee profile
- `PUT /api/v1/user/employee/profile` - Update profile

### Authentication APIs:
- `POST /api/v1/user/otp/send` - Send OTP for login
- `POST /api/v1/user/otp/verify` - Verify OTP and login
- `POST /api/v1/user/password/forgot` - Request password reset
- `POST /api/v1/user/password/reset` - Reset password

### Messaging APIs:
- `POST /api/v1/message/send` - Send message
- `GET /api/v1/message/conversations` - Get conversations
- `GET /api/v1/message/conversation/:id` - Get messages
- `PUT /api/v1/message/conversation/:id/read` - Mark as read
- `DELETE /api/v1/message/message/:id` - Delete message

---

## Database Models

### User Schema (Enhanced):
```javascript
{
  name, email, phone, password, role,
  profilePhoto: { public_id, url },
  bio, skills[], experience,
  showEmail, showPhone,
  isOnline, lastSeen,
  phoneVerified, emailVerified
}
```

### OTP Schema:
```javascript
{
  userId, email, phone, otp, type,
  expiresAt, verified, createdAt
}
```

### Conversation Schema:
```javascript
{
  participants[], lastMessage,
  unreadCount: Map
}
```

### Message Schema:
```javascript
{
  conversationId, sender, receiver,
  content, messageType, status,
  readAt, deliveredAt
}
```

---

## Security Considerations

1. **OTP Security**:
   - 10-minute expiry
   - One-time use
   - Auto-deletion after expiry
   - Rate limiting recommended

2. **Socket Security**:
   - JWT authentication required
   - User verification on connection
   - Message sender validation

3. **Password Security**:
   - Bcrypt hashing
   - Minimum 8 characters
   - Not exposed in API responses

4. **Privacy Controls**:
   - User-controlled email/phone visibility
   - Profile privacy settings

---

## Testing Notes

- Test OTP flow with both email and SMS
- Verify real-time messaging across multiple devices
- Test responsive design on various screen sizes
- Check online/offline status updates
- Validate message delivery and read status
- Test forgot password flow end-to-end

---

## Future Enhancements

- Push notifications
- File/image sharing in chat
- Video call integration
- Advanced search filters
- Message reactions
- Group chat functionality
- Email notifications for messages

---

## Support

For issues or questions:
1. Check the console for errors
2. Verify environment variables
3. Ensure MongoDB connection
4. Check Socket.IO connection status
5. Validate Twilio/Gmail credentials

---

## Existing Features (Preserved)

All original features remain functional:
- Job posting and browsing
- Job applications
- User registration and login (password-based)
- Employer dashboard
- Application management
- File upload (resumes)
- User authentication

---

**Happy Coding! 🚀**
