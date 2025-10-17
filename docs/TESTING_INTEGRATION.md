# Testing Django + Node.js Integration

This guide walks you through testing the complete authentication flow between Django and Node.js.

---

## Prerequisites

- Django backend running on `http://localhost:8000`
- Node.js service running on `http://localhost:3000`
- Both services have the **same** `JWT_SECRET` in their `.env` files
- PostgreSQL database for both services

---

## Step 1: Setup Environment Variables

### Django `.env`
```bash
JWT_SECRET=my-shared-secret-key-12345
DATABASE_URL=postgresql://user:pass@localhost:5432/django_db
```

### Node.js `.env`
```bash
JWT_SECRET=my-shared-secret-key-12345  # MUST MATCH DJANGO!
DATABASE_URL=postgresql://user:pass@localhost:5432/nodejs_db
PORT=3000
NODE_ENV=development
```

---

## Step 2: Start Both Services

### Terminal 1 - Django
```bash
cd /path/to/django/project
python manage.py runserver
```

### Terminal 2 - Node.js
```bash
cd /path/to/nodejs/project
npm run dev
```

---

## Step 3: Create Test User in Django

```bash
# Django shell
python manage.py createsuperuser
# Username: testuser
# Email: test@example.com
# Password: testpass123
```

---

## Step 4: Get JWT Token from Django

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpass123"
  }'
```

**Expected Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Save the `access` token!** You'll use it in the next steps.

---

## Step 5: Test Node.js Public Endpoints (No Auth)

### Get All Opportunities
```bash
curl http://localhost:3000/api/v1/opportunities
```

### Search Opportunities
```bash
curl "http://localhost:3000/api/v1/opportunities/search?q=internship"
```

### Get Internships Only
```bash
curl http://localhost:3000/api/v1/opportunities/category/internships
```

✅ **Expected:** These should work without authentication

---

## Step 6: Test Protected Endpoints (With Auth)

Replace `YOUR_TOKEN_HERE` with the `access` token from Step 4.

### Create Opportunity (Should Work with Token)
```bash
curl -X POST http://localhost:3000/api/v1/opportunities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Software Engineering Internship",
    "description": "Amazing internship opportunity at Tech Company",
    "category": "INTERNSHIP",
    "location": "Lagos, Nigeria",
    "isRemote": false,
    "deadline": "2025-12-31T23:59:59Z"
  }'
```

**Expected Response:**
```json
{
  "message": "Opportunity created successfully!",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Software Engineering Internship",
    "description": "Amazing internship opportunity at Tech Company",
    "category": "INTERNSHIP",
    "location": "Lagos, Nigeria",
    "isRemote": false,
    "deadline": "2025-12-31T23:59:59.000Z",
    "createdBy": "user-id-from-token",
    "createdAt": "2025-10-16T10:30:00.000Z",
    "updatedAt": "2025-10-16T10:30:00.000Z"
  }
}
```

### Create Opportunity WITHOUT Token (Should Fail)
```bash
curl -X POST http://localhost:3000/api/v1/opportunities \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Opportunity",
    "description": "This should fail",
    "category": "INTERNSHIP"
  }'
```

**Expected Response:**
```json
{
  "error": "Authentication required",
  "message": "No token provided"
}
```

### Update Opportunity (With Token)
```bash
curl -X PUT http://localhost:3000/api/v1/opportunities/OPPORTUNITY_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Updated Title",
    "description": "Updated description"
  }'
```

### Delete Opportunity (With Token)
```bash
curl -X DELETE http://localhost:3000/api/v1/opportunities/OPPORTUNITY_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Step 7: Test Invalid/Expired Tokens

### Invalid Token
```bash
curl -X POST http://localhost:3000/api/v1/opportunities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid.token.here" \
  -d '{
    "title": "Test",
    "description": "This should fail",
    "category": "INTERNSHIP"
  }'
```

**Expected Response:**
```json
{
  "error": "Invalid token",
  "message": "Authentication failed"
}
```

---

## Step 8: Verify User Ownership

1. Create an opportunity with User A's token
2. Try to update/delete it with User B's token
3. Should get 403 Forbidden error

```bash
# Create with User A
curl -X POST http://localhost:3000/api/v1/opportunities \
  -H "Authorization: Bearer USER_A_TOKEN" \
  -d '{"title": "User A Opportunity", ...}'

# Try to delete with User B (should fail)
curl -X DELETE http://localhost:3000/api/v1/opportunities/OPPORTUNITY_ID \
  -H "Authorization: Bearer USER_B_TOKEN"
```

**Expected Response:**
```json
{
  "error": "You do not have permission to delete this opportunity"
}
```

---

## Step 9: Test Validation

### Missing Required Fields
```bash
curl -X POST http://localhost:3000/api/v1/opportunities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "No description"
  }'
```

**Expected Response:**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "description",
      "message": "\"description\" is required"
    },
    {
      "field": "category",
      "message": "\"category\" is required"
    }
  ]
}
```

### Invalid Category
```bash
curl -X POST http://localhost:3000/api/v1/opportunities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Test",
    "description": "Test description",
    "category": "INVALID_CATEGORY"
  }'
```

**Expected Response:**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "category",
      "message": "Category must be one of: INTERNSHIP, SCHOLARSHIP, COMPETITION, GIG, PITCH, OTHER"
    }
  ]
}
```

---

## Troubleshooting Common Issues

### ❌ "Invalid token" error
**Cause:** JWT_SECRET doesn't match between Django and Node.js

**Solution:**
1. Check `.env` files in both projects
2. Ensure `JWT_SECRET` is exactly the same
3. Restart both services after changing

### ❌ "Token expired" error
**Cause:** Token lifetime exceeded

**Solution:**
1. Get a new token from Django login endpoint
2. Or implement token refresh logic

### ❌ "Database connection failed"
**Cause:** DATABASE_URL is incorrect

**Solution:**
1. Check PostgreSQL is running: `psql -U username -d dbname`
2. Verify DATABASE_URL in `.env`
3. Run migrations: `npx prisma migrate dev`

### ❌ Can't create opportunities - no user_id
**Cause:** Django token doesn't include `user_id` claim

**Solution:**
1. Use the custom token serializer (see DJANGO_INTEGRATION.md)
2. Ensure token payload includes `user_id` field

---

## Success Checklist

- [ ] Django server running on port 8000
- [ ] Node.js server running on port 3000
- [ ] Same JWT_SECRET in both `.env` files
- [ ] Can login and get token from Django
- [ ] Can view opportunities without token (GET)
- [ ] Can create opportunity WITH token (POST)
- [ ] CANNOT create opportunity WITHOUT token
- [ ] Can only edit/delete own opportunities
- [ ] Validation errors work correctly
- [ ] Invalid tokens are rejected

---

## Next Steps

Once everything works:

1. **Add token refresh logic** in mobile app
2. **Implement rate limiting** on both services
3. **Add logging** for security events
4. **Deploy to production** with HTTPS
5. **Set up monitoring** for failed auth attempts
