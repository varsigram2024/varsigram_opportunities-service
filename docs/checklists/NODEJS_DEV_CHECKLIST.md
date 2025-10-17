# Node.js Developer Checklist (You!)

## 📋 Tasks Before Deployment

### 1. Get JWT_SECRET from Django Team

**⚠️ CRITICAL:** You need the exact same JWT_SECRET that Django is using.

Request from Django developer:
- JWT_SECRET value
- Django API endpoint (e.g., `https://api.varsigram.com`)
- Token payload structure (confirm user_id is included)

### 2. Create `.env` File

```bash
# Copy example
cp .env.example .env

# Edit with your values
nano .env
```

```bash
# Node.js .env (Development)
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/opportunities_dev_db
JWT_SECRET=<get-from-django-team>  # MUST MATCH DJANGO!

# Node.js .env (Production)
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@prod-db:5432/opportunities_prod_db
JWT_SECRET=<same-as-django>  # MUST MATCH DJANGO!
```

### 3. Update CORS Configuration

Edit `src/index.ts`:

```typescript
// Development
const allowedOrigins = [
    'http://localhost:8000',  // Django local
    'http://localhost:3000',  // Node.js local
];

// Production (update with actual domains)
const allowedOrigins = [
    'https://api.varsigram.com',        // Django backend
    'https://app.varsigram.com',        // Mobile app (if web)
    'https://opportunities.varsigram.com',  // This service
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Set Up Database

```bash
# Create development database
createdb opportunities_dev_db

# Run Prisma migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

### 6. Test Locally

```bash
# Start development server
npm run dev

# Should see:
# 🚀 Server running on http://localhost:3000
# ✅ Database connected successfully
```

### 7. Test Integration with Django

#### Get token from Django:
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpass"}'

# Copy the "access" token from response
```

#### Test Node.js with Django token:
```bash
curl -X POST http://localhost:3000/api/v1/opportunities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <paste-token-here>" \
  -d '{
    "title": "Test Opportunity",
    "description": "Testing Django integration",
    "category": "INTERNSHIP",
    "location": "Remote"
  }'

# Should create successfully!
```

### 8. Build for Production

```bash
# Build TypeScript to JavaScript
npm run build

# Test production build
npm start

# Verify it works
curl http://localhost:3000/health
```

### 9. Prepare Deployment Package

Create deployment documentation for DevOps:

```bash
# Create deployment info file
cat > DEPLOYMENT_INFO.md << 'EOF'
# Node.js Opportunities Service - Deployment Info

## Server Requirements
- Node.js 18+ 
- PostgreSQL 14+
- 2GB RAM minimum
- 2 vCPU minimum

## Environment Variables Required
See .env.example file

## Build Commands
npm install
npm run build
npx prisma generate
npx prisma migrate deploy

## Start Commands
# Development
npm run dev

# Production
npm start

## Health Check
GET /health

## Port
3000 (can be changed via PORT env var)

## Database Migrations
npx prisma migrate deploy
EOF
```

### 10. Document API Endpoints

Create API documentation for DevOps and mobile team:

```markdown
# API Endpoints

Base URL: https://opportunities.varsigram.com/api/v1

## Public (No Auth)
GET    /opportunities              - List all
GET    /opportunities/:id          - Get one
GET    /opportunities/search?q=    - Search
GET    /opportunities/category/internships
GET    /opportunities/category/scholarships
GET    /opportunities/category/others

## Protected (Requires JWT)
POST   /opportunities              - Create
PUT    /opportunities/:id          - Update (owner only)
DELETE /opportunities/:id          - Delete (owner only)

## Health Check
GET    /health                     - Server status
```

### 11. Provide Info to DevOps

Send to DevOps team:
- Production environment variables (in secure manner)
- Server requirements (RAM, CPU, Node.js version)
- Build and start commands
- Health check endpoint
- Port number (3000)
- Database migration commands

### 12. Provide Info to Mobile Team

Send to mobile developers:
- Production API base URL: `https://opportunities.varsigram.com/api/v1`
- API endpoint documentation
- Request/response examples
- Authentication header format: `Authorization: Bearer <token>`

---

## ✅ Completion Checklist

- [ ] JWT_SECRET received from Django team
- [ ] .env file created with correct values
- [ ] CORS configured for Django subdomain
- [ ] Dependencies installed
- [ ] Database created and migrations run
- [ ] Local testing successful
- [ ] Integration with Django tested
- [ ] Production build tested
- [ ] Deployment documentation created
- [ ] API documentation created
- [ ] DevOps briefed
- [ ] Mobile team briefed

---

## 📁 Files to Provide DevOps

1. **Built application** (`dist/` folder after `npm run build`)
2. **package.json** (for production dependencies)
3. **prisma/schema.prisma** (for database setup)
4. **Environment variables template** (.env.example)
5. **Deployment documentation** (DEPLOYMENT_INFO.md)

---

## 🔐 Security Reminders

- [ ] Never commit .env to Git
- [ ] Use strong, random JWT_SECRET
- [ ] Share secrets securely (password manager, not email)
- [ ] Enable HTTPS in production
- [ ] Limit CORS to known domains only
- [ ] Keep dependencies updated

---

## 🧪 Testing Checklist

- [ ] Health check works: `GET /health`
- [ ] Can create opportunity WITH token
- [ ] CANNOT create opportunity WITHOUT token
- [ ] Can only edit/delete own opportunities
- [ ] Validation errors work correctly
- [ ] Invalid tokens are rejected
- [ ] Expired tokens are rejected
- [ ] CORS works with Django domain

---

## 📞 Communication

**To Django Developer:**
- Confirm JWT_SECRET received
- Confirm token payload includes user_id
- Report any integration issues

**To DevOps:**
- Provide all deployment files
- Share production environment variables securely
- Confirm deployment domain: opportunities.varsigram.com

**To Mobile Team:**
- Share API base URL
- Provide endpoint documentation
- Share sample request/response

---

## 🐛 Troubleshooting

**Problem:** "Invalid token" error

**Solution:** 
1. Verify JWT_SECRET matches Django exactly
2. Check token is sent as: `Authorization: Bearer <token>`
3. Verify token payload contains user_id

---

**Problem:** CORS error

**Solution:**
1. Add Django domain to allowedOrigins in src/index.ts
2. Restart Node.js server after changes

---

**Problem:** Database connection failed

**Solution:**
1. Verify PostgreSQL is running
2. Check DATABASE_URL in .env
3. Run: `npx prisma migrate dev`

---

## 📚 Documentation References

- Integration guide: `../DJANGO_INTEGRATION.md`
- Testing guide: `../TESTING_INTEGRATION.md`
- Deployment strategy: `../DEPLOYMENT_STRATEGY.md`
- Quick setup: `../QUICK_SETUP.md`
