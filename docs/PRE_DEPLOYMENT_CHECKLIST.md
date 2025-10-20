# 🚀 Pre-Deployment Checklist

## Before You Deploy - Critical Checks

### ✅ 1. Environment Configuration

#### Production `.env` File
- [ ] `JWT_SECRET` matches Django's EXACTLY (including case, no extra spaces/quotes)
- [ ] `DATABASE_URL` points to production PostgreSQL database
- [ ] `NODE_ENV=production`
- [ ] `PORT=3000` (or your desired port)
- [ ] `ALLOWED_ORIGINS` configured for production domains
- [ ] No development URLs or credentials in production `.env`

#### Verify .env Format
```bash
# Production .env should look like:
NODE_ENV=production
PORT=3000
DATABASE_URL="postgresql://user:pass@prod-host:5432/opportunities_prod_db"
JWT_SECRET="<exact-secret-from-django-team>"
ALLOWED_ORIGINS=https://app.varsigram.com,https://varsigram.com
LOG_LEVEL=info
```

---

### ✅ 2. Code Quality & Testing

#### Run All Tests Locally
```bash
# Install dependencies
npm install

# Run tests
npm test

# Check test coverage
npm run test:coverage

# All tests MUST pass before deployment
```

#### Build TypeScript
```bash
# Build the application
npm run build

# Verify dist/ folder is created
ls dist/

# Test production build locally
NODE_ENV=production npm start

# Verify server starts without errors
```

#### Check for TypeScript Errors
```bash
# Run TypeScript compiler check
npx tsc --noEmit

# Should return no errors
```

---

### ✅ 3. Database Readiness

#### Production Database Setup
- [ ] PostgreSQL 14+ installed/provisioned
- [ ] Database created: `opportunities_prod_db`
- [ ] Database user created with proper permissions
- [ ] Connection tested from production server
- [ ] Firewall allows database connections

#### Test Database Connection
```bash
# Test connection string
npx prisma db pull

# Generate Prisma client
npx prisma generate

# Run migrations (dry-run first)
npx prisma migrate deploy --preview-feature
```

#### Backup Strategy
- [ ] Database backup script configured
- [ ] Backup schedule set (daily recommended)
- [ ] Backup restoration tested
- [ ] Backup retention policy defined

---

### ✅ 4. Integration Testing with Django

#### JWT Token Validation
```bash
# Get token from Django
curl -X POST https://api.varsigram.com/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}'

# Copy the access token and test with Node.js
export TOKEN="<paste-token-here>"

curl -X POST http://localhost:3000/api/v1/opportunities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title":"Integration Test",
    "description":"Testing JWT from Django",
    "category":"INTERNSHIP",
    "location":"Lagos"
  }'

# Should return 201 Created with opportunity data
```

#### Verify JWT Contains user_id
- [ ] Decode token at https://jwt.io
- [ ] Confirm payload includes `user_id` field
- [ ] Confirm `user_id` is a valid UUID or ID format
- [ ] Test with multiple users to verify different user_ids

#### Cross-Service Communication
- [ ] Django API reachable from Node.js server
- [ ] CORS configured correctly on both services
- [ ] SSL/TLS certificates valid (if using HTTPS)
- [ ] Network security groups allow traffic

---

### ✅ 5. Security Hardening

#### Environment Variables
- [ ] `.env` file NOT committed to Git (in `.gitignore`)
- [ ] Production secrets stored securely (password manager/vault)
- [ ] Different secrets for dev/staging/production
- [ ] JWT_SECRET is strong (32+ characters, random)

#### Server Security
- [ ] Firewall configured (UFW/iptables)
- [ ] Only necessary ports open (22, 80, 443)
- [ ] SSH key-based authentication enabled
- [ ] Root login disabled
- [ ] Security updates installed
- [ ] Helmet middleware enabled (already in code)

#### Application Security
- [ ] CORS configured with specific origins (not `*`)
- [ ] Rate limiting enabled
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS protection (Helmet handles this)
- [ ] HTTPS enforced (redirect HTTP → HTTPS)

---

### ✅ 6. Deployment Infrastructure

