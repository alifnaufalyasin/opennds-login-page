# OpenNDS Login Page

A complete Next.js application with Chakra UI for OpenNDS authentication, featuring PostgreSQL database integration and admin user management.

## Features

### Login Page
- Clean, responsive login interface built with Chakra UI
- Username and password authentication against PostgreSQL database
- URL parameter handling for OpenNDS `hid` (session ID)
- Automatic redirect to OpenNDS authentication endpoint after successful login
- Tracks first_login and last_login timestamps
- Validates user expiration before allowing access

### Admin Panel
- Full CRUD operations for user management
- View all users with their login history and expiration status
- Add, edit, and delete individual users
- Bulk user generation with customizable options:
  - Generate multiple users at once (up to 1000)
  - Custom username prefix (e.g., user1, user2, guest1, guest2)
  - Username and password are the same for generated users
  - Expiry options: 1 hour, 12 hours, 1 day, 3 days, 1 week, 1 month, infinite
- Real-time status indicators (Active/Expired/Infinite)
- File-based routing structure using Next.js App Router

## Database Schema

The application uses PostgreSQL with the following schema:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,  -- bcrypt hashed
  first_login TIMESTAMP,            -- First time user logged in
  last_login TIMESTAMP,             -- Last time user logged in
  expired_time TIMESTAMP,           -- NULL means infinite access
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with Chakra UI provider
│   ├── providers.tsx       # Chakra UI configuration
│   ├── page.tsx           # Root page (redirects to /login)
│   ├── login/
│   │   ├── page.tsx       # Login page component
│   │   └── LoginForm.tsx  # Login form with database auth
│   ├── admin/
│   │   ├── page.tsx       # Admin page route
│   │   └── AdminPanel.tsx # Admin UI with CRUD operations
│   └── api/
│       ├── users/
│       │   └── route.ts   # User CRUD API endpoints
│       └── auth/
│           └── login/
│               └── route.ts # Authentication endpoint
└── lib/
    ├── db.ts              # PostgreSQL connection pool
    └── users.ts           # User operations and utilities
```

## Routing

The application uses Next.js's file-based routing:

- `/` → Redirects to `/login`
- `/login` → User login page with database authentication
- `/admin` → Admin panel for user management
- `/api/users` → User CRUD operations (GET, POST, PUT, DELETE)
- `/api/auth/login` → User authentication endpoint

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database

### Setup

1. Install dependencies:

```bash
npm install
```

2. Configure PostgreSQL connection:

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/opennds
```

3. The database schema will be automatically created on first API request.

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser. You'll be redirected to the login page.

### Admin Access

Access the admin panel at [http://localhost:3000/admin](http://localhost:3000/admin)

From the admin panel you can:
- View all users and their status
- Create individual users
- Edit existing users (username, password, expiration)
- Delete users
- Generate bulk users with custom settings

## Usage

### User Login

Login page URL with session ID:
```
http://localhost:3000/login?hid=YOUR_SESSION_ID
```

After successful authentication:
- User credentials are validated against the database
- Expiration time is checked
- First login and last login times are recorded
- User is redirected to: `http://10.1.1.1/opennds_auth/?hid=YOUR_SESSION_ID`

### Creating Users

**Individual User:**
1. Go to admin panel
2. Click "Add User"
3. Enter username and password
4. Optionally set expiration time (leave empty for infinite)

**Bulk Generation:**
1. Go to admin panel
2. Click "Generate Users"
3. Set number of users (1-1000)
4. Set username prefix (e.g., "guest")
5. Select expiry duration
6. Users will be created as: guest1/guest1, guest2/guest2, etc.

### User Expiration

- **Infinite**: NULL expired_time means user never expires
- **Timed**: Specific timestamp for expiration
- Expired users cannot log in
- Admin panel shows expiry status with color badges

## Build

To create a production build:

```bash
npm run build
npm start
```

## Security Features

- Passwords are hashed using bcrypt (10 rounds)
- SQL injection protection via parameterized queries
- Input validation on all endpoints
- URI encoding for redirect parameters
- Unique username constraint

## Technologies

- [Next.js 16](https://nextjs.org/) - React framework with App Router
- [Chakra UI v3](https://chakra-ui.com/) - Component library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [PostgreSQL](https://www.postgresql.org/) - Database
- [bcrypt](https://www.npmjs.com/package/bcrypt) - Password hashing
- [pg](https://www.npmjs.com/package/pg) - PostgreSQL client
