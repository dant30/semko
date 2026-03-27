# Frontend Deployment Guide

This guide covers building and deploying the SEMKO IMS frontend to production with proper API proxy configuration.

## Environment Configuration

### Development Environment

The development setup uses Vite's dev server with a built-in proxy to handle API requests:

```bash
# 1. Copy example env file
cp .env.example .env

# 2. Ensure these values in .env:
# VITE_APP_NAME=SEMKO IMS
# VITE_API_BASE_URL=/api                    # Relative path, proxied to backend
# VITE_BACKEND_URL=http://127.0.0.1:8000   # Dev proxy target
```

When running `npm run dev`, the Vite dev server:
- Serves the frontend on `http://localhost:3000`
- Proxies `/api/*` requests to `http://127.0.0.1:8000/api/*`
- Proxies `/static/*` and `/media/*` similarly

### Production Environment

For production builds, you have several deployment options:

#### Option 1: Same-Domain Deployment (Recommended for CORS-Free Setup)

Backend and frontend served from the same domain (e.g., `https://www.semko.co.ke`).

```bash
# .env (Production build)
VITE_APP_NAME=SEMKO IMS
VITE_API_BASE_URL=/api/v1
# VITE_BACKEND_URL is ignored in production builds

# Nginx config routes:
# /       → Frontend (built files)
# /api/v1 → Backend (proxied to gunicorn)
```

#### Option 2: Separate Domains (Requires CORS)

Frontend on `https://app.semko.co.ke`, backend on `https://api.semko.co.ke`.

```bash
# .env (Production build)
VITE_APP_NAME=SEMKO IMS
VITE_API_BASE_URL=https://api.semko.co.ke/api/v1
# VITE_BACKEND_URL is ignored in production builds

# Backend CORS configuration (set environment variable):
# CORS_ALLOWED_ORIGINS=https://app.semko.co.ke
```

## Building for Production

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Application

```bash
# Creates optimized production build in dist/
npm run build

# Or with environment file:
# NODE_ENV=production npm run build
```

### 3. Preview Build Locally

```bash
npm run preview
# Opens on http://localhost:4173
```

## Deployment Options

### Option A: Static File Server + Reverse Proxy (Nginx/Apache)

Most common and simplest approach.

#### Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name www.semko.co.ke;

    ssl_certificate /etc/letsencrypt/live/semko.co.ke/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/semko.co.ke/privkey.pem;

    # Set maximum file upload size
    client_max_body_size 50M;

    # Logging
    access_log /var/log/nginx/semko_access.log;
    error_log /var/log/nginx/semko_error.log;

    # ====================================================================
    # Frontend (React SPA)
    # ====================================================================
    location / {
        # Serve built frontend files
        root /path/to/frontend/dist;
        
        # Critical: Serve index.html for SPA routing
        try_files $uri $uri/ /index.html;

        # Cache control for static files
        if ($uri ~ \.(js|css|png|jpg|gif|ico|svg|woff|woff2)$) {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Don't cache index.html
        if ($uri = /index.html) {
            add_header Cache-Control "no-cache, no-store, must-revalidate";
        }
    }

    # ====================================================================
    # Backend API Proxy
    # ====================================================================
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Required for CORS preflight
        proxy_set_header Access-Control-Allow-Origin "*";
        
        proxy_redirect off;
        proxy_connect_timeout 60s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }

    # ====================================================================
    # Media Files
    # ====================================================================
    location /media {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        expires 7d;
        add_header Cache-Control "public";
    }

    # ====================================================================
    # Static Files
    # ====================================================================
    location /static {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name www.semko.co.ke semko.co.ke;
    return 301 https://$server_name$request_uri;
}
```

#### Deploy Steps

```bash
# 1. Build frontend
cd frontend
npm run build

# 2. Copy dist to server
scp -r dist/ user@server:/path/to/frontend/dist/

# 3. Update Nginx config and reload
sudo systemctl reload nginx

# 4. Test health
curl -I https://www.semko.co.ke
```

### Option B: Docker Deployment

#### Dockerfile (Multi-stage Build)

```dockerfile
# ============================================================================
# Stage 1: Build
# ============================================================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build frontend
ARG VITE_APP_NAME=SEMKO\ IMS
ARG VITE_API_BASE_URL=/api/v1
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ============================================================================
# Stage 2: Runtime
# ============================================================================
FROM nginx:alpine

