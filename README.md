# CRM Pro — Full Stack Lead Management System

A production-grade Mini CRM application for managing client leads from website contact forms. Built with React, Node.js, Express, and MongoDB.

---

## Quick Start

### Prerequisites
- **Node.js** v18+
- **MongoDB** running locally on port 27017
- **npm** v8+

### 1. Install dependencies

```bash
# Install server deps
cd server
npm install

# Install client deps
cd ../client
npm install
```

### 2. Configure environment

The server `.env` is pre-configured for local development:
```
MONGODB_URI=mongodb://localhost:27017/crm_db
JWT_SECRET=crm_super_secret_jwt_key_2024_change_in_production
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

### 3. Seed the database

```bash
cd server
npm run seed
```

This creates:
- **Admin user**: `admin@crm.com` / `admin123`
- **30 sample leads** with notes and follow-ups spread over 12 months

### 4. Start the application

Open **two terminals**:

```bash
# Terminal 1 — Backend (port 5000)
cd server
npm run dev

# Terminal 2 — Frontend (port 5173)
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and log in with `admin@crm.com` / `admin123`.

---

## Project Structure

```
crm-app/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/          # Button, Input, Badge, Modal, Skeleton, Select
│   │   │   ├── layout/      # Sidebar, Navbar, Layout
│   │   │   └── leads/       # StatusBadge, LeadFilters
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── LeadList.jsx
│   │   │   ├── LeadDetails.jsx
│   │   │   └── Settings.jsx
│   │   ├── context/         # AuthContext
│   │   ├── services/        # Axios API service
│   │   ├── hooks/           # useDebounce
│   │   └── utils/           # helpers, csvExport
│   └── package.json
│
├── server/                  # Node.js + Express backend
│   ├── controllers/
│   │   ├── authController.js
│   │   └── leadController.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── leads.js
│   ├── models/
│   │   ├── User.js
│   │   └── Lead.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── config/db.js
│   ├── seed.js
│   ├── index.js
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS v3 |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| State | React Context API |
| HTTP Client | Axios |
| Charts | Recharts |
| Notifications | react-hot-toast |
| Icons | lucide-react |
| Dates | date-fns |

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Admin login |
| GET | `/api/auth/me` | JWT | Get current user |
| PUT | `/api/auth/profile` | JWT | Update profile |
| PUT | `/api/auth/password` | JWT | Change password |
| GET | `/api/leads` | JWT | List leads (paginated, filtered, sorted) |
| GET | `/api/leads/stats` | JWT | KPI statistics |
| GET | `/api/leads/:id` | JWT | Single lead |
| POST | `/api/leads` | Public | Create lead (contact form) |
| PUT | `/api/leads/:id` | JWT | Update lead |
| DELETE | `/api/leads/:id` | JWT | Delete lead |
| PATCH | `/api/leads/:id/status` | JWT | Update status |
| POST | `/api/leads/:id/notes` | JWT | Add note |
| PUT | `/api/leads/:id/notes/:nid` | JWT | Edit note |
| DELETE | `/api/leads/:id/notes/:nid` | JWT | Delete note |
| POST | `/api/leads/:id/followups` | JWT | Add follow-up |
| PUT | `/api/leads/:id/followups/:fid` | JWT | Update follow-up |

### Query Parameters for GET /api/leads:
- `page`, `limit` — pagination
- `search` — searches name, email, company, phone
- `status`, `source`, `priority` — filters
- `startDate`, `endDate` — date range filter
- `sortBy`, `sortOrder` — sorting

---

## Design System

| Token | Value |
|---|---|
| Background | `#0A0A0F` |
| Surface | `#111118` |
| Surface 2 | `#1A1A26` |
| Accent | `#EAB308` (Yellow) |
| Text Primary | `#F1F5F9` |
| Text Muted | `#94A3B8` |

---

## Docker

```bash
docker-compose up -d
```

Services: MongoDB (27017), Backend (5000), Frontend (5173)

---

## Features

### Authentication
- JWT-based login
- Token persistence in localStorage
- Protected routes
- Auto-logout on token expiry

### Dashboard
- KPI cards with animated count-up
- Monthly leads area chart
- Status distribution pie chart
- Lead source bar chart
- Recent leads table

### Lead Management
- Paginated, sortable lead table
- Advanced filters (search, status, source, priority, date range)
- Inline status editing
- Add / Edit / Delete leads via modals
- CSV export

### Lead Details
- Full editable info panel
- Notes CRUD (add, edit inline, delete)
- Follow-up scheduling with reminder flags
- Status selector with visual pipeline
- Activity timeline

### Settings
- Profile update
- Password change with strength indicator
- UI preferences (notifications, items per page, default view)
