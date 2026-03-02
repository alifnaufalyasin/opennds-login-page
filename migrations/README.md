# Database Migrations

This directory contains SQL migration scripts for database schema changes.

## How to Run Migrations

### Using psql (PostgreSQL command line)

```bash
# Connect to your database and run the migration
psql -U postgres -d opennds -f migrations/001_add_expiration_duration.sql
```

### Using Docker

```bash
# If using Docker Compose
docker exec -i opennds-login-page-postgres-1 psql -U postgres -d opennds < migrations/001_add_expiration_duration.sql
```

### Using the Node.js migration script

```bash
# Run the TypeScript migration script
npx tsx scripts/run-migration.ts
```

## Migration Files

- `001_add_expiration_duration.sql` - Adds expiration_duration column to support expiration starting from first login

## Notes

- Migrations are designed to be idempotent (safe to run multiple times)
- The database initialization in `src/lib/db.ts` also includes the new schema
- For new installations, no migration is needed
- For existing databases, run the migration to add the new column
