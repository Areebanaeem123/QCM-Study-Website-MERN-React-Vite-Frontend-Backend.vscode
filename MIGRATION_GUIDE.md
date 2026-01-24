# Migration Guide: Next.js Backend to FastAPI

## Project Structure

```
QCM-Study-Website-MERN-React-Vite-Frontend-Backend.vscode/
├── Frontend/          # Next.js Frontend
│   └── (Next.js app with React)
│
└── Backend/           # FastAPI Backend
    └── (FastAPI app with SQLAlchemy)
```

## Backend Setup (FastAPI)

### 1. Install Dependencies

```bash
cd Backend
pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env` file in the `Backend` directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/qcm_study_db
SECRET_KEY=your-secret-key-here-minimum-32-characters-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### 3. Initialize Database

```bash
cd Backend
python init_db.py
```

### 4. Run the Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: `http://localhost:8000`
- Docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Frontend Setup (Next.js)

### 1. Configure Environment

Create a `.env.local` file in the `Frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 2. Run the Frontend

```bash
cd Frontend
npm run dev
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register a new user
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "rank": 1
  }
  ```

- `POST /api/v1/auth/login` - Login
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
  Returns:
  ```json
  {
    "access_token": "...",
    "refresh_token": "...",
    "token_type": "bearer"
  }
  ```

- `POST /api/v1/auth/refresh` - Refresh access token
  ```json
  {
    "refresh_token": "..."
  }
  ```

- `GET /api/v1/auth/me` - Get current user (requires authentication)

### Universities (Admin Only - rank 6)

- `GET /api/v1/universities` - List all universities
- `POST /api/v1/universities` - Create a university
  ```json
  {
    "name": "University Name",
    "is_displayed": true
  }
  ```
- `GET /api/v1/universities/{id}` - Get a university
- `PUT /api/v1/universities/{id}` - Update a university
- `DELETE /api/v1/universities/{id}` - Delete a university

## Authentication Flow

1. User registers or logs in
2. Backend returns `access_token` and `refresh_token`
3. Frontend stores tokens in localStorage
4. Frontend includes `Authorization: Bearer {access_token}` header in requests
5. When access token expires, frontend automatically refreshes using refresh token

## User Roles

- **Student**: `rank = 1` (default)
- **Admin**: `rank = 6` (can manage universities)

## Key Changes from Next.js Backend

1. **Authentication**: Changed from NextAuth.js to JWT (access + refresh tokens)
2. **Database**: Changed from Prisma to SQLAlchemy
3. **API**: Separate FastAPI backend instead of Next.js API routes
4. **Frontend**: Updated to use REST API client instead of NextAuth

## Testing

1. Start PostgreSQL database
2. Start FastAPI backend: `uvicorn app.main:app --reload`
3. Start Next.js frontend: `npm run dev`
4. Visit `http://localhost:3000` and test registration/login

