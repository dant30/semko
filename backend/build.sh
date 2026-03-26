#!/usr/bin/env bash
set -euo pipefail

echo "Building Semko backend..."

# 1. Install backend dependencies
pip install --upgrade pip
pip install -r requirements/prod.txt

# 2. Wait for database
echo "Waiting for database to be available..."
MAX_RETRIES=20
SLEEP=3
n=0

until python - <<'PY'
import os, sys
from urllib.parse import urlparse

try:
    import psycopg2
    url = os.environ.get('DATABASE_URL')
    if not url:
        print('DATABASE_URL not set')
        sys.exit(1)

    p = urlparse(url)
    conn = psycopg2.connect(
        dbname=p.path.lstrip('/'),
        user=p.username,
        password=p.password,
        host=p.hostname,
        port=p.port or 5432,
        connect_timeout=5,
    )
    conn.close()
    print('Database connection successful')
    sys.exit(0)

except psycopg2.OperationalError as e:
    print(f'Database not ready: {e}')
    sys.exit(1)
except Exception as e:
    print(f'Unexpected DB error: {e}')
    sys.exit(1)
PY

do
  n=$((n+1))
  if [ "$n" -ge "$MAX_RETRIES" ]; then
    echo "Database did not become available after $MAX_RETRIES attempts"
    exit 1
  fi
  echo "Retrying in $SLEEP seconds... ($n/$MAX_RETRIES)"
  sleep "$SLEEP"
done

echo "Database is ready"

# 3. Run migrations
echo "Running database migrations..."
python manage.py migrate --noinput

# 4. Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

# 5. Create/update superuser (idempotent)
echo "Setting up superuser..."
python manage.py shell <<'PY'
import os, secrets
from django.db import transaction
from apps.users.models import User

email = os.getenv('ADMIN_EMAIL', 'admin@semko.local')
phone = os.getenv('ADMIN_PHONE', '+0000000000')
password = os.getenv('ADMIN_PASSWORD')
rotate_password = os.getenv('ADMIN_ROTATE_PASSWORD_ON_DEPLOY', 'false').lower() == 'true'

with transaction.atomic():
    user = User.objects.filter(email=email, is_superuser=True).first()
    if user:
        print(f'Superuser exists: {email}')
        modified = False
        if phone and user.phone_number != phone:
            user.phone_number = phone
            modified = True
            print(f'Updated phone to {phone}')
        if password and rotate_password:
            user.set_password(password)
            modified = True
            print('Rotated admin password')
        if modified:
            user.save()
    else:
        if not password:
            password = secrets.token_urlsafe(16)
        User.objects.create_superuser(
            username=email,
            email=email,
            password=password,
            role=User.objects.filter(role__code='admin').first(),
        )
        print(f'Created superuser {email}')
PY

# 6. Setup default data
echo "Setting up default data..."
python manage.py setup_default_data || echo "setup_default_data not defined"

# 7. Seed transactional data (optional)
echo "Setting up seed data..."
SEED_TEST_DATA=${SEED_TEST_DATA:-true}
if [ "$SEED_TEST_DATA" = "true" ]; then
  echo "Seeding test data..."
  python manage.py seed_test_data --force || echo "seed_test_data failed"
else
  echo "Skipping seed_test_data"
fi

# 8. Verify setup
python manage.py shell <<'PY'
from apps.users.models import User
print(f'Total users: {User.objects.count()}')
print(f'Superusers: {User.objects.filter(is_superuser=True).count()}')
PY

echo "Build completed successfully"
