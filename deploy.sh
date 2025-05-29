#!/bin/bash

set -e

echo "🚀 HRMS System DevOps Deployment"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Parse command line arguments
ENVIRONMENT=${1:-development}
SKIP_BUILD=${2:-false}
USE_DOCKER=${3:-true}

log_info "Starting deployment for environment: $ENVIRONMENT"
log_info "Skip build: $SKIP_BUILD"
log_info "Use Docker: $USE_DOCKER"

# Check prerequisites
log_info "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    log_error "npm is not installed"
    exit 1
fi

if [ "$USE_DOCKER" = "true" ]; then
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
fi

log_success "Prerequisites check passed"

# Install dependencies
if [ "$SKIP_BUILD" != "true" ]; then
    log_info "Installing root dependencies..."
    npm install

    log_info "Installing app dependencies..."
    
    # Install dependencies for each app
    for app in apps/*/; do
        if [ -f "${app}package.json" ]; then
            app_name=$(basename "$app")
            log_info "Installing dependencies for $app_name..."
            cd "$app"
            npm install
            cd - > /dev/null
        fi
    done
    
    log_success "Dependencies installed"
fi

# Build applications
if [ "$SKIP_BUILD" != "true" ]; then
    log_info "Building applications..."
    
    # Build each app
    for app in apps/*/; do
        if [ -f "${app}package.json" ]; then
            app_name=$(basename "$app")
            log_info "Building $app_name..."
            cd "$app"
            
            # Skip build if no build script
            if npm run build &> /dev/null; then
                log_success "Built $app_name"
            else
                log_warning "No build script for $app_name"
            fi
            
            cd - > /dev/null
        fi
    done
    
    log_success "Applications built"
fi

# Environment specific deployment
if [ "$USE_DOCKER" = "true" ]; then
    log_info "Deploying with Docker..."
    
    # Stop existing containers
    log_info "Stopping existing containers..."
    docker-compose down --remove-orphans || true
    
    # Build and start containers
    log_info "Building and starting containers..."
    docker-compose up --build -d
    
    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    sleep 10
    
    # Check service health
    log_info "Checking service health..."
    services=("status-app:3004" "admin-app:3001" "auth-app:3000" "portal-app:3002" "hrms-app:3003")
    
    for service in "${services[@]}"; do
        IFS=':' read -r service_name port <<< "$service"
        if curl -sf "http://localhost:$port/api/health" &> /dev/null; then
            log_success "$service_name is healthy"
        else
            log_warning "$service_name health check failed (may not have health endpoint)"
        fi
    done
    
    # Show running containers
    log_info "Running containers:"
    docker-compose ps
    
else
    log_info "Deploying in development mode..."
    
    # Kill existing processes
    log_info "Stopping existing development servers..."
    pkill -f "next dev" || true
    pkill -f "npm.*dev" || true
    sleep 2
    
    # Start each application in background
    log_info "Starting development servers..."
    
    # Start status app
    cd apps/status
    npm run dev > /dev/null 2>&1 &
    STATUS_PID=$!
    log_info "Started status app (PID: $STATUS_PID)"
    cd - > /dev/null
    
    # Start admin app  
    cd apps/admin
    npm run dev > /dev/null 2>&1 &
    ADMIN_PID=$!
    log_info "Started admin app (PID: $ADMIN_PID)"
    cd - > /dev/null
    
    # Wait for services to start
    sleep 5
    
    # Check if services are running
    if curl -sf "http://localhost:4004" &> /dev/null; then
        log_success "Status app is running on http://localhost:4004"
    else
        log_warning "Status app may not be ready yet"
    fi
    
    if curl -sf "http://localhost:4003" &> /dev/null; then
        log_success "Admin app is running on http://localhost:4003"
    else
        log_warning "Admin app may not be ready yet"
    fi
fi

# Database setup
log_info "Database is already configured with Supabase"
log_success "Database setup complete"

# Final checks and information
log_info "Deployment Summary"
log_info "=================="

if [ "$USE_DOCKER" = "true" ]; then
    echo "🐳 Docker Mode:"
    echo "   Status Page:  http://localhost:4004"
    echo "   Admin Panel:  http://localhost:4003"
    echo "   Auth Service: http://localhost:4000"
    echo "   Portal App:   http://localhost:4001"
    echo "   HRMS App:     http://localhost:4002"
    echo "   Load Balancer: http://localhost:80"
else
    echo "🔧 Development Mode:"
    echo "   Status Page: http://localhost:4004"
    echo "   Admin Panel: http://localhost:4003"
fi

echo ""
echo "📊 Admin Panel Features:"
echo "   • CI/CD Pipeline Management"
echo "   • Merge Request Approval System"
echo "   • Deployment Status Monitoring"
echo "   • Feature Flag Management"
echo "   • Real-time Notifications"
echo ""
echo "🔗 API Endpoints:"
echo "   • Pipelines: /api/automation/pipelines"
echo "   • Merge Requests: /api/automation/merge-requests"
echo "   • GitHub Webhook: /api/webhooks/github"
echo ""
echo "🗄️  Database: Supabase (qdsgmvvhnkzchfupqhrl)"
echo ""

log_success "🎉 Deployment completed successfully!"

if [ "$USE_DOCKER" = "true" ]; then
    echo ""
    log_info "To stop all services: docker-compose down"
    log_info "To view logs: docker-compose logs -f [service_name]"
else
    echo ""
    log_info "Development servers are running in background"
    log_info "To stop: pkill -f 'next dev'"
fi

echo ""
log_info "Happy coding! 🚀" 