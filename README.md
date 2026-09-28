# Student Course Management System (SCMS)

A web-based Student Course Management System developed as a Full Stack Web Development project.

The project started with a traditional HTML, CSS, and JavaScript implementation and was later converted into a React-based application with a Mock REST API for course management.

---

## 📌 Project Overview

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

---

## 🛠️ Technologies Used

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

- JSON Server
- REST API
- Axios

---

## 📂 Project Structure

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
