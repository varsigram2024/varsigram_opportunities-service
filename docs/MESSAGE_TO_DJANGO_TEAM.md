# Message Template for Django Team

Copy and send this to your Django developers:

---

## Subject: Node.js Opportunities Service - Integration Requirements

Hi Django Team! 👋

I'm working on the Node.js Opportunities microservice that will integrate with our Django backend using shared JWT authentication. I need a few things from you to complete the setup.

### 🔥 Critical (Blockers):

1. **JWT_SECRET** 
   - The secret key you use to sign JWT tokens
   - ⚠️ Please share this **securely** (password manager, encrypted message, etc.)
   - This MUST be the same secret I'll use in Node.js

2. **JWT Token Structure**
   - Please confirm your JWT tokens include a `user_id` field
   - Can you send me a sample token (or decoded payload) so I can verify?
   - Example of what I need to see:
   ```json
   {
     "user_id": "550e8400-e29b-41d4-a716-446655440000",
     "email": "user@example.com",
     "username": "john_doe"
   }
   ```

3. **Test User Credentials**
   - I need a test account to verify the integration works
   - Username, password, and user ID please!

### 📋 Important Info Needed:

4. **Login Endpoint**
   - What's the full URL for the login endpoint?
   - Development: `http://localhost:8000/api/auth/???`
   - Production: `https://api.varsigram.com/api/auth/???`

5. **API Base URL**
   - Development: `http://localhost:8000` ✅
   - Production: `https://api.varsigram.com` (is this correct?)

6. **User ID Format**
   - Are user IDs UUIDs, integers, or strings?
   - Example user ID?

### 📚 Documentation for You:

I've created a complete setup guide for the Django side:
- **Your checklist:** `docs/checklists/DJANGO_DEV_CHECKLIST.md`
- **Integration guide:** `docs/DJANGO_INTEGRATION.md`
- **How it works:** `docs/AUTH_FLOW_DIAGRAM.md`

### ✅ Django Setup Checklist (for your reference):

Please confirm you've completed or can complete:
- [ ] Install `djangorestframework-simplejwt`
- [ ] Create custom token serializer that includes `user_id`
- [ ] Configure CORS to allow Node.js requests
- [ ] Set up JWT_SECRET in `.env`
- [ ] Create login endpoint
- [ ] Test token generation

### 🤝 Next Steps:

Once I have the JWT_SECRET and sample token, I can:
1. Complete the Node.js configuration
2. Test the integration end-to-end
3. Confirm everything works together
4. Update mobile team with the final API endpoints

### 📞 Questions?

Happy to jump on a quick call to walk through this together if needed!

The full requirements document is here: `docs/REQUIREMENTS_FROM_DJANGO.md`

Thanks!
[Your Name]

---

## Alternative: Shorter Version

If you want a shorter message:

---

Hi Django Team!

Quick ask for the Node.js Opportunities service integration:

**Need ASAP:**
1. JWT_SECRET (share securely please!)
2. Confirm JWT tokens include `user_id` field
3. Sample JWT token to verify structure
4. Test user credentials (username/password/ID)

**Also need:**
5. Login endpoint URL (dev & prod)
6. Production API domain
7. User ID format (UUID/int/string?)

**For you:**
Setup checklist: `docs/checklists/DJANGO_DEV_CHECKLIST.md`

Can't proceed without #1-3. Let me know when you have these ready!

Thanks!
[Your Name]

---

## For Slack/Teams (Ultra Short):

```
@django-team Need help with Opportunities service integration:

CRITICAL:
• JWT_SECRET (share securely)
• Confirm JWT has `user_id` field  
• Sample JWT token
• Test user creds

Your checklist: docs/checklists/DJANGO_DEV_CHECKLIST.md
Full details: docs/REQUIREMENTS_FROM_DJANGO.md

Can you provide JWT_SECRET today? That's the blocker.
```

---

Choose the version that fits your team's communication style!
