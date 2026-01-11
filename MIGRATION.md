# Migration from Docker Compose to External Services

This document outlines the migration from docker-compose to external services using Dockerfiles only.

## What Changed

### 1. Environment Configuration
- Updated `apps/backend/.env.example` to use environment variables for external services
- Created `.env.external` template for external service configuration

### 2. Dockerfiles
- Created `apps/backend/Dockerfile.prod` with supervisor for production
- Created `apps/frontend/Dockerfile.prod` with external API URL support
- Added supervisord configuration for backend services

### 3. Deployment Scripts
- Created `deploy.sh` script for building and running containers with external services

## External Services Required

You'll need external services for:
- **PostgreSQL**: Database hosting
- **Redis**: Caching and queue storage  
- **Email Service**: SMTP provider (SendGrid, Mailgun, etc.)

## Quick Start

1. Configure external services:
```bash
cp .env.external .env
# Edit .env with your service details
```

2. Deploy:
```bash
./deploy.sh all
```

## Environment Variables

### Backend
- `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DATABASE`, `POSTGRES_USERNAME`, `POSTGRES_PASSWORD`
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_ENCRYPTION`, `MAIL_FROM_ADDRESS`

### Frontend
- `NEXT_PUBLIC_API_URL`: Your backend API URL

## Migration Steps

1. Set up external PostgreSQL, Redis, and email services
2. Update `.env` with external service credentials
3. Build and deploy using the new Dockerfiles
4. Test all external service connections
5. Remove `docker-compose.yml` once migration is complete

## Benefits

- No local service management
- Scalable external services
- Better separation of concerns
- Production-ready configuration