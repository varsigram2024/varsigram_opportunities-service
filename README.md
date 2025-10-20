# Opportunities Service - Node.js Backend

A TypeScript/Express microservice for managing opportunities (internships, scholarships, competitions, etc.) integrated with Django authentication.

## 🚀 Features

- ✅ CRUD operations for opportunities
- ✅ JWT authentication integration with Django backend
- ✅ Request validation with Joi
- ✅ Pagination & filtering
- ✅ Category-based filtering (internships, scholarships, others)
- ✅ Full-text search
- ✅ TypeScript with strict mode
- ✅ Prisma ORM with PostgreSQL
- ✅ Security headers (Helmet)
- ✅ CORS enabled
- ✅ Request compression

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Django backend with JWT authentication (for auth integration)

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update the following variables in `.env`:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/opportunities_db?schema=public"

# IMPORTANT: This MUST match your Django backend's JWT secret
JWT_SECRET="same-secret-as-django-backend"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio to view data
npm run prisma:studio
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start at `http://localhost:3000`

## 🔐 Authentication Integration with Django

### How It Works

1. **User Login (Django)**: Mobile app authenticates with Django backend and receives a JWT token
2. **Token Forwarding**: Mobile app includes the JWT token in requests to this Node.js service
3. **Token Validation**: This service validates the token using the shared `JWT_SECRET`
4. **User Context**: User info is extracted from token and available in `req.user`

### Django Configuration Required

Your Django backend must:

1. **Use the same JWT secret** as configured in this service's `.env`
2. **Include user ID in JWT payload** with one of these field names:
   - `user_id` (recommended for Django)
   - `userId`
   - `sub`
   - `id`

Example Django JWT payload:
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "role": "user",
  "exp": 1234567890
}
```

### Token Format

Requests must include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Protected vs Public Routes

**Public Routes** (No auth required):
- `GET /api/v1/opportunities` - List all opportunities
- `GET /api/v1/opportunities/search` - Search opportunities
- `GET /api/v1/opportunities/:id` - Get single opportunity
- `GET /api/v1/opportunities/category/internships` - Get internships
- `GET /api/v1/opportunities/category/scholarships` - Get scholarships
- `GET /api/v1/opportunities/category/others` - Get other opportunities

**Protected Routes** (Auth required):
- `POST /api/v1/opportunities` - Create opportunity
- `PUT /api/v1/opportunities/:id` - Update opportunity (owner only)
- `DELETE /api/v1/opportunities/:id` - Delete opportunity (owner only)

## 📡 API Endpoints

### Health Check
```http
GET /health
```

### Create Opportunity (Protected)
```http
POST /api/v1/opportunities
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Summer Internship at TechCorp",
  "description": "Great opportunity for software engineers",
  "category": "INTERNSHIP",
  "location": "San Francisco, CA",
  "isRemote": false,
  "deadline": "2025-12-31T23:59:59Z"
}
```

**Categories**: `INTERNSHIP`, `SCHOLARSHIP`, `COMPETITION`, `GIG`, `PITCH`, `OTHER`

### Get All Opportunities (Public)
```http
GET /api/v1/opportunities?page=1&limit=20&category=INTERNSHIP&isRemote=true
```

Query params:
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `category` (optional)
- `location` (optional, case-insensitive search)
- `isRemote` (optional, "true" or "false")

### Search Opportunities (Public)
```http
GET /api/v1/opportunities/search?q=software&page=1&limit=20
```

### Get Single Opportunity (Public)
```http
GET /api/v1/opportunities/:id
```

### Update Opportunity (Protected - Owner Only)
```http
PUT /api/v1/opportunities/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description"
}
```

### Delete Opportunity (Protected - Owner Only)
```http
DELETE /api/v1/opportunities/:id
Authorization: Bearer <token>
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📦 Build & Deploy

```bash
# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

## 🏗️ Project Structure

```
src/
├── controllers/          # Route handlers
│   └── opportunityController.ts
├── middleware/          # Express middleware
│   ├── auth.ts         # JWT authentication
│   └── validateRequest.ts
├── routes/             # API routes
│   ├── index.ts
│   └── opportunities.ts
├── utils/              # Utilities
│   ├── errorHandler.ts
│   └── prisma.ts
├── validators/         # Request validation schemas
│   └── opportunityValidators.ts
└── index.ts           # App entry point
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## 🛡️ Security Features

- ✅ Helmet.js for security headers
- ✅ CORS enabled
- ✅ JWT token validation
- ✅ Request validation
- ✅ Ownership checks for updates/deletes
- ✅ Error handling without exposing internals

## 🐛 Troubleshooting

### Database Connection Failed
- Check `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Verify database exists

### JWT Token Invalid
- Ensure `JWT_SECRET` matches Django backend
- Check token format: `Authorization: Bearer <token>`
- Verify token hasn't expired

### TypeScript Errors
```bash
npm run build
```
Check for compilation errors

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3000) |
| `NODE_ENV` | Environment (development/production) | No |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | JWT signing secret (must match Django) | Yes |

## 🚀 Deployment

### Quick Deploy to Production

See `DEPLOYMENT_SUMMARY.md` and `docs/PRE_DEPLOYMENT_CHECKLIST.md` for complete deployment guide.

**Quick Start:**
```bash
# 1. Build
npm ci --production
npm run build

# 2. Database
npx prisma migrate deploy

# 3. Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save

# 4. Verify
curl https://opportunities.varsigram.com/health
```

### Documentation
- [Deployment Summary](DEPLOYMENT_SUMMARY.md) - **START HERE**
- [API Documentation](docs/API_DOCUMENTATION.md) - Complete API reference
- [Pre-Deployment Checklist](docs/PRE_DEPLOYMENT_CHECKLIST.md) - Before going live
- [DevOps Checklist](docs/checklists/DEVOPS_CHECKLIST.md) - Infrastructure setup
- [Integration Test Guide](docs/INTEGRATION_TEST_GUIDE.md) - Testing with Django

## 🧪 Testing Integration

```bash
# Test with Django JWT token
node test-integration.js <YOUR_JWT_TOKEN>
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Ensure linting passes: `npm run lint`
5. Submit a pull request

## 📄 License

ISC
