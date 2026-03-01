# 👤 Differentiating Opportunity Poster vs Other Users

## Date: November 10, 2025

---

## ❌ **Current State: NO DIFFERENTIATION**

Currently, there's **NO way** for the frontend to differentiate between:
- The **poster** (creator) of an opportunity
- **Other users** viewing the opportunity

### What's Currently Available:
```json
{
  "id": "3313e462-b793-4e5c-989a-de23e1b13996",
  "title": "Summer Internship",
  "description": "...",
  "createdBy": 1,    // ← User ID of creator (just a number)
  "createdAt": "2025-10-24T10:46:30.214Z",
  // ... other fields
}
```

### The Problem:
- ✅ API returns `createdBy` (user ID number)
- ❌ Frontend doesn't know the **current logged-in user's ID**
- ❌ No way to compare if `createdBy === currentUserId`
- ❌ No `isOwner` flag in response

---

## 🎯 **Solutions to Differentiate Poster vs Viewer**

### **Option 1: Add `isOwner` Field to Response** ⭐ **RECOMMENDED**

Modify the GET endpoints to include an `isOwner` boolean flag.

#### Implementation:

**Update `getOpportunityById` controller:**
```typescript
export const getOpportunityById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const opportunity = await prisma.opportunity.findUnique({
      where: { id }
    });
    
    if (!opportunity) {
      res.status(404).json({
        error: 'Opportunity not found'
      });
      return;
    }
    
    // ✨ NEW: Check if current user is the owner
    const isOwner = req.user?.id ? opportunity.createdBy === req.user.id : false;
    
    res.json({
      data: {
        ...opportunity,
        isOwner  // ✨ Add this field
      }
    });
  } catch (err: unknown) {
    console.error('Error fetching opportunity:', err);
    res.status(500).json({
      error: 'Failed to fetch opportunity',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};
```

**Update `getAllOpportunities` controller:**
```typescript
export const getAllOpportunities = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, category, location, isRemote } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    if (category) where.category = category;
    if (location) where.location = { contains: location as string, mode: 'insensitive' };
    if (isRemote !== undefined) where.isRemote = isRemote === 'true';
    
    const [opportunities, total] = await Promise.all([
      prisma.opportunity.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.opportunity.count({ where })
    ]);
    
    // ✨ NEW: Add isOwner to each opportunity
    const currentUserId = req.user?.id;
    const opportunitiesWithOwnership = opportunities.map(opp => ({
      ...opp,
      isOwner: currentUserId ? opp.createdBy === currentUserId : false
    }));
    
    res.json({
      data: opportunitiesWithOwnership,  // ✨ Changed
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        hasMore: skip + Number(limit) < total
      }
    });
  } catch (err: unknown) {
    console.error('Error fetching opportunities:', err);
    res.status(500).json({
      error: 'Failed to fetch opportunities',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
};
```

#### Response Example:
```json
{
  "data": {
    "id": "3313e462-b793-4e5c-989a-de23e1b13996",
    "title": "Summer Internship",
    "description": "...",
    "createdBy": 2,
    "isOwner": true,    // ✨ NEW FIELD
    "createdAt": "2025-10-24T10:46:30.214Z"
  }
}
```

#### Frontend Usage:
```typescript
// Mobile App / Frontend
if (opportunity.isOwner) {
  // Show Edit/Delete buttons
  return (
    <OpportunityCard>
      <Title>{opportunity.title}</Title>
      <ActionButtons>
        <EditButton onClick={handleEdit} />
        <DeleteButton onClick={handleDelete} />
      </ActionButtons>
    </OpportunityCard>
  );
} else {
  // Show Apply button
  return (
    <OpportunityCard>
      <Title>{opportunity.title}</Title>
      <ApplyButton onClick={handleApply} />
    </OpportunityCard>
  );
}
```

**Pros:**
- ✅ Simple to implement
- ✅ Works for both authenticated and unauthenticated users
- ✅ No frontend logic needed (backend handles comparison)
- ✅ Clear and explicit

