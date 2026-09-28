# Student Course Management System — Task 6

React + Vite frontend for the Student Course Management System. This version converts the existing static frontend into React pages and uses React Router for client-side navigation.

## Task 6 coverage
- React project initialized with Vite
- React Router routes for student and admin pages
- Reusable `CourseCard`, `Navbar`, `Footer`, `PageShell`, `PageCss`, and `LegacyScript` components
- React `AuthContext` for login/logout state
- Existing browser-storage business data is preserved
- Legacy JavaScript is kept under `public/legacy/js/` where the existing project logic still depends on it
- `.html` route aliases are included for compatibility with the original navigation logic

## Run

```bash
npm install
npm run dev
```

Then open the Vite URL shown in the terminal (normally `http://localhost:5173/`).

## Important
Do not copy `node_modules` from another computer. Run `npm install` inside this project so npm installs dependencies for your own operating system.

## Main routes
- `/` — Home
- `/student-login` — Student Login
- `/admin-login` — Admin Login
- `/register` — Student Registration
- `/forgot-password` — Password Reset
- `/student-dashboard` — Student Dashboard
- `/courses` — Courses
- `/my-courses` — My Courses
- `/progress` — Progress
- `/notifications` — Notifications
- `/admin-dashboard` — Admin Dashboard
- `/manage-courses` — Manage Courses
- `/add-course` — Add Course
- `/edit-course` — Edit Course
- `/manage-students` — Manage Students
- `/student-details` — Student Details
- `/view-enrollments` — View Enrollments
