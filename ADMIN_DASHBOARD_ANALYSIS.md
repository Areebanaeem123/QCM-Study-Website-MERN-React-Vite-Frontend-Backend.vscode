# Admin Dashboard - Complete Functionality Analysis

## Overview
The admin dashboard has **13 main modules** that need API integration. Below is a detailed breakdown of each module with required functionalities.

---

## 1. Dashboard (Home Page)
**Location:** `/admin-dashboard`

### Features:
- Display platform statistics in cards:
  - **Total Students** - Count of all registered users with rank=1
  - **Packs Sold** - Total pack purchases
  - **MCQs Created** - Total approved MCQs
  - **Active Sessions** - Currently active study sessions

### Backend Endpoints Needed:
- `GET /api/v1/dashboard/stats` - Get all dashboard statistics
- `GET /api/v1/users/count` - Count total users
- `GET /api/v1/packs/sales/total` - Total pack sales
- `GET /api/v1/mcqs/count?status=approved` - Count approved MCQs
- `GET /api/v1/sessions/active/count` - Count active sessions

### Data Model:
```json
{
  "total_students": 1284,
  "total_packs_sold": 3912,
  "total_mcqs": 12450,
  "active_sessions": 87
}
```

---

## 2. Users Management
**Location:** `/admin-dashboard/users`

### Features:
- **List Users** with pagination and search
  - Search by name or ID
  - Display: ID, Name, Email, Role, Packs purchased, Status
  
- **User Actions:**
  - Change user role (Student → Writer → Content Manager)
  - Offer a pack to user (grant access without purchase)
  - Block/Unblock user (restrict platform access)
  - View user profile/details

### Backend Endpoints Needed:
- `GET /api/v1/users?search=&skip=0&limit=20` - List users with pagination
- `GET /api/v1/users/{user_id}` - Get user details
- `PUT /api/v1/users/{user_id}/role` - Update user role
- `POST /api/v1/users/{user_id}/grant-pack/{pack_id}` - Grant pack access
- `PUT /api/v1/users/{user_id}/status` - Block/unblock user
- `GET /api/v1/users/{user_id}/packs` - Get user's purchased packs

### User Roles:
- `1` = Student (default)
- `2` = Writer (creates MCQs)
- `3` = Content Manager
- `6` = Admin

---

## 3. MCQs Management
**Location:** `/admin-dashboard/mcqs`

### Features:
- **Manage All MCQs** (approved, draft, pending)
- **Search & Filter:**
  - Search by question text or ID
  - Filter by subject
  - Filter by lesson
  - Filter by status (draft/pending/approved/rejected)

- **MCQ Actions:**
  - View MCQ details (question, options, correct answer, explanation)
  - Edit MCQ
  - Delete MCQ
  - Change MCQ status
  - Bulk actions (delete, approve, reject)

### Backend Endpoints Needed:
- `GET /api/v1/mcqs?search=&subject=&lesson=&status=&skip=0&limit=20` - List MCQs with filters
- `GET /api/v1/mcqs/{mcq_id}` - Get MCQ details with options
- `PUT /api/v1/mcqs/{mcq_id}` - Update MCQ
- `DELETE /api/v1/mcqs/{mcq_id}` - Delete MCQ
- `GET /api/v1/subjects` - Get all subjects
- `GET /api/v1/lessons?subject_id=` - Get lessons by subject

### MCQ Structure:
```json
{
  "id": "mcq_123",
  "title": "Question text",
  "question_text": "Full question",
  "subject_id": "subject_1",
  "lesson_id": "lesson_1",
  "question_type_id": "type_1",
  "status": "approved",
  "created_by": "user_id",
  "options": [
    {"id": "opt_1", "text": "Option A", "is_correct": true},
    {"id": "opt_2", "text": "Option B", "is_correct": false}
  ]
}
```

---

## 4. MCQ Approvals
**Location:** `/admin-dashboard/mcq-approvals`

### Features:
- **Approve/Reject Pending MCQs** submitted by writers
- **Card-based Interface** showing:
  - MCQ ID
  - Question text
  - Subject
  - Lesson
  - Author (writer who submitted)
  
- **Actions:**
  - Preview MCQ (view full question and options)
  - Approve MCQ (change status to approved)
  - Reject MCQ (change status to rejected)

### Backend Endpoints Needed:
- `GET /api/v1/mcqs/pending?skip=0&limit=20` - Get pending MCQs
- `POST /api/v1/mcqs/{mcq_id}/approve` - Approve MCQ
- `POST /api/v1/mcqs/{mcq_id}/reject` - Reject MCQ
- `GET /api/v1/mcqs/{mcq_id}/user` - Get writer info

