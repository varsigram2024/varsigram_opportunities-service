# 🎯 Quick Deployment Reference

## Team Responsibilities Summary

### Django Developer
1. Install `djangorestframework-simplejwt`
2. Configure JWT with custom serializer (include `user_id`)
3. Share JWT_SECRET with Node.js team **securely**
4. Update CORS for Node.js subdomain
5. Deploy to: `api.varsigram.com`

### Node.js Developer (You)
1. Get JWT_SECRET from Django team
2. Configure CORS for Django subdomain
3. Build application: `npm run build`
4. Run migrations: `npx prisma migrate deploy`
5. Provide deployment info to DevOps
6. Deploy to: `opportunities.varsigram.com`

### DevOps Engineer
1. Setup DNS: `api.varsigram.com` & `opportunities.varsigram.com`
2. Provision servers and databases
3. Configure SSL certificates
4. Setup Nginx reverse proxy
5. Deploy both services
6. Configure monitoring and backups

---

## Domain Structure

```
varsigram.com (main domain)
├── api.varsigram.com              → Django Backend
├── opportunities.varsigram.com    → Node.js Service
└── app.varsigram.com              → Mobile App (if web)
```

---

## Critical Shared Secret

```
JWT_SECRET must be EXACTLY the same in:
✅ Django .env
✅ Node.js .env

Use password manager to share securely!
```

---

## Quick Test Commands

### 1. Get Token from Django
```bash
curl -X POST https://api.varsigram.com/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "user", "password": "pass"}'
```

### 2. Use Token with Node.js
```bash
curl -X POST https://opportunities.varsigram.com/api/v1/opportunities \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "description": "Test", "category": "INTERNSHIP"}'
```

### 3. Health Checks
```bash
curl https://api.varsigram.com/health
curl https://opportunities.varsigram.com/health
```

---

## Mobile App Configuration

```javascript
const API_CONFIG = {
  DJANGO_API: 'https://api.varsigram.com',
  OPPORTUNITIES_API: 'https://opportunities.varsigram.com',
};
```

---

## Deployment Cost Estimate

| Option | Monthly Cost |
|--------|--------------|
| Budget (Single VPS) | $30-50 |
| Standard (Separate VPS) | $60-100 |
| Cloud (AWS/Azure) | $120-210 |

---

## Documentation Files

| File | Purpose |
|------|---------|
| `DEPLOYMENT_STRATEGY.md` | Full deployment guide |
| `DJANGO_DEV_CHECKLIST.md` | Django team tasks |
| `NODEJS_DEV_CHECKLIST.md` | Node.js team tasks |
| `DEVOPS_CHECKLIST.md` | DevOps team tasks |
| `DJANGO_INTEGRATION.md` | Django integration guide |
| `TESTING_INTEGRATION.md` | Testing procedures |

---

## Support Contacts

**Django Team:** [django-dev-contact]
**Node.js Team:** [nodejs-dev-contact]
**DevOps Team:** [devops-contact]

---

**Ready to deploy! 🚀**

Read the detailed checklists:
- Django Dev: `docs/checklists/DJANGO_DEV_CHECKLIST.md`
- Node.js Dev: `docs/checklists/NODEJS_DEV_CHECKLIST.md`
- DevOps: `docs/checklists/DEVOPS_CHECKLIST.md`
