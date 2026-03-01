# Question Bank Module - Complete Documentation

## Overview
The Question Bank module now has TWO sets of endpoints:

1. **Educator & Student Endpoints** (`/api/v1/question_bank_router/`)
2. **Admin Dashboard Endpoints** (`/api/v1/admin/question-banks/`) ← NEW

---

## Comparison Matrix

### Student Endpoints
| Endpoint | Method | Purpose | User |
|----------|--------|---------|------|
| `/api/v1/question_bank_router/` | GET | Browse available question banks | Students |
| `/api/v1/question_bank_router/{qb_id}` | GET | View details (educators only) | Educators (Rank 5-6) |
| `/api/v1/question_bank_router/{qb_id}/purchase` | POST | Purchase a question bank | Students |
| `/api/v1/question_bank_router/{qb_id}/access` | GET | Access purchased content | Students |
| `/api/v1/question_bank_router/{qb_id}/review` | POST | Add rating & review | Students |
| `/api/v1/question_bank_router/{qb_id}/reviews` | GET | View all reviews | Everyone |

### Admin Dashboard Endpoints (NEW)
| Endpoint | Method | Purpose | User |
|----------|--------|---------|------|
| `/api/v1/admin/question-banks` | GET | List all question banks | Admin (Rank 6) |
| `/api/v1/admin/question-banks` | POST | Create question bank | Admin |
| `/api/v1/admin/question-banks/{qb_id}` | GET | View details + analytics | Admin |
| `/api/v1/admin/question-banks/{qb_id}` | PUT | Update question bank | Admin |
| `/api/v1/admin/question-banks/{qb_id}` | DELETE | Delete question bank | Admin |

---

## Key Differences

### Educator/Student Endpoints (`question_bank_router.py`)
✅ Created specifically for educators (Rank 5-6) to manage their own content  
✅ Students can purchase and review  
✅ No analytics or admin controls  
✅ Based on educator's role and university context  

### Admin Endpoints (`admin.py`) ← NEW
✅ Full administrative control over all question banks  
✅ Can manage any educator's content  
✅ **NEW**: Includes analytics (student count, review count, average rating)  
✅ **NEW**: Unified admin interface following same pattern as Packs/Mock Exams  
✅ Can filter by university  
✅ Pagination support  

---

## Response Examples

### Educator Endpoint Response
```json
{
  "id": "qb-123",
  "university_id": "uni-456",
  "title": "Advanced Biology",
  "description": "...",
  "image_url": "...",
  "price": 49.99,
  "currency": "CHF",
  "start_datetime": "2026-03-01T00:00:00+00:00",
  "expiry_datetime": "2026-12-31T23:59:59+00:00",
  "display_before_start": false,
  "is_published": true,
  "created_at": "2026-03-01T10:30:00+00:00",
  "created_by": "user-456",
  "creator_name": "Dr. Smith",
  "students": [...],
  "reviews": [...],
  "mcqs": [...]
}
```

### Admin Dashboard Response ✨ (Enhanced)
```json
{
  "id": "qb-123",
  "university_id": "uni-456",
  "university_name": "University Name",  // ✅ NEW: Resolved name
  "title": "Advanced Biology",
  "description": "...",
  "image_url": "...",
  "price": 49.99,
  "currency": "CHF",
  "start_datetime": "2026-03-01T00:00:00+00:00",
  "expiry_datetime": "2026-12-31T23:59:59+00:00",
  "display_before_start": false,
  "is_published": true,
  "created_at": "2026-03-01T10:30:00+00:00",
  "created_by": "user-456",
  "creator_name": "Dr. Smith",
  "mcqs": [
    {"id": "mcq-1", "title": "Q1", "question_text": "..."},
    {"id": "mcq-2", "title": "Q2", "question_text": "..."}
  ],
  "student_count": 42,        // ✅ NEW: Analytics
  "review_count": 28,         // ✅ NEW: Analytics
  "average_rating": 4.3       // ✅ NEW: Analytics
}
```

---

## Use Cases