**Cons:**
- ❌ Requires backend changes
- ❌ Need to update all GET endpoints

---

### **Option 2: Return Current User Info in Auth Response**

Include user ID in the login/token response, then frontend compares.

#### Implementation:

**Django Login Response:**
```json
{
  "message": "Login successful",
  "access": "eyJhbGci...",
  "refresh": "eyJhbGci...",
  "user": {
    "id": 2,           // ✨ Include user ID
    "username": "john",
    "email": "john@example.com"
  }
}
```

#### Frontend Storage:
```typescript
// Store user ID on login
localStorage.setItem('userId', user.id);

// Compare when viewing opportunity
const currentUserId = localStorage.getItem('userId');
const isOwner = opportunity.createdBy === parseInt(currentUserId);

if (isOwner) {
  // Show edit/delete options
} else {
  // Show apply button
}
```

**Pros:**
- ✅ No backend changes to opportunities service
- ✅ Frontend has full control
- ✅ Can work offline (cached user ID)

**Cons:**
- ❌ Requires Django backend changes
- ❌ Frontend must handle comparison logic
- ❌ User ID exposed in localStorage (minor security concern)
- ❌ Needs to parse integers correctly

---

### **Option 3: Decode JWT Token on Frontend**

Frontend decodes the JWT token to extract user ID.

#### Implementation:

```typescript
// Install: npm install jwt-decode
import jwtDecode from 'jwt-decode';

// Decode token
const token = localStorage.getItem('access_token');
const decoded = jwtDecode(token);
const currentUserId = decoded.user_id;

// Compare
const isOwner = opportunity.createdBy === currentUserId;
```

**Pros:**
- ✅ No backend changes needed
- ✅ No additional API calls
- ✅ User ID from secure source (JWT)

**Cons:**
- ❌ Adds dependency (jwt-decode library)
- ❌ Exposes JWT structure to frontend
- ❌ Must decode on every opportunity view
- ❌ Performance overhead

---

### **Option 4: Add `/me` Endpoint**

Create an endpoint to get current user info.

#### Implementation:

**Backend:**
```typescript
// src/controllers/userController.ts
export const getCurrentUser = async (req: Request, res: Response) => {
  res.json({
    data: {
      id: req.user.id,
      // Could fetch more user info from Django if needed
    }
  });
};

// Route
router.get('/me', authMiddleware, getCurrentUser);
```

**Frontend:**
```typescript
// On app load, fetch current user
const response = await fetch('/api/v1/users/me', {
  headers: { Authorization: `Bearer ${token}` }
});
const { id: currentUserId } = await response.json();

// Store and compare
const isOwner = opportunity.createdBy === currentUserId;
```

**Pros:**
- ✅ Clean separation of concerns
- ✅ Can return additional user info
- ✅ RESTful pattern

**Cons:**
- ❌ Extra API call on app load
- ❌ Requires backend implementation
- ❌ Frontend must store user ID

---

## 🎨 **Frontend Use Cases**

Once you can differentiate poster vs viewer:

### **1. Conditional UI Rendering**

```typescript
// Poster sees Edit/Delete
{opportunity.isOwner && (
  <ActionMenu>
    <MenuItem icon="edit" onClick={editOpportunity}>
      Edit Opportunity
    </MenuItem>
    <MenuItem icon="delete" onClick={deleteOpportunity} danger>
      Delete Opportunity
    </MenuItem>
    <MenuItem icon="stats" onClick={viewAnalytics}>
      View Analytics (42 applicants)
    </MenuItem>
  </ActionMenu>
)}

// Viewers see Apply
{!opportunity.isOwner && (
  <ApplyButton 
    disabled={isPastDeadline(opportunity.deadline)}
    onClick={handleApply}
  >
    Apply Now
  </ApplyButton>
)}
```

### **2. Different Detail Views**

