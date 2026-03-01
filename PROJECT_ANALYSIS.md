# QCM Study Website - Project Structure & Integration Analysis

## 📋 Executive Summary

This is a **QCM (Multiple Choice Questions) Study Platform** for medical exam preparation. The architecture consists of:
- **Backend**: FastAPI (Python) with PostgreSQL database
- **Frontend**: Next.js 16 (React 19) with TypeScript
- **Authentication**: JWT-based with Role-based Access Control (RBAC)
- **UI Framework**: Radix UI components with Tailwind CSS

---

## 🏗️ BACKEND ARCHITECTURE (FastAPI)

### **Technology Stack**
- **Framework**: FastAPI 0.115.0
- **ORM**: SQLAlchemy 2.0.36
- **Database**: PostgreSQL (via psycopg2)
- **Authentication**: JWT (python-jose) + Bcrypt
- **Validation**: Pydantic 2.9.2
- **Server**: Uvicorn 0.32.0

### **Directory Structure**
```
Backend/
├── requirements.txt          # Python dependencies
├── init_db.py               # Database initialization script
├── README.md                # Backend documentation
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── core/
│   │   ├── config.py        # Configuration & environment variables
│   │   ├── database.py      # SQLAlchemy setup & session management
│   │   └── security.py      # JWT, password hashing utilities
│   ├── models/              # SQLAlchemy ORM models
│   │   ├── user.py          # User model (students, admins)
│   │   ├── university.py    # University model
│   │   ├── subject.py       # Subject model
│   │   ├── lesson.py        # Lesson model
│   │   ├── question_type.py # Question type model
│   │   ├── mcq.py           # Multiple Choice Question model
│   │   ├── mcq_option.py    # MCQ answer options
│   │   ├── mcq_approval.py  # MCQ approval workflow
│   │   ├── pack.py          # Study pack model
│   │   ├── pack_mcq.py      # MCQ-Pack relationship
│   │   ├── pack_purchase.py # Pack purchase tracking
│   │   ├── pack_review.py   # User reviews for packs
│   │   ├── mock_exam.py     # Mock exam model
│   │   ├── mock_exam_mcq.py # MCQs in mock exams
│   │   ├── question_bank.py # Question bank model
│   │   ├── session.py       # User exam session tracking
│   │   ├── slider.py        # Frontend slider/carousel data
│   │   ├── page.py          # Dynamic page content
│   │   └── __init__.py
│   ├── schemas/             # Pydantic schemas (request/response validation)
│   │   ├── auth.py          # Auth schemas
│   │   ├── user.py, mcq.py, pack.py, etc.
│   │   └── __init__.py
│   └── api/
│       └── v1/
│           ├── api.py       # API router aggregation
│           └── endpoints/   # Endpoint implementations
│               ├── auth.py           # Authentication endpoints
│               ├── universities.py   # University management
│               ├── subjects.py       # Subject management
│               ├── lesson.py         # Lesson endpoints
│               ├── question_type.py  # Question type endpoints
│               ├── mcqs.py           # MCQ CRUD operations
│               ├── packs.py          # Pack management
│               ├── session.py        # Session management
│               ├── feedback.py       # User feedback
│               ├── mock_exams_admin.py # Admin mock exam operations
│               ├── question_bank_router.py
│               ├── mcq_filter_router.py
│               ├── visualize_mcqs.py # MCQ visualization
│               └── [other specialized routers]
```

### **Key Models & Relationships**

```
User (rank: 1=student, 6=admin)
├── created_at, updated_at, email, password (encrypted)
├── profile (civility, first_name, last_name, DOB)
├── contact (address, country, phone)
├── education (diploma, former_school, university)
├── verification (email_verified, accepted_terms, is_robot_verified)
└── relationships: Universities, Lessons, QuestionTypes, MCQs, Sessions...

University (created by admin users)
├── name, description
└── relationship: Users (creator)

Subject
├── name, description
└── created_by: User

Lesson (learning materials)
├── title, content, duration
└── subject_id (FK)

QuestionType
├── name, description
└── created_by: User

MCQ (Multiple Choice Question)
├── text, explanation
├── question_type_id
├── subject_id
├── difficulty_level
├── mcq_options: [MCQOption] (1-to-many)
├── created_by: User
└── status (approved/pending)

Pack (Study packages - purchasable)
├── title, description, price
├── pack_mcqs: [PackMCQ] (MCQs in package)
├── pack_purchases: [PackPurchase] (user purchases)

MockExam (Practice full exams)
├── title, description, duration
├── mock_exam_mcqs: [MockExamMCQ]

Session (User exam session tracking)
├── user_id, exam_id
├── start_time, end_time
├── answers (user's responses)
├── score

QuestionBank (Categorized question collections)
├── title, description
├── question_bank_mcqs: [QuestionBankMCQ]
```