### Use Educator Endpoints When:
- 👨‍🏫 Educator wants to create/manage their own question banks
- 🎓 Student wants to purchase from educator
- ⭐ Student wants to review content
- 🔍 Students browsing available question banks

### Use Admin Endpoints When:
- 🔐 Admin needs to create question banks (override educator flow)
- 📊 Admin needs performance analytics
- 🚨 Admin needs to moderate/delete content
- 🏪 Admin needs system-wide visibility of all question banks
- 🔄 Admin needs to update educator's content

---

## Complete Request Flow

### Student Perspective
```
1. GET /api/v1/question_bank_router/
   └─ Browse all published question banks

2. GET /api/v1/question_bank_router/{qb_id}
   └─ View specific question bank details

3. POST /api/v1/question_bank_router/{qb_id}/purchase
   └─ Purchase access

4. GET /api/v1/question_bank_router/{qb_id}/access
   └─ Access the MCQs

5. POST /api/v1/question_bank_router/{qb_id}/review
   └─ Leave rating and comment

6. GET /api/v1/question_bank_router/{qb_id}/reviews
   └─ See community feedback
```

### Educator Perspective
```
1. POST /api/v1/question_bank_router/
   └─ Create new question bank

2. GET /api/v1/question_bank_router/
   └─ List my question banks

3. GET /api/v1/question_bank_router/{qb_id}
   └─ View my question bank details

4. PUT /api/v1/question_bank_router/{qb_id}
   └─ Update my question bank

5. DELETE /api/v1/question_bank_router/{qb_id}
   └─ Delete my question bank

6. GET /api/v1/question_bank_router/{qb_id}/reviews
   └─ See student feedback
```

### Admin Perspective ✨ NEW
```
1. GET /api/v1/admin/question-banks
   └─ List all question banks with analytics

2. POST /api/v1/admin/question-banks
   └─ Create question bank for any educator

3. GET /api/v1/admin/question-banks/{qb_id}
   └─ View any question bank + analytics

4. PUT /api/v1/admin/question-banks/{qb_id}
   └─ Update any question bank

5. DELETE /api/v1/admin/question-banks/{qb_id}
   └─ Remove any question bank

6. GET /api/v1/admin/question-banks?university_id=X
   └─ Filter by university
```

---

## Admin Analytics Fields

The admin endpoints include **3 new analytics fields**:

| Field | Type | Example | Use Case |
|-------|------|---------|----------|
| `student_count` | int | 42 | How many students purchased |
| `review_count` | int | 28 | How many left reviews |
| `average_rating` | float | 4.3 | Quality score (out of 5) |

These allow admins to:
- 📈 Track sales performance
- ⭐ Monitor student satisfaction
- 💰 Make pricing decisions
- 🎯 Identify popular content
- 📉 Remove underperforming content

---

## Authentication & Authorization

### Educator Endpoints
```
Authorization: Bearer {jwt_token}
User Rank Required: 5 or 6 (Educator/Admin)
Scope: Own university's question banks only
```

### Admin Endpoints
```
Authorization: Bearer {jwt_token}
User Rank Required: 6 (Admin only)
Scope: All universities, all educators
```

---

## Error Handling

Both endpoint sets return consistent error responses:

```json
{
  "detail": "Error message describing the issue"
}
```

Common errors:
- `404 Not Found`: Question bank doesn't exist
- `403 Forbidden`: Insufficient permissions
- `400 Bad Request`: Invalid data (e.g., MCQ doesn't exist)
- `500 Internal Server Error`: Server issue

---

## Summary

✅ **Two complementary endpoint sets:**
- Educator endpoints for day-to-day content management
- Admin endpoints for system-wide administration

✅ **Admin dashboard adds:**
- Full CRUD control
- Real-time analytics (student count, reviews, ratings)
- University-level filtering
- Pagination support

✅ **Follows established patterns:**
- Same structure as Pack management
- Consistent with Mock Exam management
- Familiar authorization patterns

✅ **Ready for production:**
- Full validation
- Error handling
- Performance optimized
- Documentation complete