---

## 5. Packs Management
**Location:** `/admin-dashboard/packs`

### Features:
- **Manage All Packs**
- **Search & List:**
  - Search by pack name or ID
  - Display: ID, Name, Sales count, Enrolled students, Status
  
- **Pack Actions:**
  - View pack details (description, price, modules/MCQs)
  - View buyers list (who purchased this pack)
  - Grant pack access to users
  - Revoke pack access from users
  - Activate/Deactivate pack
  - Edit pack details

### Backend Endpoints Needed:
- `GET /api/v1/packs?search=&skip=0&limit=20` - List packs
- `GET /api/v1/packs/{pack_id}` - Get pack details
- `GET /api/v1/packs/{pack_id}/purchases` - Get pack buyers
- `POST /api/v1/pack-purchases` - Grant access (create purchase record)
- `DELETE /api/v1/pack-purchases/{purchase_id}` - Revoke access
- `PUT /api/v1/packs/{pack_id}` - Update pack
- `PUT /api/v1/packs/{pack_id}/status` - Activate/deactivate

### Pack Statistics:
- Total sales (count of purchases)
- Enrolled students (unique users with access)

---

## 6. Mock Exams Management
**Location:** `/admin-dashboard/mock-exams`

### Features:
- **Manage All Mock Exams**
- **Search & List:**
  - Search by exam name or ID
  - Display: ID, Name, Sales, Students enrolled, Reviews count, Status
  
- **Mock Exam Actions:**
  - View exam details (questions included, time limit, price)
  - View buyers list
  - Grant exam access to users
  - View student reviews/feedback
  - Activate/Deactivate exam
  - Edit exam details

### Backend Endpoints Needed:
- `GET /api/v1/mock-exams?search=&skip=0&limit=20` - List mock exams
- `GET /api/v1/mock-exams/{exam_id}` - Get exam details
- `GET /api/v1/mock-exams/{exam_id}/purchases` - Get buyers
- `POST /api/v1/mock-exam-purchases` - Grant access
- `DELETE /api/v1/mock-exam-purchases/{purchase_id}` - Revoke access
- `GET /api/v1/mock-exams/{exam_id}/reviews` - Get reviews
- `PUT /api/v1/mock-exams/{exam_id}` - Update exam

---

## 7. Question Banks Management
**Location:** `/admin-dashboard/question-banks`

### Features:
- **Manage Question Banks** (collections of MCQs for study)
- Similar to Packs Management:
  - List with search
  - View details (MCQs included, price, status)
  - View buyers
  - Grant/revoke access
  - Manage status

### Backend Endpoints Needed:
- `GET /api/v1/question-banks?search=&skip=0&limit=20`
- `GET /api/v1/question-banks/{bank_id}`
- `GET /api/v1/question-banks/{bank_id}/purchases`
- `POST /api/v1/question-bank-purchases`
- `DELETE /api/v1/question-bank-purchases/{purchase_id}`
- `PUT /api/v1/question-banks/{bank_id}`

---

## 8. Research
**Location:** `/admin-dashboard/research`

### Features:
- **Search & Analytics Tools** (placeholder - needs specification)
- Possibly: Advanced search across all content
- Data analysis and trends

### Backend Endpoints Needed:
- To be specified

---

## 9. Feedback Management
**Location:** `/admin-dashboard/feedback`

### Features:
- **View User Feedback**
- Display reviews and ratings left by students
- Filter by:
  - Product (Pack, Mock Exam, Question Bank)
  - Rating (1-5 stars)
  - Date range
  
- **Actions:**
  - View feedback details
  - Respond to feedback
  - Delete inappropriate feedback

### Backend Endpoints Needed:
- `GET /api/v1/reviews?product_type=&skip=0&limit=20`
- `GET /api/v1/reviews/{review_id}`
- `POST /api/v1/reviews/{review_id}/moderate` - Delete/hide
- `POST /api/v1/reviews/{review_id}/respond` - Admin response

---

## 10. Statistics & Analytics
**Location:** `/admin-dashboard/statistics`

### Features:
- **Advanced Analytics:**
  - User growth over time (charts)
  - Revenue trends
  - Popular subjects/lessons
  - Top-performing packs/exams
  - Student engagement metrics
  - Performance by topic
  
- **Export Data** (CSV, PDF)

