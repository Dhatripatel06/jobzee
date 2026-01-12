# Deploy MERN Job WebApp to Vercel

## Prerequisites
1. Install Vercel CLI globally:
```powershell
npm i -g vercel
```

2. Create a Vercel account at https://vercel.com

## Deployment Steps

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Login to Vercel:**
```powershell
vercel login
```

2. **Deploy from root directory:**
```powershell
cd "c:\Users\PC\MERN JOB WEBAPP"
vercel
```

3. **Follow the prompts:**
   - Set up and deploy? → Yes
   - Which scope? → Your account
   - Link to existing project? → No
   - Project name? → mern-job-webapp
   - Which directory? → ./ (root)
   - Override settings? → No

4. **Deploy to production:**
```powershell
vercel --prod
```

### Option 2: Deploy via GitHub Integration

1. **Push code to GitHub:**
```powershell
git init
git add .
git commit -m "Initial commit for Vercel deployment"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

2. **Import in Vercel:**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Configure project settings (Vercel will auto-detect)
   - Click "Deploy"

## Environment Variables Configuration

### In Vercel Dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add these variables for **PRODUCTION**:

#### Backend Variables:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET_KEY=your_jwt_secret
JWT_EXPIRE=7d
COOKIE_EXPIRE=7

CLOUDINARY_CLIENT_NAME=your_cloudinary_name
CLOUDINARY_CLIENT_API=your_cloudinary_api_key
CLOUDINARY_CLIENT_SECRET=your_cloudinary_secret

FRONTEND_URL=https://your-frontend-url.vercel.app

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password

TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone
```

#### Frontend Variables (if needed):
```
VITE_API_URL=https://your-backend-url.vercel.app
```

## Important Notes

### For MongoDB:
- Use MongoDB Atlas (cloud database)
- Get connection string from https://cloud.mongodb.com
- Whitelist Vercel IPs or use 0.0.0.0/0 (allow all)

### For WebSocket (Socket.io):
⚠️ **Vercel Limitations:**
- Vercel serverless functions have 10-second timeout
- Real-time WebSocket connections are limited
- Consider using Vercel's edge functions or deploy backend separately

**Alternative for Chat feature:**
- Deploy backend on Railway, Render, or Heroku (better for WebSocket)
- Keep frontend on Vercel
- Update CORS and frontend API URL accordingly

## Project Structure for Vercel

```
MERN JOB WEBAPP/
├── vercel.json          # Main config (created)
├── .vercelignore        # Ignore file (created)
├── backend/
│   ├── vercel.json      # Backend config (created)
│   ├── server.js
│   └── ...
└── frontend/
    ├── package.json
    ├── vite.config.js
    └── ...
```

## Troubleshooting

### Build fails:
```powershell
# Clear cache and rebuild
vercel --force
```

### Environment variables not working:
- Ensure they're added to the correct environment (Production/Preview/Development)
- Redeploy after adding variables

### Database connection issues:
- Check MongoDB Atlas whitelist
- Verify connection string format
- Check network access settings

## Monitoring

- View logs: https://vercel.com/dashboard → Your Project → Deployments → View Logs
- Check function execution time and errors
- Monitor API routes performance

## Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed by Vercel

## Separate Backend Deployment (Recommended for Socket.io)

If chat features don't work well on Vercel, deploy backend separately:

### Option A: Railway
```powershell
npm i -g @railway/cli
railway login
cd backend
railway init
railway up
```

### Option B: Render
1. Create account at https://render.com
2. New → Web Service
3. Connect GitHub repo
4. Set build command: `cd backend && npm install`
5. Set start command: `node server.js`

Then update frontend `VITE_API_URL` to point to Railway/Render URL.

## Post-Deployment

1. Test all features:
   - User registration/login
   - Job posting/searching
   - Application submission
   - Chat functionality
   - Resume upload

2. Update CORS settings in backend if needed
3. Configure production database backups
4. Set up monitoring and alerts

---

**Quick Deploy Command:**
```powershell
cd "c:\Users\PC\MERN JOB WEBAPP"
vercel --prod
```