### **Authentication Flow**

1. **Registration** (`POST /api/v1/auth/register`)
   - Validates email uniqueness
   - Password strength check (min 8 chars)
   - Password confirmation
   - Terms acceptance required
   - Robot verification
   - Returns: User data

2. **Login** (`POST /api/v1/auth/login`)
   - Email + password validation
   - Creates JWT access token (30 min expiry)
   - Creates refresh token (7 day expiry)
   - Returns: { access_token, refresh_token }

3. **Token Refresh** (`POST /api/v1/auth/refresh`)
   - Uses refresh token to get new access token

4. **Get Current User** (`GET /api/v1/auth/me`)
   - Returns authenticated user details

### **Authorization**

- **OAuth2 Bearer Token**: Used for protected endpoints
- **Role-based Access**: `require_admin()` dependency for admin-only routes
- **JWT Structure**:
  ```python
  {
    "sub": user_id,
    "exp": expiration_time,
    "type": "access" or "refresh"
  }
  ```

### **API Endpoints Overview**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/auth/*` | POST/GET | User authentication |
| `/api/v1/universities` | GET/POST/PUT/DELETE | University management (admin) |
| `/api/v1/subjects` | GET/POST | Subject management |
| `/api/v1/lessons` | GET/POST | Learning materials |
| `/api/v1/question_types` | GET/POST | Question type definitions |
| `/api/v1/mcqs` | GET/POST/PUT | MCQ management |
| `/api/v1/packs` | GET/POST | Study pack management |
| `/api/v1/session` | POST/GET | Session tracking |
| `/api/v1/mock_exams_admin` | * | Mock exam operations |
| `/api/v1/question_bank_router` | * | Question bank operations |
| `/api/v1/feedback` | POST | User feedback submission |

---

## 🎨 FRONTEND ARCHITECTURE (Next.js)

### **Technology Stack**
- **Framework**: Next.js 16.0.10
- **UI Library**: React 19.2.0
- **Styling**: Tailwind CSS 4.1.9 with PostCSS
- **Component Library**: Radix UI
- **Forms**: React Hook Form + Zod validation
- **Charts**: Chart.js + Recharts
- **Authentication**: NextAuth 4.24.13 + Prisma Adapter
- **Database ORM**: Prisma 7.3.0
- **Icons**: Lucide React
- **Notifications**: Sonner (toast)
- **Theme**: next-themes

