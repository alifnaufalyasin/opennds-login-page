# PostgreSQL Database Setup Guide

This guide will help you set up the PostgreSQL database for the OpenNDS Login application.

## Quick Start with Docker

The easiest way to get started is using Docker Compose:

```bash
# Copy the environment template and configure your database credentials
cp .env.example .env

# Edit .env to customize database credentials (required)
# Set values for: POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB

# Start PostgreSQL
docker compose up -d postgres

# Wait a few seconds for PostgreSQL to initialize
sleep 5

# The application will automatically create the schema on first use
npm run dev
```

**Note:** The `.env` file is **required** for Docker Compose to work. If the file is missing or environment variables are not set, Docker Compose will show warnings like "The POSTGRES_USER variable is not set" and may fail to start the PostgreSQL container properly.

## Manual PostgreSQL Setup

If you prefer to use an existing PostgreSQL instance:

1. Create a database:
```sql
CREATE DATABASE opennds;
```

2. Configure the connection in `.env`:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/opennds
```

3. The schema will be automatically created when the application starts.

## Database Schema

The application uses the following schema:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_login TIMESTAMP,
  last_login TIMESTAMP,
  expired_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
```

## Initial Data Setup

You can use the provided setup script to create sample users:

```bash
node scripts/setup-db.mjs
```

This will create:
- Admin user: `admin`/`admin123` (infinite access)
- Test user: `testuser`/`test123` (expires in 1 week)
- Guest users: `guest1`/`guest1` to `guest5`/`guest5` (expires in 1 day)

## Environment Variables

Create a `.env` file in the root directory (you can copy from `.env.example`):

```bash
cp .env.example .env
```

The `.env` file should contain:

```env
# PostgreSQL Database Configuration for Docker Compose
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=opennds

# PostgreSQL Connection for the application
# IMPORTANT: Update username and password here to match POSTGRES_USER and POSTGRES_PASSWORD above
# Note: Use 'localhost' as hostname when running the app outside Docker
# Use 'postgres' (the service name) as hostname when running the app inside Docker
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/opennds

# Admin JWT Secret
ADMIN_JWT_SECRET=your-secret-key-change-in-production
```

**Important:** 
- Keep the username and password in `DATABASE_URL` in sync with `POSTGRES_USER` and `POSTGRES_PASSWORD`.
- If you customize the Docker database credentials, make sure to update all three variables accordingly.
- When running the Next.js app outside Docker (e.g., `npm run dev`), use `localhost` as the hostname in `DATABASE_URL`.
- When running the Next.js app inside Docker, use `postgres` (the Docker service name) as the hostname in `DATABASE_URL`.

## Accessing the Admin Panel

Once the database is set up, access the admin panel at:
```
http://localhost:3000/admin
```

From here you can:
- View all users
- Create new users
- Edit existing users
- Delete users
- Generate bulk users

## User Management

### Creating Individual Users

1. Go to `/admin`
2. Click "Add User"
3. Enter username and password
4. Optionally set an expiration time (leave empty for infinite access)
5. Click "Save"

### Generating Bulk Users

1. Go to `/admin`
2. Click "Generate Users"
3. Set the number of users (1-1000)
4. Set the username prefix (e.g., "guest")
5. Select expiry duration:
   - 1 Hour
   - 12 Hours
   - 1 Day
   - 3 Days
   - 1 Week
   - 1 Month
   - Infinite
6. Click "Generate"

The system will create users with usernames like `prefix1`, `prefix2`, etc., where the username and password are identical.

## Password Security

- All passwords are hashed using bcrypt with 10 salt rounds
- Passwords are never stored in plain text
- Passwords are never returned in API responses

## Expiration Logic

- `expired_time = NULL`: User never expires (infinite access)
- `expired_time = timestamp`: User expires at the specified time
- Expired users cannot log in
- The admin panel shows expiry status with color-coded badges:
  - Green "Infinite": Never expires
  - Blue "Active": Has expiration but not yet expired
  - Red "Expired": Past expiration time

## Login Tracking

The system tracks:
- `first_login`: First time the user successfully logged in
- `last_login`: Most recent successful login

These timestamps are automatically updated during the authentication process.

## Troubleshooting

### Connection Refused

If you get a connection error, ensure:
1. PostgreSQL is running
2. The connection string in `.env` is correct
3. The database exists
4. The user has proper permissions

### Port Already in Use

If port 5432 is already in use:
1. Stop the existing PostgreSQL instance, or
2. Change the port mapping in `docker-compose.yml`

### Schema Creation Fails

If schema creation fails:
1. Check PostgreSQL logs
2. Ensure the user has CREATE TABLE permissions
3. Try running the SQL manually

## Backup and Restore

### Backup
```bash
docker exec login-page-postgres-1 pg_dump -U postgres opennds > backup.sql
```

### Restore
```bash
docker exec -i login-page-postgres-1 psql -U postgres opennds < backup.sql
```

## Production Deployment

For production:

1. Use a managed PostgreSQL service (AWS RDS, Google Cloud SQL, etc.)
2. Update the `DATABASE_URL` environment variable
3. Ensure SSL is enabled for database connections
4. Set up regular backups
5. Monitor connection pool usage
6. Consider implementing admin authentication

## Security Best Practices

1. **Change default credentials**: Don't use `postgres/postgres` in production
2. **Use SSL/TLS**: Enable SSL for database connections
3. **Limit access**: Use firewall rules to restrict database access
4. **Regular updates**: Keep PostgreSQL and dependencies updated
5. **Monitor logs**: Set up logging and monitoring
6. **Admin authentication**: Add authentication to the admin panel
7. **Rate limiting**: Implement rate limiting on API endpoints
