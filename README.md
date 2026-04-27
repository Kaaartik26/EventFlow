# EventFlow

A full-stack mobile application for managing college events with a **faculty approval-based booking system**.

## 🎯 Overview

EventFlow is a comprehensive event management system that allows:
- **Admins** to create clubs and events
- **Faculty** to approve/reject event proposals
- **Students** to view approved events and book time slots

## 🧱 Tech Stack

### Frontend
- **React Native (Expo)** - Cross-platform mobile development
- **TypeScript** - Type-safe development
- **Expo Router** - File-based routing
- **AsyncStorage** - Local data persistence

### Backend
- **Python FastAPI** - Modern, fast web framework
- **SQLAlchemy** - Python ORM
- **PostgreSQL** - Primary database
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

### Architecture
- **REST API** - Clean API design
- **Role-based access control** - Secure permissions
- **Dynamic slot generation** - Efficient resource management

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL
- Expo CLI

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables**
Create `.env` file:
```env
DATABASE_URL=postgresql://username:password@localhost/eventflow
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

5. **Run database migrations**
```bash
# The app will auto-create tables on first run
```

6. **Start the server**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm start
```

4. **Run on device/simulator**
```bash
# For Android
npm run android

# For iOS
npm run ios

# For web
npm run web
```

## 📱 Features

### 🔐 Authentication System
- **Multi-role authentication**: Student, Admin, Faculty
- **JWT-based security**: Secure token management
- **Role-based routing**: Dynamic navigation based on user type
- **Password hashing**: bcrypt encryption

### 👥 User Roles

#### Students
- Browse approved events
- View event details and available slots
- Book time slots
- Manage bookings
- View personal profile

#### Admins
- Create and manage clubs
- Create and manage events
- Submit events for faculty approval
- Monitor all system activity
- View all bookings

#### Faculty
- Review pending event proposals
- Approve/reject events with comments
- View approval history
- Monitor event system

### 🎪 Event Management
- **Event creation**: Detailed event information
- **Club association**: Events linked to student clubs
- **Approval workflow**: Faculty review process
- **Status tracking**: Pending, Approved, Rejected

### ⏰ Dynamic Slot System
- **Real-time generation**: Slots created on-demand
- **Capacity management**: Automatic booking limits
- **Time-based validation**: Prevents conflicts
- **No database storage**: Efficient memory usage

### 📊 Booking System
- **Slot selection**: Interactive time slot booking
- **Capacity enforcement**: Maximum participant limits
- **Double booking prevention**: Conflict resolution
- **Booking management**: View and cancel bookings

## 🗄️ Database Schema

### Core Tables

#### Users
```sql
- id (PK)
- name
- email (unique)
- password (hashed)
- role (student/admin)
- created_at
```

#### Faculty
```sql
- id (PK)
- name
- email (unique)
- password (hashed)
- department
- created_at
```

#### Clubs
```sql
- id (PK)
- name
- description
- created_by_id (FK to users)
- created_at
```

#### Events
```sql
- id (PK)
- title
- description
- club_id (FK to clubs)
- start_time
- end_time
- slot_duration (minutes)
- max_participants
- status (pending/approved/rejected)
- approved_by_id (FK to faculty, nullable)
- rejection_comment (nullable)
- created_at
```

#### Bookings
```sql
- id (PK)
- user_id (FK to users)
- event_id (FK to events)
- slot_start
- slot_end
- created_at
```

## 🛣️ API Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /faculty/login` - Faculty login
- `GET /auth/me` - Current user info
- `GET /faculty/me` - Current faculty info

### Clubs
- `GET /clubs` - List all clubs
- `POST /clubs` - Create club (admin only)
- `GET /clubs/{id}` - Get club details
- `PUT /clubs/{id}` - Update club (admin only)
- `DELETE /clubs/{id}` - Delete club (admin only)

### Events
- `GET /events` - List events (filtered by user role)
- `POST /events` - Create event (admin only)
- `GET /events/{id}` - Get event details
- `PUT /events/{id}` - Update event (admin only)
- `DELETE /events/{id}` - Delete event (admin only)
- `GET /events/{id}/slots` - Get available slots
- `POST /events/{id}/submit-for-approval` - Submit for approval

