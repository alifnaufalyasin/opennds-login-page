# Password Hash Utilities

This directory contains utility scripts for working with bcrypt password hashes.

## Scripts

### 1. generate-hash.ts

Generates a bcrypt hash for a given password using the `hashPassword()` function from `src/lib/users.ts`.

**Usage:**
```bash
# Generate hash for "admin" (default)
npx tsx scripts/generate-hash.ts

# Generate hash for a custom password
npx tsx scripts/generate-hash.ts mypassword
```

**Example Output:**
```
==========================================
Password Hash Generator
==========================================
Password: "admin"
Hash: $2b$10$Ow9Yel.k9UdatSSulyWI4uWxf.oRJq9IROxr7P9os.5TC.Qp1pCwa
==========================================
```

**Important Note:**
Bcrypt generates a different hash each time due to a random salt. This is by design and is a security feature. All different hashes will verify correctly against the original password.

### 2. verify-hashes.ts

Demonstrates that multiple different bcrypt hashes for the same password all verify correctly.

**Usage:**
```bash
npx tsx scripts/verify-hashes.ts
```

**Example Output:**
```
==========================================
Hash Verification Test
==========================================
Password being verified: "admin"

README hash:  ✓ VALID
Hash 1:       ✓ VALID
Hash 2:       ✓ VALID
Hash 3:       ✓ VALID

==========================================
All different hashes verify correctly!
==========================================
```

## Understanding Bcrypt

### What is hashPassword()?

The `hashPassword(password: string)` function in `src/lib/users.ts`:
```typescript
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}
```

### Salt Rounds
- The function uses **10 salt rounds** for bcrypt hashing
- More rounds = more secure but slower
- 10 rounds is a good balance for most applications

### Why Different Hashes for Same Password?

Bcrypt includes a **random salt** in each hash, which means:
- Running `hashPassword("admin")` multiple times produces different results
- Each hash is unique, even for the same password
- This prevents rainbow table attacks
- Despite different hashes, all verify correctly for the same password

### Example Hashes for "admin"

All of these are valid bcrypt hashes for the password "admin":

1. `$2b$10$i0/B9njRJ5DT7dl34pPDNuakaKKCE8sXZ7dmbwPuDuc7j3ylHgSoq` (from README)
2. `$2b$10$Ow9Yel.k9UdatSSulyWI4uWxf.oRJq9IROxr7P9os.5TC.Qp1pCwa`
3. `$2b$10$ixne0IgTiCfGDVDEI3Pin.U0DbtuEk4C0AGapvggkAYVLl3u.jqoi`
4. `$2b$10$mv/B1epGmRsD3WrXan6kBerKvOXaV9Xz.iFGks3c99mq51LLBkdXq`

Each hash:
- Starts with `$2b$10$` indicating bcrypt algorithm and 10 rounds
- Contains a unique salt
- Verifies correctly against password "admin"

## Common Use Cases

### Creating Manual Database Entries

If you need to manually insert a user into the database:

```bash
# Generate a hash for your password
npx tsx scripts/generate-hash.ts mypassword

# Use the generated hash in your SQL INSERT
# Note: Backslashes escape the dollar signs in the shell command
docker exec -it login-page-postgres-1 psql -U postgres -d opennds -c \
  "INSERT INTO users (username, password, expired_time) VALUES ('myuser', '\$2b\$10\$...[your-hash]...', NULL);"
```

### Verifying Existing Hashes

Use the verify-hashes script to understand how bcrypt verification works, especially useful for debugging authentication issues.

### Password Reset

When users need password resets, generate a new hash:

```bash
npx tsx scripts/generate-hash.ts newpassword
```

Then update the database:

```sql
-- Note: In the SQL command below, dollar signs in the hash don't need escaping
UPDATE users SET password = '$2b$10$...[new-hash]...' WHERE username = 'username';
```

Or via psql command line (dollar signs need escaping with backslash in shell):

```bash
docker exec -it login-page-postgres-1 psql -U postgres -d opennds -c \
  "UPDATE users SET password = '\$2b\$10\$...[new-hash]...' WHERE username = 'username';"
```

## Security Best Practices

1. **Never store plaintext passwords** - Always use `hashPassword()` 
2. **Use the provided utilities** - Don't manually create passwords
3. **Change default passwords** - Always change "admin" password in production
4. **Keep salt rounds appropriate** - 10 rounds is current best practice
5. **Use environment variables** - Store sensitive data in `.env` files

## Troubleshooting

### "Cannot find module 'bcrypt'"

Install dependencies first:
```bash
npm install
```

### "Authentication failed"

1. Verify the password hash is correct
2. Check that the username exists in the database
3. Ensure you're using the right password
4. Run `verify-hashes.ts` to test the verification function

### Need to verify a specific hash?

Modify `scripts/verify-hashes.ts` to include your hash and test it.
