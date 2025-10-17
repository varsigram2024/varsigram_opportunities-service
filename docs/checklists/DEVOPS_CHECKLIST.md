# DevOps Engineer Checklist

## 📋 Infrastructure Setup Tasks

### Phase 1: Domain & DNS Setup

#### 1. DNS Records to Create

```bash
# Main API (Django Backend)
Type: A (or CNAME if using load balancer)
Name: api
Host: api.varsigram.com
Value: <Django-Server-IP> or <Load-Balancer-DNS>
TTL: 3600

# Opportunities Service (Node.js)
Type: A (or CNAME if using load balancer)
Name: opportunities
Host: opportunities.varsigram.com
Value: <NodeJS-Server-IP> or <Load-Balancer-DNS>
TTL: 3600

# Mobile App (if web version)
Type: A
Name: app
Host: app.varsigram.com
Value: <Frontend-Server-IP> or <CDN>
TTL: 3600
```

#### 2. Verify DNS Propagation

```bash
# Check DNS records
nslookup api.varsigram.com
nslookup opportunities.varsigram.com

# Or use
dig api.varsigram.com
dig opportunities.varsigram.com
```

---

### Phase 2: Server Provisioning

#### Option A: Separate Servers (Recommended for production)

**Server 1 - Django Backend**
```
Provider: AWS EC2 / Azure VM / DigitalOcean
OS: Ubuntu 22.04 LTS
Size: 2 vCPU, 4GB RAM, 50GB SSD
IP: Assign static/elastic IP
Security Group: Allow 22 (SSH), 80 (HTTP), 443 (HTTPS)
```

**Server 2 - Node.js Service**
```
Provider: AWS EC2 / Azure VM / DigitalOcean
OS: Ubuntu 22.04 LTS
Size: 2 vCPU, 4GB RAM, 50GB SSD
IP: Assign static/elastic IP
Security Group: Allow 22 (SSH), 80 (HTTP), 443 (HTTPS)
```

#### Option B: Single Server with Reverse Proxy

```
Provider: AWS EC2 / Azure VM / DigitalOcean
OS: Ubuntu 22.04 LTS
Size: 4 vCPU, 8GB RAM, 100GB SSD
IP: Assign static/elastic IP
Security Group: Allow 22 (SSH), 80 (HTTP), 443 (HTTPS)
```

---

### Phase 3: Database Setup

#### Create PostgreSQL Databases

**Option 1: Managed Database (Recommended)**
```
AWS RDS / Azure Database / DigitalOcean Managed DB
Engine: PostgreSQL 14+
Instance: db.t3.small (or equivalent)

Create two databases:
1. django_prod_db (for Django)
2. opportunities_prod_db (for Node.js)
```

**Option 2: Self-hosted PostgreSQL**
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create databases
sudo -u postgres psql

CREATE DATABASE django_prod_db;
CREATE USER django_user WITH PASSWORD 'secure_password_1';
GRANT ALL PRIVILEGES ON DATABASE django_prod_db TO django_user;

CREATE DATABASE opportunities_prod_db;
CREATE USER nodejs_user WITH PASSWORD 'secure_password_2';
GRANT ALL PRIVILEGES ON DATABASE opportunities_prod_db TO nodejs_user;

\q

# Configure PostgreSQL for remote access (if needed)
sudo nano /etc/postgresql/14/main/postgresql.conf
# Change: listen_addresses = 'localhost' to listen_addresses = '*'

sudo nano /etc/postgresql/14/main/pg_hba.conf
# Add: host all all 0.0.0.0/0 md5

sudo systemctl restart postgresql
```

---

### Phase 4: SSL/TLS Certificates

#### Option 1: Let's Encrypt (Free, Recommended for single certs)

```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Get certificates
sudo certbot certonly --nginx -d api.varsigram.com
sudo certbot certonly --nginx -d opportunities.varsigram.com

# Certificates will be at:
# /etc/letsencrypt/live/api.varsigram.com/fullchain.pem
# /etc/letsencrypt/live/api.varsigram.com/privkey.pem

# Auto-renewal (Certbot sets this up automatically)
sudo certbot renew --dry-run
```

#### Option 2: Wildcard Certificate (Recommended for multiple subdomains)

```bash
# Purchase wildcard cert for *.varsigram.com
# Or use Let's Encrypt with DNS challenge

