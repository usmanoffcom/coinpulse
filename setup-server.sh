#!/bin/bash

# Server setup script for coinpulse.yappix.studio
# Run this script on the server to set up the application

set -e

SERVER_IP="89.23.102.48"
DOMAIN="coinpulse.yappix.studio"
PORT="3115"
APP_DIR="/var/www/coinpulse"
REPO_URL="https://github.com/usmanoffcom/coinpulse.git"

echo "🔧 Setting up server for $DOMAIN on port $PORT..."

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p $APP_DIR
sudo mkdir -p $APP_DIR/logs

# Clone repository if it doesn't exist
if [ ! -d "$APP_DIR/.git" ]; then
    echo "📥 Cloning repository..."
    cd /var/www
    sudo git clone $REPO_URL coinpulse
    cd $APP_DIR
else
    echo "📥 Repository already exists, pulling latest changes..."
    cd $APP_DIR
    sudo git pull origin main
fi

# Set permissions
echo "🔐 Setting permissions..."
sudo chown -R $USER:$USER $APP_DIR

# Install Node.js dependencies if needed
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install dependencies
echo "📦 Installing npm dependencies..."
cd $APP_DIR
npm ci --production

# Build the application
echo "🔨 Building Next.js application..."
npm run build

# Install PM2 if not installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2
    pm2 startup systemd -u $USER --hp /home/$USER
fi

# Start/restart application with PM2
echo "🚀 Starting application with PM2..."
cd $APP_DIR
pm2 delete coinpulse 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

echo "✅ Server setup completed!"
echo "🌐 Application is running on port $PORT"
echo "📋 Use 'pm2 status' to check application status"
echo "📋 Use 'pm2 logs coinpulse' to view logs"
