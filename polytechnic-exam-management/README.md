# Examination Management System

A highly secure web application for Diploma College, Karnataka (Government) Polytechnic, Mangaluru, built with Next.js, TypeScript, TypeORM, Material-UI, and SQLite.

## Features

### User Roles
- **Admin**: Manage subjects, faculty, semesters, and branches
- **HoD (Head of Department)**: Map subjects to faculty, manage students and classes, generate reports
- **Faculty**: Enter attendance and CIE marks for assigned subjects

### Core Functionality
- **Subject Management**: Create and manage subjects with scheme, code, name, department, credits, and marks
- **Faculty Management**: Manage faculty information and assignments
- **Student Management**: Manage student records and class assignments
- **Class Management**: Create classes (branch + semester + section)
- **Attendance Tracking**: Monthly consolidated attendance entry with percentage calculation
- **CIE Marks**: Continuous Internal Evaluation marks entry
- **Reports**: Consolidated attendance reports and low attendance lists (threshold: 75%)

### Security Features
- Email/password authentication with JWT tokens
- Role-based access control (RBAC)
- Password policy enforcement (min 8 chars, uppercase, lowercase, number, special character)
- Session management with secure HTTP-only cookies
- Audit logging for all critical operations
- Data encryption for sensitive information
- Account lockout after 5 failed login attempts

### UI Features
- Responsive design with mobile support
- Material-UI theming
- Pagination for large datasets
- Search and filtering
- Sorting capabilities
- Bulk upload via Excel
- Export to Excel
- Mobile-friendly cards view
- Uniform design across all pages

## Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Material-UI
- **Backend**: Next.js API Routes
- **Database**: SQLite with TypeORM
- **Authentication**: JWT with bcrypt password hashing
- **File Processing**: xlsx for Excel import/export

## Prerequisites

- Node.js 18+ and npm
- TypeScript knowledge (helpful but not required)

## Installation

