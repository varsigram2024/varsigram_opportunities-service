# 📚 Opportunities API Documentation

## Base URL

**Development:** `http://localhost:3000/api/v1`  
**Production:** `https://opportunities.varsigram.com/api/v1`

---

## Authentication

All protected endpoints require JWT authentication from Django backend.

### Headers
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Getting a Token
1. Login via Django backend: `POST https://api.varsigram.com/api/v1/login`
2. Copy the `access` token from response
3. Use in Authorization header: `Bearer <token>`

---

## Endpoints

### 1. Health Check

**GET** `/health` (root level, not under `/api/v1`)

Check if the service is running.

**Authentication:** None required

**Response:**
```json
{
  "status": "OK",
  "service": "Opportunities-service",
  "timestamp": "2025-10-20T12:34:56.789Z"
}
```

---

### 2. API Information

**GET** `/api/v1/`

Get API information and available endpoints.

**Authentication:** None required

**Response:**
```json
{
  "message": "Opportunities API",
  "version": "1.0.0",
  "endpoints": {
    "opportunities": "/api/v1/opportunities",
    "internships": "/api/v1/opportunities/category/internships",
    "scholarships": "/api/v1/opportunities/category/scholarships",
    "others": "/api/v1/opportunities/category/others",
    "search": "/api/v1/opportunities/search?q=keyword"
  }
}
```

---

### 3. Get All Opportunities

**GET** `/api/v1/opportunities`

Retrieve all opportunities with pagination.

**Authentication:** None required (public endpoint)

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Items per page

**Example Request:**
```bash
curl https://opportunities.varsigram.com/api/v1/opportunities?page=1&limit=10
```

**Response:**
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Software Engineering Internship",
      "description": "Great opportunity to learn backend development",
      "category": "INTERNSHIP",
      "location": "Lagos, Nigeria",
      "isRemote": false,
      "deadline": "2025-12-31T00:00:00.000Z",
      "createdBy": "user-uuid",
      "createdAt": "2025-10-20T12:00:00.000Z",
      "updatedAt": "2025-10-20T12:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

### 4. Get Opportunity by ID

**GET** `/api/v1/opportunities/:id`

Retrieve a specific opportunity.

**Authentication:** None required (public endpoint)

**Example Request:**
```bash
curl https://opportunities.varsigram.com/api/v1/opportunities/123e4567-e89b-12d3-a456-426614174000
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Software Engineering Internship",
  "description": "Great opportunity to learn backend development",
  "category": "INTERNSHIP",
  "location": "Lagos, Nigeria",
  "isRemote": false,
  "deadline": "2025-12-31T00:00:00.000Z",
  "createdBy": "user-uuid",
  "createdAt": "2025-10-20T12:00:00.000Z",
  "updatedAt": "2025-10-20T12:00:00.000Z"
}
```

**Error Response (404):**
```json
{
  "error": "Opportunity not found"
}
```

---

### 5. Create Opportunity

**POST** `/api/v1/opportunities`

Create a new opportunity.

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
  "title": "Software Engineering Internship",
  "description": "Great opportunity to learn backend development",
  "category": "INTERNSHIP",
  "location": "Lagos, Nigeria",
  "isRemote": false,
  "deadline": "2025-12-31"
}
```

**Required Fields:**
- `title` (string, max 255 chars)
- `description` (string)
- `category` (enum: INTERNSHIP, SCHOLARSHIP, COMPETITION, GIG, PITCH, OTHER)

**Optional Fields:**
- `location` (string, max 255 chars)
- `isRemote` (boolean, default: false)
- `deadline` (ISO date string)

**Example Request:**
```bash
curl -X POST https://opportunities.varsigram.com/api/v1/opportunities \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Software Engineering Internship",
    "description": "Great opportunity to learn backend development",
    "category": "INTERNSHIP",
    "location": "Lagos, Nigeria",
    "deadline": "2025-12-31"
  }'
```

**Response (201 Created):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Software Engineering Internship",
  "description": "Great opportunity to learn backend development",
  "category": "INTERNSHIP",
  "location": "Lagos, Nigeria",
  "isRemote": false,
  "deadline": "2025-12-31T00:00:00.000Z",
  "createdBy": "user-uuid-from-jwt",
  "createdAt": "2025-10-20T12:00:00.000Z",
  "updatedAt": "2025-10-20T12:00:00.000Z"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Authentication required",
  "message": "No token provided"
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Validation error",
  "details": [
    "\"title\" is required",
    "\"category\" must be one of [INTERNSHIP, SCHOLARSHIP, COMPETITION, GIG, PITCH, OTHER]"
  ]
}
```

---

### 6. Update Opportunity

**PUT** `/api/v1/opportunities/:id`

Update an existing opportunity (only the owner can update).

**Authentication:** Required (JWT token)

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "category": "SCHOLARSHIP",
  "location": "Remote",
  "isRemote": true,
  "deadline": "2026-01-31"
}
```

**Example Request:**
```bash
curl -X PUT https://opportunities.varsigram.com/api/v1/opportunities/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Software Engineering Internship",
    "isRemote": true
  }'
