# 📋 Requirements from Django Backend Team

## What You Need from Django Developers

As the Node.js developer, you need the following information and configurations from the Django backend team to successfully integrate authentication.

---

## 🔑 1. JWT_SECRET (CRITICAL!)

**What:** The secret key used to sign JWT tokens

**Why:** You need the EXACT same secret to validate tokens that Django creates

**Format:** A long random string (minimum 32 characters)

**Example:** `super-secret-key-do-not-share-abc123xyz789`

**How to receive:**
- ✅ Password manager (1Password, LastPass)
- ✅ Encrypted message
- ✅ Secret management tool (AWS Secrets Manager, HashiCorp Vault)
- ❌ NOT via plain email
- ❌ NOT in Slack/Teams public channels
- ❌ NOT committed to Git

**What to ask:**
```
"Hey Django team, I need the JWT_SECRET that you're using 
to sign tokens. Please share it securely via [password manager/
encrypted channel]. Make sure it's the production secret."
```

---

## 🎫 2. JWT Token Payload Structure

**What:** The exact structure of data inside the JWT token

**Why:** You need to know which field contains the user ID

**Required field:** `user_id` (this is critical!)

**Example payload you need:**
```json
{
  "token_type": "access",
  "exp": 1729209600,
  "iat": 1729123200,
  "jti": "abc123def456",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",  ← YOU NEED THIS!
  "email": "user@example.com",
  "username": "john_doe"
}
```

**What to ask:**
```
"Can you confirm that the JWT token includes a 'user_id' field? 
Can you send me an example token payload so I can verify the 
structure?"
```

**How to verify:**
1. Get a sample token from Django team
2. Go to https://jwt.io
3. Paste the token
4. Check that `user_id` is present in the payload

---

## 🌐 3. Django API Base URL

**What:** The production and development URLs for the Django API

**Why:** You need to configure CORS to allow requests from Django

**Required information:**

### Development:
```
http://localhost:8000
```

### Production:
```
https://api.varsigram.com
```

**What to ask:**
```
"What's the production domain for the Django API? 
Also, what port do you use for local development?"
```

---

## 🔐 4. Login Endpoint

**What:** The endpoint where users log in and get JWT tokens

**Why:** You need to know this for testing and documentation

**Expected endpoint:**
```
POST https://api.varsigram.com/api/auth/login/
```

**Request format:**
```json
{
  "username": "john_doe",
  "password": "secretpassword"
}
```

**Response format:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**What to ask:**
```
"What's the exact login endpoint path? 
What's the request/response format?"
```

---

## 🔄 5. Token Refresh Endpoint (Optional but Recommended)

**What:** Endpoint to refresh expired access tokens

**Why:** For better UX, tokens can be refreshed without re-login

**Expected endpoint:**
```
POST https://api.varsigram.com/api/auth/refresh/
```

**Request format:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response format:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."  // New access token
}
```

**What to ask:**
```
"Do you have a token refresh endpoint? 
What's the path and format?"
```

---

## ⏰ 6. Token Expiration Times

**What:** How long tokens are valid

**Why:** You need to know this for error handling and testing

**Required information:**
- Access token lifetime (e.g., 24 hours)
- Refresh token lifetime (e.g., 7 days)

**What to ask:**
```
"How long are access tokens valid? 
What about refresh tokens?"
```

---

## 👤 7. User ID Format

**What:** The format/type of user IDs

**Why:** Your database needs to match this format

**Common formats:**
- UUID: `550e8400-e29b-41d4-a716-446655440000`
- Integer: `12345`
- String: `user_abc123`

**Your Prisma schema already expects UUID:**
```prisma
model Opportunity {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  // ...
  createdBy String   @map("created_by") @db.Uuid  ← Must match Django user ID format
}
```

**What to ask:**
```
"What format are user IDs? UUID, integer, or string? 
Can you show me an example?"
```

---

## 🧪 8. Test User Credentials

**What:** A test user account for development and testing

**Why:** You need to test the integration end-to-end

**Required:**
- Test username
- Test password
- Test user ID

**What to ask:**
```
"Can you create a test user account for me to test the 
integration? I need username, password, and the user ID."
```

---

## 📝 9. Confirmation of Django Configuration

**What:** Confirmation that Django is properly configured

**Why:** To avoid integration issues later

**Checklist for Django team to confirm:**

- [ ] `djangorestframework-simplejwt` installed
- [ ] Custom token serializer created with `user_id`
- [ ] CORS configured to allow your Node.js domain
- [ ] JWT_SECRET set in Django `.env`
- [ ] Login endpoint tested and working
- [ ] Token includes `user_id` in payload

**What to ask:**
```
"Can you confirm you've completed the Django setup checklist? 
(Send them docs/checklists/DJANGO_DEV_CHECKLIST.md)"
```

---

## 🚀 10. Production Domain Name

**What:** The actual domain name for production

**Why:** For CORS configuration and documentation

**Required:**
```
Production Django API: https://api.varsigram.com
```

**What to ask:**
```
"What will be the production domain for the Django API?"
```

---

## ✅ Complete Requirements Checklist

Copy this and send to Django team:

```markdown
Hi Django Team!

