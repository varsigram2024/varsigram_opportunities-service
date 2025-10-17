# 🌐 Deployment & Domain Strategy

## Architecture Overview

```
Main Domain: varsigram.com (or your domain)
├── Django Backend:      api.varsigram.com
├── Node.js Opportunities: opportunities.varsigram.com
├── Mobile App:          app.varsigram.com (if web version)
└── Admin Dashboard:     admin.varsigram.com
```

---

## 🏗️ Hosting Options

### **Option 1: Subdomain per Service (Recommended)**
```
Main Django Backend:        https://api.varsigram.com
Node.js Opportunities:      https://opportunities.varsigram.com
```

**Pros:**
- ✅ Clear separation of services
- ✅ Independent scaling
- ✅ Easy to add more microservices
- ✅ Better for monitoring and debugging

**Cons:**
- ❌ Need to configure multiple subdomains
- ❌ Multiple SSL certificates (or wildcard)

---

### **Option 2: Path-based Routing**
```
Django Backend:             https://api.varsigram.com/auth
                            https://api.varsigram.com/users
Node.js Opportunities:      https://api.varsigram.com/opportunities
```

**Pros:**
- ✅ Single domain
- ✅ One SSL certificate
- ✅ Simpler DNS setup

**Cons:**
- ❌ Need API Gateway/Reverse Proxy (Nginx)
- ❌ Harder to scale independently
- ❌ More complex routing configuration

---

## 📋 **RECOMMENDED: Subdomain Strategy**

We'll use **Option 1** - separate subdomains for each service.

---

## 👥 Responsibilities Breakdown

### 1️⃣ **Django Developer Tasks**

#### **Development Phase:**

```bash
# 1. Update Django CORS settings
# settings.py
CORS_ALLOWED_ORIGINS = [
    "https://opportunities.varsigram.com",  # Node.js service
    "https://app.varsigram.com",            # Mobile app (if web)
    # Local development
    "http://localhost:3000",
    "http://localhost:8000",
]

# 2. Update ALLOWED_HOSTS
ALLOWED_HOSTS = [
    'api.varsigram.com',
    'localhost',
    '127.0.0.1',
]

# 3. Configure JWT settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'SIGNING_KEY': config('JWT_SECRET'),  # From environment
    'ALGORITHM': 'HS256',
}

# 4. Add custom token serializer to include user_id
# (See docs/DJANGO_INTEGRATION.md)
```

#### **Environment Configuration:**

```bash
# Django .env (Production)
JWT_SECRET=<super-secure-random-key-32-chars-minimum>
DATABASE_URL=postgresql://user:pass@db-host:5432/django_prod_db
ALLOWED_HOSTS=api.varsigram.com
DEBUG=False
SECRET_KEY=<django-secret-key>
```

#### **Deployment Checklist:**
- [ ] Install `djangorestframework-simplejwt`
- [ ] Configure JWT settings with shared secret
- [ ] Update CORS settings to allow Node.js subdomain
- [ ] Create custom token serializer with `user_id`
- [ ] Set up production environment variables
- [ ] Run migrations on production database
- [ ] Test JWT token generation endpoint
- [ ] Share JWT_SECRET securely with Node.js team

---

### 2️⃣ **Node.js Developer (You) Tasks**

#### **Development Phase:**

```bash
# 1. Update CORS configuration
# src/index.ts
const allowedOrigins = [
    'https://api.varsigram.com',        # Django backend
    'https://app.varsigram.com',        # Mobile app
    'http://localhost:8000',            # Local Django
    'http://localhost:3000',            # Local Node.js
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

# 2. Add health check endpoint (already done!)
app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'Opportunities' });
});
```

#### **Environment Configuration:**

```bash
# Node.js .env (Production)
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@db-host:5432/opportunities_prod_db
JWT_SECRET=<same-as-django-jwt-secret>  # MUST MATCH DJANGO!

# Optional
REDIS_URL=redis://redis-host:6379
LOG_LEVEL=info
```

#### **Build & Package:**

```bash
# 1. Build TypeScript
npm run build

# 2. Test production build locally
npm start

# 3. Create deployment package
# (DevOps will handle actual deployment)
```

#### **Deployment Checklist:**
- [ ] Ensure JWT_SECRET matches Django (critical!)
- [ ] Update CORS to allow Django subdomain
- [ ] Set up production database (separate from Django)
- [ ] Run Prisma migrations: `npx prisma migrate deploy`
- [ ] Generate Prisma client: `npx prisma generate`
- [ ] Test build: `npm run build`
- [ ] Provide environment variables to DevOps
- [ ] Document API endpoints for DevOps

---

### 3️⃣ **DevOps Engineer Tasks**

#### **Infrastructure Setup:**

##### **A. Domain & DNS Configuration**