sudo certbot certonly --manual --preferred-challenges dns -d "*.varsigram.com"

# Follow instructions to add DNS TXT record
# Certificate will cover all subdomains
```

---

### Phase 5: Django Backend Deployment

#### 1. Server Setup

```bash
# SSH into Django server
ssh user@api.varsigram.com

# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and dependencies
sudo apt install python3 python3-pip python3-venv nginx git -y

# Create app directory
sudo mkdir -p /var/www/django-backend
sudo chown $USER:$USER /var/www/django-backend
```

#### 2. Clone and Setup Application

```bash
cd /var/www/django-backend

# Clone repository
git clone <django-repo-url> .

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install gunicorn
```

#### 3. Create Environment File

```bash
sudo nano /var/www/django-backend/.env
```

```bash
# Django Production .env
JWT_SECRET=<get-from-dev-team-securely>
DATABASE_URL=postgresql://django_user:password@db-host:5432/django_prod_db
SECRET_KEY=<django-secret-key>
DEBUG=False
ALLOWED_HOSTS=api.varsigram.com
```

#### 4. Run Migrations

```bash
source venv/bin/activate
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

#### 5. Setup Gunicorn Service

```bash
sudo nano /etc/systemd/system/django.service
```

```ini
[Unit]
Description=Django API Service
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/django-backend
Environment="PATH=/var/www/django-backend/venv/bin"
EnvironmentFile=/var/www/django-backend/.env
ExecStart=/var/www/django-backend/venv/bin/gunicorn \
    --workers 4 \
    --bind 127.0.0.1:8000 \
    --access-logfile /var/log/django/access.log \
    --error-logfile /var/log/django/error.log \
    project.wsgi:application

[Install]
WantedBy=multi-user.target
```

```bash
# Create log directory
sudo mkdir -p /var/log/django
sudo chown www-data:www-data /var/log/django

# Start service
sudo systemctl start django
sudo systemctl enable django
sudo systemctl status django
```

---

### Phase 6: Node.js Service Deployment

#### 1. Server Setup

```bash
# SSH into Node.js server
ssh user@opportunities.varsigram.com

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs nginx git -y

# Install PM2
sudo npm install -g pm2

# Create app directory
sudo mkdir -p /var/www/opportunities-service
sudo chown $USER:$USER /var/www/opportunities-service
```

#### 2. Clone and Setup Application

```bash
cd /var/www/opportunities-service

# Clone repository
git clone <nodejs-repo-url> .

# Install dependencies
npm install

# Build TypeScript
npm run build
```

#### 3. Create Environment File

```bash
nano /var/www/opportunities-service/.env
```

```bash
# Node.js Production .env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://nodejs_user:password@db-host:5432/opportunities_prod_db
JWT_SECRET=<same-as-django-jwt-secret>
```

#### 4. Setup Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy
```

#### 5. Start with PM2

```bash
# Start application
pm2 start dist/index.js --name opportunities-api

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd
# Run the command it outputs

# Check status
pm2 status
pm2 logs opportunities-api
```

---

### Phase 7: Nginx Reverse Proxy Configuration

#### 1. Create Nginx Config

```bash
sudo nano /etc/nginx/sites-available/varsigram
```

```nginx
# Django Backend
server {
    listen 80;
    server_name api.varsigram.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.varsigram.com;
    
    ssl_certificate /etc/letsencrypt/live/api.varsigram.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.varsigram.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    
    client_max_body_size 10M;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }
    
    location /static/ {
        alias /var/www/django-backend/static/;
    }
    
    location /media/ {
        alias /var/www/django-backend/media/;
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
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    
    client_max_body_size 10M;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }
    
    location /health {
        proxy_pass http://127.0.0.1:3000/health;
        access_log off;
    }
}
```

#### 2. Enable Site

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/varsigram /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

### Phase 8: Firewall Configuration

```bash
# Install UFW
sudo apt install ufw

# Allow SSH (important - do this first!)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

### Phase 9: Monitoring & Logging

#### 1. Setup Log Rotation

```bash
# Django logs
sudo nano /etc/logrotate.d/django
```