#### Server Requirements
- [ ] Ubuntu 22.04 LTS (or similar)
- [ ] Node.js 18+ installed
- [ ] PM2 installed globally: `npm install -g pm2`
- [ ] Nginx installed and configured
- [ ] SSL certificates installed (Let's Encrypt)
- [ ] Minimum 2GB RAM, 2 vCPU
- [ ] 20GB+ disk space available

#### DNS & Domain
- [ ] Domain purchased/configured
- [ ] DNS A record: `opportunities.varsigram.com → Server IP`
- [ ] DNS propagation verified
- [ ] SSL certificate valid for domain

#### Nginx Configuration
- [ ] Reverse proxy configured for port 3000
- [ ] SSL/TLS configured
- [ ] HTTP → HTTPS redirect enabled
- [ ] Security headers added
- [ ] Gzip compression enabled
- [ ] Rate limiting configured (optional)

---

### ✅ 7. Monitoring & Logging

#### Application Monitoring
- [ ] PM2 monitoring enabled: `pm2 monitor`
- [ ] Uptime monitoring service configured (UptimeRobot, etc.)
- [ ] Error tracking service configured (Sentry, etc. - optional)
- [ ] Health check endpoint accessible: `/health`

#### Logging Setup
- [ ] Log directory created: `/var/log/opportunities/`
- [ ] PM2 logs configured in `ecosystem.config.js`
- [ ] Log rotation configured (logrotate)
- [ ] Log levels appropriate for production

#### Alerts
- [ ] Server down alerts configured
- [ ] High error rate alerts
- [ ] Database connection failure alerts
- [ ] Disk space alerts

---

### ✅ 8. Performance Optimization

#### Application Performance
- [ ] Compression middleware enabled (already in code)
- [ ] Database queries optimized
- [ ] Indexes added for frequently queried fields
- [ ] Connection pooling configured (Prisma handles this)

#### Caching (Optional)
- [ ] Redis installed/configured (if using)
- [ ] Cache strategy defined
- [ ] Cache invalidation strategy defined

---

### ✅ 9. Documentation

#### For DevOps Team
- [ ] Deployment checklist shared: `docs/checklists/DEVOPS_CHECKLIST.md`
- [ ] Environment variables documented: `.env.example`
- [ ] Deployment script provided: `deploy.sh`
- [ ] PM2 config provided: `ecosystem.config.js`
- [ ] Nginx config template provided

#### For Mobile Team
- [ ] API base URL shared: `https://opportunities.varsigram.com/api/v1`
- [ ] API endpoints documented
- [ ] Authentication flow documented
- [ ] Error response formats documented
- [ ] Example requests/responses provided

#### For Django Team
- [ ] JWT_SECRET confirmed matching
- [ ] JWT token structure verified
- [ ] CORS origins configured correctly
- [ ] Integration tested end-to-end

---

### ✅ 10. Git & Version Control

#### Repository Status
- [ ] All code committed to `develop` branch
- [ ] All tests passing
- [ ] No merge conflicts
- [ ] `main` branch created from `develop`
- [ ] Branch protection rules set (require PR reviews)

#### Tagging Release
```bash
# Create release tag
git tag -a v1.0.0 -m "Initial production release"
git push origin v1.0.0
```

---

## 🧪 Quick Pre-Deployment Test

Run this complete test locally before deploying:

```bash
# 1. Clean install
rm -rf node_modules dist
npm install

# 2. Build
npm run build

# 3. Run tests
npm test

# 4. Start production build locally
NODE_ENV=production npm start

# 5. Test health check
curl http://localhost:3000/health
# Should return: {"status":"OK",...}

# 6. Test with Django JWT token
export TOKEN="<get-from-django>"

# Create opportunity
curl -X POST http://localhost:3000/api/v1/opportunities \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","description":"Test","category":"INTERNSHIP","location":"Lagos"}'

# Should return 201 with created opportunity

# 7. Test ownership (try to update your own opportunity)
export OPP_ID="<id-from-previous-response>"
curl -X PUT http://localhost:3000/api/v1/opportunities/$OPP_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title"}'

# Should return 200 with updated opportunity

# 8. Test public endpoints (no auth)
curl http://localhost:3000/api/v1/opportunities
# Should return array of opportunities

# If all tests pass, you're ready to deploy! ✅
```

---

## 🚨 Deployment Blockers

**DO NOT DEPLOY IF:**

❌ Tests are failing  
❌ TypeScript has compilation errors  
❌ JWT_SECRET doesn't match Django's  
❌ Database connection fails  
❌ Build fails (`npm run build` errors)  
❌ Django integration not tested  
❌ Production environment variables not configured  
❌ No backup strategy in place  
❌ Server/infrastructure not ready  

---

## ✅ Ready to Deploy?

If all checkboxes are checked and tests pass:

### Manual Deployment
```bash
# SSH to production server
ssh user@opportunities.varsigram.com

# Run deployment script
cd /var/www/opportunities-service
./deploy.sh production
```

### Automated Deployment (GitHub Actions)
```bash
# Merge to main branch
git checkout main
git merge develop
git push origin main

# GitHub Actions will automatically:
# - Run tests
# - Build application
# - Deploy to production
# - Run health checks
```

---

## 📞 Post-Deployment Verification

After deployment, verify:

```bash
# 1. Health check
curl https://opportunities.varsigram.com/health

# 2. API info
curl https://opportunities.varsigram.com/api/v1

# 3. Create opportunity with real token
curl -X POST https://opportunities.varsigram.com/api/v1/opportunities \
  -H "Authorization: Bearer $PROD_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Production Test","description":"Live test","category":"INTERNSHIP","location":"Lagos"}'

# 4. Check server status
pm2 status
pm2 logs opportunities-api --lines 50

# 5. Check Nginx
sudo systemctl status nginx
sudo nginx -t
```

---

## 🆘 Rollback Plan

If deployment fails:

```bash
# 1. SSH to server
ssh user@opportunities.varsigram.com

# 2. Rollback to previous version
cd /var/www/opportunities-service
git log --oneline -5  # Find previous commit
git checkout <previous-commit-hash>

# 3. Reinstall dependencies
npm ci --production

# 4. Rebuild
npm run build

# 5. Restart
pm2 reload ecosystem.config.js
pm2 save

# 6. Verify
curl https://opportunities.varsigram.com/health
```

---

**Good luck with your deployment! 🚀**