1. **Clone or navigate to the project directory:**
   ```bash
   cd polytechnic-exam-management
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Initialize the database:**
   ```bash
   npm run init-db
   ```
   This will create the SQLite database and a default admin user:
   - Email: `admin@polytechnic.edu`
   - Password: `Admin@123`
   **⚠️ IMPORTANT: Change the default password after first login!**

4. **Set up environment variables:**
   Create a `.env.local` file in the root directory:
   ```env
   JWT_SECRET=your-secret-key-change-in-production
   ENCRYPTION_KEY=your-32-character-hex-encryption-key
   NODE_ENV=development
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
polytechnic-exam-management/
├── app/                    # Next.js app directory
│   ├── api/                # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── subjects/       # Subject management
│   │   ├── faculty/         # Faculty management
│   │   ├── students/       # Student management
│   │   ├── attendance/     # Attendance management
│   │   ├── cie-marks/      # CIE marks management
│   │   └── reports/        # Report generation
│   ├── admin/              # Admin pages
│   ├── hod/                # HoD pages
│   ├── faculty/            # Faculty pages
│   ├── login/              # Login page
│   └── dashboard/          # Dashboard
├── components/             # React components
│   ├── Layout.tsx          # Main layout with navigation
│   ├── DataTable.tsx       # Reusable data table component
│   └── ThemeProvider.tsx   # Material-UI theme provider
├── lib/                    # Utility libraries
│   ├── database.ts         # TypeORM data source
│   ├── entities/           # TypeORM entities
│   ├── auth.ts             # Authentication utilities
│   ├── security.ts         # Security utilities
│   ├── middleware.ts       # API middleware
│   ├── audit.ts            # Audit logging
│   ├── validation.ts       # Validation rules
│   └── theme.ts            # Material-UI theme
├── scripts/                # Utility scripts
│   └── init-db.ts         # Database initialization
└── database.sqlite        # SQLite database (created on first run)
```

## Database Schema

### Core Entities
- **User**: System users (Admin, HoD, Faculty)
- **Subject**: Subject details (code, name, department, credits, marks)
- **Faculty**: Faculty information
- **Semester**: Semester information (1-6 for diploma)
- **Branch**: Department/branch information
- **Class**: Class definition (branch + semester + section)
- **Student**: Student information
- **SubjectFacultyMapping**: Many-to-many relationship between subjects and faculty
- **ClassSubjectMapping**: Many-to-many relationship between classes and subjects
- **Attendance**: Monthly attendance records
- **CIEMarks**: Continuous Internal Evaluation marks
- **AuditLog**: Audit trail for all operations

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Subjects (Admin only)
- `GET /api/subjects` - List subjects (with pagination, search, filtering)
- `POST /api/subjects` - Create subject
- `GET /api/subjects/[id]` - Get subject details
- `PUT /api/subjects/[id]` - Update subject
- `DELETE /api/subjects/[id]` - Delete subject

### Faculty (Admin only)
- `GET /api/faculty` - List faculty
- `POST /api/faculty` - Create faculty

### Students (Admin, HoD)
- `GET /api/students` - List students
- `POST /api/students` - Create student

### Attendance (Faculty)
- `GET /api/attendance` - List attendance records
- `POST /api/attendance` - Create/update attendance

### CIE Marks (Faculty)
- `GET /api/cie-marks` - List CIE marks
- `POST /api/cie-marks` - Create/update CIE marks

### Reports (Admin, HoD)
- `GET /api/reports/low-attendance` - Get students with low attendance

## Usage Guide

### Admin Tasks

1. **Create Subjects:**
   - Navigate to Admin > Subjects
   - Click "Add Subject"
   - Fill in all required fields
   - Validation: CIE + SEE ≤ Total Marks

2. **Manage Faculty:**
   - Navigate to Admin > Faculty
   - Add faculty members with their details

3. **Create Semesters:**
   - Navigate to Admin > Semesters
   - Create semesters (1-6) for each academic year

4. **Create Branches:**
   - Navigate to Admin > Branches
   - Add departments/branches (CS, ME, CE, etc.)

### HoD Tasks

1. **Map Subjects to Faculty:**
   - Navigate to HoD > Subject Mapping
   - Assign subjects to faculty members

2. **Manage Students:**
   - Navigate to HoD > Students
   - Add students and assign them to classes

3. **Create Classes:**
   - Navigate to HoD > Classes
   - Create classes (e.g., CS3A = Computer Science, Semester 3, Section A)

4. **Generate Reports:**
   - Navigate to HoD > Reports
   - View consolidated attendance and low attendance lists

### Faculty Tasks

1. **Enter Attendance:**
   - Navigate to Faculty > Attendance
   - Enter monthly consolidated attendance for each student
   - System calculates percentage automatically

2. **Enter CIE Marks:**
   - Navigate to Faculty > CIE Marks
   - Enter marks for each student
   - Validation ensures marks don't exceed maximum

## Security Best Practices

1. **Change Default Password**: Immediately change the default admin password
2. **Use Strong Passwords**: Enforce password policy for all users
3. **Environment Variables**: Never commit `.env.local` to version control
4. **JWT Secret**: Use a strong, random JWT secret in production
5. **HTTPS**: Always use HTTPS in production
6. **Regular Backups**: Backup the SQLite database regularly
7. **Audit Logs**: Regularly review audit logs for suspicious activity

## Production Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Set production environment variables:**
   - `NODE_ENV=production`
   - Strong `JWT_SECRET`
   - Strong `ENCRYPTION_KEY`

3. **Start the production server:**
   ```bash
   npm start
   ```

4. **Database Migration:**
   - For production, set `synchronize: false` in `lib/database.ts`
   - Use TypeORM migrations for schema changes

5. **Backup Strategy:**
   - Regularly backup `database.sqlite`
   - Consider migrating to PostgreSQL/MySQL for production

## Future Enhancements

- Cloud migration support (PostgreSQL/MySQL)
- Email notifications
- SMS integration for attendance alerts
- Advanced reporting and analytics
- Mobile app integration
- Multi-language support
- Two-factor authentication (2FA)

## Support

For issues or questions, please contact the system administrator.

## License

This project is developed for Diploma College, Karnataka (Government) Polytechnic, Mangaluru.
