# Quick Setup Checklist - Django Integration

Follow these steps to integrate your Node.js Opportunities service with your Django backend.

---

## ✅ Django Backend Setup

### 1. Install Required Packages
```bash
cd /path/to/django/project
pip install djangorestframework-simplejwt
pip install python-decouple
```

### 2. Update Django settings.py

Add to `INSTALLED_APPS`:
```python
INSTALLED_APPS = [
    # ...
    'rest_framework',
    'rest_framework_simplejwt',
]
```

Add JWT configuration:
```python
from datetime import timedelta
from decouple import config

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),
    'SIGNING_KEY': config('JWT_SECRET'),  # From .env
    'ALGORITHM': 'HS256',
}
```

### 3. Create Django .env file
```bash
# Django .env
JWT_SECRET=my-super-secret-key-12345
```

### 4. Add authentication URLs
```python
# urls.py
from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
    path('api/auth/login/', TokenObtainPairView.as_view()),
]
```

---

## ✅ Node.js Service Setup

### 1. Create .env file
```bash
cd /path/to/nodejs/project
cp .env.example .env
```

### 2. Update .env with SAME secret
```bash
# Node.js .env
JWT_SECRET=my-super-secret-key-12345  # MUST MATCH DJANGO!
DATABASE_URL=postgresql://user:pass@localhost:5432/opportunities_db
PORT=3000
```

### 3. Install dependencies (if not done)
```bash
npm install
```

### 4. Run database migrations
```bash
npx prisma migrate dev
npx prisma generate
```

### 5. Start the service
```bash
npm run dev
```

---

## ✅ Test the Integration

### 1. Start both services
```bash
# Terminal 1 - Django
python manage.py runserver

# Terminal 2 - Node.js
npm run dev
```

### 2. Get JWT token from Django
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpass"}'
```

Save the `access` token from the response.

### 3. Test Node.js with the token
```bash
# Replace YOUR_TOKEN with the actual token
curl -X POST http://localhost:3000/api/v1/opportunities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test Opportunity",
    "description": "Testing Django integration",
    "category": "INTERNSHIP",
    "location": "Remote"
  }'
```

### 4. Verify it works ✅
If you get a successful response with the created opportunity, the integration is working!

---

## 🔍 Troubleshooting

### Problem: "Invalid token" error

**Solution:**
- Check that `JWT_SECRET` is exactly the same in both `.env` files
- Restart both services after changing environment variables
- Verify the token is being sent with `Bearer ` prefix

### Problem: "User not authenticated"

**Solution:**
- Make sure you're sending the `Authorization` header
- Format: `Authorization: Bearer <your-token-here>`
- No extra spaces or characters

### Problem: Database connection failed

**Solution:**
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Run: `npx prisma migrate dev`

---

## 📚 Full Documentation

For detailed information, see:
- [Django Integration Guide](./DJANGO_INTEGRATION.md)
- [Testing Guide](./TESTING_INTEGRATION.md)
- [Auth Flow Diagram](./AUTH_FLOW_DIAGRAM.md)

---

## ✨ Success!

Once all tests pass, you have successfully integrated Django authentication with your Node.js Opportunities service!

**Next Steps:**
1. Implement this in your mobile app
2. Add error handling for expired tokens
3. Implement token refresh logic
4. Deploy to production with HTTPS