### Faculty
- `GET /faculty/events/pending` - Pending events
- `GET /faculty/events/reviewed` - Reviewed events
- `GET /faculty/events/all` - All events
- `PATCH /faculty/events/{id}` - Approve/reject event

### Bookings
- `POST /bookings/book-slot` - Book a slot
- `GET /bookings/my-bookings` - User's bookings
- `GET /bookings/all-bookings` - All bookings (admin)
- `DELETE /bookings/{id}` - Cancel booking

## 🔒 Security Features

### Authentication
- **JWT tokens**: Secure session management
- **Password hashing**: bcrypt encryption
- **Role-based access**: Permission enforcement
- **Token expiration**: Automatic session timeout

### Data Protection
- **Input validation**: Pydantic schemas
- **SQL injection prevention**: SQLAlchemy ORM
- **CORS protection**: Cross-origin security
- **Error handling**: Secure error responses

### Access Control
- **Role-based routing**: Dynamic navigation
- **API permissions**: Endpoint protection
- **Data filtering**: User-specific data access
- **Audit trails**: Activity logging

## 📱 Mobile Screens

### Authentication Flow
- **Login Screen**: Multi-role login
- **Signup Screen**: User registration
- **Role Selection**: Student/Admin/Faculty

### Student Interface
- **Events List**: Browse approved events
- **Event Details**: View event information
- **Slot Booking**: Select time slots
- **My Bookings**: Manage bookings
- **Profile**: User information

### Admin Dashboard
- **Dashboard Overview**: System statistics
- **Club Management**: Create/edit clubs
- **Event Management**: Create/manage events
- **Booking Overview**: Monitor all bookings
- **System Settings**: Admin configuration

### Faculty Interface
- **Pending Events**: Review proposals
- **Event Review**: Approve/reject workflow
- **Approval History**: Past decisions
- **Faculty Profile**: Account information

## 🎨 UI/UX Features

### Design Principles
- **Clean interface**: Modern, minimalist design
- **Intuitive navigation**: Easy-to-use layouts
- **Responsive design**: Works on all screen sizes
- **Consistent theming**: Unified visual language

### User Experience
- **Loading states**: Visual feedback
- **Error handling**: User-friendly messages
- **Confirmation dialogs**: Prevent accidental actions
- **Refresh functionality**: Real-time updates

## 🔧 Development

### Project Structure
```
EventFlow/
├── backend/
│   ├── app/
│   │   ├── database/
│   │   ├── routers/
│   │   ├── schemas/
│   │   ├── utils/
│   │   └── main.py
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── app/
│   │   ├── (student)/
│   │   ├── (admin)/
│   │   ├── (faculty)/
│   │   ├── auth/
│   │   ├── context/
│   │   └── services/
│   ├── package.json
│   └── app.json
└── README.md
```

### Best Practices
- **Clean architecture**: Separation of concerns
- **Type safety**: TypeScript throughout
- **Error handling**: Comprehensive error management
- **Testing**: Unit and integration tests
- **Documentation**: Clear code comments

## 🚀 Deployment

### Backend Deployment
- **Platform**: Render, Railway, or similar
- **Database**: PostgreSQL (Neon, Supabase)
- **Environment**: Production configuration
- **Monitoring**: Health checks and logging

### Frontend Deployment
- **Platform**: Expo Application Services
- **Build**: APK for Android, IPA for iOS
- **Distribution**: App Store, Google Play
- **Updates**: Over-the-air updates

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request
5. Code review and merge

### Code Standards
- **Python**: PEP 8 compliance
- **TypeScript**: Strict typing
- **React**: Functional components
- **Git**: Conventional commits

## � License

This project is licensed under the MIT License - see the LICENSE file for details.

## � Support

For issues and questions:
- Create an issue on GitHub
- Check existing documentation
- Review API endpoints
- Test with provided examples

---