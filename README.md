# ⚡ WorkFlow — Employee Management SaaS

A fully functional multi-tenant employee management system built with React, FastAPI, and PostgreSQL.

---

## 🏗️ Architecture

```
emp-mgmt/
├── backend/            # FastAPI + SQLAlchemy + PostgreSQL
│   ├── main.py         # All API routes
│   ├── models.py       # Database models
│   ├── schemas.py      # Pydantic request/response schemas
│   ├── auth.py         # JWT auth + password hashing
│   ├── database.py     # DB connection + session
│   └── requirements.txt
├── frontend/           # React SPA
│   ├── src/
│   │   ├── pages/      # Login, Signup, Dashboard, Employees, Messages, Notifications, Leaves
│   │   ├── components/ # Sidebar
│   │   ├── context/    # AuthContext, ThemeContext
│   │   └── utils/      # api.js (fetch wrapper)
│   └── public/
└── docker-compose.yml
```

---

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
docker-compose up --build
```

Then open:
- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/docs

### Option 2: Manual Setup

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set up PostgreSQL and create database: emp_mgmt
export DATABASE_URL=postgresql://postgres:password@localhost:5432/emp_mgmt
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
REACT_APP_API_URL=http://localhost:8000 npm start
```

---

## 📦 Database Tables

| Table | Purpose |
|-------|---------|
| `companies` | Multi-tenant company records |
| `users` | All users (admin + employee) unified |
| `messages` | Direct + broadcast messages |
| `notifications` | Per-user notification feed |
| `leave_requests` | Employee leave submissions |

---

## 🔐 Auth Flow

1. **Signup** → creates company + admin user → returns JWT
2. **Login** → requires email + company selection → returns JWT
3. JWT contains: `user_id`, `company_id`, `role`
4. All API routes verify JWT via `Authorization: Bearer <token>`

---

## 👤 User System

- **Single `users` table** for all people
- `role` field: `admin` or `employee`
- `company_id` provides tenant isolation
- Same email CAN exist in different companies (multi-tenant)
- Same email CANNOT exist twice in the same company

---

## 📡 API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/signup` | Create company + admin |
| POST | `/api/login` | Login (requires company_id) |
| GET | `/api/companies` | List all companies (for login dropdown) |
| GET | `/api/me` | Current user profile |

### Employees (Admin only for write)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/employees` | List company employees |
| POST | `/api/employees` | Add employee (sends welcome msg) |
| DELETE | `/api/employees/:id` | Remove employee |
| GET | `/api/my-admin` | Get company admin (for employees) |

### Messages
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/messages` | Get messages (scoped by role) |
| POST | `/api/messages` | Send message / broadcast |

### Notifications
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/notifications` | Get user notifications |
| PATCH | `/api/notifications/:id/read` | Mark one as read |
| PATCH | `/api/notifications/read-all` | Mark all as read |

### Leave Requests
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/leaves` | Get leaves (admin=all, employee=own) |
| POST | `/api/leaves` | Submit leave request |
| PATCH | `/api/leaves/:id` | Approve/reject (admin only) |

### Dashboard
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/dashboard/stats` | Stats for current user |

---

## ✨ Features

- **Multi-tenant**: Companies are isolated, all queries filter by `company_id`
- **Role-based access**: Admin sees all; employee sees own data + admin info
- **Auto welcome message**: Sent when employee is added
- **Broadcast messages**: Admin can message all employees at once
- **Leave management**: Submit → Admin approves/rejects → Employee notified
- **Dark/Light mode**: Toggle persists in localStorage
- **JWT auth**: Stored in localStorage, sent with every request

---

## 🧪 Test Flow

1. **Sign up** as admin → creates "Acme Corp" company
2. **Add employees** from the Employees page
3. **Send messages** to individuals or broadcast to all
4. **Employee logs in** → sees their admin, messages, notifications
5. **Employee requests leave** → Admin approves/rejects
6. **Toggle dark/light mode** with the button in sidebar

---

## 🔧 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://postgres:password@localhost/emp_mgmt` | PostgreSQL connection |
| `SECRET_KEY` | `supersecretkey_change_in_production_12345` | JWT signing key |
| `REACT_APP_API_URL` | `http://localhost:8000` | Backend URL |
