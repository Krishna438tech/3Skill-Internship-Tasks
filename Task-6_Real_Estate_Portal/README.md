# 🏠 HomeNest - Real Estate Portal

A modern full-stack **Real Estate Portal** built using the **MERN Stack**. HomeNest allows users to explore properties, save favorites, send inquiries, manage their profile, and track inquiry status. It also includes a secure admin dashboard for managing properties, users, inquiries, and platform statistics.

---

## 👨‍💻 Developer

**Krishna Gopal**

GitHub: https://github.com/Krishna438tech  
LinkedIn: Add LinkedIn Profile Link Here

---

## 🌐 Live Demo

### 🚀 Frontend

🔗 https://homenest-real-estate-portal.vercel.app

### ⚙️ Backend API

🔗 https://homenest-backend-rxwm.onrender.com

### 📂 GitHub Repository

🔗 https://github.com/Krishna438tech/3Skill-Internship-Tasks/tree/main/Task-6_Real_Estate_Portal

---

## 📌 Project Overview

**HomeNest** is a complete real estate management platform where users can discover residential and commercial properties with a simple and responsive interface.

Users can browse listings, search and filter properties, view property details, save favorites, send inquiries, and manage their profile.

Admins can manage properties, users, inquiries, and dashboard statistics through a protected admin panel.

---

## ✨ Features

### 👤 User Features

- Register and login
- JWT-based authentication
- Browse property listings
- Search and filter properties
- View property details
- Save and remove favorite properties
- Send property inquiries
- Track personal inquiries
- Update profile
- Responsive UI

### 🛡️ Admin Features

- Admin dashboard
- Add, edit, and delete properties
- Manage registered users
- Block and unblock users
- Delete normal users
- View all inquiries
- Update inquiry status
- Delete inquiries
- Protected admin routes

---

## 🧰 Tech Stack

### Frontend

- React.js
- Vite
- React Router DOM
- Axios
- Context API
- React Icons
- React Hot Toast
- CSS3

### Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT
- bcryptjs
- dotenv
- CORS

### Tools

- VS Code
- Git & GitHub
- MongoDB Atlas
- Postman
- Vercel
- Render

---

## 📁 Project Structure

```bash
Task-6_Real_Estate_Portal/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## 🗄️ Database

MongoDB Atlas database used:

```bash
real_estate
```

Main collections:

```bash
users
properties
favorites
inquiries
```

---

## 🔐 Authentication & Authorization

The application uses **JWT authentication** and role-based authorization.

- Password hashing using bcryptjs
- Protected user routes
- Admin-only protected routes
- Blocked user access prevention
- Secure environment variables using `.gitignore`

---

## 🧾 API Endpoints

### Auth Routes

```bash
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/profile
PUT    /api/auth/profile
```

### Property Routes

```bash
POST   /api/properties
GET    /api/properties
GET    /api/properties/:id
PUT    /api/properties/:id
DELETE /api/properties/:id
```

### Favorite Routes

```bash
POST   /api/favorites
GET    /api/favorites/my-favorites
DELETE /api/favorites/:propertyId
```

### Inquiry Routes

```bash
POST   /api/inquiries
GET    /api/inquiries/my-inquiries
GET    /api/inquiries/admin/all
PUT    /api/inquiries/admin/:id/status
DELETE /api/inquiries/admin/:id
```

### Admin Routes

```bash
GET    /api/admin/dashboard
GET    /api/admin/users
PUT    /api/admin/users/:id/block
PUT    /api/admin/users/:id/unblock
DELETE /api/admin/users/:id
```

---

## 🖥️ Application Pages

### Public Pages

- Home
- Properties
- Property Details
- Login
- Register
- Not Found

### Protected User Pages

- Favorites
- My Inquiries
- Profile

### Admin Pages

- Admin Dashboard
- Manage Properties
- Manage Users
- Manage Inquiries

---

## ⚙️ Environment Variables

### Backend `.env`

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Installation & Setup

### Clone Repository

```bash
git clone https://github.com/Krishna438tech/3Skill-Internship-Tasks.git
```

### Go to Project Folder

```bash
cd 3Skill-Internship-Tasks/Task-6_Real_Estate_Portal
```

### Run Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on:

```bash
http://localhost:5000
```

### Run Frontend

Open a new terminal:

```bash
cd Task-6_Real_Estate_Portal/frontend
npm install
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

## 📦 Deployment

### Frontend

Frontend can be deployed on **Vercel**.

Required environment variable:

```env
VITE_API_URL=your_deployed_backend_api_url
```

### Backend

Backend can be deployed on **Render**.

Required environment variables:

```env
PORT
MONGO_URI
JWT_SECRET
```

---

## 🧪 Testing Checklist

- User register/login working
- Profile update working
- Property listing and details working
- Search and filters working
- Favorites working
- Inquiry system working
- Admin dashboard working
- Manage properties working
- Manage users working
- Manage inquiries working
- Protected routes working
- `.env` and `node_modules` ignored
- Frontend build successful

---

## 🔮 Future Improvements

- Property image upload
- Multiple image gallery
- Video upload
- Forgot/reset password
- Password show/hide toggle
- Email notifications
- Map integration
- Review and rating system
- Payment or booking flow

---

## 📌 Project Status

✅ Completed for internship Task 6 submission.

---

## 🙌 Author

Made with dedication by **Krishna Gopal**.