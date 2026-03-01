# 🎯 Authentication Integration Checklist

## Phase 1: Preparation ✅ DONE

- [x] Created API Client (`lib/api-client.ts`)
  - HTTP client with automatic token management
  - Request/response interception
  - Automatic token refresh on 401
  - Error handling

- [x] Created Auth Service (`lib/auth-service.ts`)
  - User registration
  - User login
  - Get current user
  - Token management
  - Logout functionality

- [x] Created Auth Hooks (`lib/auth-hooks.ts`)
  - Protected route hook
  - Admin-only route hook
  - Current user hook
  - Logout hook

- [x] Updated Registration Page
  - Connected to `/api/v1/auth/register`
  - Form data transformation
  - Token storage
  - Error handling

- [x] Updated Login Page
  - Connected to `/api/v1/auth/login`
  - Role-based redirection
  - Token storage
  - Error handling

- [x] Created Environment Configuration
  - `.env.local` with API endpoints
  - Token storage key names

---

## Phase 2: Backend Setup 

### Pre-requirements
- [ ] PostgreSQL installed and running
- [ ] Python 3.9+ installed
- [ ] Backend folder has `requirements.txt`

### Setup Steps
- [ ] Navigate to `Backend` folder
- [ ] Create `.env` file with:
  ```env
  DATABASE_URL=postgresql://user:password@localhost:5432/qcm_study_db
  SECRET_KEY=your-secret-key-minimum-32-characters
  ALGORITHM=HS256
  ACCESS_TOKEN_EXPIRE_MINUTES=30
  REFRESH_TOKEN_EXPIRE_DAYS=7
  CORS_ORIGINS=http://localhost:3000,http://localhost:3001
  ```
- [ ] Install dependencies: `pip install -r requirements.txt`
- [ ] Initialize database: `python init_db.py`
- [ ] Start server: `uvicorn app.main:app --reload --port 8000`
- [ ] Verify at http://localhost:8000/docs (should show API docs)
- [ ] Verify at http://localhost:8000/health (should return healthy status)

---

## Phase 3: Frontend Setup

### Pre-requirements
- [ ] Node.js 18+ installed
- [ ] pnpm or npm installed
- [ ] Frontend folder ready

### Setup Steps
- [ ] Navigate to `Frontend` folder
- [ ] Verify `.env.local` exists with correct values
- [ ] Install dependencies: `pnpm install` (or `npm install`)
- [ ] Start dev server: `pnpm dev` (or `npm run dev`)
- [ ] Verify at http://localhost:3000 (should load homepage)

---

## Phase 4: Integration Testing

### Test Registration Flow
- [ ] Open http://localhost:3000/inscription
- [ ] Fill in all required fields
  - [ ] Step 1: Personal info (civility, name, DOB, address, country, phone)
  - [ ] Step 2: Education info (diploma, school, university)
  - [ ] Step 3: Account (email, password, captcha check, terms)
- [ ] Click "Créer mon compte"
- [ ] Check browser console for errors
- [ ] Verify success page appears
- [ ] Check localStorage for tokens:
  ```javascript
  // Run in browser console
  localStorage.getItem('qcm_study_auth_token')  // Should have long JWT
  localStorage.getItem('qcm_study_refresh_token')  // Should have token
  ```
- [ ] Check backend logs for registration request
- [ ] Verify user exists in PostgreSQL database

### Test Login Flow
- [ ] Open http://localhost:3000/connexion
- [ ] Enter email and password from registration
- [ ] Click "Se connecter"
- [ ] Check browser console for errors
- [ ] Verify tokens in localStorage are updated
- [ ] Check if redirected to dashboard
  - If user rank = 6 (admin): should go to `/admin-dashboard`
  - If user rank = 1 (student): should go to `/tableau-de-bord`
- [ ] Check backend logs for login requests

### Test Token Refresh (Optional)
- [ ] Login successfully
- [ ] Wait for access token to expire (if set to short duration for testing)
- [ ] Try to access protected endpoint
- [ ] Should automatically refresh token
- [ ] Should continue without requiring login again

---

## Phase 5: Edge Case Testing

### Test Registration Validation
- [ ] Try registering with invalid email format → should show error
- [ ] Try registering with password < 8 characters → should show error
- [ ] Try registering with mismatched passwords → should show error
- [ ] Try registering with duplicate email → should show "email exists" error
- [ ] Try registering without accepting terms → should show error
- [ ] Try registering without checking captcha → should show error

### Test Login Validation
- [ ] Try login with non-existent email → should show error
- [ ] Try login with wrong password → should show error
- [ ] Try login with blank email → should show error
- [ ] Try login with blank password → should show error
- [ ] Try login with invalid email format → should show error

### Test Error Handling
- [ ] Stop backend server
- [ ] Try to register → should show connection error
- [ ] Try to login → should show connection error
- [ ] Restart backend
- [ ] Should work again

### Test CORS
- [ ] Backend should accept requests from http://localhost:3000
- [ ] Check Network tab in DevTools
- [ ] Should not see CORS errors
- [ ] Response should include proper CORS headers

---

## Phase 6: Database Verification

