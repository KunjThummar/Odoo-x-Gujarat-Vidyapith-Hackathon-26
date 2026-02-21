# FleetFlow – Fleet & Logistics Management System

A full-stack, production-ready ERP module for fleet and logistics management.

---

## Tech Stack

- **Frontend:** React.js + Vite + Tailwind CSS + React Router + Recharts
- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** JWT + bcrypt + RBAC

---

## System Roles

| Role             | Access                                      |
|------------------|---------------------------------------------|
| Fleet Manager    | Full access — vehicles, drivers, trips, analytics |
| Dispatcher       | Create/dispatch trips, view vehicles & drivers |
| Driver           | View assigned + open trips, accept/start/complete |
| Safety Officer   | Driver profiles, maintenance logs            |
| Financial Analyst| Fuel logs, expenses, analytics               |

---

## Windows Setup Instructions

### Step 1: Install Prerequisites

1. **Node.js** – Download from https://nodejs.org (LTS version)
2. **PostgreSQL** – Download from https://www.postgresql.org/download/windows/
   - During install, set password as: `Kunj@1277`
   - Keep port as default: `5432`

### Step 2: Create the Database

Open **pgAdmin** or **psql** and run:

```sql
CREATE DATABASE "FleetFlow";
```

Or via command line (as postgres user):
```bash
psql -U postgres -c "CREATE DATABASE \"FleetFlow\";"
```

### Step 3: Setup Backend

```bash
# Navigate to server folder
cd fleetflow/server

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations (creates all tables)
npx prisma migrate dev --name init

# Seed the database with demo data
node prisma/seed.js
```

### Step 4: Setup Frontend

```bash
# Navigate to client folder
cd ../client

# Install dependencies
npm install
```

### Step 5: Start the Application

**Terminal 1 – Backend:**
```bash
cd fleetflow/server
npm run dev
# Server starts at http://localhost:5000
```

**Terminal 2 – Frontend:**
```bash
cd fleetflow/client
npm run dev
# App opens at http://localhost:5173
```

---

## Environment Configuration

The `.env` file in `server/` is pre-configured:

```env
DATABASE_URL="postgresql://postgres:Kunj@1277@localhost:5432/FleetFlow"
JWT_SECRET="fleetflow_jwt_secret_key_2024_production_secure"
JWT_EXPIRES_IN="7d"
PORT=5000
```

### Email / SMTP (optional)
To send OTPs, password reset links or other notifications you can configure a real SMTP server. If the variables below are not set the server will fall back to logging the message to the console (useful during development).

```env
# MAIL_HOST=smtp.example.com
# MAIL_PORT=587
# MAIL_USER=your_username
# MAIL_PASS=your_password
# MAIL_FROM="FleetFlow <no-reply@fleetflow.com>"
```

Once the environment is configured, install the mailing dependency in the backend:

```bash
cd server
npm install nodemailer
```


---

## Demo Accounts (After Seeding)

All accounts use password: **`Fleet@123`**

| Role             | Email                    |
|------------------|--------------------------|
| Fleet Manager    | manager@fleetflow.com    |
| Dispatcher       | dispatcher@fleetflow.com |
| Safety Officer   | safety@fleetflow.com     |
| Financial Analyst| finance@fleetflow.com    |
| Driver 1         | john@fleetflow.com       |
| Driver 2         | mike@fleetflow.com       |

---

## Features Implemented

### Authentication
- ✅ JWT login/logout
- ✅ Driver self-registration
- ✅ Forgot password with 6-digit OTP (console-logged in dev)
- ✅ OTP verification + password reset
- ✅ Strong password validation (8+ chars, upper, lower, number, special)
- ✅ bcrypt password hashing

### Dashboards (Role-Based)
- ✅ Fleet Manager: KPIs + all data access
- ✅ Dispatcher: Trip management + vehicle/driver views
- ✅ Driver: My trips + unassigned open trips
- ✅ Safety Officer: Drivers + maintenance
- ✅ Financial Analyst: Fuel, expenses, analytics