For the Node.js Opportunities service integration, I need the following:

**Critical (Can't proceed without these):**
- [ ] JWT_SECRET (share securely!)
- [ ] Confirmation that JWT tokens include 'user_id' field
- [ ] Sample JWT token for testing

**Important (Needed soon):**
- [ ] Login endpoint URL (dev and prod)
- [ ] Django API base URL (dev and prod)
- [ ] User ID format (UUID/integer/string?)
- [ ] Test user credentials

**Nice to have:**
- [ ] Token refresh endpoint
- [ ] Token expiration times
- [ ] Production domain name

Please share JWT_SECRET via [secure method].

Also, please review and complete: docs/checklists/DJANGO_DEV_CHECKLIST.md

Thanks!
```

---

## 📞 How to Communicate

### Initial Request (Send this message):

```
Hey Django Team! 👋

I'm setting up the Node.js Opportunities microservice and need 
some info from you to complete the authentication integration.

The most critical thing I need is:
1. JWT_SECRET (please share securely)
2. Confirmation that your JWT tokens include a 'user_id' field
3. A sample JWT token so I can verify the structure

I've created a complete checklist for you:
docs/checklists/DJANGO_DEV_CHECKLIST.md

Can we schedule a quick call to go through this?

Full requirements document:
docs/REQUIREMENTS_FROM_DJANGO.md

Thanks!
```

---

## 🧪 How to Test Once You Receive Info

### Step 1: Verify JWT_SECRET
```bash
# Add to your .env
JWT_SECRET=<value-from-django-team>

# Restart your Node.js server
npm run dev
```

### Step 2: Get a Token from Django
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpass"}'
```

### Step 3: Verify Token Structure
- Copy the `access` token
- Go to https://jwt.io
- Paste token
- Check for `user_id` field

### Step 4: Test with Your Node.js Service
```bash
curl -X POST http://localhost:3000/api/v1/opportunities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "title": "Test Opportunity",
    "description": "Testing integration",
    "category": "INTERNSHIP"
  }'
```

### Step 5: Verify in Database
```bash
# Check that createdBy matches the user_id from JWT
npx prisma studio
# Open opportunities table
# Check createdBy field
```

---

## 🚨 Red Flags to Watch For

### ❌ Django team says:
- "We're using a different JWT library" 
  → Might not include user_id by default
  
- "We haven't configured JWT yet"
  → Share docs/checklists/DJANGO_DEV_CHECKLIST.md
  
- "Can't we just send user_id in the request body?"
  → No! Must be in JWT token for security
  
- "JWT_SECRET can be anything, right?"
  → Must be strong and SAME in both services

---

## 📚 Documents to Share with Django Team

1. **`docs/checklists/DJANGO_DEV_CHECKLIST.md`** - Their complete checklist
2. **`docs/DJANGO_INTEGRATION.md`** - Detailed integration guide
3. **`docs/AUTH_FLOW_DIAGRAM.md`** - Visual explanation
4. **`docs/TESTING_INTEGRATION.md`** - How to test together

---

## Summary: The 3 Most Critical Things

1. **JWT_SECRET** - Without this, you can't validate tokens
2. **user_id in token payload** - Without this, you can't link opportunities to users
3. **Login endpoint** - Without this, you can't test

Everything else can be figured out later, but these three are blockers!

---

**Ready to request info from Django team! 📞**