```bash
# DNS Records to Create:

# Main API (Django)
Type: A or CNAME
Name: api.varsigram.com
Value: <Django-Server-IP> or <Load-Balancer>

# Opportunities Service (Node.js)
Type: A or CNAME
Name: opportunities.varsigram.com
Value: <NodeJS-Server-IP> or <Load-Balancer>

# Mobile App (if web version)
Type: A or CNAME
Name: app.varsigram.com
Value: <Frontend-Server-IP> or <CDN>
```

---

##### **B. Server Setup Options**

**Option 1: Separate VPS for Each Service**
```
Server 1 (Django):
- IP: 1.2.3.4
- Domain: api.varsigram.com
- Specs: 2 vCPU, 4GB RAM
- OS: Ubuntu 22.04

Server 2 (Node.js):
- IP: 5.6.7.8
- Domain: opportunities.varsigram.com
- Specs: 2 vCPU, 4GB RAM
- OS: Ubuntu 22.04

Database Servers:
- PostgreSQL 1 (Django): Managed DB or separate server
- PostgreSQL 2 (Node.js): Managed DB or separate server
```

**Option 2: Single Server with Nginx Reverse Proxy**
```
Server:
- IP: 1.2.3.4
- Specs: 4 vCPU, 8GB RAM
- OS: Ubuntu 22.04

Services:
- Django:  localhost:8000 → api.varsigram.com
- Node.js: localhost:3000 → opportunities.varsigram.com
- Nginx:   Port 80/443 (reverse proxy)
```

**Option 3: Cloud Platform (Recommended)**
```
AWS/Azure/Google Cloud:
- Django:     AWS Elastic Beanstalk / Azure App Service
- Node.js:    AWS Elastic Beanstalk / Azure App Service
- Database:   AWS RDS / Azure Database for PostgreSQL
- Cache:      AWS ElastiCache / Azure Cache for Redis
```

---

##### **C. SSL/TLS Certificates**

```bash
# Option 1: Wildcard Certificate (Recommended)
Certificate: *.varsigram.com
Covers:
  - api.varsigram.com
  - opportunities.varsigram.com
  - app.varsigram.com
  - any.other.subdomain.varsigram.com

# Option 2: Individual Certificates
Let's Encrypt (Free):
  certbot certonly --nginx -d api.varsigram.com
  certbot certonly --nginx -d opportunities.varsigram.com
```

---

##### **D. Nginx Configuration (if using reverse proxy)**

```nginx
# /etc/nginx/sites-available/varsigram

# Django Backend
server {
    listen 80;
    server_name api.varsigram.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.varsigram.com;
    
    ssl_certificate /etc/letsencrypt/live/api.varsigram.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.varsigram.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Node.js Opportunities Service
server {
    listen 80;
    server_name opportunities.varsigram.com;
    
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name opportunities.varsigram.com;
    
    ssl_certificate /etc/letsencrypt/live/opportunities.varsigram.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/opportunities.varsigram.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3000/health;
        access_log off;
    }
}
```

```bash
# Enable site and restart Nginx
sudo ln -s /etc/nginx/sites-available/varsigram /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

##### **E. Process Management**

**For Django (using Gunicorn + Systemd):**

```bash
# /etc/systemd/system/django-api.service
[Unit]
Description=Django API Service
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/django-backend
Environment="PATH=/var/www/django-backend/venv/bin"
ExecStart=/var/www/django-backend/venv/bin/gunicorn \
    --workers 4 \
    --bind 127.0.0.1:8000 \
    project.wsgi:application

[Install]
WantedBy=multi-user.target
```

**For Node.js (using PM2):**

```bash
# Install PM2
npm install -g pm2

# Start Node.js app
cd /var/www/opportunities-service
pm2 start dist/index.js --name opportunities-api

# Save PM2 process list
pm2 save

# Auto-start on server reboot
pm2 startup systemd
```

---

##### **F. Database Setup**

```bash
# PostgreSQL for Django
CREATE DATABASE django_prod_db;
CREATE USER django_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE django_prod_db TO django_user;

# PostgreSQL for Node.js
CREATE DATABASE opportunities_prod_db;
CREATE USER nodejs_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE opportunities_prod_db TO nodejs_user;
```

---

##### **G. Environment Variables Management**

```bash
# Django .env
sudo nano /var/www/django-backend/.env

JWT_SECRET=<shared-secret>
DATABASE_URL=postgresql://django_user:password@localhost:5432/django_prod_db
SECRET_KEY=<django-secret>
DEBUG=False
ALLOWED_HOSTS=api.varsigram.com

# Node.js .env
sudo nano /var/www/opportunities-service/.env

NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://nodejs_user:password@localhost:5432/opportunities_prod_db
JWT_SECRET=<same-as-django>  # MUST MATCH!
```

---

##### **H. Monitoring & Logging**

```bash
# Install monitoring tools
# 1. Prometheus + Grafana for metrics
# 2. ELK Stack (Elasticsearch, Logstash, Kibana) for logs
# 3. Uptime monitoring (UptimeRobot, Pingdom)

