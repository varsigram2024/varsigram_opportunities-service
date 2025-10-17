# 📋 What You Need from Django Backend - Quick Visual Guide

```
┌─────────────────────────────────────────────────────────────────┐
│              WHAT YOU NEED FROM DJANGO TEAM                     │
└─────────────────────────────────────────────────────────────────┘

🔴 CRITICAL (Can't start without these):
═══════════════════════════════════════════════════════════════════

1. JWT_SECRET 🔑
   ┌────────────────────────────────────────────────┐
   │ super-secret-key-do-not-share-abc123xyz789     │
   └────────────────────────────────────────────────┘
   ⚠️  MUST BE SHARED SECURELY (not plain email!)
   ⚠️  MUST BE EXACT SAME in both Django and Node.js


2. JWT Token with user_id 🎫
   ┌────────────────────────────────────────────────┐
   │ {                                              │
   │   "user_id": "550e8400-...",  ← YOU NEED THIS! │
   │   "email": "user@example.com",                 │
   │   "username": "john_doe"                       │
   │ }                                              │
   └────────────────────────────────────────────────┘
   Ask: "Does your JWT include user_id field?"


3. Test User 👤
   ┌────────────────────────────────────────────────┐
   │ Username: testuser                             │
   │ Password: testpass123                          │
   │ User ID:  550e8400-e29b-41d4-a716-446655440000 │
   └────────────────────────────────────────────────┘
   Needed to test the integration


🟡 IMPORTANT (Need soon):
═══════════════════════════════════════════════════════════════════

4. Login Endpoint 🚪
   Development:  http://localhost:8000/api/auth/login/
   Production:   https://api.varsigram.com/api/auth/login/


5. API Base URLs 🌐
   Development:  http://localhost:8000
   Production:   https://api.varsigram.com


6. User ID Format 🆔
   Options: UUID / Integer / String
   Your DB expects: UUID (confirm Django matches)


🟢 NICE TO HAVE (Can get later):
═══════════════════════════════════════════════════════════════════

7. Token Refresh Endpoint 🔄
   POST /api/auth/refresh/

8. Token Expiration Times ⏰
   Access token:  24 hours (example)
   Refresh token: 7 days (example)

9. Production Domain 🌍
   https://api.varsigram.com (confirm)


═══════════════════════════════════════════════════════════════════
              HOW THE INTEGRATION WORKS
═══════════════════════════════════════════════════════════════════

Step 1: User logs in (Django)
     │
     ├─> Django creates JWT with user_id
     │
     └─> Signed with JWT_SECRET
         ┌──────────────────────┐
         │ eyJ0eXAiOiJKV1Q...   │
         └──────────────────────┘

Step 2: Mobile app stores token

Step 3: Request to Node.js (You!)
     │
     ├─> Sends: Authorization: Bearer <token>
     │
     ├─> Node.js validates with SAME JWT_SECRET ✅
     │
     ├─> Extracts user_id from token
     │
     └─> Saves opportunity with createdBy = user_id


═══════════════════════════════════════════════════════════════════
                    QUICK ACTION ITEMS
═══════════════════════════════════════════════════════════════════

FOR YOU:
  □ Send request to Django team (use MESSAGE_TO_DJANGO_TEAM.md)
  □ Wait for JWT_SECRET
  □ Add JWT_SECRET to .env
  □ Test with Django token
  □ Confirm integration works

FOR DJANGO TEAM:
  □ Share setup checklist (DJANGO_DEV_CHECKLIST.md)
  □ Wait for them to complete setup
  □ Receive JWT_SECRET securely
  □ Receive sample token
  □ Get test credentials


═══════════════════════════════════════════════════════════════════
                 TESTING THE INTEGRATION
═══════════════════════════════════════════════════════════════════

1. Get token from Django:
   curl -X POST http://localhost:8000/api/auth/login/ \
     -d '{"username":"testuser","password":"testpass"}'

2. Verify token at jwt.io:
   • Paste token
   • Check for user_id field ✓

3. Use token with Node.js:
   curl -X POST http://localhost:3000/api/v1/opportunities \
     -H "Authorization: Bearer <TOKEN>" \
     -d '{"title":"Test","description":"Test","category":"INTERNSHIP"}'

4. Success! ✅


═══════════════════════════════════════════════════════════════════
                      RED FLAGS 🚩
═══════════════════════════════════════════════════════════════════

Django team says:                What to do:
─────────────────────────────────────────────────────────────────
"We haven't set up JWT yet"  →  Share DJANGO_DEV_CHECKLIST.md

"We use a different library"  →  Must include user_id in payload

"JWT_SECRET can be anything"  →  Must be strong & SAME in both

"Can't we send user_id in      →  NO! Security risk. Must be in
 request body?"                    JWT token


═══════════════════════════════════════════════════════════════════
                   DOCUMENTS TO SHARE
═══════════════════════════════════════════════════════════════════

With Django Team:
  • MESSAGE_TO_DJANGO_TEAM.md         ← Copy & send this
  • DJANGO_DEV_CHECKLIST.md           ← Their todo list  
  • DJANGO_INTEGRATION.md             ← How to set up
  • AUTH_FLOW_DIAGRAM.md              ← Visual explanation

For Reference:
  • REQUIREMENTS_FROM_DJANGO.md       ← Full requirements
  • TESTING_INTEGRATION.md            ← How to test together


═══════════════════════════════════════════════════════════════════
                    SUMMARY
═══════════════════════════════════════════════════════════════════

YOU ABSOLUTELY NEED:
  1. JWT_SECRET (blocker #1)
  2. user_id in JWT payload (blocker #2)
  3. Test user credentials (blocker #3)

Everything else can be figured out, but without these 3, you 
can't proceed with the integration.


═══════════════════════════════════════════════════════════════════

Ready to reach out to Django team! 🚀

Use: docs/MESSAGE_TO_DJANGO_TEAM.md (copy and send)
```
