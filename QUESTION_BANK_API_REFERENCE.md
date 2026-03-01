# Question Bank Module - API Quick Reference

## Base URL
```
http://localhost:8000/api/v1/question_bank_router
```

## Authentication
All endpoints require Bearer token in Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## EDUCATOR ENDPOINTS (Rank 5 & 6)

### 1️⃣ CREATE QUESTION BANK
```http
POST /
Content-Type: application/json

{
  "university_id": "uni-123",
  "title": "Advanced Biology QCM Collection",
  "description": "Complete collection of biology MCQs for advanced students",
  "image_url": "https://example.com/image.png",
  "price": 49.99,
  "currency": "CHF",
  "start_datetime": "2026-03-01T00:00:00Z",
  "expiry_datetime": "2026-12-31T23:59:59Z",
  "display_before_start": false,
  "mcq_ids": [
    "mcq-001",
    "mcq-002",
    "mcq-003"
  ],
  "is_published": true
}

Response (201): QuestionBankOut
{
  "id": "qb-123",
  "university_id": "uni-123",
  "title": "Advanced Biology QCM Collection",
  "description": "Complete collection of biology MCQs for advanced students",
  "image_url": "https://example.com/image.png",
  "price": 49.99,
  "currency": "CHF",
  "start_datetime": "2026-03-01T00:00:00+00:00",
  "expiry_datetime": "2026-12-31T23:59:59+00:00",
  "display_before_start": false,
  "is_published": true,
  "created_at": "2026-03-01T10:30:00+00:00",
  "created_by": "user-456",
  "creator_name": "Dr. John Smith",
  "students": [],
  "reviews": [],
  "mcqs": []
}
```

---

### 2️⃣ LIST ALL QUESTION BANKS
```http
GET /
GET /?university_id=uni-123

Response (200): List[QuestionBankOut]
[
  {
    "id": "qb-123",
    "title": "Advanced Biology",
    "price": 49.99,
    ...
  },
  {
    "id": "qb-124",
    "title": "Chemistry Basics",
    "price": 39.99,
    ...
  }
]
```

---

### 3️⃣ GET SINGLE QUESTION BANK DETAILS
```http
GET /{qb_id}

Response (200): QuestionBankOut
{
  "id": "qb-123",
  "title": "Advanced Biology",
  "description": "...",
  "price": 49.99,
  "currency": "CHF",
  "created_by": "user-456",
  "creator_name": "Dr. John Smith",
  "students": [
    {
      "student_id": "user-789",
      "student_name": "Alice Johnson",
      "purchased_at": "2026-03-02T14:00:00+00:00",
      "gifted": false
    }
  ],
  "reviews": [
    {
      "student_id": "user-789",
      "student_name": "Alice Johnson",
      "rating": 5,
      "comment": "Excellent content!",
      "created_at": "2026-03-03T10:00:00+00:00"
    }
  ],
  "mcqs": []
}
```

---

### 4️⃣ UPDATE QUESTION BANK
```http
PUT /{qb_id}
Content-Type: application/json

{
  "title": "Advanced Biology - Updated",
  "price": 59.99,
  "is_published": true
}

Response (200): QuestionBankOut
```

---

### 5️⃣ DELETE QUESTION BANK
```http
DELETE /{qb_id}

Response (204): No Content
```

---

## STUDENT ENDPOINTS

### 6️⃣ PURCHASE QUESTION BANK
```http
POST /{qb_id}/purchase

Response (201):
{
  "message": "Question Bank purchased successfully"
}

Error Cases:
- 404: Question Bank not found
- 403: Question Bank not yet available (before start_datetime with display_before_start=false)
- 403: Question Bank has expired (after expiry_datetime)
- 400: Already purchased
```

---

### 7️⃣ ACCESS PURCHASED CONTENT
```http
GET /{qb_id}/access

Response (200): QuestionBankAccessOut
{
  "id": "qb-123",
  "title": "Advanced Biology",
  "description": "...",
  "image_url": "https://example.com/image.png",
  "mcqs": [
    "mcq-001",
    "mcq-002",
    "mcq-003"
  ]
}

Error Cases:
- 403: Access not purchased
- 404: Question Bank not found
```

---

### 8️⃣ ADD REVIEW & RATING
```http
POST /{qb_id}/review?rating=5&comment=Excellent%20content

Response (201):
{
  "message": "Review added successfully"
}

Parameters:
- rating (int, required): 1-5 stars
- comment (string, optional): Review text

Error Cases:
- 403: Must purchase to review
- 400: Already reviewed
- 400: Rating must be between 1 and 5
- 404: Question Bank not found
```

