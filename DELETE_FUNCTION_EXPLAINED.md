# 🗑️ Delete Opportunity Function - How It Works

## Date: November 10, 2025

---

## 📍 Location
- **File:** `src/controllers/opportunityController.ts`
- **Function:** `deleteOpportunity`
- **Route:** `DELETE /api/v1/opportunities/:id`
- **Protection:** Requires JWT authentication via `authMiddleware`

---

## 🔒 Security Model: **Owner-Only Deletion**

The delete function implements a **strict ownership model** - only the user who created an opportunity can delete it.

---

## 🔄 How It Works (Step-by-Step)

### Step 1: **Route Protection** (Before Function Runs)
```typescript
router.delete('/:id', authMiddleware, deleteOpportunity);
```

**What happens:**
- Request must include `Authorization: Bearer <JWT_TOKEN>` header
- `authMiddleware` validates the JWT token
- Token must be from Django backend (shared `JWT_SECRET`)
- Extracts `user_id` from token and attaches to `req.user.id`
- If token is invalid/expired → **401 Unauthorized** (never reaches delete function)

---

### Step 2: **Extract Opportunity ID from URL**
```typescript
const { id } = req.params;
```

**Example:**
- URL: `DELETE /api/v1/opportunities/d317cdf5-a66a-410f-8daf-525c07f28531`
- `id` = `"d317cdf5-a66a-410f-8daf-525c07f28531"`

---

### Step 3: **Check if Opportunity Exists**
```typescript
const existingOpportunity = await prisma.opportunity.findUnique({
  where: { id }
});

if (!existingOpportunity) {
  res.status(404).json({
    error: 'Opportunity not found'
  });
  return;
}
```

**What happens:**
- Queries database for opportunity with that UUID
- If **not found** → **404 Not Found**
- If **found** → Proceeds to ownership check

**Why this check?**
- Prevents deletion of non-existent IDs
- Provides clear error message to user
- Needed to get `createdBy` field for ownership check

---

### Step 4: **Verify User Authentication**
```typescript
if (!req.user?.id) {
  res.status(401).json({
    error: 'User not authenticated'
  });
  return;
}
```

**What happens:**
- Double-checks user data exists (should always be true after middleware)
- Safety net in case middleware fails
- If no user → **401 Unauthorized**

---

### Step 5: **Check Ownership** ⚠️ **CRITICAL SECURITY CHECK**
```typescript
if (existingOpportunity.createdBy !== req.user.id) {
  res.status(403).json({
    error: 'You do not have permission to delete this opportunity'
  });
  return;
}
```

**What happens:**
- Compares `createdBy` (from database) with `req.user.id` (from JWT token)
- `createdBy` is an **integer** (user ID from Django)
- `req.user.id` is also an **integer** (extracted from JWT token)
- If **IDs don't match** → **403 Forbidden** ❌
- If **IDs match** → User is the owner ✅

**Example Scenario:**
```
User A (user_id: 2) created opportunity X
User B (user_id: 5) tries to delete opportunity X

Check: X.createdBy (2) !== B.id (5)
Result: 403 Forbidden - "You do not have permission to delete this opportunity"
```

---

### Step 6: **Perform Deletion** (Only if All Checks Pass)
```typescript
await prisma.opportunity.delete({
  where: { id }
});
```

**What happens:**
- **Permanently removes** the opportunity from database
- **Hard delete** - data is gone forever (no soft delete)
- No undo/restore functionality
- All related data is lost (title, description, tags, etc.)

---

### Step 7: **Return Success Response**
```typescript
res.json({
  message: 'Opportunity deleted successfully!'
});
```

**Response:**
- **Status Code:** 200 OK
- **Body:** `{ "message": "Opportunity deleted successfully!" }`

---

### Step 8: **Error Handling**
```typescript
catch (err: unknown) {
  console.error('Error deleting opportunity:', err);
  res.status(400).json({
    error: 'Failed to delete opportunity',
    details: err instanceof Error ? err.message : 'Unknown error'
  });
}
```

**Handles:**
- Database connection errors
- Invalid UUID format
- Any unexpected errors
- Returns **400 Bad Request** with error details

---

## 🔐 Security Layers

The delete function has **5 security layers**:

1. **JWT Authentication** (middleware) - Must be logged in
2. **Token Validation** - Token must be valid & not expired
3. **Existence Check** - Opportunity must exist
4. **User Verification** - User data must be present
5. **Ownership Verification** - Must be the creator

---

## 📊 Possible Responses

### ✅ Success (200 OK)
```json
{
  "message": "Opportunity deleted successfully!"
}
```

### ❌ No Token (401 Unauthorized)
```json
{
  "error": "No authorization token provided"
}
```

### ❌ Invalid/Expired Token (401 Unauthorized)
```json
{
  "error": "Token expired"
}
```

### ❌ Opportunity Not Found (404 Not Found)
```json
{
  "error": "Opportunity not found"
}
```

### ❌ Not the Owner (403 Forbidden)
```json
{
  "error": "You do not have permission to delete this opportunity"
}
```

### ❌ Database Error (400 Bad Request)
```json
{
  "error": "Failed to delete opportunity",
  "details": "Database connection error"
}
```

