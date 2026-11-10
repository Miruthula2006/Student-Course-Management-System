# Student Course Management System (SCMS)

A web-based Student Course Management System developed as a Full Stack Web Development project.

The project started with a traditional HTML, CSS, and JavaScript implementation and now includes a React application with an Express, MongoDB, JWT, and Socket.IO backend. The legacy HTML frontend and mock API remain in the repository for the earlier project tasks.

## Application Status

- `Front End/` is an archived, non-production prototype retained for the original coursework UI. Authentication, registration, and password recovery are intentionally unavailable there; its pages do not provide secure access control and must not be used for real accounts or personal data.
- `react-frontend/` and `backend/` are the active application. The React frontend uses the authenticated backend API; passwords are verified and hashed by the backend, not by the archived browser-storage prototype.
- Secure password recovery is not available until an identity-verification and delivery service is configured. The active React page directs users to the administrator instead of changing passwords locally.

##  Project Overview

The Student Course Management System (SCMS) provides separate interfaces for students and administrators.

### Student Features

- Student registration and login
- Student dashboard
- View available courses
- View enrolled courses
- Course details
- Learning resources
- Track course progress
- Course completion
- Certificate generation
- Notifications
- Student profile/details

### Admin Features

- Admin login
- Admin dashboard
- View course statistics
- Add courses
- Edit courses
- Delete courses
- Manage students
- View student details
- View enrollments
- Manage course learning resources


##  Technologies Used

### Frontend - Initial Version

- HTML5
- CSS3
- JavaScript
- Bootstrap
- Font Awesome

### Frontend - React Version

- React
- Vite
- JavaScript
- React Router
- Axios
- CSS

### API

- Node.js and Express
- MongoDB and Mongoose
- JWT and bcryptjs
- Socket.IO
- REST API
- Axios

## Local Setup

1. Copy `backend/.env.example` to `backend/.env` and set `MONGO_URI` and a long random `JWT_SECRET`.
2. Install backend dependencies with `cd backend` and `npm install`; run `npm run seed-courses` once to load the existing demo courses into an empty database, then start with `npm run dev`.
3. Copy `react-frontend/.env.example` to `react-frontend/.env`.
4. Install and start React with `cd react-frontend`, `npm install`, and `npm run dev`.
5. Create the first administrator using the backend `create-admin` script with `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` configured in the backend environment. Admin passwords must be at least 12 characters.
6. To run backend security integration tests, set `MONGO_TEST_URI` to a MongoDB test-server URI and run `npm test` from `backend`. Tests create a uniquely named `scms_phase9_test_*` database and clean up only that isolated database; they never use `MONGO_URI`.

## Deployment

The React app is prepared for Vercel (`react-frontend/vercel.json`); the Express API can be deployed as a Render web service, with MongoDB Atlas as the database. Set `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, and `CLIENT_URL` on the backend. Set `VITE_API_URL` (backend origin, without `/api/v1`) and `VITE_SOCKET_URL` (backend origin) on the frontend, then rebuild/redeploy. The backend health check is `/api/health`.

Deployment is not yet performed. Replace these notes with live URLs only after hosting accounts are configured and the production workflow has been tested. See [docs/database-schema.md](docs/database-schema.md) for collection relationships and indexes.


##  Project Structure

```text
Student-Course-Management-System/
│
├── Front End/
│   ├── css/
│   ├── images/
│   ├── js/
│   ├── index.html
│   ├── student-login.html
│   ├── student-dashboard.html
│   ├── courses.html
│   ├── my-courses.html
│   ├── progress.html
│   ├── admin-login.html
│   ├── admin-dashboard.html
│   ├── manage-courses.html
│   ├── add-course.html
│   ├── edit-course.html
│   ├── manage-students.html
│   └── ...
│
├── react-frontend/
│   ├── public/
│   ├── src/
│   │   ├── auth/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
│
├── mock-api/
│   └── db.json
│
└── .gitignore
