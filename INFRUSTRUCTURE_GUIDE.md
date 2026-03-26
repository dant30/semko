Infrastructure Setup Guide
SEMKO Enterprise Resource Planning System
Document Version: 1.0
Author: Dancan Kariuki (Lead Developer)
Date: March 2026
Target Audience: Newly Employed Developer

Welcome to SEMKO! 👋
Congratulations on joining the SEMKO team! You've been hired to continue development of our Integrated Management System. This guide will walk you through exactly what you need to do to get started with all the infrastructure, accounts, and access you'll need.

Part 1: Understanding What's Already Done ✅
Before you start, here's what the previous developer (Dancan) has already completed:

Completed Items:
✅ System Design Document approved by Director

✅ Project structure created with all Django apps

✅ Basic authentication foundation

✅ Development environment setup scripts

✅ Docker configuration for local development

✅ Initial database models designed

What's Waiting for You:
⬜ GitHub repository access and commits

⬜ Domain registration and configuration

⬜ Email system setup (notifications, password reset)

⬜ Cloud hosting account

⬜ SSL certificates

⬜ Production deployment

Part 2: Day 1 - Access & Accounts Setup
2.1 GitHub Repository Setup
Situation: The code exists locally on Dancan's machine and in the project structure you received, but it's not yet on GitHub.

Your Tasks:

Step 1: Create a GitHub Organization (or use personal account)
bash
# Option A: If company has GitHub organization
# Ask director: "Does SEMKO have a GitHub organization, or should I create one?"

# Option B: Create new organization
# Go to https://github.com/organizations/plan
# Choose Free plan (unlimited public/private repos)
# Organization name: semko-ltd or semko-erp
Step 2: Create the Repository
bash
# 1. On GitHub, click "New repository"
# Repository name: semko-erp-system
# Description: SEMKO Integrated Management System for fleet operations
# Visibility: Private
# Initialize: DO NOT initialize with README (we have one already)

# 2. On your local machine, navigate to the project
cd /path/to/semko

# 3. Initialize git (if not already done)
git init

# 4. Add remote origin
git remote add origin https://github.com/your-org/semko-erp-system.git

# 5. Create main branch and push
git checkout -b main
git add .
git commit -m "Initial commit: SEMKO ERP system structure from SDD"
git push -u origin main

# 6. Create develop branch
git checkout -b develop
git push -u origin develop
Step 3: Set Up Branch Protection Rules
Go to GitHub → Settings → Branches → Add rule:

Branch: main

Require pull request reviews before merging

Require status checks

Include administrators

Step 4: Add Team Members
bash
# Invite:
# - Director (view access)
# - Operations Manager (view access)
# - Future developers (write access)
# - Yourself (admin)
2.2 Domain Name Setup
Situation: You need a domain for the production system.

Option A: Use Existing Company Domain
bash
# Ask director:
# "Does SEMKO already own a domain like semko.co.ke or semkoltd.com?"

# If yes:
# 1. Get access to domain registrar (Namecheap, GoDaddy, etc.)
# 2. Create subdomain: erp.semko.co.ke or app.semko.co.ke
Option B: Register New Domain
bash
# Recommended registrars:
# - Namecheap (KES 1,500-2,000/year)
# - GoDaddy (KES 1,800-2,500/year)
# - Kenya Website Experts (local, KES 2,000/year)

# Domain suggestions:
# - semkoerp.com
# - semkosystem.com
# - erp.semko.co.ke (if you buy semko.co.ke)

# Registration steps:
# 1. Go to Namecheap.com
# 2. Search for domain availability
# 3. Purchase (company credit card)
# 4. Set up auto-renewal
# 5. Add to company asset register
Step 3: DNS Configuration
After getting domain, you'll need to point it to your future cloud server:

bash
# At your domain registrar, add these DNS records:
# (You'll get the IP address from your cloud provider later)

# A Record
Host: @ or erp
Value: [YOUR_SERVER_IP]
TTL: 3600

