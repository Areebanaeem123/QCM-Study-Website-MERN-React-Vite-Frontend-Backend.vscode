# Admin Dashboard - Question Bank Management

## New Admin Endpoints for Question Banks

The admin dashboard now includes comprehensive Question Bank management endpoints, following the same pattern as Pack management.

### Base URL
```
http://localhost:8000/api/v1/admin
```

---

## Admin Question Bank Endpoints

### 1️⃣ LIST QUESTION BANKS
```http
GET /question-banks
GET /question-banks?university_id=uni-123&skip=0&limit=20

Response (200):
{
  "total": 5,
  "skip": 0,
  "limit": 20,
  "items": [
    {
      "id": "qb-123",
      "title": "Advanced Biology",
      "description": "...",
      "image_url": "...",
      "university_id": "uni-123",
      "university_name": "University Name",
      "price": 49.99,
      "currency": "CHF",
      "start_datetime": "2026-03-01T00:00:00+00:00",
      "expiry_datetime": "2026-12-31T23:59:59+00:00",
      "display_before_start": false,
      "is_published": true,
      "created_at": "2026-03-01T10:30:00+00:00",
      "created_by": "user-456",
      "creator_name": "Dr. John Smith",
      "mcqs": [
        {"id": "mcq-1", "title": "Q1", "question_text": "..."},
        {"id": "mcq-2", "title": "Q2", "question_text": "..."}
      ],
      "student_count": 15,        // ✅ NEW: Number of students who purchased
      "review_count": 8,          // ✅ NEW: Number of reviews
      "average_rating": 4.5       // ✅ NEW: Average rating (1-5 stars)
    }
  ]
}
```

---

### 2️⃣ CREATE QUESTION BANK
```http
POST /question-banks
Content-Type: application/json

{
  "title": "Physics Fundamentals",
  "description": "Core physics concepts",
  "image_url": "https://example.com/physics.png",
  "university_id": "uni-456",
  "price": 59.99,
  "currency": "CHF",
  "start_datetime": "2026-03-15T08:00:00Z",
  "expiry_datetime": "2027-03-14T23:59:59Z",
  "display_before_start": true,
  "is_published": true,
  "mcq_ids": ["mcq-001", "mcq-002", "mcq-003"]
}

Response (201): AdminQuestionBankResponse
```

---

### 3️⃣ GET SINGLE QUESTION BANK
```http
GET /question-banks/{qb_id}

Response (200): AdminQuestionBankResponse with full details including:
- All basic fields
- List of MCQs
- Student count
- Review count
- Average rating
```

---

### 4️⃣ UPDATE QUESTION BANK
```http
PUT /question-banks/{qb_id}
Content-Type: application/json

{
  "title": "Physics Fundamentals - Updated",
  "price": 69.99,
  "is_published": true,
  "mcq_ids": ["mcq-001", "mcq-002", "mcq-003", "mcq-004"]
}

Response (200): AdminQuestionBankResponse with updated data
```

---

### 5️⃣ DELETE QUESTION BANK
```http
DELETE /question-banks/{qb_id}

Response (204): No Content
```

---

## New Response Fields in AdminQuestionBankResponse

Added analytics fields to track Question Bank performance:

| Field | Type | Description |
|-------|------|-------------|
| `student_count` | int | Number of students who purchased |
| `review_count` | int | Number of reviews/ratings |
| `average_rating` | float | Average rating (1-5 stars) |

---

## Key Features

✅ **Full CRUD Operations**: Create, read, update, delete question banks  
✅ **Admin Analytics**: Track student purchases and reviews  
✅ **MCQ Management**: Add/remove MCQs from question banks  
✅ **University Filtering**: Filter question banks by university  
✅ **Pagination**: List with skip/limit for large datasets  
✅ **Validation**: Ensures universities and MCQs exist before operations  

---

## Comparison: Packs vs Question Banks in Admin Dashboard

| Feature | Packs | Question Banks |
|---------|-------|-----------------|
| List | ✅ `/packs` | ✅ `/question-banks` |
| Create | ✅ `POST /packs` | ✅ `POST /question-banks` |
| Get Details | ✅ `GET /packs/{id}` | ✅ `GET /question-banks/{id}` |
| Update | ✅ `PUT /packs/{id}` | ✅ `PUT /question-banks/{id}` |
| Delete | ✅ `DELETE /packs/{id}` | ✅ `DELETE /question-banks/{id}` |
| Time Limit | ✅ Supported | ❌ Not supported |
| MCQ Count Limit | ✅ Supported | ❌ Unlimited MCQs |
| Reviews Analytics | ❌ No | ✅ Yes (rating, count, avg) |
| Student Count | ❌ No | ✅ Yes |

---

## Example Workflows

### Admin Creates and Publishes Question Bank
```bash
# 1. Create question bank
curl -X POST "http://localhost:8000/api/v1/admin/question-banks" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "MCAT Prep",
    "price": 99.99,
    "currency": "CHF",
    "university_id": "uni-123",
    "start_datetime": "2026-03-01T00:00:00Z",
    "expiry_datetime": "2027-02-28T23:59:59Z",
    "is_published": true,
    "mcq_ids": ["mcq-1", "mcq-2", "mcq-3"]
  }'

# 2. View analytics
curl -X GET "http://localhost:8000/api/v1/admin/question-banks/qb-123" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 3. Update based on feedback
curl -X PUT "http://localhost:8000/api/v1/admin/question-banks/qb-123" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 89.99,
    "mcq_ids": ["mcq-1", "mcq-2", "mcq-3", "mcq-4", "mcq-5"]
  }'
```

---

## Admin Dashboard Statistics

The `AdminQuestionBankResponse` includes real-time analytics:

```json
{
  "id": "qb-123",
  "title": "Advanced Biology",
  ...
  "student_count": 42,        // How many bought this QB
  "review_count": 28,         // How many reviewed
  "average_rating": 4.3       // Average out of 5 stars
}
```

This allows admins to:
- See which question banks are popular
- Monitor student satisfaction via ratings
- Track revenue potential
- Adjust pricing based on demand

---

## Permissions

All admin Question Bank endpoints require:
- **Authentication**: Valid JWT token
- **Authorization**: Rank 6 (Admin only)

Error if not authorized:
```json
{
  "detail": "Not authenticated or insufficient permissions"
}
```

---

## Navigation in Admin Dashboard

Admin can now manage:
- Universities
- Subjects
- Lessons
- Question Types
- MCQs
- **Packs**
- **Mock Exams**
- **Question Banks** ← NEW

All accessible via the same admin pattern with full CRUD capabilities.
