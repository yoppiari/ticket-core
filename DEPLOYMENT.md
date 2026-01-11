# Deployment Guide

This guide describes how to deploy the Ticketing application (Laravel Backend + Next.js Frontend) to a production server using external services.

## Prerequisites

- Docker installed on the server.
- External services: PostgreSQL, Redis, Email provider
- Git (optional, if pulling code).
- A domain name pointing to the server (for Nginx/SSL).

## Configuration

1.  **Environment Variables**:
     - Ensure `apps/backend/.env` exists and contains production values.
     - Set `APP_ENV=production`, `APP_DEBUG=false`, and configure `DB_*` to match your external PostgreSQL service.
     - Configure `REDIS_HOST` to point to your external Redis service.
     - Configure email service variables (`MAIL_HOST`, `MAIL_PORT`, etc.)

2.  **Frontend Config**:
     - The frontend Dockerfile uses `NEXT_PUBLIC_API_URL` environment variable at BUILD time or RUN time.
     - Set `NEXT_PUBLIC_API_URL` to point to your backend API URL.
     - Checks `apps/frontend/next.config.ts` has `output: "standalone"`.

## Deploying

1.  **Build and Start Services**:
     Run the deployment script from the project root:

     ```bash
     ./deploy.sh all
     ```

     This will:
     - Build the Backend image (PHP-FPM with supervisor).
     - Build the Frontend image (Next.js Standalone).
     - Start containers configured for external services.

2.  **Run Migrations**:
     Once services are up, run the database migrations:

     ```bash
     docker exec ticket-backend php artisan migrate --force
     ```

     (Optional) Seed data if needed:
     ```bash
     docker exec ticket-backend php artisan db:seed --force
     ```

3.  **Storage Permissions**:
     Ensure storage is writable:
     ```bash
     docker exec ticket-backend chown -R www-data:www-data /var/www/storage
     ```

## Accessing the Application

- **Frontend**: Accessed via `http://localhost:3000` (or your configured port).
- **Backend API**: Accessed via `http://localhost:9000` (PHP-FPM).

## SSL (Optional but Recommended)

For SSL, you can use Let's Encrypt with Certbot on the host machine and proxy to port 3000, or run a separate Nginx/Traefik container handling SSL termination.

## Troubleshooting

- **Logs**:
     ```bash
     docker logs ticket-backend
     docker logs ticket-frontend
     ```
- **Rebuild**:
     ```bash
     ./deploy.sh all
     ```