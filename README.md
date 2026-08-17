# 🎓 Campus Event Dashboard

> A full-stack web application for managing campus events, clubs, registrations, and GC (General Championship) points at **IIT Palakkad**.

---

## 📌 Overview

The **Campus Event Dashboard** is an Open-Ended Lab Project (OELP) developed to provide a centralized platform for students, event organizers, and administrators to discover, manage, and participate in campus activities.

The platform brings together **event management, club discovery, event registration, student profiles, authentication, and GC point tracking** into a single application.

---

## ✨ Features

- 🔐 **Authentication** — User registration, login, forgot password, OTP verification, and JWT-based authentication
- 📅 **Event Management** — Create, browse, filter, update, and delete campus events
- 📝 **Event Registration** — Students can register for events and track their participation
- 🏆 **GC Points System** — Track and update General Championship points across clubs
- 👤 **Student Profiles** — View profile information, registered events, and participation history
- 🎭 **Club Pages** — Explore Technical, Cultural, Sports, and Other clubs
- 📊 **Admin Dashboard** — Manage users, events, and registrations
- 🧑‍💼 **Organizer Dashboard** — Create and manage events
- 🗓️ **Event Calendar** — Visualize upcoming campus events
- 📧 **OTP Email Verification** — Email-based OTP flow using Nodemailer
- 📄 **PDF Generation** — Generate PDFs using PDFKit

---

## 💡 Key Highlights

- 🔑 Implemented **JWT-based authentication** and protected routes
- 👥 Designed role-based workflows for **Students, Organizers, and Admins**
- 📧 Built **OTP-based email verification** using Nodemailer
- 🔄 Developed **RESTful APIs** using Node.js and Express
- 🗄️ Designed MongoDB schemas using **Mongoose**
- 🏆 Implemented a **GC points tracking and leaderboard system**
- 📅 Developed event creation, registration, filtering, and calendar functionality
- 🔗 Connected the frontend and backend using the **Fetch API**
- 🛠️ Structured the application into backend routes, models, and middleware

---

## 🛠️ Tech Stack

### Frontend

| Technology | Usage |
|------------|-------|
| HTML5 | UI structure |
| CSS3 | Styling and responsive layouts |
| JavaScript | Client-side logic |
| Fetch API | REST API communication |
| Live Server | Local frontend development |

### Backend

| Technology | Usage |
|------------|-------|
| Node.js | JavaScript runtime |
| Express.js | REST API server |
| MongoDB | Database |
| Mongoose | MongoDB ODM |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Nodemailer | OTP email delivery |
| PDFKit | PDF generation |
| dotenv | Environment configuration |
| CORS | Cross-origin resource sharing |

---

## 🏗️ Architecture

```text
                    ┌─────────────────────────┐
                    │       Frontend          │
                    │   HTML / CSS / JS       │
                    └────────────┬────────────┘
                                 │
                                 │ Fetch API
                                 │ REST API
                                 ▼
                    ┌─────────────────────────┐
                    │        Backend          │
                    │    Node.js + Express    │
                    └────────────┬────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
        Authentication       Event System       User System
        JWT + bcryptjs       Registrations      Profiles
              │                  │                  │
              └──────────────────┼──────────────────┘
                                 ▼
                    ┌─────────────────────────┐
                    │        MongoDB          │
                    │       + Mongoose        │
                    └─────────────────────────┘
```

---

## 📁 Project Structure

```text
OELP/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Event.js
│   │   └── Registration.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── events.js
│   │   ├── registrations.js
│   │   ├── users.js
│   │   └── gc.js
│   ├── seed.js
│   ├── reset.js
│   ├── update_gc_points.js
│   ├── server.js
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
│
├── Events/
│   ├── Campus-Event-Dashboard/
│   │   ├── index.html
│   │   ├── login.html
│   │   ├── register.html
│   │   ├── events.html
│   │   ├── create-event.html
│   │   ├── calendar.html
│   │   ├── gc.html
│   │   ├── admin-dashboard.html
│   │   ├── organizer-dashboard.html
│   │   ├── profile.html
│   │   ├── studentclubs.html
│   │   ├── culturalclubs.html
│   │   ├── technicalclubs.html
│   │   ├── sportsclubs.html
│   │   ├── otherclubs.html
│   │   ├── images.html
│   │   ├── auth.js
│   │   └── style.css
│   │
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) — Local installation or MongoDB Atlas
- Gmail account with an **App Password** for OTP email functionality

### 1. Clone the Repository

```bash
git clone https://github.com/nenavathsriganga-25/OELP.git
cd OELP
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/campus_events
JWT_SECRET=your_super_secret_jwt_key

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password

FROM_EMAIL="Campus Events <your_email@gmail.com>"
```

> ⚠️ **Never commit your `.env` file.** It may contain database credentials, email credentials, API keys, and secret keys.

### 3. Seed the Database

This step is optional:

```bash
npm run seed
```

### 4. Start the Backend

For development:

```bash
npm run dev
```

Or:

```bash
npm start
```

The backend API will be available at:

```text
http://localhost:5000
```

### 5. Frontend Setup

Open a new terminal:

```bash
cd Events
npm install
npm run dev
```

The frontend will be available at:

```text
http://localhost:3000
```

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |
| POST | `/api/auth/send-otp` | Send OTP to email |
| POST | `/api/auth/verify-otp` | Verify OTP |

### Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | Get all events |
| POST | `/api/events` | Create an event |
| PUT | `/api/events/:id` | Update an event |
| DELETE | `/api/events/:id` | Delete an event |

### Registrations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/registrations` | Get registrations |
| POST | `/api/registrations` | Register for an event |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get logged-in user profile |

### GC Points

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/gc` | Get GC points leaderboard |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Check backend status |

---

## 🌍 Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Backend server port |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key used for JWT signing |
| `SMTP_HOST` | SMTP server host |
| `SMTP_PORT` | SMTP server port |
| `SMTP_SECURE` | SMTP security configuration |
| `SMTP_USER` | Sender email address |
| `SMTP_PASS` | Gmail App Password |
| `FROM_EMAIL` | Display name and email for outgoing messages |


---

## 👥 Contributors

- **Sri Ganga** — Full-Stack Development

---

## 🎓 Academic Context

This project was developed as part of the **Open-Ended Lab Project (OELP)** at **IIT Palakkad**.

The project applies concepts from software development, databases, backend systems, authentication, and web technologies to build a practical campus management platform.

---

## 📄 License

This project was developed for academic purposes as part of the **Open-Ended Lab Project (OELP)** at **IIT Palakkad**.

---

⭐ **If you found this project interesting, consider giving the repository a star!**