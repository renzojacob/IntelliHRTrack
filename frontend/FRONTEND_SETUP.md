# Frontend Setup Instructions

## Quick Start Guide

### Step 1: Navigate to Frontend Directory

```bash
cd think-web-project/frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React 18
- TypeScript
- Tailwind CSS
- Chart.js
- React Router
- Axios
- And more...

### Step 3: Run Development Server

```bash
npm run dev
```

The frontend will start at: **http://localhost:3000**

### Step 4: Access the Application

1. Open your browser and go to: `http://localhost:3000`
2. You'll see the login page
3. Login with your credentials (you'll need to create a user first via the backend API)

## What You'll See

### Login Page
- Beautiful glass morphism design
- Gradient background
- Theme toggle support

### Admin Dashboard (after login as admin)
- Real-time workforce overview
- Statistics cards (Present, Late, On Leave, Absent)
- Live attendance feed
- Charts and analytics
- Quick actions panel

### Employee Dashboard (after login as employee)
- Personalized welcome message
- Attendance status
- Quick actions
- Work hours summary
- Performance metrics

## Features Included

✅ **Complete Design System**
- Glass morphism UI
- Dark/Light theme toggle
- Smooth animations
- Responsive design
- Custom scrollbars

✅ **All Pages Implemented**
- Admin Dashboard
- Employee Management
- Biometrics & Attendance
- Payroll Management
- Leave Management
- Schedule Management
- Analytics Dashboard
- Employee Dashboard
- Employee Attendance
- Employee Payroll
- Employee Leaves
- Employee Schedules

✅ **Interactive Features**
- Real-time clock
- Camera integration for face recognition
- Chart.js visualizations
- Form validations
- Toast notifications

## Troubleshooting

### Port Already in Use
If port 3000 is busy, Vite will automatically use the next available port (3001, 3002, etc.)

### Cannot Connect to Backend
1. Make sure backend is running on `http://localhost:8000`
2. Check `.env` file has correct `VITE_API_BASE_URL`
3. Check browser console for CORS errors

### Icons Not Showing
- Iconify icons are loaded via CDN in `index.html`
- Make sure you have internet connection
- Icons will load automatically

### Styling Issues
- Make sure Tailwind CSS is properly configured
- Clear browser cache
- Restart dev server

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

## Development Tips

1. **Hot Reload**: Changes are automatically reflected in the browser
2. **Console**: Check browser console (F12) for errors
3. **Network Tab**: Monitor API calls in browser DevTools
4. **Theme Toggle**: Click the theme toggle button to switch between light/dark

## Next Steps

1. **Connect to Backend**: Make sure backend is running
2. **Create Users**: Use the backend API to create admin/employee users
3. **Test Features**: Try all the features and pages
4. **Customize**: Modify colors, add features, etc.

---

**Enjoy your beautiful Think Web frontend! 🚀**