# CNAME for www (if needed)
Host: www
Value: @
TTL: 3600
2.3 Email System Setup
Situation: The system needs to send emails for:

Password reset

Notifications

Reports

Alerts

Option A: Transactional Email Service (Recommended)
bash
# Choice 1: SendGrid (Free tier: 100 emails/day)
# 1. Go to sendgrid.com
# 2. Sign up with company email
# 3. Create account
# 4. Verify domain (optional but recommended)
# 5. Get API key
# 6. Update .env file:

# In backend/.env
SENDGRID_API_KEY=your_api_key_here
EMAIL_FROM=noreply@semko.co.ke
bash
# Choice 2: Mailgun (Free tier: 5,000 emails/month)
# 1. Go to mailgun.com
# 2. Sign up
# 3. Add and verify domain
# 4. Get SMTP credentials
# 5. Update .env:

# In backend/.env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_HOST_USER=postmaster@mg.semko.co.ke
EMAIL_HOST_PASSWORD=your_password
EMAIL_USE_TLS=True
Option B: Gmail SMTP (For Development Only)
bash
# For testing only - NOT for production!
# 1. Create company Gmail: semko.erp@gmail.com
# 2. Enable 2-factor authentication
# 3. Create app password
# 4. Update .env:

# In backend/.env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=semko.erp@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
EMAIL_USE_TLS=True
2.4 Cloud Hosting Setup
Situation: You need a server to host the application.

Option A: DigitalOcean (Recommended for beginners)
bash
# 1. Go to digitalocean.com
# 2. Sign up with company email
# 3. Add billing info (company card)
# 4. Create Droplet (Virtual Machine)

# Droplet Configuration:
# - Distribution: Ubuntu 22.04 LTS
# - Plan: Basic
# - CPU: Regular with SSD
# - Price: $12/month (4GB RAM, 2 vCPUs) or $24/month for production
# - Datacenter: Choose closest (Frankfurt for Kenya, or NYC)
# - Authentication: SSH keys (set this up!)

# 5. Create SSH key on your machine:
ssh-keygen -t rsa -b 4096 -C "your.email@semko.com"
# Save as: ~/.ssh/semko_production

# 6. Add public key to DigitalOcean
Option B: AWS (More complex, more scalable)
bash
# 1. Go to aws.amazon.com
# 2. Create account (requires credit card)
# 3. Set up billing alerts immediately!
# 4. Launch EC2 instance:
#    - t3.medium (2 vCPU, 4GB RAM)
#    - Ubuntu 22.04
#    - 20GB SSD
#    - Security group: open ports 22, 80, 443
Option C: Linode (Similar to DigitalOcean)
bash
# 1. Go to linode.com
# 2. Create account
# 3. Create Linode (similar to DigitalOcean)
# 4. Same configuration as DigitalOcean
2.5 SSL Certificate Setup
Situation: Your site needs HTTPS for security.

bash
# Let's Encrypt is FREE and automated

# After server is set up with domain pointing to it:

# 1. SSH into your server
ssh -i ~/.ssh/semko_production root@your_server_ip

# 2. Install Certbot
apt update
apt install certbot python3-certbot-nginx

# 3. Get certificate
certbot --nginx -d erp.semko.co.ke

# 4. Follow prompts (email, agree to terms)

# 5. Auto-renewal is automatic! Test it:
certbot renew --dry-run
2.6 Backup System Setup
Situation: You need automated backups to prevent data loss.

bash
# Option 1: DigitalOcean Backups ($2/month extra)
# Enable in DigitalOcean dashboard

# Option 2: Custom backup script
# Create this script in backend/scripts/automated_backup.sh

#!/bin/bash
# Automated backup script for SEMKO ERP

# Variables
BACKUP_DIR="/var/backups/semko"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="semko"
DB_USER="semko"
DB_PASSWORD="your_password"
S3_BUCKET="s3://semko-backups"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
PGPASSWORD=$DB_PASSWORD pg_dump -U $DB_USER $DB_NAME > $BACKUP_DIR/db_$DATE.sql