# Copy Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built frontend from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

#### Build and Run

```bash
# Build image
docker build \
  --build-arg VITE_APP_NAME="SEMKO IMS" \
  --build-arg VITE_API_BASE_URL="/api/v1" \
  -t semko-frontend:latest .

# Run container
docker run -d \
  --name semko-frontend \
  -p 3000:80 \
  -e VIRTUAL_HOST=www.semko.co.ke \
  semko-frontend:latest
```

### Option C: Node.js Server (Recommended for SPA + SSR)

If you want SSR or server-side routing logic, you can use Node.js:

```bash
# 1. Install dependencies
npm install --save-dev express cors

# 2. Create server.js
cat > server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for API calls (already handled by backend, but safe to enable)
app.use(cors());

// Serve static files (built dist)
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback: serve index.html for unmatched routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
EOF

# 3. Update package.json scripts
# "start": "node server.js",
# "build": "vite build"

# 4. Run
npm run build
npm start
```

## Environment Variables for Build

### Build-Time Variables (Must be set before `npm run build`)

```bash
# Frontend build
export VITE_APP_NAME="SEMKO IMS"
export VITE_API_BASE_URL="/api/v1"

npm run build
```

### Runtime Variables (For Node.js server option)

```bash
export PORT=3000
export API_BASE_URL="https://api.semko.co.ke"
npm start
```

## Optimization Checklist

- [ ] Enable gzip compression in Nginx
- [ ] Set `Cache-Control` headers for static assets
- [ ] Use a CDN for static files (CloudFront, Cloudflare, etc.)
- [ ] Enable source map uploads to error tracking (Sentry)
- [ ] Run `npm run build` in production mode
- [ ] Verify API calls use correct base URL
- [ ] Test CORS headers in browser DevTools
- [ ] Monitor bundle size with `npm run build -- --analyze`

## Testing Production Build Locally

```bash
# Build
npm run build

# Preview (simulates production)
npm run preview

# Open browser and check:
# 1. Network tab: verify /api requests go to backend
# 2. Console: no CORS errors
# 3. Application works as expected
```

## Troubleshooting

### CORS Error in Browser

**Error:** `Access to XMLHttpRequest at 'https://api.semko.co.ke' from origin 'https://app.semko.co.ke' has been blocked by CORS policy`

**Solution:**
1. Verify backend `CORS_ALLOWED_ORIGINS` includes your frontend domain
2. Ensure frontend `VITE_API_BASE_URL` is correct
3. Check browser DevTools for exact error message

### Blank Page After Deploy

**Cause:** Frontend build artifacts not properly served

**Debug:**
```bash
# Check if dist folder exists
ls -la dist/

# Verify Nginx config points to correct dist path
sudo nginx -T | grep root

# Check Nginx error log
sudo tail -f /var/log/nginx/error.log
```

### 404 on Route Navigation

**Cause:** Nginx not configured for SPA routing

**Solution:**
Ensure Nginx has `try_files $uri /index.html;` in location / block

### API Calls to Wrong URL

**Check:**
```bash
# In browser DevTools Network tab, inspect API request
# Should show full URL like: https://api.semko.co.ke/api/v1/...

# Or check in React:
console.log(import.meta.env.VITE_API_BASE_URL);
```

## Performance Monitoring

### Lighthouse Audit

```bash
npm install -g lighthouse

lighthouse https://www.semko.co.ke --json > lighthouse.json
```

### Bundle Size Analysis

```bash
npm install -D vite-plugin-visualizer

# Then in vite.config.ts add:
# import { visualizer } from "rollup-plugin-visualizer";
# plugins: [visualizer()]

npm run build
# Opens dist/stats.html

```

## Rollback Procedure

```bash
# Keep previous dist as dist.backup
mv dist dist.backup
mv dist.previous dist

# Restart/reload server
sudo systemctl reload nginx
# or
docker restart semko-frontend
```

## Additional Resources

- [Vite Deployment Docs](https://vitejs.dev/guide/static-deploy.html)
- [React Router SPA Deployment](https://reactrouter.com/start/library/serving)
- [Nginx SPA Configuration](https://nginx.org/en/docs/)
- [Let's Encrypt SSL](https://letsencrypt.org/)
