#!/bin/bash

# Deployment script for coinpulse.yappix.studio
# Server: 89.23.102.48
# Domain: coinpulse.yappix.studio
# Port: 3115

set -e

echo "🚀 Starting deployment..."

# Git pull latest changes
echo "📥 Pulling latest changes from main branch..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production

# Build the application
echo "🔨 Building Next.js application..."
npm run build

# Restart PM2 process
echo "🔄 Restarting application..."
pm2 restart coinpulse || pm2 start ecosystem.config.js

echo "✅ Deployment completed successfully!"
echo "🌐 Application is running on http://coinpulse.yappix.studio"