```
/var/log/django/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

#### 2. Setup Monitoring

```bash
# Install monitoring tools
# Option 1: Simple uptime monitoring
# Use: UptimeRobot, Pingdom (external services)

# Option 2: Full stack monitoring
# Install: Prometheus + Grafana

# Health check URLs to monitor:
# https://api.varsigram.com/health
# https://opportunities.varsigram.com/health
```

---

### Phase 10: Backup Configuration

```bash
# Create backup script
sudo nano /usr/local/bin/backup-databases.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backups/databases"
DATE=$(date +%Y-%m-%d_%H-%M-%S)

mkdir -p $BACKUP_DIR

# Backup Django database
pg_dump -h localhost -U django_user django_prod_db > $BACKUP_DIR/django_$DATE.sql

# Backup Node.js database
pg_dump -h localhost -U nodejs_user opportunities_prod_db > $BACKUP_DIR/nodejs_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-databases.sh

# Setup cron job (daily at 2 AM)
sudo crontab -e
```

Add:
```
0 2 * * * /usr/local/bin/backup-databases.sh >> /var/log/backup.log 2>&1
```

---

## ✅ Deployment Completion Checklist

### DNS & Domain
- [ ] DNS A records created for api.varsigram.com
- [ ] DNS A records created for opportunities.varsigram.com
- [ ] DNS propagation verified

### SSL/TLS
- [ ] SSL certificates obtained
- [ ] Certificates installed in Nginx
- [ ] HTTPS working for both domains
- [ ] Auto-renewal configured

### Servers
- [ ] Servers provisioned
- [ ] Static IPs assigned
- [ ] Security groups configured
- [ ] Firewall rules set

### Databases
- [ ] PostgreSQL installed/provisioned
- [ ] Django database created
- [ ] Node.js database created
- [ ] Database users created with proper permissions
- [ ] Backups configured

### Django Deployment
- [ ] Application cloned and dependencies installed
- [ ] Environment variables set
- [ ] Migrations run
- [ ] Static files collected
- [ ] Gunicorn service running
- [ ] Accessible at https://api.varsigram.com

### Node.js Deployment
- [ ] Application cloned and dependencies installed
- [ ] TypeScript compiled
- [ ] Prisma migrations run
- [ ] Environment variables set
- [ ] PM2 process running
- [ ] Accessible at https://opportunities.varsigram.com

### Nginx
- [ ] Reverse proxy configured
- [ ] Both services proxied correctly
- [ ] SSL configured
- [ ] Security headers added
- [ ] Nginx restarted and enabled

### Monitoring
- [ ] Health check endpoints verified
- [ ] Uptime monitoring configured
- [ ] Log rotation set up
- [ ] Backup cron jobs configured

### Testing
- [ ] https://api.varsigram.com/health returns OK
- [ ] https://opportunities.varsigram.com/health returns OK
- [ ] Can login to Django and get JWT token
- [ ] Can create opportunity with JWT token on Node.js
- [ ] CORS working between services
- [ ] Mobile app can access both APIs

---

## 📞 Information Needed from Dev Teams

### From Django Developer:
- [ ] Production environment variables
- [ ] Database migration files
- [ ] Static files location
- [ ] Required Python packages (requirements.txt)
- [ ] WSGI application path

### From Node.js Developer:
- [ ] Production environment variables
- [ ] Build output location (dist/)
- [ ] Required Node.js version
- [ ] Database migration command
- [ ] Port number

---

## 🐛 Troubleshooting Commands

```bash
# Check Django service
sudo systemctl status django
sudo journalctl -u django -f

# Check Node.js service
pm2 status
pm2 logs opportunities-api

# Check Nginx
sudo nginx -t
sudo systemctl status nginx
tail -f /var/log/nginx/error.log

# Check database connections
sudo -u postgres psql
\l  # List databases
\du # List users

# Test endpoints
curl https://api.varsigram.com/health
curl https://opportunities.varsigram.com/health
```

---

## 📚 Documentation to Create

- [ ] Infrastructure diagram
- [ ] Server access credentials (in password manager)
- [ ] Backup and restore procedures
- [ ] Incident response plan
- [ ] Scaling procedures
- [ ] Update/deployment procedures

---

**Deployment Complete! 🚀**
