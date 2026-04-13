# EventFlow
Mini-project shyt

Build a full-stack mobile application called **EventFlow** for managing college events with a **faculty approval-based booking system**.

The system must allow:

* Admins/clubs to create event proposals
* Faculty to approve/reject events
* Students to view approved events and book time slots

---

## 🧱 Tech Stack (MANDATORY)

Frontend:

* React Native (Expo)

Backend:

* Python FastAPI

Database:

* PostgreSQL

Other Requirements:

* REST API architecture
* JWT-based authentication
* Clean, scalable folder structure
* Production-ready practices

---

## 🧠 Core System Flow (IMPORTANT)

1. Admin creates event
2. Admin submits event for approval
3. Faculty reviews event
4. Faculty approves/rejects
5. ONLY approved events are visible to students
6. Students book slots for approved events

---

## 🔐 Authentication System

Roles:

* student
* admin
* faculty

APIs:

Students/Admin:

* POST /signup
* POST /login
* GET /me

Faculty:

* POST /faculty/login
* GET /faculty/me

Requirements:

* Password hashing (bcrypt/passlib)
* JWT authentication
* Role-based access control

---

## 🗄️ Database Schema

### users

* id
* name
* email (unique)
* password
* role (student/admin)

### faculty

* id
* name
* email (unique)
* password
* department

### clubs

* id
* name
* description
* created_by (admin)

### events

* id
* title
* description
* club_id (FK)
* start_time
* end_time
* slot_duration
* max_participants
* status (pending / approved / rejected)
* approved_by (faculty_id, nullable)
* rejection_comment (nullable)

### bookings

* id
* user_id (FK)
* event_id (FK)
* slot_start
* slot_end

---

## 🏢 Club Management

APIs:

* GET /clubs
* POST /clubs (admin only)
* GET /clubs/{id}

---

## 📅 Event Management

APIs:

* POST /events (admin only)
* GET /events (ONLY approved events)
* GET /events/{id} (only if approved OR admin/faculty)

---

## 📩 Event Proposal System (CRITICAL FEATURE)

### Submit for Approval

API:

* POST /events/{id}/submit-for-approval

Logic:

* Set event.status = "pending"

---

### Faculty Views Pending Events

API:

* GET /faculty/events/pending

---

### Faculty Approval/Rejection

API:

* PATCH /faculty/events/{id}

Request body examples:

Approve:
{
"status": "approved"
}

Reject:
{
"status": "rejected",
"comment": "Timing conflicts with exams"
}

Logic:

* Update status
* Store approved_by or rejection_comment

---

## ⚠️ Access Rules

* Students can ONLY see events where status = approved
* Booking is allowed ONLY if event is approved
* Admin can see all events
* Faculty can see all pending/reviewed events

---

## ⏱️ Dynamic Slot Generation (IMPORTANT)

DO NOT store slots in database.

Generate slots dynamically using:

* start_time
* end_time
* slot_duration

API:

* GET /events/{id}/slots

Return:

* slot_start
* slot_end
* remaining capacity (based on bookings)

---

## 🎟️ Booking System

APIs:

* POST /book-slot
* GET /my-bookings
* DELETE /booking/{id}

Rules:

* Prevent double booking
* Enforce slot capacity
* Validate slot within event timing
* Ensure event is approved

---

## 🛠️ Admin Features

APIs:

* GET /all-events
* DELETE /event/{id}
* GET /all-bookings

Admins can:

* create clubs
* create events
* submit proposals
* monitor system

---

## 👩‍🏫 Faculty Features

* View pending proposals
* Approve/reject events
* Add rejection comments

---

## 📱 Frontend (React Native)

Screens:

Authentication:

* Login Screen (Student/Admin)
* Faculty Login Screen
* Signup Screen

Student:

* Clubs List
* Events List (approved only)
* Event Details
* Slot Selection
* My Bookings

Admin:

* Create Club
* Create Event
* Submit for Approval
* Admin Dashboard

Faculty:

* Pending Proposals Screen
* Event Review Screen (Approve/Reject)

---

## ⚙️ Backend Architecture

Structure:

app/

* main.py
* database.py
* models/
* schemas/
* routes/
* controllers/
* services/
* utils/
* middleware/

Requirements:

* SQLAlchemy ORM
* Pydantic validation
* Dependency injection
* Error handling
* Environment variables

---

## 🔐 Security

* JWT authentication
* Password hashing
* Role-based authorization
* Input validation

---

## 🚀 Deployment (Optional)

* Backend → Render / Railway
* Database → Supabase / Neon
* Frontend → Expo APK

---

## ✅ Final Expected Outcome

Students:

* Login/signup
* View approved events
* View slots
* Book slots
* Manage bookings

Admins:

* Create clubs/events
* Submit events for approval
* Monitor system

Faculty:

* Review event proposals
* Approve/reject with comments

---

## 📌 Critical Constraints

* Slots must NOT be stored in DB (generate dynamically)
* Events must go through approval before visibility
* Clean architecture required
* Avoid hardcoding
* Maintain scalability

---

## 🎯 Goal

Deliver a complete production-ready system with:

* Faculty approval workflow
* Dynamic slot booking
* Secure authentication
* Scalable backend
