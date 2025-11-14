# Examination Management System

Secure web application for Government Polytechnic, Mangaluru to manage examination-related activities.

## Features

- **Role-Based Access Control**: Admin, HoD (Head of Department), and Faculty roles with different permissions
- **Subject Management**: Admin can manage subjects with scheme, codes, credits, and marks
- **Faculty Management**: Admin can manage faculty information
- **Student Management**: HoD can manage students and map them to classes
- **Class Management**: HoD can create classes (branch + semester + section)
- **Subject-Faculty Mapping**: HoD can assign multiple faculty to subjects
- **Class-Subject Mapping**: HoD can map subjects to classes
- **Attendance Entry**: Faculty can enter monthly consolidated attendance
- **CIE Marks Entry**: Faculty can enter CIE (Continuous Internal Evaluation) marks
- **Consolidated Reports**: HoD can view consolidated attendance and generate reports
- **Low Attendance/CIE Reports**: HoD can identify students with attendance < 75% or low CIE marks

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Material-UI
- **Backend**: Next.js API Routes
- **Database**: SQLite with TypeORM
- **Authentication**: JWT-based with secure password hashing
- **Security**: Audit logs, data encryption, session management, password policies

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Initialize the database:
```bash
# Start the dev server first, then visit:
# http://localhost:3000/api/init
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

### Default Credentials

- **Email**: admin@polytechnic.edu
- **Password**: Admin@123

**⚠️ IMPORTANT**: Change the default admin password immediately after first login!

## Project Structure

```
exam-management/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── admin/             # Admin pages
│   ├── hod/               # HoD pages
│   ├── faculty/           # Faculty pages
│   └── login/             # Login page
├── components/            # React components
│   ├── common/           # Reusable components
│   └── layout/           # Layout components
├── lib/                   # Library code
│   ├── entities/         # TypeORM entities
│   ├── middleware/       # Auth middleware
│   └── utils/            # Utility functions
└── database.sqlite        # SQLite database (created automatically)
```

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control
- Audit logging for all critical operations
- Input validation
- SQL injection prevention (TypeORM)
- XSS protection
- Secure session management

## Validation Rules

- CIE + SEE ≤ Total Marks
- Attendance threshold: 75%
- Password policy: Minimum 8 characters, uppercase, lowercase, number, special character

## Deployment

### On-Premises

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

### Cloud Migration

The application can be migrated to cloud platforms like:
- Vercel (recommended for Next.js)
- AWS
- Azure
- Google Cloud Platform

For cloud deployment, consider:
- Using PostgreSQL or MySQL instead of SQLite
- Setting up environment variables for JWT_SECRET
- Configuring proper database connection pooling
- Setting up SSL/TLS certificates

## Environment Variables

Create a `.env.local` file:

```env
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=production
```

## License

Copyright © Government Polytechnic, Mangaluru
