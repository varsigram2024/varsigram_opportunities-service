# Django Backend Integration Guide

## Overview
This guide shows how to configure your Django backend to work with the Node.js Opportunities microservice using shared JWT authentication.

---

## Django Setup (Python)

### 1. Install Required Packages

```bash
pip install djangorestframework
pip install djangorestframework-simplejwt
pip install python-decouple
```

### 2. Django Settings Configuration

```python
# settings.py
from datetime import timedelta
from decouple import config

INSTALLED_APPS = [
    # ... other apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ... other middleware
]

# CORS Settings (allow Node.js service to verify tokens)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Your Node.js service
    # Add production URLs here
]

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

# JWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': config('JWT_SECRET'),  # MUST BE THE SAME as Node.js
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
}

# IMPORTANT: Use the same secret for both Django and Node.js
JWT_SECRET = config('JWT_SECRET', default='your-super-secret-key-change-this')
```

### 3. Create .env file in Django project

```bash
# Django .env
JWT_SECRET=your-super-secret-key-change-this-in-production
DATABASE_URL=postgresql://user:password@localhost:5432/django_db
```

### 4. Django URLs Configuration

```python
# urls.py
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    # ... other URLs
    
    # JWT Authentication endpoints
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
```

### 5. Custom JWT Payload (Optional but Recommended)

Create a custom serializer to include user ID in the token:

```python
# serializers.py
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['user_id'] = str(user.id)  # IMPORTANT: Node.js reads this
        token['email'] = user.email
        token['role'] = 'user'  # or user.role if you have roles
        
        return token

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
```

Then update urls.py:

```python
# urls.py
from .serializers import CustomTokenObtainPairView

urlpatterns = [
    path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    # ... rest of URLs
]
```

---

## Testing Django JWT Token Generation

### 1. Start Django Server

```bash
python manage.py runserver
```

### 2. Test Login Endpoint

```bash
# Using curl
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpassword"
  }'
```

### 3. Expected Response

```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### 4. Decode Token to Verify Payload

Go to https://jwt.io and paste the `access` token. You should see:

```json
{
  "token_type": "access",
  "exp": 1729123456,
  "iat": 1729037056,
  "jti": "abc123...",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "role": "user"
}
```

---

## Mobile App Flow

### 1. User Login (Django)

```javascript
// React Native / Mobile App
const login = async (username, password) => {
  const response = await fetch('http://your-django-backend.com/api/auth/login/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  const data = await response.json();
  
  // Store tokens
  await AsyncStorage.setItem('access_token', data.access);
  await AsyncStorage.setItem('refresh_token', data.refresh);
  
  return data;
};
```

### 2. Create Opportunity (Node.js)

```javascript
// Using the same token from Django
const createOpportunity = async (opportunityData) => {
  const token = await AsyncStorage.getItem('access_token');
  
  const response = await fetch('http://nodejs-service.com/api/v1/opportunities', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`  // Same token from Django!
    },
    body: JSON.stringify(opportunityData)
  });
  
  return await response.json();
};
```

---

## Environment Variables Sync

### Django .env
```bash
JWT_SECRET=your-super-secret-key-change-this-in-production
DATABASE_URL=postgresql://user:password@localhost:5432/django_db
```

### Node.js .env
```bash
JWT_SECRET=your-super-secret-key-change-this-in-production  # MUST MATCH!
DATABASE_URL=postgresql://user:password@localhost:5432/nodejs_db
PORT=3000
NODE_ENV=development
```

⚠️ **CRITICAL**: `JWT_SECRET` MUST be exactly the same in both services!

---

## Troubleshooting

### Error: "Invalid token"
- Check that `JWT_SECRET` is the same in both Django and Node.js
- Verify token is being sent with `Bearer ` prefix
- Check token hasn't expired

### Error: "User not authenticated"
- Ensure `Authorization` header is present
- Check token format: `Authorization: Bearer <token>`
- Verify Django is generating tokens correctly

### Error: "Token expired"
- Get a new token from Django login endpoint
- Or implement token refresh logic

---

## Production Checklist

- [ ] Use strong, random JWT_SECRET (at least 32 characters)
- [ ] Store JWT_SECRET in environment variables, not in code
- [ ] Use HTTPS for all API calls
- [ ] Set appropriate token expiration times
- [ ] Implement token refresh logic
- [ ] Add rate limiting on both services
- [ ] Enable CORS only for trusted origins
- [ ] Use different database instances for Django and Node.js
- [ ] Monitor and log authentication failures
