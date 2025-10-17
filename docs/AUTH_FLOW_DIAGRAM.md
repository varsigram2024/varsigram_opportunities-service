# Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     DJANGO + NODE.JS AUTH FLOW                       │
└─────────────────────────────────────────────────────────────────────┘

Step 1: User Login (Django Backend)
────────────────────────────────────
┌──────────┐                    ┌─────────────────┐
│  Mobile  │   POST /login      │     Django      │
│   App    │ ───────────────>   │    Backend      │
│          │   username/pass    │   (Port 8000)   │
└──────────┘                    └─────────────────┘
                                         │
                                         │ Generate JWT
                                         │ {
                                         │   user_id: "123",
                                         │   email: "user@example.com"
                                         │ }
                                         │ Signed with JWT_SECRET
                                         ▼
                                   Return Token
                                    ┌─────────┐
                                    │  JWT    │
                                    │ Token   │
                                    └─────────┘


Step 2: Store Token (Mobile App)
─────────────────────────────────
┌──────────┐
│  Mobile  │  Store token in
│   App    │  AsyncStorage/SecureStore
│          │  access_token = "eyJ0eXAi..."
└──────────┘


Step 3: Create Opportunity (Node.js Service)
─────────────────────────────────────────────
┌──────────┐                          ┌──────────────────┐
│  Mobile  │   POST /opportunities    │     Node.js      │
│   App    │ ──────────────────────>  │  Opportunities   │
│          │   + Authorization:       │    Service       │
│          │     Bearer <token>       │   (Port 3000)    │
└──────────┘   + opportunity data     └──────────────────┘
                                               │
                                               │ Verify JWT
                                               │ using SAME
                                               │ JWT_SECRET
                                               │
                                               ▼
                                        Extract user_id
                                        from token
                                               │
                                               │
                                               ▼
                                        ┌──────────────┐
                                        │  PostgreSQL  │
                                        │   Database   │
                                        │ Save with    │
                                        │ createdBy =  │
                                        │ user_id      │
                                        └──────────────┘
                                               │
                                               ▼
                                        Return success


┌─────────────────────────────────────────────────────────────────────┐
│                            KEY POINTS                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. Django generates the JWT token                                  │
│  2. Token is signed with JWT_SECRET                                 │
│  3. Mobile app stores the token                                     │
│  4. Mobile app sends token to Node.js                               │
│  5. Node.js validates token with SAME JWT_SECRET                    │
│  6. Node.js extracts user_id from token                             │
│  7. Node.js creates opportunity with user_id                        │
│                                                                      │
│  ⚠️  CRITICAL: JWT_SECRET must be identical in both services!       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘


EXAMPLE TOKEN PAYLOAD
─────────────────────
{
  "token_type": "access",
  "exp": 1729209600,           // Expiration time
  "iat": 1729123200,           // Issued at time
  "jti": "abc123def456",       // Unique token ID
  "user_id": "550e8400-...",   // ← Node.js reads this!
  "email": "user@example.com",
  "role": "user"
}


API ENDPOINTS
─────────────

Django (Port 8000):
  POST   /api/auth/login/       - Get JWT token
  POST   /api/auth/refresh/     - Refresh token
  GET    /api/users/profile/    - Get user profile

Node.js (Port 3000):
  GET    /health                                - Health check
  GET    /api/v1/opportunities                  - List (public)
  GET    /api/v1/opportunities/:id              - Get one (public)
  POST   /api/v1/opportunities                  - Create (🔒 auth)
  PUT    /api/v1/opportunities/:id              - Update (🔒 auth)
  DELETE /api/v1/opportunities/:id              - Delete (🔒 auth)
  GET    /api/v1/opportunities/search           - Search (public)
  GET    /api/v1/opportunities/category/...     - By category (public)


ENVIRONMENT VARIABLES
─────────────────────

Django .env:
  JWT_SECRET=your-secret-here   ← MUST MATCH!
  DATABASE_URL=postgresql://...

Node.js .env:
  JWT_SECRET=your-secret-here   ← MUST MATCH!
  DATABASE_URL=postgresql://...
  PORT=3000


SECURITY NOTES
──────────────
✓ Use HTTPS in production
✓ Use strong JWT_SECRET (32+ random characters)
✓ Never commit .env files to Git
✓ Set appropriate token expiration times
✓ Implement token refresh logic
✓ Add rate limiting
✓ Log authentication failures
✓ Use different databases for Django and Node.js
```
