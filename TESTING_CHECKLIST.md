# 🧪 Testing Checklist - MERN Job Application UI

## Pre-Testing Setup
- [ ] Backend server is running on http://localhost:4000
- [ ] Frontend server is running on http://localhost:5173
- [ ] MongoDB is connected
- [ ] All dependencies installed (`npm install`)
- [ ] Environment variables configured

---

## 🎨 Visual & UI Testing

### General Layout
- [ ] Page layouts are centered and responsive
- [ ] No horizontal scrolling on any page
- [ ] All images load correctly
- [ ] Fonts are consistent (Roboto)
- [ ] Colors match the design system (accent-500: #2d5649)
- [ ] Spacing is consistent across pages

### Navbar
- [ ] ✅ Navbar is sticky at top
- [ ] ✅ Logo displays correctly
- [ ] ✅ Navigation links are visible
- [ ] ✅ Logout button is styled correctly
- [ ] ✅ Mobile hamburger menu appears on small screens
- [ ] ✅ Mobile menu opens/closes smoothly
- [ ] ✅ Slide-down animation works on page load
- [ ] ✅ Navbar hides when not authenticated

### Footer
- [ ] ✅ Footer appears at bottom of page
- [ ] ✅ Social media icons display
- [ ] ✅ Copyright year is current
- [ ] ✅ Icon hover effects work (scale + translate)
- [ ] ✅ Footer hides when not authenticated

---

## 🔐 Authentication Testing

### Login Page
- [ ] ✅ Page loads without errors
- [ ] ✅ Two-column layout on desktop
- [ ] ✅ Single column on mobile
- [ ] ✅ Form animations play on load
- [ ] ✅ Gradient background displays
- [ ] ✅ Login illustration shows on desktop
- [ ] ✅ Role selector works
- [ ] ✅ Email input validates
- [ ] ✅ Password input hides text
- [ ] ✅ Icons appear in input fields
- [ ] ✅ Submit button has hover effect
- [ ] ✅ "Register Now" link works
- [ ] ✅ Focus states are visible
- [ ] ✅ Form submits successfully
- [ ] ✅ Toast notification appears on success/error
- [ ] ✅ Redirects to home after successful login

### Register Page
- [ ] ✅ Page loads without errors
- [ ] ✅ Layout mirrors login page
- [ ] ✅ Illustration on left side
- [ ] ✅ All form fields present (role, name, email, phone, password)
- [ ] ✅ Form validation works
- [ ] ✅ Icons in input fields
- [ ] ✅ Submit button styled correctly
- [ ] ✅ "Login Now" link works
- [ ] ✅ Successful registration redirects to home

---

## 🏠 Home Page Testing

### Hero Section
- [ ] ✅ Two-column layout (text + image)
- [ ] ✅ Gradient text effect works
- [ ] ✅ Hero image displays
- [ ] ✅ Stats cards display in grid (2/4 columns)
- [ ] ✅ Staggered card animations play
- [ ] ✅ Icons scale on hover
- [ ] ✅ All numbers display correctly

### How It Works Section
- [ ] ✅ Section title displays
- [ ] ✅ Three cards in a row (desktop)
- [ ] ✅ Stacked on mobile
- [ ] ✅ Step numbers in circles
- [ ] ✅ Icons present in each card
- [ ] ✅ Hover effects work
- [ ] ✅ Cards animate on scroll

### Popular Categories
- [ ] ✅ Grid layout (1/2/4 columns)
- [ ] ✅ All 8 categories display
- [ ] ✅ Icons show correctly
- [ ] ✅ Hover effects (scale + rotate)
- [ ] ✅ Text color changes on hover

### Popular Companies
- [ ] ✅ Three company cards display
- [ ] ✅ Company icons visible
- [ ] ✅ Location text readable
- [ ] ✅ "Open Positions" buttons styled
- [ ] ✅ Card hover effects work

---

## 💼 Job Listing Testing

### All Jobs Page (/job/getall)
- [ ] ✅ Page title displays
- [ ] ✅ Gradient background
- [ ] ✅ Jobs load from API
- [ ] ✅ Grid layout (1/2/3 columns)
- [ ] ✅ Each job card shows:
  - [ ] Job title
  - [ ] Category with icon
  - [ ] Country with icon
  - [ ] "View Details" button
- [ ] ✅ Staggered card animations
- [ ] ✅ Hover effects on cards
- [ ] ✅ Empty state shows if no jobs
- [ ] ✅ "View Details" button works

### Job Details Page (/job/:id)
- [ ] ✅ Job title is prominent
- [ ] ✅ Category displayed with icon
- [ ] ✅ Location details in grid
- [ ] ✅ Description is readable
- [ ] ✅ Salary highlighted
- [ ] ✅ Posted date shows
- [ ] ✅ "Apply Now" button (for job seekers only)
- [ ] ✅ Button hides for employers
- [ ] ✅ DetailItem components styled
- [ ] ✅ Icons next to each detail

---

## 📝 Job Management (Employer)

### Post Job Page (/job/post)
- [ ] ✅ Redirects non-employers to home
- [ ] ✅ Form has gradient header
- [ ] ✅ All fields present:
  - [ ] Title
  - [ ] Category dropdown
  - [ ] Country
  - [ ] City
  - [ ] Location
  - [ ] Salary type selector
  - [ ] Salary fields (fixed or ranged)
  - [ ] Description textarea
- [ ] ✅ Icons in input fields
- [ ] ✅ Salary section highlighted
- [ ] ✅ Fixed/Ranged salary toggle works
- [ ] ✅ Submit button styled
- [ ] ✅ Form validates before submit
- [ ] ✅ Success toast on creation
- [ ] ✅ Form clears after submission

### My Jobs Page (/job/me)
- [ ] ✅ Only employers can access
- [ ] ✅ Page title displays
- [ ] ✅ Grid layout for job cards
- [ ] ✅ Empty state if no jobs
- [ ] ✅ Each job card shows all details
- [ ] ✅ Edit button styled (blue)
- [ ] ✅ Delete button styled (red)
- [ ] ✅ Save button styled (green)
- [ ] ✅ Cancel button styled (gray)
- [ ] ✅ Edit mode highlights card
- [ ] ✅ Inline editing works
- [ ] ✅ Category dropdown functional
- [ ] ✅ Salary toggle (fixed/ranged)
- [ ] ✅ Delete confirmation
- [ ] ✅ Update saves changes

---

## 📋 Application Testing

### Apply for Job (/application/:id)
- [ ] ✅ Only job seekers can access
- [ ] ✅ Form has gradient background
- [ ] ✅ All fields present:
  - [ ] Name
  - [ ] Email
  - [ ] Phone
  - [ ] Address
  - [ ] Cover letter
  - [ ] Resume upload
- [ ] ✅ Icons in input fields
- [ ] ✅ File upload area styled
- [ ] ✅ Visual feedback on file select
- [ ] ✅ Form validation works
- [ ] ✅ Submit button styled
- [ ] ✅ Success toast appears
- [ ] ✅ Redirects after submission

### My Applications (/applications/me)

#### Job Seeker View
- [ ] ✅ Title: "My Applications"
- [ ] ✅ Grid layout (1/2/3 columns)
- [ ] ✅ Each application card shows:
  - [ ] Name, email, phone
  - [ ] Address
  - [ ] Cover letter
  - [ ] Resume thumbnail
- [ ] ✅ Resume preview on click
- [ ] ✅ Delete button works
- [ ] ✅ Hover overlay on resume
- [ ] ✅ Empty state if no applications

#### Employer View
- [ ] ✅ Title: "Applications From Job Seekers"
- [ ] ✅ Grid layout
- [ ] ✅ Application cards styled
- [ ] ✅ Applicant details visible
- [ ] ✅ Resume preview works
- [ ] ✅ No delete button (employer can't delete)
- [ ] ✅ Empty state if no applications

### Resume Modal
- [ ] ✅ Modal opens on resume click
- [ ] ✅ Backdrop darkens screen
- [ ] ✅ Modal centers on screen
- [ ] ✅ Close button visible
- [ ] ✅ Close on backdrop click works
- [ ] ✅ Close on X button works
- [ ] ✅ Resume image displays full size
- [ ] ✅ Smooth entrance animation
- [ ] ✅ Smooth exit animation
- [ ] ✅ Scrollable if resume is large

---

## 📱 Responsive Design Testing

### Mobile (320px - 767px)
- [ ] ✅ Navbar shows hamburger menu
- [ ] ✅ Mobile menu slides down
- [ ] ✅ All text is readable
- [ ] ✅ Buttons are touch-friendly (min 44px)
- [ ] ✅ Forms stack vertically
- [ ] ✅ Cards stack in single column
- [ ] ✅ Images resize appropriately
- [ ] ✅ No horizontal scroll

### Tablet (768px - 1023px)
- [ ] ✅ Two-column grids work
- [ ] ✅ Navbar shows full menu
- [ ] ✅ Images scale correctly
- [ ] ✅ Forms in two columns where appropriate
- [ ] ✅ Spacing is comfortable

### Desktop (1024px+)
- [ ] ✅ Three/four column grids
- [ ] ✅ All features visible
- [ ] ✅ Max-width container (1280px)
- [ ] ✅ Content is centered
- [ ] ✅ Two-column auth layouts

---

## ✨ Animation Testing

### Page Transitions
- [ ] ✅ Fade-in on page load
- [ ] ✅ Slide-up for content
- [ ] ✅ Smooth route transitions

### Component Animations
- [ ] ✅ Navbar slides down on mount
- [ ] ✅ Cards stagger in on lists
- [ ] ✅ Hero section animates
- [ ] ✅ Form fields animate on focus
- [ ] ✅ Modal fade in/out
- [ ] ✅ Mobile menu slides smoothly

### Hover Effects
- [ ] ✅ Buttons scale on hover
- [ ] ✅ Cards lift on hover (shadow + translate)
- [ ] ✅ Icons scale/rotate
- [ ] ✅ Links change color
- [ ] ✅ Social icons scale up

### Focus States
- [ ] ✅ All interactive elements have focus ring
- [ ] ✅ Ring color is accent-500
- [ ] ✅ Keyboard navigation works

---

## ♿ Accessibility Testing

### Keyboard Navigation
- [ ] ✅ Tab through all interactive elements
- [ ] ✅ Enter activates buttons
- [ ] ✅ Escape closes modals
- [ ] ✅ Focus visible at all times
- [ ] ✅ Skip navigation works

### Screen Reader
- [ ] ✅ Alt text on all images
- [ ] ✅ Aria labels on icon buttons
- [ ] ✅ Form labels associated with inputs
- [ ] ✅ Headings in proper hierarchy
- [ ] ✅ Semantic HTML used

### Color Contrast
- [ ] ✅ Text meets WCAG AA (4.5:1 minimum)
- [ ] ✅ Buttons have sufficient contrast
- [ ] ✅ Links are distinguishable
- [ ] ✅ Error messages are clear

---

## 🚀 Performance Testing

### Page Load
- [ ] ✅ Initial load under 3 seconds
- [ ] ✅ No console errors
- [ ] ✅ All assets load
- [ ] ✅ Fonts load properly

### Animations
- [ ] ✅ Smooth at 60fps
- [ ] ✅ No janky scrolling
- [ ] ✅ Hover effects instant

### Network
- [ ] ✅ API calls complete successfully
- [ ] ✅ Loading states show when needed
- [ ] ✅ Error handling works

---

## 🔧 Functionality Testing

### Authentication Flow
- [ ] ✅ Login works for both roles
- [ ] ✅ Register creates new user
- [ ] ✅ Logout clears session
- [ ] ✅ Protected routes redirect
- [ ] ✅ Auth persists on refresh

### Job Seeker Flow
1. [ ] ✅ Login as job seeker
2. [ ] ✅ View all jobs
3. [ ] ✅ View job details
4. [ ] ✅ Apply for job
5. [ ] ✅ View my applications
6. [ ] ✅ Delete application
7. [ ] ✅ View resume in modal
8. [ ] ✅ Logout

### Employer Flow
1. [ ] ✅ Login as employer
2. [ ] ✅ Post new job
3. [ ] ✅ View my jobs
4. [ ] ✅ Edit job
5. [ ] ✅ Delete job
6. [ ] ✅ View applications
7. [ ] ✅ View applicant resume
8. [ ] ✅ Logout

---

## 🐛 Error Handling

### Form Errors
- [ ] ✅ Required field validation
- [ ] ✅ Email format validation
- [ ] ✅ Error messages display
- [ ] ✅ Toast notifications for errors

### API Errors
- [ ] ✅ Network error handling
- [ ] ✅ 404 page works
- [ ] ✅ Unauthorized redirects
- [ ] ✅ Server error messages

### Edge Cases
- [ ] ✅ Empty states display
- [ ] ✅ No jobs available message
- [ ] ✅ No applications message
- [ ] ✅ Invalid job ID handling

---

## 🌐 Browser Testing

### Chrome
- [ ] ✅ All features work
- [ ] ✅ Animations smooth
- [ ] ✅ Layout correct

### Firefox
- [ ] ✅ All features work
- [ ] ✅ Animations smooth
- [ ] ✅ Layout correct

### Safari
- [ ] ✅ All features work
- [ ] ✅ Animations smooth
- [ ] ✅ Layout correct

### Edge
- [ ] ✅ All features work
- [ ] ✅ Animations smooth
- [ ] ✅ Layout correct

---

## 📊 Lighthouse Audit

### Performance
- [ ] ✅ Score: 90+
- [ ] ✅ First Contentful Paint < 2s
- [ ] ✅ Time to Interactive < 3s
- [ ] ✅ Largest Contentful Paint < 2.5s

### Accessibility
- [ ] ✅ Score: 90+
- [ ] ✅ Color contrast passes
- [ ] ✅ ARIA attributes correct
- [ ] ✅ Alt text present

### Best Practices
- [ ] ✅ Score: 90+
- [ ] ✅ HTTPS used (production)
- [ ] ✅ No console errors
- [ ] ✅ Images optimized

### SEO
- [ ] ✅ Score: 90+
- [ ] ✅ Meta tags present
- [ ] ✅ Headings structured
- [ ] ✅ Links have text

---

## ✅ Final Checklist

- [ ] All tests passed
- [ ] No console errors
- [ ] No console warnings
- [ ] All animations smooth
- [ ] All links work
- [ ] All forms validate
- [ ] All images load
- [ ] Responsive on all screens
- [ ] Accessible to all users
- [ ] Performance is good
- [ ] Code is clean
- [ ] Ready for deployment

---

## 📝 Notes

**Issues Found:**
(List any issues discovered during testing)

**Browser Specific Issues:**
(Note any browser-specific problems)

**Performance Bottlenecks:**
(Note any slow areas)

**Accessibility Concerns:**
(Note any accessibility issues)

---

## 🎉 Testing Complete!

Date Tested: _________________
Tester Name: _________________
Status: ⬜ Pass  ⬜ Fail  ⬜ Needs Work

**Overall Assessment:**
(Write summary of testing results)
