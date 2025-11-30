# 🎯 How to Access Admin & Employee Dashboards

## 🚀 Quick Demo Access (Easiest Way)

### Step 1: Go to Login Page
Open: **http://localhost:3000**

### Step 2: Use Demo Buttons
At the bottom of the login page, you'll see two demo buttons:

1. **"Admin Demo"** button → Click to access Admin Dashboard
2. **"Employee Demo"** button → Click to access Employee Dashboard

### Step 3: Explore!
- Click **"Admin Demo"** to see the admin interface
- Logout (click logout in sidebar)
- Click **"Employee Demo"** to see the employee interface

---

## 📍 Direct URLs (After Login)

### Admin Dashboard
- **Main URL**: `http://localhost:3000/admin/dashboard`
- **Other Admin Pages**:
  - Employees: `http://localhost:3000/admin/employees`
  - Biometrics: `http://localhost:3000/admin/biometrics`
  - Payroll: `http://localhost:3000/admin/payroll`
  - Leaves: `http://localhost:3000/admin/leaves`
  - Schedules: `http://localhost:3000/admin/schedules`
  - Analytics: `http://localhost:3000/admin/analytics`

### Employee Dashboard
- **Main URL**: `http://localhost:3000/employee/dashboard`
- **Other Employee Pages**:
  - Attendance: `http://localhost:3000/employee/attendance`
  - Payroll: `http://localhost:3000/employee/payroll`
  - Leaves: `http://localhost:3000/employee/leaves`
  - Schedules: `http://localhost:3000/employee/schedules`

---

## 🔐 Using Real Backend (When Backend is Running)

### Option 1: Create Users via Backend API

1. **Start Backend Server**:
   ```bash
   cd think-web-project/backend
   uvicorn app.main:app --reload
   ```

2. **Create Admin User** (via API or database):
   - Use the `/api/v1/auth/register` endpoint
   - Set `role: "super_admin"` or `"hr_admin"`

3. **Create Employee User**:
   - Use the `/api/v1/auth/register` endpoint
   - Set `role: "employee"`

4. **Login** with the created credentials

### Option 2: Direct Database Insert

If you have database access, you can insert users directly:

```sql
-- Admin User
INSERT INTO users (employee_id, username, email, password_hash, role)
VALUES (1, 'admin', 'admin@thinkweb.com', '$2b$12$...', 'super_admin');

-- Employee User
INSERT INTO users (employee_id, username, email, password_hash, role)
VALUES (2, 'employee', 'employee@thinkweb.com', '$2b$12$...', 'employee');
```

---

## 🎨 What You'll See

### Admin Dashboard Features:
✅ Real-time statistics (Present, Late, On Leave, Absent)
✅ Live attendance feed
✅ Department activity charts
✅ Predictive workforce charts
✅ Quick actions panel
✅ System health status
✅ Notifications panel
✅ KPI snapshot
✅ AI insights

### Employee Dashboard Features:
✅ Personalized welcome message
✅ Attendance status card
✅ Quick action buttons
✅ Attendance snapshot (Days Present, Late Arrivals, etc.)
✅ Attendance trend chart
✅ Overtime & work hours
✅ Work duration timer

---

## 🔄 Switching Between Views

### Method 1: Logout and Use Demo Buttons
1. Click **Logout** in the sidebar
2. Click **"Admin Demo"** or **"Employee Demo"** button

### Method 2: Change User Role (Advanced)
1. Open browser DevTools (F12)
2. Go to **Application** tab → **Local Storage**
3. Find `auth_user` key
4. Edit the JSON and change `role` field:
   - For Admin: `"role": "super_admin"`
   - For Employee: `"role": "employee"`
5. Refresh the page

### Method 3: Direct URL Navigation
- Type the URL directly in browser:
  - Admin: `http://localhost:3000/admin/dashboard`
  - Employee: `http://localhost:3000/employee/dashboard`

**Note**: This only works if you're already logged in with the appropriate role.

---

## 🎯 Role-Based Access

The system automatically routes you based on your role:

### Admin Roles (→ Admin Dashboard):
- `super_admin`
- `hr_admin`
- `payroll_admin`
- `manager`

### Employee Roles (→ Employee Dashboard):
- `employee`
- Any other role

---

## 💡 Tips

1. **Demo Mode**: Use demo buttons for quick testing - no backend needed!
2. **Navigation**: Use the sidebar menu to navigate between pages
3. **Theme Toggle**: Click the theme toggle in sidebar to switch dark/light mode
4. **Responsive**: Resize browser to see mobile/tablet views
5. **Logout**: Always logout before switching to a different role

---

## 🐛 Troubleshooting

### Can't see demo buttons?
- Make sure you're on the login page (`http://localhost:3000`)
- Clear browser cache and refresh

### Wrong dashboard showing?
- Check your user role in localStorage
- Logout and login again with correct role
- Use demo buttons for guaranteed access

### Pages not loading?
- Check browser console (F12) for errors
- Make sure frontend server is running
- Try refreshing the page

---

## ✅ Quick Checklist

- [ ] Frontend running on `http://localhost:3000`
- [ ] Can see login page
- [ ] Can see demo buttons at bottom
- [ ] Clicked "Admin Demo" → See admin dashboard
- [ ] Logged out
- [ ] Clicked "Employee Demo" → See employee dashboard
- [ ] Can navigate between pages using sidebar

---

**Enjoy exploring both admin and employee views! 🚀**