# Backup media files
tar -czf $BACKUP_DIR/media_$DATE.tar.gz /var/www/semko/media

# Upload to cloud storage (if using S3-compatible)
aws s3 cp $BACKUP_DIR/db_$DATE.sql $S3_BUCKET/database/
aws s3 cp $BACKUP_DIR/media_$DATE.tar.gz $S3_BUCKET/media/

# Keep only last 7 days locally
find $BACKUP_DIR -type f -mtime +7 -delete

# Log the backup
echo "Backup completed at $DATE" >> /var/log/semko_backup.log

# Set up cron job (runs daily at 2 AM)
# Add to crontab: 0 2 * * * /var/www/semko/scripts/automated_backup.sh
2.7 Monitoring Setup
Situation: You need to know if the system goes down.

bash
# Option 1: Uptime Robot (Free)
# 1. Go to uptimerobot.com
# 2. Create account
# 3. Add monitor: https://erp.semko.co.ke
# 4. Set alert contacts (email, SMS)

# Option 2: Better Stack (formerly Uptime) - Free tier
# 1. Go to betterstack.com
# 2. Create account
# 3. Add status page
# 4. Configure alerts
2.8 Error Tracking
Situation: You need to know when errors happen in production.

bash
# Option: Sentry (Free tier)
# 1. Go to sentry.io
# 2. Create account with company email
# 3. Create new project: Django
# 4. Get DSN (Data Source Name)
# 5. Add to Django settings:

# In backend/semko/settings/production.py
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn="your_sentry_dsn_here",
    integrations=[DjangoIntegration()],
    traces_sample_rate=1.0,
    send_default_pii=True
)
Part 3: Configuration Files to Update
3.1 Environment Variables
Create/update .env file in backend/:

bash
# backend/.env (production example)

# Django
DJANGO_SECRET_KEY=generate-a-long-random-string-here
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=erp.semko.co.ke,localhost

# Database (Production)
DB_NAME=semko_prod
DB_USER=semko_admin
DB_PASSWORD=strong-password-here
DB_HOST=localhost
DB_PORT=5432

# Email (SendGrid example)
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=noreply@semko.co.ke

# Cloud Storage (if using S3)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_STORAGE_BUCKET_NAME=semko-media
AWS_S3_REGION_NAME=eu-west-1

# Sentry
SENTRY_DSN=your_sentry_dsn

# Security
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
3.2 Production Settings
Update backend/semko/settings/production.py:

python
from .base import *
import os

DEBUG = False

ALLOWED_HOSTS = os.environ.get('DJANGO_ALLOWED_HOSTS', '').split(',')

# Security settings
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Static files
STATIC_ROOT = '/var/www/semko/static'
MEDIA_ROOT = '/var/www/semko/media'

# Database - use environment variables
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST'),
        'PORT': os.environ.get('DB_PORT'),
    }
}

# Email configuration
if os.environ.get('SENDGRID_API_KEY'):
    EMAIL_BACKEND = 'sendgrid_backend.SendgridBackend'
    SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY')
    SENDGRID_SANDBOX_MODE_IN_DEBUG = False

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': '/var/log/semko/error.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'ERROR',
            'propagate': True,
        },
    },
}
Part 4: Deployment Checklist
Week 1 Tasks:
Task	Status	Done?
Create GitHub organization/repo	⬜	
Push code to GitHub	⬜	
Add team members to GitHub	⬜	
Register/purchase domain	⬜	
Set up email service (SendGrid/Mailgun)	⬜	
Create cloud hosting account	⬜	
Set up SSH keys	⬜	
Week 2 Tasks:
Task	Status	Done?
Deploy to staging server	⬜	
Configure domain DNS	⬜	
Set up SSL certificate	⬜	
Test email sending	⬜	
Set up automated backups	⬜	
Configure monitoring	⬜	
Set up error tracking (Sentry)	⬜	
Week 3 Tasks:
Task	Status	Done?
Deploy to production	⬜	
Final DNS switch	⬜	
Test all functionality	⬜	
Train users	⬜	
Document all credentials in password manager	⬜	
Part 5: Password Management
CRITICAL: Never store passwords in plain text or share via email.

