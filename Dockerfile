# Multi-stage build for backend + frontend SPA
FROM node:20-alpine AS frontend-builder

# Install frontend dependencies
WORKDIR /app/frontend
COPY apps/frontend/package*.json ./
RUN npm ci

# Copy source and build
COPY apps/frontend/ ./
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build
# Copy static files to standalone
RUN cp -r public .next/standalone/public
RUN cp -r .next/static .next/standalone/.next/static

# Backend stage
FROM php:8.2-fpm

# Install system dependencies including nginx
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libpq-dev \
    libzip-dev \
    nginx \
    nodejs \
    supervisor

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_pgsql mbstring exif pcntl bcmath gd zip

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy composer files
COPY apps/backend/composer.json apps/backend/composer.lock ./

# Install dependencies
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

# Copy backend application code
COPY apps/backend/ ./

# Copy standalone build
COPY --from=frontend-builder /app/frontend/.next/standalone ./frontend


# Ensure directories exist
RUN mkdir -p storage/app/public
RUN mkdir -p public

# Create storage link (remove existing one first if it exists from host)
RUN rm -f public/storage
RUN ln -s /var/www/storage/app/public /var/www/public/storage

# Finish composer
RUN composer dump-autoload --optimize

# Permissions
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache /var/www/public
RUN chmod -R 755 /var/www/storage /var/www/public

# Configure nginx
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/default.conf /etc/nginx/conf.d/default.conf

# Create supervisor config
RUN mkdir -p /etc/supervisor/conf.d
COPY docker/supervisord.conf /etc/supervisor/conf.d/

# Expose ports
EXPOSE 80 9000

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]