```

**Response (200 OK):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Updated Software Engineering Internship",
  "description": "Great opportunity to learn backend development",
  "category": "INTERNSHIP",
  "location": "Lagos, Nigeria",
  "isRemote": true,
  "deadline": "2025-12-31T00:00:00.000Z",
  "createdBy": "user-uuid",
  "createdAt": "2025-10-20T12:00:00.000Z",
  "updatedAt": "2025-10-20T14:30:00.000Z"
}
```

**Error Response (403 Forbidden):**
```json
{
  "error": "You are not authorized to update this opportunity"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Opportunity not found"
}
```

---

### 7. Delete Opportunity

**DELETE** `/api/v1/opportunities/:id`

Delete an opportunity (only the owner can delete).

**Authentication:** Required (JWT token)

**Example Request:**
```bash
curl -X DELETE https://opportunities.varsigram.com/api/v1/opportunities/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer <TOKEN>"
```

**Response (200 OK):**
```json
{
  "message": "Opportunity deleted successfully"
}
```

**Error Response (403 Forbidden):**
```json
{
  "error": "You are not authorized to delete this opportunity"
}
```

**Error Response (404 Not Found):**
```json
{
  "error": "Opportunity not found"
}
```

---

### 8. Search Opportunities

**GET** `/api/v1/opportunities/search`

Search opportunities by keyword, category, location, etc.

**Authentication:** None required (public endpoint)

**Query Parameters:**
- `q` (string) - Search keyword (searches in title and description)
- `category` (string) - Filter by category
- `location` (string) - Filter by location
- `isRemote` (boolean) - Filter remote opportunities
- `page` (number, default: 1)
- `limit` (number, default: 10)

**Example Requests:**
```bash
# Search by keyword
curl "https://opportunities.varsigram.com/api/v1/opportunities/search?q=software"

# Filter by category
curl "https://opportunities.varsigram.com/api/v1/opportunities/search?category=INTERNSHIP"

# Combine filters
curl "https://opportunities.varsigram.com/api/v1/opportunities/search?q=engineering&category=INTERNSHIP&isRemote=true"
```

**Response:**
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Software Engineering Internship",
      "description": "Great opportunity to learn backend development",
      "category": "INTERNSHIP",
      "location": "Lagos, Nigeria",
      "isRemote": false,
      "deadline": "2025-12-31T00:00:00.000Z",
      "createdBy": "user-uuid",
      "createdAt": "2025-10-20T12:00:00.000Z",
      "updatedAt": "2025-10-20T12:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

### 9. Get Internships

**GET** `/api/v1/opportunities/category/internships`

Get all internship opportunities.

**Authentication:** None required (public endpoint)

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)

**Example Request:**
```bash
curl https://opportunities.varsigram.com/api/v1/opportunities/category/internships
```

**Response:** Same format as "Get All Opportunities"

---

### 10. Get Scholarships

**GET** `/api/v1/opportunities/category/scholarships`

Get all scholarship opportunities.

**Authentication:** None required (public endpoint)

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)

**Example Request:**
```bash
curl https://opportunities.varsigram.com/api/v1/opportunities/category/scholarships
```

**Response:** Same format as "Get All Opportunities"

---

### 11. Get Others

**GET** `/api/v1/opportunities/category/others`

Get opportunities in categories: COMPETITION, GIG, PITCH, OTHER

**Authentication:** None required (public endpoint)

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)

**Example Request:**
```bash
curl https://opportunities.varsigram.com/api/v1/opportunities/category/others
```

**Response:** Same format as "Get All Opportunities"

---

## Error Responses

### Common HTTP Status Codes

- **200 OK** - Request successful
- **201 Created** - Resource created successfully
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Missing or invalid authentication token
- **403 Forbidden** - Not authorized to perform this action
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

### Error Response Format

```json
{
  "error": "Error message",
  "message": "Detailed error description",
  "details": [] // Optional, for validation errors
}
```

---

## Data Models

### Opportunity

```typescript
{
  id: string (UUID)
  title: string (max 255 chars)
  description: string
  category: "INTERNSHIP" | "SCHOLARSHIP" | "COMPETITION" | "GIG" | "PITCH" | "OTHER"
  location: string | null (max 255 chars)
  isRemote: boolean
  deadline: string (ISO date) | null
  createdBy: string (UUID)
  createdAt: string (ISO datetime)
  updatedAt: string (ISO datetime)
}
```

---

## Rate Limiting

- **Window:** 15 minutes
- **Max Requests:** 100 per window per IP
- When exceeded, returns **429 Too Many Requests**

---

## CORS

Allowed origins configured in production:
- `https://app.varsigram.com`
- `https://varsigram.com`

---

## Example Integration (Mobile App)

```javascript
// 1. Login via Django
const loginResponse = await fetch('https://api.varsigram.com/api/v1/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'user', password: 'pass' })
});
const { access } = await loginResponse.json();

// 2. Use token to create opportunity
const createResponse = await fetch('https://opportunities.varsigram.com/api/v1/opportunities', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${access}`
  },
  body: JSON.stringify({
    title: 'My Opportunity',
    description: 'Description here',
    category: 'INTERNSHIP',
    location: 'Lagos'
  })
});
const opportunity = await createResponse.json();
console.log('Created:', opportunity);
```

---

## Support

For issues or questions:
- Create GitHub issue
- Contact backend team
- Check logs: `pm2 logs opportunities-api`

---

**Last Updated:** October 20, 2025