```typescript
if (opportunity.isOwner) {
  // Poster Dashboard View
  return (
    <OwnerView>
      <Stats>
        <Stat label="Views" value={opportunity.views} />
        <Stat label="Applicants" value={opportunity.applicants} />
        <Stat label="Shares" value={opportunity.shares} />
      </Stats>
      <ApplicantsList />
      <ManageActions />
    </OwnerView>
  );
} else {
  // Public View
  return (
    <PublicView>
      <OpportunityDetails />
      <ApplyForm />
    </PublicView>
  );
}
```

### **3. List View Badges**

```typescript
{opportunities.map(opp => (
  <OpportunityCard key={opp.id}>
    {opp.isOwner && (
      <Badge color="blue">Your Post</Badge>
    )}
    <Title>{opp.title}</Title>
    {/* ... */}
  </OpportunityCard>
))}
```

### **4. Notifications & Alerts**

```typescript
if (opportunity.isOwner) {
  showNotification({
    title: 'New Applicant',
    message: 'Sarah Johnson applied to your opportunity',
    action: 'View Application'
  });
}
```

---

## 📊 **Comparison Table**

| Solution | Backend Changes | Frontend Complexity | Security | Performance | Recommended |
|----------|----------------|---------------------|----------|-------------|-------------|
| **Option 1: isOwner field** | Medium | Low | ✅ High | ✅ Best | ⭐ **YES** |
| **Option 2: User in login** | Low (Django) | Medium | ⚠️ Medium | ✅ Good | Maybe |
| **Option 3: Decode JWT** | None | Medium | ⚠️ Medium | ⚠️ Overhead | No |
| **Option 4: /me endpoint** | Medium | Medium | ✅ High | ⚠️ Extra call | Maybe |

---

## ✅ **Recommended Solution: Option 1**

**Add `isOwner` field to all GET responses**

### Why?
1. ✅ **Backend handles logic** - No frontend comparison needed
2. ✅ **Works for guests** - Returns `false` for unauthenticated users
3. ✅ **Consistent** - Same logic across all endpoints
4. ✅ **Secure** - Comparison done server-side
5. ✅ **Simple** - Just one boolean field

### Implementation Steps:

1. **Update controllers** (getOpportunityById, getAllOpportunities, searchOpportunities)
2. **Add TypeScript type**
   ```typescript
   interface OpportunityResponse extends Opportunity {
     isOwner: boolean;
   }
   ```
3. **Test with authenticated and unauthenticated requests**
4. **Update frontend to use `isOwner` flag**

---

## 🧪 **Testing the Solution**

### Test 1: Owner Viewing Their Own Post
```powershell
# Login as User 2
$token = "eyJhbGci..." # User 2's token

# Get opportunity created by User 2
$headers = @{"Authorization" = "Bearer $token"}
Invoke-WebRequest -Uri "https://staging.opportunities.varsigram.com/api/v1/opportunities/<ID>" -Headers $headers

# Expected Response:
# {
#   "data": {
#     "id": "...",
#     "createdBy": 2,
#     "isOwner": true  ✅
#   }
# }
```

### Test 2: Other User Viewing Post
```powershell
# Login as User 5
$token = "eyJhbGci..." # User 5's token

# Get opportunity created by User 2
$headers = @{"Authorization" = "Bearer $token"}
Invoke-WebRequest -Uri "https://staging.opportunities.varsigram.com/api/v1/opportunities/<ID>" -Headers $headers

# Expected Response:
# {
#   "data": {
#     "id": "...",
#     "createdBy": 2,
#     "isOwner": false  ❌
#   }
# }
```

### Test 3: Unauthenticated User (Guest)
```powershell
# No token
Invoke-WebRequest -Uri "https://staging.opportunities.varsigram.com/api/v1/opportunities/<ID>"

# Expected Response:
# {
#   "data": {
#     "id": "...",
#     "createdBy": 2,
#     "isOwner": false  ❌ (guest can't be owner)
#   }
# }
```

---

## 🚀 **Next Steps**

Would you like me to:
1. **Implement Option 1** (Add `isOwner` field to responses)?
2. **Show detailed code changes** for all affected endpoints?
3. **Create migration/update documentation**?
4. **Test on staging** after implementation?

Let me know and I'll implement the solution! 🎯