Recommended Setup:
bash
# 1. Set up company password manager
# Options:
# - Bitwarden (free, open source)
# - 1Password (paid)
# - LastPass (paid)

# 2. Create shared folder for SEMKO
# Store all credentials:
# - GitHub tokens
# - Domain registrar login
# - Cloud hosting credentials
# - Email service API keys
# - Database passwords
# - SSL certificate info

# 3. Share with authorized team members only
# - Director (emergency access)
# - Lead Developer (you)
# - Backup developer (future)
Emergency Access Document (Physical):
Create a sealed envelope with:

Master password to password manager

Domain registrar login

Cloud hosting support PIN

Director's personal email (for account recovery)

Store in company safe.

Part 6: Monthly Maintenance Tasks
First Week of Each Month:
bash
# 1. Check domain renewal date
# 2. Verify SSL certificate expiry
# 3. Review cloud hosting bills
# 4. Test backup restoration
# 5. Update security patches
# 6. Review error logs
# 7. Check email service usage (free tier limits)
Part 7: Quick Reference - Credentials Tracker
Use this table to track all accounts (store securely in password manager):

Service	URL	Username/Email	Purpose	Renewal Date
GitHub	github.com		Code repository	N/A
Domain Registrar	namecheap.com		erp.semko.co.ke	[DATE]
DigitalOcean	digitalocean.com		Cloud server	Monthly
SendGrid	sendgrid.com		Email sending	Monthly
Sentry	sentry.io		Error tracking	Monthly
Uptime Robot	uptimerobot.com		Monitoring	Free
Bitwarden	bitwarden.com		Passwords	Monthly
Part 8: First Day Checklist for You
markdown
## My First Week Checklist

### Day 1:
- [ ] Meet with director to confirm priorities
- [ ] Get company credit card for accounts
- [ ] Set up GitHub
- [ ] Push code to GitHub
- [ ] Get domain decision (existing or new)

### Day 2:
- [ ] Register/purchase domain
- [ ] Set up email service account
- [ ] Create cloud hosting account
- [ ] Generate SSH keys

### Day 3:
- [ ] Set up staging server
- [ ] Configure DNS
- [ ] Deploy basic app to staging
- [ ] Test email sending

### Day 4:
- [ ] Set up production server
- [ ] Configure SSL
- [ ] Set up backups
- [ ] Set up monitoring

### Day 5:
- [ ] Document all credentials in password manager
- [ ] Create deployment guide
- [ ] Plan next development sprint
- [ ] Report progress to director
Common Pitfalls to Avoid
❌ Using personal accounts for company services

Always use company email and company payment method

❌ Storing passwords in spreadsheets or text files

Use a password manager from day one

❌ Skipping backups "just for now"

Set up automated backups before going live

❌ Using root account for everything

Create limited access users for each service

❌ Not documenting DNS changes

Keep a log of all DNS records and changes

Emergency Contacts
Issue	Contact	Phone/Email
Domain/hosting payment	Director	[DIRECTOR_EMAIL]
GitHub account locked	GitHub Support	support@github.com
Server hacked	Emergency	[DIRECTOR_PHONE]
Data loss	Emergency	[DIRECTOR_PHONE]
Need Help?
Dancan (Previous Developer): Available for questions (contact info in handover document)

Director: For budget approvals and domain decisions

GitHub Docs: https://docs.github.com

DigitalOcean Tutorials: https://www.digitalocean.com/community/tutorials

Welcome aboard! You've got this! 🚀

*Document Version: 1.0 - Last Updated: March 2026*