### **Directory Structure**
```
Frontend/
├── package.json                # Dependencies & scripts
├── next.config.mjs            # Next.js configuration
├── tsconfig.json              # TypeScript config
├── tailwind.config.js         # Tailwind CSS config
├── postcss.config.mjs         # PostCSS config
├── app/
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page
│   ├── globals.css            # Global styles
│   ├── (auth)/                # Auth route group
│   │   ├── layout.tsx
│   │   ├── connexion/         # Login page
│   │   ├── inscription/       # Registration page
│   │   └── mot-de-passe-oublie/ # Password reset
│   ├── (dashboard)/           # Protected dashboard routes
│   │   ├── layout.tsx
│   │   └── tableau-de-bord/   # Dashboard
│   ├── (main)/                # Main app routes
│   │   ├── layout.tsx
│   │   ├── banque-questions/  # Question bank
│   │   ├── examens/           # Exams
│   │   ├── packs/             # Study packs
│   │   ├── question-banks/    # Question banks
│   │   ├── universities/      # University list
│   │   ├── payment-methods/   # Payment
│   │   └── terms-conditions/  # Terms
│   ├── admin-dashboard/       # Admin section
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── activity/          # Activity logs
│   │   ├── feedback/          # User feedback
│   │   ├── mcq-approvals/     # MCQ approval workflow
│   │   ├── mcqs/              # MCQ management
│   │   ├── mock-exams/        # Mock exam management
│   │   ├── packs/             # Pack management
│   │   ├── pages/             # Content page management
│   │   ├── question-banks/    # Question bank management
│   │   ├── research/          # Research tools
│   │   ├── sliders/           # Carousel/slider management
│   │   ├── statistics/        # Analytics
│   │   └── users/             # User management
│   └── qcm/                   # QCM exam interface
│       ├── loading.tsx
│       ├── session/           # Active exam session
│       └── resultats/         # Exam results
├── components/
│   ├── navbar.tsx             # Navigation bar
│   ├── footer.tsx             # Footer
│   ├── providers.tsx          # App providers (context, themes, etc.)
│   ├── google-translate-fix.tsx
│   ├── theme-provider.tsx
│   ├── admin/
│   │   ├── AdminHeader.tsx    # Admin header
│   │   └── AdminSidebar.tsx   # Admin sidebar navigation
│   ├── dashboard/
│   │   ├── dashboard-shell.tsx
│   │   ├── header.tsx
│   │   └── sidebar.tsx
│   ├── landing/               # Landing page sections
│   │   ├── hero-section.tsx
│   │   ├── features-section.tsx
│   │   ├── about-section.tsx
│   │   ├── contact-section.tsx
│   │   ├── popular-packs-section.tsx
│   │   ├── stats-section.tsx
│   │   └── [other sections]
│   └── ui/                    # Reusable UI components (Radix-based)
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── dialog.tsx
│       └── [60+ UI components]
├── hooks/
│   ├── use-mobile.ts          # Mobile detection hook
│   └── use-toast.ts           # Toast notification hook
├── lib/
│   └── utils.ts               # Utility functions (cn for class merging, etc.)
├── types/
│   └── next-auth.d.ts         # NextAuth type definitions
├── styles/
│   └── globals.css            # Global CSS
└── public/                    # Static assets
```

### **Page Routes Structure**

```
Routes:
/                           # Home page
/connexion                  # Login
/inscription                # Registration
/mot-de-passe-oublie        # Password reset
/tableau-de-bord            # User dashboard
/banque-questions           # Question bank view
/examens                    # Exams page
/packs                      # Study packs page
/universities               # Universities page
/payment-methods            # Payment page
/terms-conditions           # Terms page
/qcm/session                # Active exam session
/qcm/resultats              # Exam results
/admin-dashboard            # Admin dashboard
/admin-dashboard/mcqs       # MCQ management
/admin-dashboard/packs      # Pack management
/admin-dashboard/mock-exams # Mock exam management
/admin-dashboard/users      # User management
/admin-dashboard/statistics # Analytics
```

### **Key Components & Features**

1. **Authentication System**
   - NextAuth for session management
   - Prisma adapter for user storage
   - JWT tokens (if using custom JWT)
   - Login/Register/Password Reset

2. **UI Components** (All Radix UI based)
   - Form controls: Input, Select, Checkbox, Radio, Toggle
   - Containers: Card, Dialog, Drawer, Modal, Popover
   - Navigation: Navbar, Sidebar, Breadcrumbs, Tabs
   - Data display: Tables, Lists, Carousels, Dropdowns
   - Charts: Bar, Line, Pie charts (Recharts)
   - Notifications: Toast/Sonner

3. **Admin Dashboard**
   - MCQ management & approval workflow
   - Pack creation & management
   - Mock exam configuration
   - User management & analytics
   - Feedback/support management
   - Content management (pages, sliders)

4. **User Dashboard**
   - Study progress tracking
   - Question bank access
   - Pack purchases & access
   - Exam history & results
   - Performance analytics

5. **QCM Exam Interface** (`/qcm/session`)
   - Real-time exam experience
   - Question navigation
   - Timer management
   - Answer tracking
   - Results display

### **Styling & Theme**
- **Tailwind CSS** for utility-first styling
- **CSS-in-JS**: Global styles in `globals.css`
- **Dark mode support** via `next-themes`
- **Responsive design** for mobile/tablet/desktop

---

## 🔄 INTEGRATION POINTS (Frontend ↔ Backend)

### **Current Integration Status**

