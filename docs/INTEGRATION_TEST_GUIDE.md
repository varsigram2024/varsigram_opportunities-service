# 🧪 Integration Testing Guide

## You Have JWT_SECRET! ✅

Now let's test the integration between Django and your Node.js service.

---

## Step 1: Update Your .env File

Open `.env` and update the `JWT_SECRET` line with the value from Django team:

```bash
JWT_SECRET="<paste-the-jwt-secret-from-django-team>"
```

**CRITICAL:** The JWT_SECRET must be EXACTLY the same as Django's. Even a single character difference will cause auth to fail.

---

## Step 2: Verify Your Environment

```powershell
# Check if .env is loaded correctly
Get-Content .env | Select-String "JWT_SECRET"

# Should show your JWT_SECRET (make sure it matches Django's!)
```

---

## Step 3: Start Your Development Server

```powershell
# Install dependencies (if not done)
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start the server
npm run dev
```

You should see:
```
Server running on port 3000
Environment: development
```

---

## Step 4: Test Health Check (No Auth Needed)

```powershell
# Test 1: Health check endpoint
curl http://localhost:3000/health

# Expected response:
# {"status":"OK","service":"Opportunities-service","timestamp":"..."}
```

---

## Step 5: Get JWT Token from Django

**Option A: Ask Django team for a test token**
Send them this message:
```
Hi! I have the JWT_SECRET now. Can you generate a test JWT token for me?

Just need:
1. A JWT token (from your login endpoint)
2. The user_id it contains

Or give me test credentials so I can generate it myself.

Thanks!
```

**Option B: Generate token yourself (if you have Django credentials)**
```powershell
# If Django is running locally at http://localhost:8000
curl -X POST http://localhost:8000/api/v1/login `
  -H "Content-Type: application/json" `
  -d '{\"username\": \"testuser\", \"password\": \"testpass\"}'

# Copy the "access" token from the response
```

---

## Step 6: Verify JWT Token Structure

Go to https://jwt.io and paste your token.

**Check the payload MUST include:**
```json
{
  "user_id": "some-uuid-or-id-here",  ← MUST BE PRESENT!
  "email": "user@example.com",
  "exp": 1234567890,
  ...
}
```

If `user_id` is missing, contact Django team - they need to add it to the JWT payload!

---

## Step 7: Test Public Endpoints (No Auth)

```powershell
# Test: Get all opportunities (public endpoint)
curl http://localhost:3000/api/v1/opportunities

# Expected: Empty array [] (or list of opportunities)
# Status: 200 OK
```

```powershell
# Test: Search opportunities (public)
curl http://localhost:3000/api/v1/opportunities/search?category=INTERNSHIP

# Expected: Array of internships
# Status: 200 OK
```

---

## Step 8: Test Protected Endpoints (Auth Required)

### Create Opportunity (POST - Requires Auth)

```powershell
# Replace <YOUR_JWT_TOKEN> with actual token from Django
$token = "<YOUR_JWT_TOKEN>"

curl -X POST http://localhost:3000/api/v1/opportunities `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $token" `
  -d '{
    \"title\": \"Software Engineering Internship\",
    \"description\": \"Great opportunity to learn backend development\",
    \"category\": \"INTERNSHIP\",
    \"location\": \"Lagos, Nigeria\",
    \"applicationDeadline\": \"2025-12-31\",
    \"requirements\": \"Basic programming knowledge\",
    \"benefits\": \"Mentorship, stipend, certificate\"
  }'

# Expected response:
# {
#   "id": "...",
#   "title": "Software Engineering Internship",
#   "createdBy": "<user_id_from_jwt>",
#   ...
# }
# Status: 201 Created
```

**If this works:** 🎉 **Integration successful!**

---

## Step 9: Test Ownership Verification

### Try to Update the Opportunity You Just Created

```powershell
# Get the opportunity ID from previous response
$opportunityId = "<id-from-previous-response>"

curl -X PUT http://localhost:3000/api/v1/opportunities/$opportunityId `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $token" `
  -d '{
    \"title\": \"Updated Title\",
    \"description\": \"Updated description\"
  }'

# Expected: Success (200 OK) - You own this opportunity
```

### Try to Update Someone Else's Opportunity (Should Fail)

```powershell
# Try to update an opportunity you don't own (if any exist)
curl -X PUT http://localhost:3000/api/v1/opportunities/some-other-id `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $token" `
  -d '{
    \"title\": \"Trying to hack\"
  }'

# Expected: Error (403 Forbidden)
# {"error":"You are not authorized to update this opportunity"}
```

---

## Step 10: Verify Database

```powershell
# Open Prisma Studio to see the data
npx prisma studio

# Go to http://localhost:5555
# Click "opportunities" table
# Verify the opportunity you created has:
# - createdBy: matches user_id from JWT token
# - All other fields populated correctly
```

---

## ✅ Success Criteria

Your integration is working if:

- [x] Server starts without errors
- [x] Health check returns OK
- [x] Public endpoints work (GET without auth)
- [x] Protected endpoints work WITH valid JWT token
- [x] Creating opportunity populates `createdBy` with correct user_id
- [x] You can update your own opportunities
- [x] You CANNOT update other users' opportunities
- [x] Invalid/expired tokens return 401 Unauthorized
- [x] Missing token returns 401 Unauthorized

---

## 🐛 Troubleshooting

### Error: "Invalid token"
```
Problem: JWT verification failed
Solution: 
1. Check JWT_SECRET matches Django's EXACTLY
2. Verify token is not expired (check exp claim)
3. Make sure token is valid (test at jwt.io)
```

### Error: "Authorization header required"
```
Problem: Token not sent correctly
Solution: Make sure you're sending header:
Authorization: Bearer <token>
```

### Error: "User ID not found in token"
```
Problem: JWT doesn't include user_id
Solution: Contact Django team - they need to add user_id to JWT payload
```

### Error: "Database connection failed"
```
Problem: PostgreSQL not running or DATABASE_URL wrong
Solution:
1. Start PostgreSQL
2. Check DATABASE_URL in .env
3. Run: npx prisma migrate dev
```

### Error: "Cannot find module"
```
Problem: Dependencies not installed or TypeScript not compiled
Solution:
1. Run: npm install
2. Run: npm run build
3. Try again
```

---

## 📝 Next Steps After Successful Integration

Once all tests pass:

1. **Commit Your Changes**
   ```powershell
   git add .
   git commit -m "Configure JWT_SECRET and verify Django integration"
   git push origin develop
   ```

2. **Create Main Branch**
   ```powershell
   git checkout -b main
   git push origin main
   git checkout develop
   ```

3. **Share with DevOps**
   - Send them `docs/checklists/DEVOPS_CHECKLIST.md`
   - Send them `.env.example` (NOT .env with secrets!)
   - Confirm production JWT_SECRET with Django team

4. **Update Mobile Team**
   ```
   Integration complete! API is ready.
   
   Base URL (dev): http://localhost:3000/api/v1
   Base URL (prod): https://opportunities.varsigram.com/api/v1
   
   Auth: Use the same JWT token from Django login
   Header: Authorization: Bearer <token>
   
   Endpoints ready:
   - GET /opportunities (public)
   - POST /opportunities (auth required)
   - GET /opportunities/:id (public)
   - PUT /opportunities/:id (auth required, owner only)
   - DELETE /opportunities/:id (auth required, owner only)
   - GET /opportunities/search (public)
   ```

---

## 🎉 You're Done!

If all tests pass, your Django + Node.js integration is complete and working!

**Next milestone:** Production deployment 🚀