### Check Created User Record
```bash
# Connect to PostgreSQL
psql postgresql://user:password@localhost:5432/qcm_study_db

# Check users table
SELECT id, email, first_name, last_name, rank FROM users;

# Should see registered user(s)
```

### Verify User Fields
- [ ] `id` - UUID
- [ ] `email` - User's email address
- [ ] `first_name` - User's first name
- [ ] `last_name` - User's last name
- [ ] `rank` - 1 (student) by default
- [ ] `created_at` - Registration timestamp
- [ ] `password` - Bcrypt hashed (not plain text!)
- [ ] `accepted_terms` - true
- [ ] `is_robot_verified` - true

---

## Phase 7: Security Verification

- [ ] Password is bcrypt hashed (not plain text)
- [ ] Tokens are JWT format
- [ ] Access token has ~30 min expiry
- [ ] Refresh token has ~7 days expiry
- [ ] Tokens not logged anywhere
- [ ] HTTPS ready (for production)
- [ ] SECRET_KEY is strong (min 32 chars)
- [ ] No sensitive data in localStorage (only tokens)

---

## Phase 8: Browser DevTools Inspection

### Application Tab
- [ ] Open http://localhost:3000
- [ ] Open DevTools → Application tab
- [ ] Check LocalStorage → http://localhost:3000
  - [ ] `qcm_study_auth_token` exists after login
  - [ ] `qcm_study_refresh_token` exists after login
  - [ ] Tokens are long alphanumeric strings (JWT format)

### Network Tab
- [ ] Perform login
- [ ] Check Network tab
- [ ] Should see requests:
  - [ ] POST /api/v1/auth/login
  - [ ] GET /api/v1/auth/me
- [ ] Response should include `access_token` and `refresh_token`

### Console Tab
- [ ] Should see no 403/401 errors (except for initial checks)
- [ ] No CORS errors
- [ ] No undefined token errors

---

## Phase 9: Component Usage

### Test Protected Routes Hook
```tsx
// In any component
"use client"
import { useProtectedRoute } from "@/lib/auth-hooks"

export default function MyPage() {
  const isAuth = useProtectedRoute()
  
  // Should redirect to login if not authenticated
}
```
- [ ] Test page redirects to login when not authenticated
- [ ] Test page shows content when authenticated

### Test Get Current User Hook
```tsx
// In any component
"use client"
import { useCurrentUser } from "@/lib/auth-hooks"

export default function Profile() {
  const { user, isLoading } = useCurrentUser()
  
  // Should show user data
}
```
- [ ] Shows loading state initially
- [ ] Shows user data after loading
- [ ] User object has id, email, rank, etc.

### Test Admin Check Hook
```tsx
// In admin-only component
"use client"
import { useRequireAdmin } from "@/lib/auth-hooks"

export default function AdminPage() {
  const { isAdmin, isLoading } = useRequireAdmin()
  
  // Should deny access if not admin
}
```
- [ ] Redirects non-admin users to dashboard
- [ ] Allows admin users to see page
- [ ] Shows loading state during permission check

### Test Logout Hook
```tsx
// In any component
"use client"
import { useLogout } from "@/lib/auth-hooks"

export default function LogoutButton() {
  const logout = useLogout()
  
  return <button onClick={logout}>Logout</button>
}
```
- [ ] Clicking button clears tokens
- [ ] Redirects to login page
- [ ] Tokens removed from localStorage

---

## Phase 10: Documentation

- [x] Created `INTEGRATION_GUIDE.md` - Setup & testing guide
- [x] Created `AUTH_INTEGRATION_SUMMARY.md` - Feature overview
- [x] Created `QuickStart.bat` - Quick start script
- [x] This checklist

---

## ✅ Final Verification

Before moving to next features:

- [ ] Backend running and accepting requests
- [ ] Frontend running on localhost:3000
- [ ] Can register new user
- [ ] Can login with registered account
- [ ] Tokens stored in localStorage
- [ ] Can redirect to appropriate dashboard
- [ ] Can logout
- [ ] Protected routes work
- [ ] No console errors
- [ ] No network errors
- [ ] Database has new users
- [ ] API documentation accessible at http://localhost:8000/docs

---

## 🎯 Status

Current Phase: **Phase 1 ✅ COMPLETE**

Next Phases:
- Phase 2: Backend Setup (In Progress)
- Phase 3: Frontend Setup (In Progress)
- Phase 4: Integration Testing
- Phase 5: Edge Case Testing
- Phase 6-10: Verification & Documentation

---

## 📞 Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS Error | Check `CORS_ORIGINS` in Backend `.env` |
| Connection Refused | Backend not running on port 8000 |
| 404 API Error | Check `.env.local` API_ENDPOINT value |
| Tokens not saving | Check localStorage permissions |
| Password validation error | Ensure password is min 8 chars |
| Email validation error | Ensure email format is valid |
| Database error | Check DATABASE_URL and PostgreSQL status |
| Token expired | Should auto-refresh, if not check backend logs |

---

## 🚀 Next Features (After Auth Complete)

1. Protected Routes Middleware
2. MCQ Listing & Display
3. Exam Session Management
4. Admin Dashboard Integration
5. Results & Analytics
6. Payment Integration

---

**Keep this checklist updated as you progress through each phase!**
