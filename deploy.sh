#!/bin/bash

# Production Deployment Script
# Usage: ./deploy.sh [environment]
# Example: ./deploy.sh production

set -e # Exit on error

ENVIRONMENT=${1:-production}

echo "🚀 Starting deployment to $ENVIRONMENT..."

# 1. Pull latest code
echo "📥 Pulling latest code from Git..."
git pull origin main

# 2. Install dependencies
echo "📦 Installing dependencies..."
npm ci --production

# 3. Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

# 4. Build TypeScript
echo "🏗️  Building TypeScript..."
npm run build

# 5. Run database migrations
echo "🗄️  Running database migrations..."
npx prisma migrate deploy

# 6. Restart PM2 process
echo "♻️  Restarting application..."
pm2 reload ecosystem.config.js --env $ENVIRONMENT
pm2 save

# 7. Health check
echo "🏥 Running health check..."
sleep 5

HEALTH_URL="http://localhost:3000/health"
if [ "$ENVIRONMENT" = "production" ]; then
  HEALTH_URL="https://opportunities.varsigram.com/health"
fi

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ "$RESPONSE" -eq 200 ]; then
  echo "✅ Deployment successful! Health check passed."
  echo "🌐 Server is running at $HEALTH_URL"
else
  echo "❌ Deployment failed! Health check returned status code: $RESPONSE"
  echo "🔍 Check logs with: pm2 logs opportunities-api"
  exit 1
fi

echo "🎉 Deployment complete!"