### Backend Endpoints Needed:
- `GET /api/v1/analytics/users/growth?period=monthly`
- `GET /api/v1/analytics/revenue?period=monthly`
- `GET /api/v1/analytics/popular-subjects`
- `GET /api/v1/analytics/pack-performance`
- `GET /api/v1/analytics/engagement?period=weekly`

---

## 11. Recent Activity Log
**Location:** `/admin-dashboard/activity`

### Features:
- **Activity Timeline** of system events
- Display:
  - Event type (user registration, purchase, MCQ approval, etc.)
  - User involved
  - Timestamp
  - Details
  
- **Filters:**
  - Event type
  - User
  - Date range

### Backend Endpoints Needed:
- `GET /api/v1/activity-logs?event_type=&user_id=&skip=0&limit=50`
- `GET /api/v1/activity-logs/{log_id}`

---

## 12. Pages Management
**Location:** `/admin-dashboard/pages`

### Features:
- **Manage Static Pages** (Terms, About, Privacy, etc.)
- Edit page content
- Publish/unpublish pages
- View page statistics (visits, engagement)

### Backend Endpoints Needed:
- `GET /api/v1/pages?skip=0&limit=20`
- `GET /api/v1/pages/{page_id}`
- `PUT /api/v1/pages/{page_id}`
- `POST /api/v1/pages`
- `DELETE /api/v1/pages/{page_id}`

---

## 13. Sliders Management
**Location:** `/admin-dashboard/sliders`

### Features:
- **Manage Homepage Sliders/Banners**
- Upload/edit slider images
- Set slider order
- Set clickable links
- Schedule slider visibility
- View engagement metrics

### Backend Endpoints Needed:
- `GET /api/v1/sliders?skip=0&limit=20`
- `GET /api/v1/sliders/{slider_id}`
- `POST /api/v1/sliders` - Create slider
- `PUT /api/v1/sliders/{slider_id}` - Update slider
- `DELETE /api/v1/sliders/{slider_id}`
- `PATCH /api/v1/sliders/{slider_id}/order` - Reorder

---

## Integration Priority & Implementation Plan

### Phase 1 (Foundation) - CRITICAL
1. ✅ Dashboard - Show statistics
2. Users Management - List and search
3. MCQs Management - List, search, filter
4. MCQ Approvals - Approve/reject workflow

### Phase 2 (Sales & Access)
5. Packs Management - List, manage access
6. Mock Exams Management - List, manage access
7. Question Banks Management - Similar to packs

### Phase 3 (Content & Feedback)
8. Feedback Management - View and moderate reviews
9. Pages Management - Manage static content
10. Sliders Management - Manage homepage banners

### Phase 4 (Analytics & Monitoring)
11. Statistics - Advanced analytics
12. Recent Activity - Activity logging
13. Research - Advanced search tools

---

## Data Dependencies

```
Users (rank=6) → Admin
            ↓
    Can manage:
    - All Users (change role, block/grant access)
    - All MCQs (list, edit, delete)
    - MCQ Approvals (approve/reject submissions)
    - All Packs (list, grant/revoke access, manage)
    - All Mock Exams (list, manage access)
    - All Question Banks (list, manage access)
    - Feedback (moderate reviews)
    - Pages (edit static content)
    - Sliders (manage banners)
    - Activity Logs (view system events)
    - Statistics (view analytics)
```

---

## Summary Table

| Module | Complexity | Dependencies | Estimated APIs | Priority |
|--------|-----------|-------------|-----------------|----------|
| Dashboard | Low | User, Pack, MCQ, Session | 4-5 | Phase 1 |
| Users | Medium | User Model | 6 | Phase 1 |
| MCQs | Medium | MCQ, Subject, Lesson | 6 | Phase 1 |
| MCQ Approvals | Low | MCQ Approvals | 2-3 | Phase 1 |
| Packs | High | Pack, Purchase | 6-7 | Phase 2 |
| Mock Exams | High | MockExam, Purchase, Review | 6-7 | Phase 2 |
| Question Banks | High | QuestionBank, Purchase | 6-7 | Phase 2 |
| Feedback | Medium | Review Model | 4 | Phase 3 |
| Pages | Low | Page Model | 5 | Phase 3 |
| Sliders | Low | Slider Model | 5 | Phase 3 |
| Statistics | High | Analytics Engine | 5-6 | Phase 4 |
| Activity | Medium | ActivityLog Model | 2 | Phase 4 |
| Research | Low | Search Engine | 2-3 | Phase 4 |

---

## Ready to Start?
Let's begin with **Phase 1** - I recommend starting with:
1. Dashboard statistics
2. Users Management (list + search)

Would you like me to start with these?
