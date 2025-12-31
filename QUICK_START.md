# Quick Start Guide - Jobzee Enhanced Features

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### Step 2: Configure Environment Variables

**Backend** - Create `backend/config/config.env`:
```env
# Minimum Required Configuration
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET_KEY=your_secret_key_here
JWT_EXPIRE=7d
PORT=4000

# Cloudinary (for image uploads)
CLOUDINARY_CLIENT_NAME=your_cloudinary_name
CLOUDINARY_CLIENT_API=your_cloudinary_api_key
CLOUDINARY_CLIENT_SECRET=your_cloudinary_secret

# Gmail for OTP (IMPORTANT!)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

# Twilio for SMS OTP (Optional - can skip for now)
# TWILIO_ACCOUNT_SID=
# TWILIO_AUTH_TOKEN=
# TWILIO_PHONE_NUMBER=
```

**Frontend** - Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:4000/api/v1
VITE_SOCKET_URL=http://localhost:4000
```

### Step 3: Setup Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to Security
3. Enable 2-Step Verification (if not already enabled)
4. Go to "App passwords"
5. Select "Mail" and your device
6. Copy the 16-character password
7. Use this in `EMAIL_PASSWORD` in config.env

### Step 4: Start the Servers

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### Step 5: Access the Application

Open your browser: http://localhost:5173

---

## 🎯 Testing New Features

### 1. Test Employee Profiles
1. Register as a Job Seeker
2. Login
3. Update your profile:
   - Add profile photo
   - Write bio
   - Add skills (comma-separated)
   - Add experience
4. Logout and register as an Employer
5. Navigate to "Browse Talent"
6. View employee profiles

### 2. Test Real-Time Chat
1. Open two browser windows (or one normal + one incognito)
2. Login as Job Seeker in window 1
3. Login as Employer in window 2
4. Go to Messages in both windows
5. Start a conversation from employee profile
6. Send messages back and forth
7. Notice:
   - Instant message delivery
   - Typing indicators
   - Online/offline status
   - Message read receipts

### 3. Test OTP Login
1. Logout from your account
2. On login page, click "OTP" tab
3. Select role
4. Choose "Email" method
5. Enter your email
6. Click "Send OTP"
7. Check your email for OTP
8. Enter the 6-digit code
9. Login successfully

### 4. Test Forgot Password
1. On login page, click "Forgot Password"
2. Select "Email" method
3. Enter your registered email
4. Click "Send OTP"
5. Check email for OTP
6. Enter OTP and new password
7. Reset password
8. Login with new password

---

## 📱 Mobile Testing

1. Open http://YOUR_IP:5173 on your phone (ensure on same network)
2. Test all features on mobile:
   - Employee list (grid adapts)
   - Profile viewing
   - Chat (full-screen interface)
   - Navigation (hamburger menu)

---

## 🔍 Troubleshooting

### Backend won't start:
- Check MongoDB connection string
- Ensure MongoDB is running
- Verify all required env variables are set

### Email OTP not working:
- Verify EMAIL_USER and EMAIL_PASSWORD are correct
- Ensure you're using Gmail App Password (not regular password)
- Check if 2FA is enabled on Google account
- Check spam folder

### Chat not real-time:
- Open browser console (F12)
- Check for Socket.IO connection errors
- Verify VITE_SOCKET_URL is correct
- Ensure backend is running

### Images not uploading:
- Verify Cloudinary credentials
- Check file size (should be reasonable)
- Look for errors in backend console

---

## 🎉 You're All Set!

Enjoy exploring the new features:
- ✅ Browse employee profiles
- ✅ Real-time messaging
- ✅ OTP login
- ✅ Password recovery
- ✅ Mobile-friendly UI

For detailed documentation, see:
- `NEW_FEATURES_GUIDE.md` - Comprehensive feature documentation
- `IMPLEMENTATION_SUMMARY.md` - Technical implementation details

---

## 💡 Tips

1. **Test with two accounts**: Create both Job Seeker and Employer accounts to test all features
2. **Keep console open**: Watch for real-time events in browser console
3. **Mobile testing**: Use your phone to test responsive design
4. **OTP expiry**: OTPs expire in 10 minutes - act fast!
5. **Socket connection**: Socket connects automatically when you login

---

## 🆘 Need Help?

Common issues and solutions:

**"Authentication error" in Socket.IO:**
- Logout and login again to refresh token

**"OTP expired":**
- Request a new OTP (they expire in 10 minutes)

**"Failed to fetch employees":**
- Ensure you're logged in
- Check if backend is running

**Messages not sending:**
- Check Socket.IO connection status
- Verify both users are logged in
- Check backend console for errors

---

**Happy Testing! 🚀**