# Health check endpoints
https://api.varsigram.com/health
https://opportunities.varsigram.com/health

# Log locations
Django:  /var/log/django/api.log
Node.js: PM2 logs (pm2 logs)
Nginx:   /var/log/nginx/access.log
```

---

##### **I. Backup Strategy**

```bash
# Database backups (daily)
# Django DB
pg_dump -U django_user django_prod_db > /backups/django_$(date +%F).sql

# Node.js DB
pg_dump -U nodejs_user opportunities_prod_db > /backups/nodejs_$(date +%F).sql

# Application code backups
rsync -avz /var/www/ /backups/apps/
```

---

##### **J. Firewall Configuration**

```bash
# UFW (Uncomplicated Firewall)
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw enable

# Only allow database connections from localhost
sudo ufw deny 5432         # PostgreSQL external access
```

---

##### **K. DevOps Deployment Checklist:**

- [ ] Set up DNS records for subdomains
- [ ] Provision servers (VPS or cloud platform)
- [ ] Install and configure Nginx reverse proxy
- [ ] Set up SSL certificates (Let's Encrypt or wildcard)
- [ ] Create PostgreSQL databases (separate for each service)
- [ ] Set up process management (Gunicorn for Django, PM2 for Node.js)
- [ ] Configure environment variables
- [ ] Set up monitoring and alerting
- [ ] Configure backup automation
- [ ] Set up firewall rules
- [ ] Test health check endpoints
- [ ] Set up CI/CD pipeline (GitHub Actions, Jenkins, etc.)
- [ ] Configure log rotation
- [ ] Set up auto-scaling (if using cloud)

---

## 📱 **Mobile App Configuration**

Update API endpoints in mobile app:

```javascript
// config/api.js
const API_CONFIG = {
  // Production
  DJANGO_API: 'https://api.varsigram.com',
  OPPORTUNITIES_API: 'https://opportunities.varsigram.com',
  
  // Development
  // DJANGO_API: 'http://localhost:8000',
  // OPPORTUNITIES_API: 'http://localhost:3000',
};

export default API_CONFIG;
```

---

## 🔄 **CI/CD Pipeline Example**

```yaml
# .github/workflows/deploy-nodejs.yml
name: Deploy Node.js Opportunities Service

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Run tests
        run: npm test
      
      - name: Deploy to server
        env:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
        run: |
          # SSH into server and deploy
          ssh user@opportunities.varsigram.com "
            cd /var/www/opportunities-service &&
            git pull origin main &&
            npm install &&
            npm run build &&
            npx prisma migrate deploy &&
            pm2 reload opportunities-api
          "
```

---

## 💰 **Cost Estimation (Monthly)**

### **Budget Option: Single VPS**
- VPS (4GB RAM, 2 vCPU): $12-20
- Managed PostgreSQL: $15-25
- Domain: $10-15/year
- SSL (Let's Encrypt): Free
- **Total: ~$30-50/month**

### **Standard Option: Separate VPS**
- Django VPS: $12-20
- Node.js VPS: $12-20
- Managed PostgreSQL x2: $30-50
- Domain: $10-15/year
- SSL (Wildcard): $50-100/year
- **Total: ~$60-100/month**

### **Cloud Option (AWS/Azure)**
- App Services x2: $50-100
- Managed Databases x2: $50-80
- Load Balancer: $20-30
- SSL (included): Free
- **Total: ~$120-210/month**

---

## 🎯 **Quick Summary**

| Task | Who | What |
|------|-----|------|
| **Django Config** | Django Dev | Add CORS, JWT settings, custom token serializer |
| **Node.js Config** | You | Add CORS, environment variables, build app |
| **Domain Setup** | DevOps | Create DNS records for subdomains |
| **SSL Certificates** | DevOps | Set up Let's Encrypt or wildcard cert |
| **Server Setup** | DevOps | Nginx, process managers, databases |
| **Deployment** | DevOps | Deploy both services, test endpoints |
| **Monitoring** | DevOps | Set up health checks, logging, alerts |
| **Mobile App Update** | Mobile Dev | Update API endpoints to use subdomains |

---

## 📞 **Communication Between Teams**

**Critical Information to Share:**

1. **JWT_SECRET** (securely!)
   - Django Dev → You (Node.js Dev)
   - Store in password manager or secret vault

2. **API Endpoints**
   - You → DevOps: Document all endpoints
   - You → Mobile Dev: New base URLs

3. **Database Credentials**
   - DevOps → Django Dev
   - DevOps → You

4. **Environment Variables**
   - All teams → DevOps (for setup)

---

**Ready to deploy! 🚀**