---

## 🧪 Testing Examples

### Test 1: Successful Deletion (Owner)
```powershell
# User with ID 2 deletes their own opportunity
$headers = @{
    "Authorization" = "Bearer <JWT_TOKEN_USER_2>"
}

Invoke-WebRequest -Uri "https://staging.opportunities.varsigram.com/api/v1/opportunities/<OPPORTUNITY_ID>" `
    -Method DELETE `
    -Headers $headers

# Result: 200 OK ✅
```

### Test 2: Unauthorized (No Token)
```powershell
# No authorization header
Invoke-WebRequest -Uri "https://staging.opportunities.varsigram.com/api/v1/opportunities/<OPPORTUNITY_ID>" `
    -Method DELETE

# Result: 401 Unauthorized ❌
```

### Test 3: Forbidden (Wrong User)
```powershell
# User 5 tries to delete User 2's opportunity
$headers = @{
    "Authorization" = "Bearer <JWT_TOKEN_USER_5>"
}

Invoke-WebRequest -Uri "https://staging.opportunities.varsigram.com/api/v1/opportunities/<OPPORTUNITY_ID>" `
    -Method DELETE `
    -Headers $headers

# Result: 403 Forbidden ❌
```

### Test 4: Not Found
```powershell
# Invalid/non-existent opportunity ID
$headers = @{
    "Authorization" = "Bearer <JWT_TOKEN>"
}

Invoke-WebRequest -Uri "https://staging.opportunities.varsigram.com/api/v1/opportunities/00000000-0000-0000-0000-000000000000" `
    -Method DELETE `
    -Headers $headers

# Result: 404 Not Found ❌
```

---

## ⚠️ Important Considerations

### 1. **Permanent Deletion**
- No soft delete or "trash" functionality
- Once deleted, data is **gone forever**
- Consider implementing soft delete if you need:
  - Undo functionality
  - Audit trail
  - Data recovery
  - Legal compliance (data retention)

### 2. **No Admin Override**
- Even admins can't delete other users' opportunities
- Only the creator can delete
- To add admin delete:
  ```typescript
  if (existingOpportunity.createdBy !== req.user.id && !req.user.isAdmin) {
    // Forbidden
  }
  ```

### 3. **No Cascade Checks**
- Doesn't check if opportunity has applicants
- Doesn't notify users who bookmarked it
- No validation of deadline (can delete active opportunities)

### 4. **Race Conditions**
- Two requests can check existence simultaneously
- Second one might fail after first deletes
- Database handles this gracefully (second gets 404)

---

## 🎯 Flow Diagram

```
User Request: DELETE /api/v1/opportunities/:id
              with Authorization header
                      |
                      v
            [authMiddleware]
              Validate JWT
                      |
         Valid?  ----NO----> 401 Unauthorized
                      |
                     YES
                      v
           [deleteOpportunity]
          Extract id from URL
                      |
                      v
         Query database for id
                      |
        Exists? ----NO----> 404 Not Found
                      |
                     YES
                      v
         User authenticated?
                      |
            NO ---> 401 Unauthorized
                      |
                     YES
                      v
    createdBy === user.id ?
                      |
            NO ---> 403 Forbidden
                      |
                     YES
                      v
         DELETE FROM database
                      |
                      v
         200 OK - Success! ✅
```

---

## 🔧 Potential Improvements

### 1. **Add Soft Delete**
```typescript
// Instead of hard delete:
await prisma.opportunity.update({
  where: { id },
  data: { 
    isDeleted: true,
    deletedAt: new Date(),
    deletedBy: req.user.id
  }
});
```

### 2. **Add Admin Override**
```typescript
const isOwner = existingOpportunity.createdBy === req.user.id;
const isAdmin = req.user.role === 'admin';

if (!isOwner && !isAdmin) {
  res.status(403).json({ error: 'Forbidden' });
  return;
}
```

### 3. **Add Deletion Logging**
```typescript
// Log deletion for audit trail
await prisma.deletionLog.create({
  data: {
    opportunityId: id,
    deletedBy: req.user.id,
    deletedAt: new Date(),
    opportunityTitle: existingOpportunity.title
  }
});
```

### 4. **Prevent Active Opportunity Deletion**
```typescript
// Don't allow deletion if deadline hasn't passed
if (existingOpportunity.deadline && existingOpportunity.deadline > new Date()) {
  res.status(400).json({
    error: 'Cannot delete active opportunity before deadline'
  });
  return;
}
```

---

## 📚 Summary

**The delete function:**
- ✅ Requires authentication (JWT token)
- ✅ Validates opportunity exists
- ✅ Enforces ownership (creator only)
- ✅ Permanently removes data (hard delete)
- ✅ Returns clear success/error messages
- ❌ No soft delete
- ❌ No admin override
- ❌ No undo functionality

**Use Cases:**
- User wants to remove their posted opportunity
- Opportunity was posted by mistake
- Opportunity no longer relevant

**Alternative to Deletion:**
- Consider soft delete for better user experience
- Allow editing instead of deletion
- Mark as "closed" rather than deleting
