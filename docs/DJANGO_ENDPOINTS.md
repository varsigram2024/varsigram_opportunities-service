# Django Backend Endpoints Reference

## Base URL

**Development:** `http://localhost:8000`  
**Production:** `https://api.varsigram.com`

---

## Authentication Endpoint

### Login

**POST** `/api/v1/login`

Authenticate user and receive JWT token.

**Request:**
```http
POST /api/v1/login HTTP/1.1
Host: api.varsigram.com
Content-Type: application/json

{
  "username": "your-username",
  "password": "your-password"
}
```

**Response (Success):**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "your-username",
    "email": "user@example.com"
  }
}
```

**Response (Error):**
```json
{
  "error": "Invalid credentials"
}
```

---

## Using the JWT Token

### Token Structure

The `access` token from Django login should contain:

```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "username": "your-username",
  "exp": 1730332800,
  "iat": 1730328800
}
```

**Critical:** The token MUST include `user_id` field for Node.js integration to work.

### Using Token with Node.js Service

```http
POST /api/v1/opportunities HTTP/1.1
Host: opportunities.varsigram.com
Content-Type: application/json
Authorization: Bearer <access-token-from-django>

{
  "title": "My Opportunity",
  "description": "Description here",
  "category": "INTERNSHIP"
}
```

---

## Quick Test Commands

### Get JWT Token from Django

```bash
# Development
curl -X POST http://localhost:8000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpass"
  }'

# Production
curl -X POST https://api.varsigram.com/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your-username",
    "password": "your-password"
  }'
```

### Save Token to Variable (Bash)

```bash
# Get token and save to variable
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}' \
  | jq -r '.access')

echo $TOKEN
```

### Save Token to Variable (PowerShell)

```powershell
# Get token and save to variable
$response = curl -X POST http://localhost:8000/api/v1/login `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"testuser\",\"password\":\"testpass\"}' | ConvertFrom-Json

$token = $response.access
echo $token
```

### Use Token with Node.js Service

```bash
# Use the token with opportunities service
curl -X POST http://localhost:3000/api/v1/opportunities \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Opportunity",
    "description": "Testing integration",
    "category": "INTERNSHIP",
    "location": "Lagos"
  }'
```

---

## Integration Flow

```
Mobile App
    |
    | 1. POST /api/v1/login
    v
Django Backend (api.varsigram.com)
    |
    | 2. Returns JWT token
    v
Mobile App (stores token)
    |
    | 3. POST /api/v1/opportunities
    |    Header: Authorization: Bearer <token>
    v
Node.js Service (opportunities.varsigram.com)
    |
    | 4. Validates token with shared JWT_SECRET
    | 5. Extracts user_id from token
    | 6. Creates opportunity with createdBy = user_id
    v
PostgreSQL Database
```

---

## Token Verification

### Check Token Contents (jwt.io)

1. Go to https://jwt.io
2. Paste your access token
3. Verify the decoded payload contains:
   - `user_id` ✅ (required)
   - `exp` (expiration timestamp)
   - Other user info (optional)

### Check Token Validity

```bash
# The token should work for both Django and Node.js services
# Django uses it for authentication
# Node.js validates it and extracts user_id

# Test with Django protected endpoint (if available)
curl -X GET http://localhost:8000/api/v1/protected-endpoint \
  -H "Authorization: Bearer $TOKEN"

# Test with Node.js service
curl -X POST http://localhost:3000/api/v1/opportunities \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","description":"Test","category":"INTERNSHIP"}'
```

---

## Common Issues

### "Invalid token" error on Node.js service

**Cause:** JWT_SECRET doesn't match between Django and Node.js

**Solution:** 
1. Verify Django's JWT_SECRET setting
2. Ensure Node.js `.env` has EXACT same value
3. No extra spaces, quotes, or characters

### "User ID not found in token" error

**Cause:** Django JWT doesn't include `user_id` field

**Solution:**
Ask Django team to include `user_id` in JWT payload. The field should be one of:
- `user_id` (recommended)
- `userId`
- `sub`
- `id`

### Token expires too quickly

**Cause:** Django JWT expiration time too short

**Solution:**
Ask Django team to adjust JWT token expiration time in their settings.

---

## For Django Team

### What Node.js Service Needs

1. **JWT_SECRET**: Share securely (password manager, encrypted message)
2. **Token Payload**: Must include `user_id` field
3. **Login Endpoint**: `POST /api/v1/login` ✅
4. **CORS**: Allow requests from Node.js service domain
5. **Test Credentials**: Username/password for testing integration

### Example Django JWT Configuration

```python
# settings.py
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=7),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'SIGNING_KEY': 'your-secret-key-here',  # Share this with Node.js team
    
    # Ensure user_id is in token
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',  # ← Important!
}
```

---

## Quick Reference

| Service | Endpoint | Purpose |
|---------|----------|---------|
| Django | `POST /api/v1/login` | Get JWT token |
| Node.js | `POST /api/v1/opportunities` | Create opportunity (requires token) |
| Node.js | `GET /api/v1/opportunities` | List opportunities (public) |

**Token Format:** `Authorization: Bearer <access-token>`

---

Last Updated: October 20, 2025
