# Student Management System

A full-stack Student Management System built with React.js, Node.js, Express, and JSON file-based storage.

## Tech Stack

- **Frontend**: React.js, React Router, Axios, Vite
- **Backend**: Node.js, Express.js, REST API
- **Storage**: JSON file-based (future-compatible with MongoDB/MySQL)

## Features

- 📊 Dashboard with stats, recent students, course/year breakdown
- ➕ Add student with full form validation
- 📋 Student table with search, filter, sort & pagination
- 👁 Student detail view
- ✏️ Edit student
- 🗑 Delete with confirmation
- 🌙 Dark mode toggle
- 📱 Fully responsive layout

## Getting Started

### 1. Install backend dependencies

```bash
cd backend
npm install
npm run dev
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
npm run dev
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/students | List students (search, filter, sort, paginate) |
| GET | /api/students/:id | Get student by ID |
| POST | /api/students | Create student |
| PUT | /api/students/:id | Update student |
| DELETE | /api/students/:id | Delete student |
| GET | /api/students/stats | Dashboard statistics |

## Project Structure

```
stuManSys/
├── backend/          # Node.js/Express API
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── data/         # JSON storage
│   └── server.js
└── frontend/         # React.js app
    └── src/
        ├── api/
        ├── components/
        ├── context/
        └── pages/
```