### Vehicle Management
- ✅ Full CRUD (Fleet Manager only)
- ✅ Status tracking: Available / In Use / In Shop
- ✅ Automatic status updates from trips and maintenance

### Trip Management
- ✅ Create trips with cargo weight validation
- ✅ Prevent assignment if cargo > vehicle capacity
- ✅ Full lifecycle: Draft → Dispatched → In Progress → Completed/Cancelled
- ✅ Drivers can accept unassigned trips
- ✅ Drivers can start and complete their trips

### Maintenance
- ✅ Add service logs → auto-sets vehicle to In Shop
- ✅ Mark complete → auto-sets vehicle to Available

### Fuel & Expense Logging
- ✅ Fuel log with per-vehicle tracking
- ✅ Expense records with category breakdown
- ✅ CSV export

### Analytics
- ✅ Operational cost summary
- ✅ Fuel efficiency charts (Recharts)
- ✅ Monthly financial summary table
- ✅ Fleet utilization rate
- ✅ CSV export

---

## API Endpoints

| Method | Endpoint                          | Role Access              |
|--------|-----------------------------------|--------------------------|
| POST   | /api/auth/login                   | Public                   |
| POST   | /api/auth/register-driver         | Public                   |
| POST   | /api/auth/forgot-password         | Public                   |
| POST   | /api/auth/verify-otp              | Public                   |
| POST   | /api/auth/reset-password          | Public                   |
| GET    | /api/dashboard                    | All authenticated         |
| GET    | /api/vehicles                     | All authenticated         |
| POST   | /api/vehicles                     | Fleet Manager             |
| PUT    | /api/vehicles/:id                 | Fleet Manager             |
| DELETE | /api/vehicles/:id                 | Fleet Manager             |
| GET    | /api/trips                        | All authenticated         |
| POST   | /api/trips                        | Manager, Dispatcher       |
| PUT    | /api/trips/:id                    | Manager, Dispatcher, Driver |
| GET    | /api/drivers                      | All authenticated         |
| PUT    | /api/drivers/:id                  | Manager, Safety Officer   |
| DELETE | /api/drivers/:id                  | Fleet Manager             |
| GET    | /api/maintenance                  | All authenticated         |
| POST   | /api/maintenance                  | Manager, Safety Officer   |
| PUT    | /api/maintenance/:id/complete     | Manager, Safety Officer   |
| GET    | /api/fuel                         | All authenticated         |
| POST   | /api/fuel                         | Manager, Dispatcher       |
| GET    | /api/expenses                     | Manager, Financial Analyst |
| POST   | /api/expenses                     | Manager, Financial Analyst |
| GET    | /api/analytics                    | Manager, Financial Analyst |

---

## Folder Structure

```
fleetflow/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── RegisterDriver.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Vehicles.jsx
│   │   │   ├── Trips.jsx
│   │   │   ├── Drivers.jsx
│   │   │   ├── Maintenance.jsx
│   │   │   ├── FuelLogs.jsx
│   │   │   ├── Expenses.jsx
│   │   │   ├── Analytics.jsx
│   │   │   └── MyProfile.jsx
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── StatusBadge.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── server/
    ├── controllers/
    │   ├── auth.controller.js
    │   ├── vehicle.controller.js
    │   ├── trip.controller.js
    │   ├── driver.controller.js
    │   ├── maintenance.controller.js
    │   ├── fuel_expense.controller.js
    │   ├── analytics.controller.js
    │   └── dashboard.controller.js
    ├── routes/
    │   ├── auth.routes.js
    │   ├── vehicle.routes.js
    │   ├── trip.routes.js
    │   ├── driver.routes.js
    │   ├── maintenance.routes.js
    │   ├── fuel.routes.js
    │   ├── expense.routes.js
    │   ├── analytics.routes.js
    │   └── dashboard.routes.js
    ├── middleware/
    │   └── auth.middleware.js
    ├── prisma/
    │   ├── schema.prisma
    │   └── seed.js
    ├── index.js
    ├── package.json
    └── .env
```
