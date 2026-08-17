## OTP Backend (Node.js + Express + Nodemailer)

This backend sends OTP emails for the **Forgot Password** flow and verifies them.

### 1. Install dependencies

From the project root in a terminal:

```bash
cd backend
npm install
```

### 2. Configure SMTP (.env)

Create a file called `.env` inside the `backend` folder with content like:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@example.com
SMTP_PASS=your_app_password_or_smtp_password
FROM_EMAIL="IIT Palakkad Dashboard <your_email@example.com>"
PORT=5000
```

> For Gmail you must use an **App Password** (for accounts with 2FA) or enable "Less secure apps" on older accounts.

### 3. Run the backend

```bash
cd backend
npm start
```

The server will listen on `http://localhost:5000` with two endpoints:

- `POST /send-otp` – body: `{ "email": "user@example.com" }`
- `POST /verify-otp` – body: `{ "email": "user@example.com", "otp": "123456" }`


