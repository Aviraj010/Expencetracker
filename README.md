# Expense Tracker

A full-stack Expense Tracker web application built using the MERN stack that helps users manage their income and expenses efficiently with a clean dashboard and secure authentication system.

---

## Features

### Authentication
- User Login & Signup
- Secure Authentication System
- Change Password Functionality
- Protected Routes

### Dashboard
- Overview of total income and expenses
- Financial summary dashboard
- User profile management

### Expense Management
- Add new expenses
- Track expense history
- Categorize and monitor spending

### Income Management
- Add income sources
- Track earnings
- View income records

### Profile Management
- Update and manage user profile
- Password update support

---

## Tech Stack

### Frontend
- React.js
- Vite
- Axios
- React Router DOM

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

---

## Project Structure

```bash
ExpTracker/
│
├── backend/
│   ├── config/
│   ├── controller/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── dist/
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── vite.config.js
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/basudev07/ExpTracker.git
```

---

## Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside backend:

```env
PORT=4000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
```

Run backend:

```bash
npm start
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## Production Build

Build frontend:

```bash
cd frontend
npm run build
```

Copy frontend `dist` folder into backend.

Run backend server:

```bash
cd backend
npm start
```

---

## API Features

- User Authentication APIs
- Expense CRUD Operations
- Income CRUD Operations
- User Profile APIs

---

## Screens Included

- Login Page
- Authentication Page
- Dashboard
- Expense Page
- Income Page
- Profile Page
- Change Password Page

---

## Future Improvements

- Charts & Analytics
- Monthly Reports
- Export to PDF/Excel
- Dark Mode
- Budget Planning

---

## Author

Developed by AVIRAJ & BASUDEV 
