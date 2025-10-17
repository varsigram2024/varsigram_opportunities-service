# Django Developer Checklist

## 📋 Tasks Before Deployment

### 1. Install Required Packages
```bash
pip install djangorestframework-simplejwt
pip install python-decouple
pip install django-cors-headers
```

### 2. Update `settings.py`

#### Add to INSTALLED_APPS:
```python
INSTALLED_APPS = [
    # ... existing apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
]
```

#### Add to MIDDLEWARE (before CommonMiddleware):
```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Add this
    'django.middleware.common.CommonMiddleware',
    # ... rest
]
```

#### Configure CORS:
```python
# Development
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Node.js local
]

# Production (update these with actual domains)
CORS_ALLOWED_ORIGINS = [
    "https://opportunities.varsigram.com",  # Node.js production
    "https://app.varsigram.com",            # Mobile app (if web)
]
```

#### Configure JWT:
```python
from datetime import timedelta
from decouple import config

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': config('JWT_SECRET'),  # From .env
    'AUTH_HEADER_TYPES': ('Bearer',),
}
```

#### Update ALLOWED_HOSTS:
```python
# Production
ALLOWED_HOSTS = [
    'api.varsigram.com',
    'localhost',
    '127.0.0.1',
]
```

### 3. Create Custom Token Serializer

Create `serializers.py`:
```python
# yourapp/serializers.py
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # ⚠️ CRITICAL: Add user_id - Node.js needs this!
        token['user_id'] = str(user.id)
        token['email'] = user.email
        token['username'] = user.username
        
        return token

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
```

### 4. Update `urls.py`

```python
# yourapp/urls.py
from django.urls import path
from .serializers import CustomTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # ... existing URLs
    path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
```

### 5. Create `.env` File

```bash
# Django .env (Development)
JWT_SECRET=development-secret-key-change-in-production
DATABASE_URL=postgresql://user:pass@localhost:5432/django_dev_db
DEBUG=True
SECRET_KEY=your-django-secret-key

# Django .env (Production)
JWT_SECRET=<super-secure-random-32-char-key>  # SHARE WITH NODE.JS TEAM!
DATABASE_URL=postgresql://user:pass@prod-db-host:5432/django_prod_db
DEBUG=False
SECRET_KEY=<production-django-secret>
ALLOWED_HOSTS=api.varsigram.com
```

### 6. Generate Secure JWT_SECRET

```python
# In Python shell
import secrets
print(secrets.token_urlsafe(32))
# Copy this value and use it in both Django and Node.js!
```

### 7. Test JWT Token Generation

```bash
# Start Django server
python manage.py runserver

# Test login endpoint
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpass"}'

# Should return:
# {
#   "access": "eyJ0eXAi...",
#   "refresh": "eyJ0eXAi..."
# }
```

### 8. Verify Token Payload

Go to https://jwt.io and paste the `access` token.

**Must contain:**
```json
{
  "token_type": "access",
  "exp": 1729209600,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",  // ← Required!
  "email": "user@example.com",
  "username": "testuser"
}
```

### 9. Share JWT_SECRET with Node.js Team

**⚠️ IMPORTANT:** Share the JWT_SECRET securely with the Node.js developer.

Methods:
- Password manager (1Password, LastPass)
- Encrypted message
- Secret management tool (AWS Secrets Manager, Azure Key Vault)

**DO NOT:**
- Send via plain email
- Post in public chat
- Commit to Git

### 10. Production Deployment Prep

- [ ] Run migrations: `python manage.py migrate`
- [ ] Collect static files: `python manage.py collectstatic`
- [ ] Create superuser: `python manage.py createsuperuser`
- [ ] Test all endpoints
- [ ] Update CORS_ALLOWED_ORIGINS with production domains
- [ ] Set DEBUG=False
- [ ] Provide .env values to DevOps

---

## ✅ Completion Checklist

- [ ] Packages installed
- [ ] settings.py updated with JWT config
- [ ] Custom token serializer created
- [ ] user_id included in JWT payload
- [ ] Login endpoint created
- [ ] CORS configured for Node.js subdomain
- [ ] JWT_SECRET generated and shared securely
- [ ] Token generation tested
- [ ] Token payload verified (contains user_id)
- [ ] Production settings configured
- [ ] Environment variables documented

---

## 📞 Contact

**Send to Node.js Developer:**
- JWT_SECRET (securely!)
- API endpoint: `https://api.varsigram.com/api/auth/login/`
- Token payload structure

**Send to DevOps:**
- Production environment variables
- Database migration files
- Static files location
- Required Python version

---

## 🐛 Troubleshooting

**Problem:** Token doesn't include user_id

**Solution:** Make sure you're using CustomTokenObtainPairSerializer, not the default one.

---

**Problem:** CORS errors from Node.js

**Solution:** Add Node.js domain to CORS_ALLOWED_ORIGINS in settings.py

---

**Problem:** Token validation fails in Node.js

**Solution:** Verify JWT_SECRET is exactly the same in both services (no extra spaces, same capitalization).

---

## 📚 Documentation References

- [Django REST Framework Simple JWT](https://django-rest-framework-simplejwt.readthedocs.io/)
- [Django CORS Headers](https://github.com/adamchainz/django-cors-headers)
- Full integration guide: `../DJANGO_INTEGRATION.md`
