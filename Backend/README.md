# QCM Study Backend API

FastAPI backend for QCM Study application.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create a `.env` file from `.env.example` and configure:
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT secret key (minimum 32 characters)
- `CORS_ORIGINS`: Allowed frontend origins

3. Initialize the database:
```bash
# Create tables
python -c "from app.core.database import Base, engine; Base.metadata.create_all(bind=engine)"
```

## Running the Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login and get tokens
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user info

### Universities (Admin Only)
- `GET /api/v1/universities` - List all universities
- `POST /api/v1/universities` - Create a university
- `GET /api/v1/universities/{id}` - Get a university
- `PUT /api/v1/universities/{id}` - Update a university
- `DELETE /api/v1/universities/{id}` - Delete a university

## User Roles

- **Student**: rank = 1 (default)
- **Admin**: rank = 6 (can manage universities)

