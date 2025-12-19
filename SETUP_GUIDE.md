# 🚀 Setup & Running Guide

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB running
- Backend server configured

## Installation Steps

### 1. Install Frontend Dependencies
```bash
cd frontend
npm install
```

This will install all required packages including:
- React & React DOM
- React Router DOM
- Axios
- Tailwind CSS
- Framer Motion
- React Icons
- React Hot Toast

### 2. Verify Tailwind Configuration

Ensure these files exist:
- ✅ `tailwind.config.js`
- ✅ `postcss.config.js`
- ✅ `src/index.css`

### 3. Start Development Server

```bash
npm run dev
```

The app will run on `http://localhost:5173` (or the port shown in terminal)

### 4. Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

### 5. Preview Production Build

```bash
npm run preview
```

## Backend Setup

Make sure your backend is running on `http://localhost:4000`

### Required Environment Variables (Backend)
```
PORT=4000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

## Troubleshooting

### Issue: Tailwind styles not applying

**Solution:**
1. Ensure `index.css` is imported in `main.jsx`
2. Check that Tailwind directives are at the top of `index.css`
3. Restart the dev server

### Issue: CSS warnings in VS Code

The warnings for `@tailwind` and `@apply` directives are normal and don't affect functionality. To suppress them:

1. Install "Tailwind CSS IntelliSense" VS Code extension
2. Add to VS Code settings:
```json
{
  "css.lint.unknownAtRules": "ignore"
}
```

### Issue: Images not loading

**Solution:**
Ensure image files are in the `public` folder:
- `/JobZeelogo.png`
- `/JobZee-logos__white.png`
- `/login.png`
- `/register.png`
- `/heroS.jpg`
- `/notfound.png`

### Issue: CORS errors

**Solution:**
Backend must have CORS configured:
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### Issue: Authentication not working

**Solution:**
1. Check backend is running
2. Verify API endpoints match
3. Check cookies are enabled
4. Verify `withCredentials: true` in axios calls

## File Structure After Setup

```
frontend/
├── node_modules/
├── public/
│   ├── JobZeelogo.png
│   ├── JobZee-logos__white.png
│   ├── login.png
│   ├── register.png
│   ├── heroS.jpg
│   └── notfound.png
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   ├── Home/
│   │   ├── Job/
│   │   ├── Application/
│   │   ├── Layout/
│   │   └── NotFound/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── README.md
```

## Testing the Application

### 1. Test Authentication
- Visit `/login`
- Try logging in as both Employer and Job Seeker
- Test registration at `/register`

### 2. Test Job Seeker Flow
- Login as Job Seeker
- View all jobs at `/job/getall`
- Click on a job to see details
- Apply for a job
- View your applications at `/applications/me`

### 3. Test Employer Flow
- Login as Employer
- Post a new job at `/job/post`
- View your posted jobs at `/job/me`
- Edit/Delete jobs
- View applications at `/applications/me`

### 4. Test Responsive Design
- Resize browser window
- Test on mobile viewport (DevTools)
- Check tablet size (768px)
- Verify desktop layout (1024px+)

### 5. Test Animations
- Navigate between pages
- Hover over cards and buttons
- Open/close mobile menu
- View resume modal

## Performance Checks

### Run Lighthouse Audit
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Run audit for:
   - Performance
   - Accessibility
   - Best Practices
   - SEO

Expected scores:
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

## Browser Support

Tested and working on:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

## Deployment

### Netlify
```bash
npm run build
# Deploy the 'dist' folder
```

### Vercel
```bash
npm run build
# Deploy the 'dist' folder
```

### Environment Variables for Production
Update API URLs in components:
```javascript
// Change from:
"http://localhost:4000/api/v1/..."

// To:
"https://your-backend-url.com/api/v1/..."
```

Or use environment variables:
```javascript
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
```

## Monitoring

### Check for Console Errors
Open browser DevTools Console and verify:
- ✅ No errors on page load
- ✅ No errors during navigation
- ✅ No errors during form submission
- ✅ Successful API calls

### Network Tab
Monitor API calls:
- ✅ Requests complete successfully
- ✅ Response times are reasonable
- ✅ No unnecessary requests

## Common Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Install new package
npm install package-name

# Install dev dependency
npm install -D package-name
```

## Getting Help

### Documentation Links
- React: https://react.dev
- Tailwind CSS: https://tailwindcss.com/docs
- Framer Motion: https://www.framer.com/motion
- React Router: https://reactrouter.com
- Vite: https://vitejs.dev

### Common Issues & Solutions

**Problem: Port already in use**
```bash
# Kill process on port 5173
npx kill-port 5173

# Or change port in vite.config.js
server: {
  port: 3000
}
```

**Problem: Module not found**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Problem: Build errors**
```bash
# Check for TypeScript errors (if using TS)
npm run lint

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

## Next Steps

1. ✅ Setup complete
2. ✅ Test all features
3. ✅ Review UI/UX
4. ✅ Fix any bugs
5. ⬜ Add more features (optional)
6. ⬜ Deploy to production
7. ⬜ Monitor and maintain

## Support

For issues or questions:
1. Check the documentation
2. Review error messages
3. Check browser console
4. Review network requests
5. Test in different browsers

## Success Checklist

Before considering setup complete:

- [ ] All dependencies installed
- [ ] Dev server runs without errors
- [ ] All pages load correctly
- [ ] Authentication works
- [ ] Job posting works
- [ ] Job application works
- [ ] Images display correctly
- [ ] Animations are smooth
- [ ] Mobile layout works
- [ ] No console errors
- [ ] API calls succeed
- [ ] Forms validate properly

---

**Congratulations!** 🎉 Your modern MERN Job Application is ready to use!
