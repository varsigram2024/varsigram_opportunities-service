# ⚠️ IMPORTANT: Django Login Endpoint Update

## Correct Django Login Endpoint

**The actual Django login endpoint is:**

```
POST /api/v1/login
```

**NOT:** ~~`/api/auth/login/`~~ (This was a placeholder in documentation)

---

## Updated Files

The following files have been updated with the correct endpoint:

✅ `test-integration.js` - Integration test script  
✅ `docs/INTEGRATION_TEST_GUIDE.md`  
✅ `docs/API_DOCUMENTATION.md`  
✅ `QUICK_START.md`  
✅ `DEPLOYMENT_SUMMARY.md`  
✅ `docs/DJANGO_ENDPOINTS.md` - **NEW FILE** with complete Django endpoint reference  

---

## Quick Reference

### Get JWT Token from Django

```bash
# Development
curl -X POST http://localhost:8000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}'

# Production
curl -X POST https://api.varsigram.com/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"username":"your-username","password":"your-password"}'
```

### PowerShell

```powershell
curl -X POST http://localhost:8000/api/v1/login `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"testuser\",\"password\":\"testpass\"}'
```

### Save Token to Variable

```bash
# Bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}' \
  | jq -r '.access')

# PowerShell
$response = curl -X POST http://localhost:8000/api/v1/login `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"testuser\",\"password\":\"testpass\"}' | ConvertFrom-Json
$token = $response.access
```

---

## Testing Integration

```bash
# 1. Get token from Django
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}' \
  | jq -r '.access')

# 2. Test Node.js service with the token
node test-integration.js $TOKEN
```

---

## For Reference

If you see `/api/auth/login/` in older documentation files, replace it mentally with `/api/v1/login`.

The most up-to-date reference is: **`docs/DJANGO_ENDPOINTS.md`**

---

Last Updated: October 20, 2025
