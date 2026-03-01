# Authentication Integration Guide

## ✅ What We've Done

We've integrated the **Registration** and **Login** features with your FastAPI backend. Here's what was implemented:

### Files Created/Modified:

#### 1. **`.env.local`** (Environment Variables)
- Configures the API base URL for all backend requests
- Stores JWT token key names for localStorage

#### 2. **`lib/api-client.ts`** (HTTP Client)
- Reusable API client for all backend requests
- Automatic token management (access & refresh tokens)
- Handles 401 errors with automatic token refresh
- Request/response interception
- Error handling and normalization

#### 3. **`lib/auth-service.ts`** (Authentication Service)
- `register()` - Creates new user account
- `login()` - Authenticates user and stores tokens
- `getCurrentUser()` - Fetches authenticated user details
- `logout()` - Clears tokens
- `isAuthenticated()` - Checks if user is logged in
- `getAccessToken()` - Retrieves current JWT token

#### 4. **`app/(auth)/inscription/page.tsx`** (Updated Registration Page)
- Now sends form data to `/api/v1/auth/register`
- Stores JWT tokens in localStorage
- Redirects to confirmation page on success
- Shows backend errors in UI

#### 5. **`app/(auth)/connexion/login-form.tsx`** (Updated Login Page)
- Now sends credentials to `/api/v1/auth/login`
- Automatically checks user role (rank)
- Redirects to admin dashboard (rank=6) or student dashboard (rank=1)
- Stores tokens automatically

---

## 🚀 Setup Instructions

### Step 1: Backend Setup

1. Open a new terminal and navigate to the Backend folder:
```bash
cd Backend
```

2. Install dependencies (if not already done):
```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the Backend folder:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/qcm_study_db
SECRET_KEY=your-super-secret-key-minimum-32-characters-long-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

⚠️ **Important**: 
- Replace `postgresql://user:password@localhost:5432/qcm_study_db` with your actual PostgreSQL connection string
- Make sure PostgreSQL is running
- The `SECRET_KEY` must be at least 32 characters long (use a secure random string)

4. Initialize the database:
```bash
python init_db.py
```

5. Start the FastAPI server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

6. Verify the backend is running:
- Open browser: http://localhost:8000/docs (API documentation)
- You should see the Swagger UI with all endpoints

---

### Step 2: Frontend Setup

1. Open another terminal and navigate to the Frontend folder:
```bash
cd Frontend
```

2. Install dependencies (if not already done):
```bash
pnpm install
# or npm install if you don't have pnpm
```

3. The `.env.local` file is already created. Verify it contains:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_API_ENDPOINT=http://localhost:8000/api/v1
NEXT_PUBLIC_JWT_STORAGE_KEY=qcm_study_auth_token
NEXT_PUBLIC_REFRESH_TOKEN_KEY=qcm_study_refresh_token
```

4. Start the Next.js development server:
```bash
pnpm dev
# or npm run dev
```

Expected output:
```
  ▲ Next.js 16.0.10
  - Local:        http://localhost:3000
  - Environments: .env.local
```

5. Open browser: http://localhost:3000

---

## 🧪 Testing the Integration

### Test Registration:

1. Go to http://localhost:3000/inscription
2. Fill in the form:
   - **Step 1**: Personal info (name, DOB, address, etc.)
   - **Step 2**: Education info (diploma, school, university)
   - **Step 3**: Account credentials (email, password, captcha, terms)
3. Click "Créer mon compte" (Create account)
4. **Expected Result**: 
   - Backend receives data
   - User is created in PostgreSQL
   - JWT tokens are stored in localStorage
   - Redirected to `/inscription/confirmation`

### Test Login:

1. Go to http://localhost:3000/connexion
2. Enter the email and password you just registered with
3. Click "Se connecter" (Sign in)
4. **Expected Result**:
   - JWT tokens are stored in localStorage
   - If user role is 6 (admin): redirect to `/admin-dashboard`
   - If user role is 1 (student): redirect to `/tableau-de-bord`

---

## 🔍 Debugging & Troubleshooting

### Check Browser Console:
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Check for any error messages
4. Go to **Network** tab
5. Check API requests to `localhost:8000/api/v1/*`

### Check Browser Storage:
1. Open DevTools → **Application** tab
2. Check **LocalStorage** → `http://localhost:3000`
3. You should see:
   - `qcm_study_auth_token` - JWT access token
   - `qcm_study_refresh_token` - Refresh token

### Check Backend Logs:
1. Look at the terminal running FastAPI
2. You should see requests like:
   ```
   POST /api/v1/auth/register
   POST /api/v1/auth/login
   GET /api/v1/auth/me
   ```

### Common Issues:

| Issue | Solution |
|-------|----------|
| **CORS Error** | Ensure `CORS_ORIGINS` in Backend `.env` includes `http://localhost:3000` |
| **Database Connection Error** | Check PostgreSQL is running and `DATABASE_URL` is correct |
| **"Email already exists"** | Register with a different email address |
| **"Invalid credentials"** | Make sure you entered the correct password |
| **Blank page after login** | Check that dashboard pages exist at `/tableau-de-bord` and `/admin-dashboard` |

---

## 📁 File Structure After Integration

```
Frontend/
├── .env.local                              # ← NEW
├── lib/
│   ├── api-client.ts                       # ← NEW (HTTP client)
│   ├── auth-service.ts                     # ← NEW (Auth logic)
│   └── utils.ts
├── app/
│   ├── (auth)/
│   │   ├── connexion/
│   │   │   └── login-form.tsx              # ← UPDATED (integrated with API)
│   │   └── inscription/
│   │       └── page.tsx                    # ← UPDATED (integrated with API)
│   └── ...
```

---

## 🔐 Security Notes

1. **Access Token**: Stored in localStorage, expires in 30 minutes (configurable)
2. **Refresh Token**: Stored in localStorage, expires in 7 days (configurable)
3. **Automatic Refresh**: When access token expires, the API client automatically refreshes using refresh token
4. **Logout**: Call `AuthService.logout()` to clear all tokens

### For Production:
- Move tokens to secure HTTP-only cookies
- Use a proper secret key management system
- Enable HTTPS only
- Implement CSRF protection

---

## 🎯 Next Integration Features (After Auth is Working)

Once authentication is fully integrated and tested, we can proceed with:

1. **Protected Routes** - Middleware to prevent unauthorized access
2. **MCQ Listing** - Fetch and display questions
3. **Exam Sessions** - Create and manage exam sessions
4. **Admin Features** - MCQ management, user management
5. **Results** - Display exam results and analytics

---

## ✨ API Endpoints Used

| Feature | Endpoint | Method |
|---------|----------|--------|
| Register | `/auth/register` | POST |
| Login | `/auth/login` | POST |
| Get User | `/auth/me` | GET |
| Refresh Token | `/auth/refresh` | POST |

All endpoints require the format: `http://localhost:8000/api/v1/...`

---

## 📞 Quick Commands

### Backend
```bash
# Terminal 1 - Start Backend
cd Backend
pip install -r requirements.txt
python init_db.py
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
# Terminal 2 - Start Frontend
cd Frontend
pnpm install
pnpm dev
# Open http://localhost:3000
```

---

Good luck with the integration! 🚀
