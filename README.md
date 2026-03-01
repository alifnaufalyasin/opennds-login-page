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

Create a `.env` file in the root directory (copy from `.env.example`):

```bash
cp .env.example .env
```

Then edit the `.env` file:

```env
# PostgreSQL Database Configuration for Docker Compose
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=opennds

# PostgreSQL Connection for the application
DATABASE_URL=postgresql://username:password@localhost:5432/opennds

# Admin JWT Secret
ADMIN_JWT_SECRET=your-secret-key-change-in-production
```

**Note:** If using Docker Compose, the database credentials in `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` will be used by the PostgreSQL container. Make sure to update `DATABASE_URL` to match these values.

3. The database schema will be automatically created on first API request.

4. **Create the initial admin user:**

The admin user needs to be created in the database with username `admin` and password `admin`:

```bash
# Using Docker PostgreSQL
docker exec -it login-page-postgres-1 psql -U postgres -d opennds -c \
  "INSERT INTO users (username, password, expired_time) VALUES ('admin', '\$2b\$10\$i0/B9njRJ5DT7dl34pPDNuakaKKCE8sXZ7dmbwPuDuc7j3ylHgSoq', NULL) ON CONFLICT (username) DO NOTHING;"
```

Or use the provided setup script (after starting the app once to create the schema):
```bash
node scripts/setup-db.mjs
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser. You'll be redirected to the login page.

### Admin Access

1. Navigate to [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
2. Login with username: `admin` and password: `admin`
3. **Important:** Change the default password immediately after first login using the "Change Password" button
4. The admin user never expires - you can always access the admin panel

From the admin panel you can:
- **Login required:** Access at `/admin/login` with username: `admin`, password: `admin`
- **Change password:** Update admin password without entering old password
- **Logout:** End admin session securely
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
- **Expired users cannot log in** via `/login`
- **Admin never expires:** Admin can always access `/admin/login` regardless of expired_time
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
