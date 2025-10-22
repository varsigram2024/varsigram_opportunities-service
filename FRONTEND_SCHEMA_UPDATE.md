# Frontend Schema Update

## Date: October 22, 2025

## Summary
Updated the Opportunity model to match frontend type definitions for better integration with the mobile app.

## New Fields Added

### 1. **contactEmail** (String?, optional)
- Maps to: `contact_email` in database
- Purpose: Email address to contact about the opportunity
- Example: `"recruitment@techcorp.com"`

### 2. **organization** (String?, optional)
- Purpose: Name of the organization/company posting the opportunity
- Example: `"TechCorp Nigeria"`, `"Varsigram Foundation"`

### 3. **image** (String?, optional)
- Purpose: URL or path to opportunity banner/logo image
- Max length: 500 characters
- Example: `"https://cdn.example.com/images/opportunity-banner.jpg"`

### 4. **applicants** (Int, default: 0)
- Purpose: Counter for number of applicants
- Frontend can use this for displaying popularity
- Example: `42`

### 5. **excerpt** (String?, optional)
- Purpose: Short summary/preview text (first ~150 chars)
- Max length: 500 characters
- Frontend uses this for card previews in lists
- Example: `"Join our summer internship program and gain hands-on experience..."`

### 6. **requirements** (String?, optional)
- Purpose: Detailed requirements/qualifications needed
- Can be formatted text (markdown, plain text, etc.)
- Example: `"- Bachelor's degree in CS\n- 2+ years experience\n- Proficient in TypeScript"`

### 7. **tags** (String[], default: [])
- Purpose: Array of tags/keywords for filtering and search
- Examples: `["remote", "full-time", "tech"]`, `["undergraduate", "stem"]`

### 8. **deadline** (DateTime?, optional)
- Note: Renamed from `application_deadline` to `deadline` to match frontend
- Purpose: Application deadline date
- Frontend receives as ISO string

## Migration Details

**Migration Name:** `20251022190413_add_frontend_fields`

**Changes:**
- Dropped column: `application_deadline`
- Added column: `deadline` (renamed)
- Added 7 new columns: `contact_email`, `organization`, `image`, `applicants`, `excerpt`, `requirements`, `tags`

## Backend Changes Needed

### 1. Update Validation Schemas
Update `src/validation/opportunityValidation.ts` to include new fields:

```typescript
export const createOpportunitySchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().min(10),
  category: z.enum(['INTERNSHIP', 'SCHOLARSHIP', 'COMPETITION', 'GIG', 'PITCH', 'OTHER']),
  location: z.string().max(255).optional(),
  isRemote: z.boolean().default(false),
  deadline: z.string().datetime().optional(),
  contactEmail: z.string().email().optional(),
  organization: z.string().max(255).optional(),
  image: z.string().url().max(500).optional(),
  excerpt: z.string().max(500).optional(),
  requirements: z.string().optional(),
  tags: z.array(z.string()).default([])
});
```

### 2. Update Controllers
Update `src/controllers/opportunityController.ts` to:
- Accept new fields in POST/PUT requests
- Return new fields in responses
- Update search to include tags, organization

### 3. Update Response Mapping
Ensure all endpoints return:
```typescript
{
  id: string,
  title: string,
  description: string,
  category: string,
  location: string | null,
  isRemote: boolean,
  deadline: string | null,  // ISO string
  contactEmail: string | null,
  organization: string | null,
  image: string | null,
  applicants: number,
  excerpt: string | null,
  requirements: string | null,
  tags: string[],
  createdAt: string,  // ISO string
  updatedAt: string,  // ISO string
  userId: number  // createdBy mapped to userId for frontend
}
```

## Frontend Compatibility

### Fields Mapping

| Frontend Field | Backend Field | Type | Notes |
|---------------|---------------|------|-------|
| `id` | `id` | string | UUID |
| `title` | `title` | string | Required |
| `description` | `description` | string | Required |
| `category` | `category` | enum | Required |
| `location` | `location` | string? | Optional |
| `isRemote` | `isRemote` | boolean | Default: false |
| `deadline` | `deadline` | ISO string | Optional |
| `contactEmail` | `contactEmail` | string? | Optional, NEW |
| `organization` | `organization` | string? | Optional, NEW |
| `image` | `image` | string? | Optional, NEW |
| `applicants` | `applicants` | number | Default: 0, NEW |
| `excerpt` | `excerpt` | string? | Optional, NEW |
| `requirements` | `requirements` | string? | Optional, NEW |
| `tags` | `tags` | string[] | Default: [], NEW |
| `postedAt` | `createdAt` | ISO string | Auto-generated |
| `createdAt` | `createdAt` | ISO string | Auto-generated |
| `updatedAt` | `updatedAt` | ISO string | Auto-generated |
| `userId` | `createdBy` | number | Auto from JWT |

## Testing Checklist

- [ ] Update validation schemas
- [ ] Update controller to handle new fields
- [ ] Test POST endpoint with new fields
- [ ] Test PUT endpoint with new fields
- [ ] Test GET endpoints return new fields
- [ ] Update search to filter by tags/organization
- [ ] Apply migration on staging database
- [ ] Test frontend integration
- [ ] Update API documentation

## Next Steps

1. **Immediate:**
   - Update validation schemas
   - Update controllers to accept/return new fields
   - Test locally

2. **Before Staging Deployment:**
   - Commit and push migration files
   - Coordinate with DevOps to apply migration on staging
   - Update `STAGING_FIX_REQUIRED.md` with new migration

3. **Mobile Team Coordination:**
   - Share updated API documentation
   - Provide example requests/responses with new fields
   - Confirm field naming conventions match expectations

## Example API Request (POST)

```json
POST /api/v1/opportunities
Authorization: Bearer <JWT_TOKEN>

{
  "title": "Summer Internship 2025",
  "description": "Join our engineering team for a 3-month internship program...",
  "category": "INTERNSHIP",
  "organization": "TechCorp Nigeria",
  "location": "Lagos, Nigeria",
  "isRemote": false,
  "deadline": "2025-12-31T23:59:59Z",
  "contactEmail": "internships@techcorp.ng",
  "image": "https://cdn.techcorp.ng/images/internship-2025.jpg",
  "excerpt": "Join our engineering team for a 3-month internship program...",
  "requirements": "- Currently enrolled in Computer Science\n- Knowledge of JavaScript/TypeScript\n- Available for 3 months",
  "tags": ["engineering", "summer", "paid", "tech"]
}
```

## Example API Response (GET)

```json
{
  "success": true,
  "data": {
    "id": "d317cdf5-a66a-410f-8daf-525c07f28531",
    "title": "Summer Internship 2025",
    "description": "Join our engineering team for a 3-month internship program...",
    "category": "INTERNSHIP",
    "organization": "TechCorp Nigeria",
    "location": "Lagos, Nigeria",
    "isRemote": false,
    "deadline": "2025-12-31T23:59:59.000Z",
    "contactEmail": "internships@techcorp.ng",
    "image": "https://cdn.techcorp.ng/images/internship-2025.jpg",
    "applicants": 0,
    "excerpt": "Join our engineering team for a 3-month internship program...",
    "requirements": "- Currently enrolled in Computer Science\n- Knowledge of JavaScript/TypeScript\n- Available for 3 months",
    "tags": ["engineering", "summer", "paid", "tech"],
    "createdAt": "2025-10-22T19:04:13.000Z",
    "updatedAt": "2025-10-22T19:04:13.000Z",
    "userId": 2
  }
}
```
