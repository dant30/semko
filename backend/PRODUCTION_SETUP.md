# Production Deployment Guide

This guide covers the setup required to safely deploy the SEMKO IMS backend to production.

## Security Configuration

### 1. Required Environment Variables

Before deploying to production, set these environment variables:

```bash
# ============================================================================
# Django Core (REQUIRED)
# ============================================================================
# Generate a secure key with:
# python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
export DJANGO_SECRET_KEY="your-generated-secret-key"

# Set Django to production mode
export DJANGO_DEBUG=False
export DJANGO_SETTINGS_MODULE=semko.settings.production

# Set your production domain(s)
export DJANGO_ALLOWED_HOSTS="www.semko.co.ke,semko.co.ke"

# ============================================================================
# CORS Configuration (Frontend Origin)
# ============================================================================
# Only allow requests from your frontend domain
export CORS_ALLOWED_ORIGINS="https://www.semko.co.ke,https://semko.co.ke"

# ============================================================================
# Database (PostgreSQL)
# ============================================================================
# Option 1: Set individual connection parameters
export DB_NAME="semko_prod"
export DB_USER="semko_user"
export DB_PASSWORD="your-secure-db-password"
export DB_HOST="your-db-host.example.com"
export DB_PORT="5432"

# Option 2: Use DATABASE_URL (for platforms like Heroku, Render, Railway)
# export DATABASE_URL="postgresql://user:password@host:port/dbname"

# ============================================================================
# Email Configuration
# ============================================================================
export DEFAULT_FROM_EMAIL="noreply@semko.co.ke"
export EMAIL_HOST="smtp.gmail.com"
export EMAIL_PORT="587"
export EMAIL_HOST_USER="your-email@gmail.com"
export EMAIL_HOST_PASSWORD="your-app-password"

# ============================================================================
# Redis (Celery & Caching)
# ============================================================================
export CELERY_BROKER_URL="redis://your-redis-host:6379/0"

# ============================================================================
# Logging
# ============================================================================
export DJANGO_LOG_LEVEL="WARNING"  # Use WARNING or ERROR in production
```

### 2. Security Features Enabled in Production

The following security features are automatically enabled when running with `DJANGO_SETTINGS_MODULE=semko.settings.production`:

#### HTTPS & Cookies
- ✅ SSL Redirect: All HTTP requests are redirected to HTTPS
- ✅ Secure Cookies: Session and CSRF cookies are marked secure (HTTPS-only)
- ✅ HSTS Header: HTTP Strict-Transport-Security enforced for 1 year
- ✅ Subdomains Included: HSTS applies to all subdomains

#### Security Headers
- ✅ XSS Filter: Browser XSS protection enabled
- ✅ Clickjacking Protection: X-Frame-Options set to DENY
- ✅ Content Security Policy: Restrictive CSP headers configured

#### CORS
- ✅ Whitelist Only: Only specified frontend origins can make requests
- ✅ Credentials: Cross-origin credentials allowed (for auth cookies/tokens)
- ✅ Method Restriction: Only safe HTTP methods allowed (GET, POST, PUT, PATCH, DELETE, OPTIONS)

### 3. Database Migration

Before deploying, run migrations:

```bash
# In production environment (adjust for Docker/Kubernetes if needed)
python manage.py migrate --no-input
```

### 4. Static Files Handling

```bash
# Collect static files for serving with a web server (nginx, Apache, etc.)
python manage.py collectstatic --no-input
```

### 5. Logging Directory

Ensure the logs directory exists and is writable:

```bash
mkdir -p /path/to/project/logs
chmod 755 /path/to/project/logs
```

### 6. Supervisor/Systemd Configuration Example

#### Using Gunicorn via Systemd

Create `/etc/systemd/system/semko-backend.service`:

```ini
[Unit]
Description=SEMKO IMS Backend
After=network.target

[Service]
Type=notify
User=semko
WorkingDirectory=/path/to/semko/backend
Environment="DJANGO_SETTINGS_MODULE=semko.settings.production"
Environment="DJANGO_SECRET_KEY=your-secret-key"
Environment="DB_NAME=semko_prod"
# Add other environment variables here
ExecStart=/path/to/venv/bin/gunicorn \
    --workers 4 \
    --bind 127.0.0.1:8000 \
    --timeout 120 \
    semko.wsgi:application
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable semko-backend
sudo systemctl start semko-backend
```

### 7. Nginx Reverse Proxy Configuration

Example Nginx config at `/etc/nginx/sites-available/semko`:

```nginx
upstream semko_backend {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name www.semko.co.ke semko.co.ke;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name www.semko.co.ke semko.co.ke;

    # SSL certificate paths (e.g., from Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/semko.co.ke/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/semko.co.ke/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/semko_access.log;
    error_log /var/log/nginx/semko_error.log;

    # Static files (if served by Nginx)
    location /static/ {
        alias /path/to/semko/backend/static/;
        expires 30d;
    }

    # Media files
    location /media/ {
        alias /path/to/semko/backend/media/;
        expires 7d;
    }

    # API proxy
    location / {
        proxy_pass http://semko_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;

        # Timeouts for long-running operations
        proxy_connect_timeout 60s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/semko /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 8. SSL Certificate (Let's Encrypt)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d semko.co.ke -d www.semko.co.ke
```

### 9. Health Check

```bash
curl -I https://www.semko.co.ke/api/v1/health/
# Should return 200 OK
```

## Monitoring & Troubleshooting

### View Logs

```bash
# Supervisor logs (if using supervisor)
tail -f /var/log/supervisor/semko-backend.log

# Systemd logs (if using systemd)
journalctl -u semko-backend -f

# Django application logs
tail -f /path/to/semko/backend/logs/django.log

# Nginx logs
tail -f /var/log/nginx/semko_error.log
```

### Common Issues

**CORS Error (browser console):**
- Ensure `CORS_ALLOWED_ORIGINS` includes your frontend domain
- Verify frontend domain matches exactly (http vs https, www vs non-www)

**SSL Certificate Issues:**
- Check certificate expiration: `openssl x509 -in /path/to/cert.pem -noout -dates`
- Renew with: `sudo certbot renew`

**Database Connection:**
- Test with: `psql -h $DB_HOST -U $DB_USER -d $DB_NAME`

**502 Bad Gateway (Nginx):**
- Check if backend is running: `ps aux | grep gunicorn`
- Check backend logs: `journalctl -u semko-backend -n 50`

## Backup & Recovery

```bash
# Backup database
pg_dump -h $DB_HOST -U $DB_USER $DB_NAME | gzip > semko_backup_$(date +%Y%m%d).sql.gz

# Backup media files
tar -czf media_backup_$(date +%Y%m%d).tar.gz media/
```

## Additional Resources

- [Django Security Documentation](https://docs.djangoproject.com/en/4.2/topics/security/)
- [Django HTTPS/SSL Guide](https://docs.djangoproject.com/en/4.2/topics/security/#ssl-https)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Nginx Configuration](https://nginx.org/en/docs/)