---

### 9️⃣ VIEW ALL REVIEWS
```http
GET /{qb_id}/reviews

Response (200): List[QuestionBankReviewOut]
[
  {
    "student_id": "user-789",
    "student_name": "Alice Johnson",
    "rating": 5,
    "comment": "Excellent content!",
    "created_at": "2026-03-03T10:00:00+00:00"
  },
  {
    "student_id": "user-790",
    "student_name": "Bob Smith",
    "rating": 4,
    "comment": "Good but needs more examples",
    "created_at": "2026-03-04T11:30:00+00:00"
  }
]

Error Cases:
- 404: Question Bank not found
```

---

## ERROR RESPONSES

### Standard HTTP Status Codes
- `201`: Created successfully
- `200`: Success
- `204`: Success (no content to return)
- `400`: Bad request (validation error)
- `403`: Forbidden (permission denied)
- `404`: Resource not found

### Error Response Format
```json
{
  "detail": "Error message describing what went wrong"
}
```

---

## COMMON WORKFLOWS

### Workflow 1: Create & Publish Question Bank
```
1. POST /                      → Create draft
2. PUT /{qb_id}                → Update to is_published=true
3. GET /                       → List for dashboard
```

### Workflow 2: Student Purchase & Review
```
1. GET /                       → Browse available
2. GET /{qb_id}                → View details
3. POST /{qb_id}/purchase      → Purchase
4. GET /{qb_id}/access         → Access content
5. POST /{qb_id}/review        → Add rating
6. GET /{qb_id}/reviews        → See community feedback
```

### Workflow 3: Educator Analytics
```
1. GET /{qb_id}                → View purchase count (students list)
2. GET /{qb_id}/reviews        → View ratings & comments
3. PUT /{qb_id}                → Update based on feedback
```

---

## REQUEST/RESPONSE EXAMPLES

### Example 1: Create MBA Finance Question Bank
```bash
curl -X POST "http://localhost:8000/api/v1/question_bank_router/" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "university_id": "mba-finance-uni",
    "title": "Complete MBA Finance Preparation",
    "description": "500+ questions covering all MBA finance topics",
    "image_url": "https://example.com/finance.png",
    "price": 79.99,
    "currency": "CHF",
    "start_datetime": "2026-03-15T08:00:00Z",
    "expiry_datetime": "2027-03-14T23:59:59Z",
    "display_before_start": true,
    "mcq_ids": ["q1", "q2", "q3", "q4", "q5"],
    "is_published": true
  }'
```

### Example 2: Student Purchase
```bash
curl -X POST "http://localhost:8000/api/v1/question_bank_router/qb-123/purchase" \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

### Example 3: Add 5-Star Review
```bash
curl -X POST "http://localhost:8000/api/v1/question_bank_router/qb-123/review?rating=5&comment=Best%20material%20available" \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

---

## PERMISSIONS MATRIX

| Endpoint | Rank 0-4 (Student) | Rank 5-6 (Educator) | Rank 6+ (Admin) |
|----------|-------------------|-------------------|-----------------|
| POST `/` | ❌ | ✅ | ✅ |
| GET `/` | ❌ | ✅ | ✅ |
| GET `/{qb_id}` | ❌ | ✅ | ✅ |
| PUT `/{qb_id}` | ❌ | ✅ | ✅ |
| DELETE `/{qb_id}` | ❌ | ✅ | ✅ |
| POST `/{qb_id}/purchase` | ✅ | ✅ | ✅ |
| GET `/{qb_id}/access` | ✅ | ✅ | ✅ |
| POST `/{qb_id}/review` | ✅ | ✅ | ✅ |
| GET `/{qb_id}/reviews` | ✅ | ✅ | ✅ |

---

## FIELD NOTES

### Price & Currency
- Supports: CHF, GBP, USD, EUR (customize as needed)
- Should be validated on frontend for currency conversion

### Availability Window
- `start_datetime`: When students can start accessing
- `expiry_datetime`: When access expires
- `display_before_start`: Show in catalog before start date

### Published Status
- `is_published=false`: Draft mode (only visible to creator)
- `is_published=true`: Public, students can purchase

### Rating System
- Scale: 1-5 stars
- Only purchased students can review
- One review per student per question bank

### Gifted Flag
- `gifted=true`: This is a gift purchase (sent by another user)
- `gifted=false`: Regular purchase (student paid themselves)