| Feature | Backend Ready | Frontend Ready | Integration Needed |
|---------|---------------|----------------|--------------------|
| Authentication (Login/Register) | ✅ | ✅ | 🔄 API call wiring |
| User Management | ✅ | ✅ | 🔄 API call wiring |
| MCQ CRUD | ✅ | ✅ | 🔄 API call wiring |
| Pack Management | ✅ | ✅ | 🔄 API call wiring |
| Mock Exams | ✅ | ✅ | 🔄 API call wiring |
| Question Banks | ✅ | ✅ | 🔄 API call wiring |
| Sessions/Exam Tracking | ✅ | ✅ | 🔄 API call wiring |
| Admin Dashboard | ✅ | ✅ | 🔄 API call wiring |
| Feedback System | ✅ | ✅ | 🔄 API call wiring |

### **Key Integration Tasks**

1. **API Client Setup**
   - Create API service layer (fetch/axios wrapper)
   - Configure API base URL from environment
   - Implement request/response interceptors
   - Handle authentication token management

2. **Authentication Integration**
   - Connect login form to `/api/v1/auth/login`
   - Connect register form to `/api/v1/auth/register`
   - Store JWT tokens (localStorage/secure cookie)
   - Implement protected routes middleware

3. **Data Fetching**
   - Wire MCQ list page to `/api/v1/mcqs`
   - Wire Pack page to `/api/v1/packs`
   - Wire Question Bank to `/api/v1/question_bank_router`
   - Wire Exam session to `/api/v1/session`

4. **Admin Features**
   - Wire MCQ approval workflow
   - Wire pack/exam management pages
   - Wire user management page
   - Wire statistics/analytics

5. **Real-time Updates** (Optional)
   - WebSocket setup for live exam sessions
   - Real-time score updates
   - Notification system integration

### **Environment Configuration**

**Backend (.env file)**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/qcm_study_db
SECRET_KEY=your-very-long-secret-key-minimum-32-characters
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

**Frontend (.env.local file)**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_AUTH_ENDPOINT=http://localhost:8000/api/v1/auth
```

---

## 🚀 Next Steps for Integration

### **Phase 1: Setup & Configuration**
1. ✅ Understand project structure (DONE)
2. ⬜ Set up environment variables (Backend & Frontend)
3. ⬜ Start backend server (FastAPI)
4. ⬜ Start frontend dev server (Next.js)
5. ⬜ Test backend health check (`GET /health`)

### **Phase 2: Core Features**
6. ⬜ Integrate authentication (Login/Register)
7. ⬜ Set up protected routes
8. ⬜ Integrate MCQ listing & display
9. ⬜ Integrate exam session functionality
10. ⬜ Integrate results display

### **Phase 3: Advanced Features**
11. ⬜ Admin dashboard integration
12. ⬜ Real-time exam updates (WebSockets)
13. ⬜ Payment integration
14. ⬜ Analytics & reporting

### **Phase 4: Polish & Deployment**
15. ⬜ Error handling & validation
16. ⬜ Loading states & skeleton screens
17. ⬜ Performance optimization
18. ⬜ Testing (Unit & E2E)
19. ⬜ Deployment (Docker/CI-CD)

---

## 📊 Technology Summary

### Backend Stack
- **Language**: Python 3.9+
- **Framework**: FastAPI
- **Database**: PostgreSQL
- **Authentication**: JWT + Bcrypt
- **Server**: Uvicorn
- **ORM**: SQLAlchemy 2.0

### Frontend Stack
- **Language**: TypeScript
- **Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS 4
- **Components**: Radix UI
- **Forms**: React Hook Form + Zod
- **State**: React Context (can add Redux if needed)
- **Authentication**: NextAuth 4

### Deployment Targets
- **Backend**: Can run on any Python hosting (Heroku, Railway, PythonAnywhere, etc.)
- **Frontend**: Optimized for Vercel, but can run on any Node.js host

---

## ✅ Ready for Integration!

Your project is well-structured with:
- ✅ Clear separation of concerns
- ✅ Comprehensive API endpoints
- ✅ Modern tech stack (FastAPI + Next.js)
- ✅ Proper authentication & authorization
- ✅ Complete data models
- ✅ Admin & user dashboards
- ✅ Professional UI components

**Next: We'll start connecting these two systems step-by-step!**
