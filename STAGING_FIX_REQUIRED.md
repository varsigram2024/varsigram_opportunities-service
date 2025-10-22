# Staging Server Fix Required

## Issue
POST requests to create opportunities are failing on staging because of a mismatch between Django user IDs (integers) and the database schema (expects UUIDs).

## Error You Would See:
```json
{
  "error": "Failed to create opportunity",
  "details": "Inconsistent column data: Error creating UUID, invalid length: expected length 32 for simple format, found 1"
}
```

## Root Cause
- Django JWT tokens contain `user_id` as an **integer** (e.g., `2`)
- Current Prisma schema defines `createdBy` field as **UUID** (string)
- When creating an opportunity, Prisma tries to insert integer `2` into a UUID field → fails

## Required Changes

### 1. Update Prisma Schema
File: `prisma/schema.prisma`

Change line for `createdBy`:
```prisma
// OLD:
createdBy   String   @map("created_by") @db.Uuid

// NEW:
createdBy   Int      @map("created_by")
```

### 2. Update Auth Middleware Type
File: `src/middleware/auth.ts`

Change user id type:
```typescript
// OLD:
interface Request {
  user?: {
    id: string;  // ❌ Wrong type
    ...
  };
}

// NEW:
interface Request {
  user?: {
    id: number;  // ✅ Correct type
    ...
  };
}
```

And ensure the middleware doesn't convert to string:
```typescript
// Make sure this line does NOT convert to string:
req.user = {
  id: userId,  // Keep as number, don't do String(userId)
  ...
};
```

### 3. Run Database Migration

**IMPORTANT:** The migration files are now in the repository under `prisma/migrations/`

On the staging server:

```bash
# Step 1: Pull latest code from develop branch
git pull origin develop

# Step 2: Install dependencies (if needed)
npm install

# Step 3: Apply the migration
npx prisma migrate deploy

# Step 4: Generate Prisma Client
npx prisma generate
```

**Alternative if there's data in the database:**
```bash
# WARNING: This will delete all existing data!
# Only use if you can afford to lose the data
npx prisma migrate reset --force
```

### 4. Restart the Application

```bash
pm2 restart ecosystem.config.js --env production
```

## Testing After Fix

### Test 1: Health Check
```bash
curl https://staging.opportunities.varsigram.com/health
```

Expected:
```json
{
  "status": "OK",
  "service": "Opportunities-service",
  "timestamp": "2025-10-22T..."
}
```

### Test 2: Get Opportunities (Public)
```bash
curl https://staging.opportunities.varsigram.com/api/v1/opportunities
```

Expected:
```json
{
  "data": [],
  "pagination": {...}
}
```

### Test 3: Create Opportunity (Protected - needs JWT)

```bash
curl -X POST https://staging.opportunities.varsigram.com/api/v1/opportunities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Test Opportunity",
    "description": "Testing the create endpoint",
    "company": "Test Corp",
    "category": "GIG"
  }'
```

Expected (201 Created):
```json
{
  "message": "Opportunity created successfully!",
  "data": {
    "id": "uuid-here",
    "title": "Test Opportunity",
    "createdBy": 2,
    ...
  }
}
```

## Current Valid Categories
Based on staging validation, the valid categories are:
- `INTERNSHIP`
- `SCHOLARSHIP`
- `COMPETITION`
- `GIG`
- `PITCH`
- `OTHER`

## Files That Need Deployment
1. `prisma/schema.prisma` (updated)
2. `src/middleware/auth.ts` (updated)
3. New migration file in `prisma/migrations/`

## Rollback Plan
If the fix causes issues:
```bash
# Revert to previous migration
npx prisma migrate resolve --rolled-back <migration-name>

# Restart app
pm2 restart ecosystem.config.js --env production
```

---
**Status:** 🔴 Waiting for DevOps to apply fix  
**Priority:** HIGH - Blocking opportunity creation on staging  
**Created:** October 22, 2025
