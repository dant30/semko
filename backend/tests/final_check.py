#!/usr/bin/env python
"""
Comprehensive Django application initialization and migration check.
Verifies that all models load correctly and migrations can be created.
"""
import os
import sys
import subprocess

# Add backend directory to path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)
os.chdir(backend_dir)

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'semko.settings.development')

print("="*70)
print("DJANGO APPLICATION INITIALIZATION CHECK")
print("="*70 + "\n")

# Step 1: Test Django setup
print("Step 1: Testing Django setup...")
try:
    import django
    django.setup()
    print("✓ Django initialized successfully\n")
except Exception as e:
    print(f"✗ Django initialization failed: {e}\n")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Step 2: Verify models import
print("Step 2: Verifying model imports...")
try:
    from apps.vehicles.models.vehicle import Vehicle
    from apps.vehicles.models.vehicle_type import VehicleType
    from apps.vehicles.models.ownership import VehicleOwnership
    from apps.vehicles.constants import VehicleStatus
    print("✓ All vehicle models imported successfully\n")
except ImportError as e:
    print(f"✗ Model import failed: {e}\n")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Step 3: Verify app registry
print("Step 3: Checking app registry...")
try:
    from django.apps import apps
    vehicles_config = apps.get_app_config('vehicles')
    models = [m.__name__ for m in vehicles_config.get_models()]
    print(f"✓ Vehicles app registered with models: {models}\n")
except Exception as e:
    print(f"✗ App registry check failed: {e}\n")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Step 4: Check URL configuration
print("Step 4: Checking URL configuration...")
try:
    from django.urls import get_resolver
    resolver = get_resolver()
    print("✓ URL configuration loaded successfully\n")
except Exception as e:
    print(f"✗ URL configuration check failed: {e}\n")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Step 5: Run makemigrations --dry-run
print("Step 5: Testing makemigrations...")
try:
    result = subprocess.run(
        [sys.executable, "manage.py", "makemigrations", "--dry-run", "--verbosity=2"],
        capture_output=True,
        text=True,
        timeout=30
    )
    
    if result.returncode == 0:
        print("✓ makemigrations succeeded")
        if result.stdout:
            print("Output:", result.stdout[:500])
    else:
        print(f"✗ makemigrations failed with return code {result.returncode}")
        print("STDERR:", result.stderr[:1000])
        sys.exit(1)
    print()
except subprocess.TimeoutExpired:
    print("✗ makemigrations timed out")
    sys.exit(1)
except Exception as e:
    print(f"✗ makemigrations check failed: {e}")
    sys.exit(1)

print("="*70)
print("✅ ALL CHECKS PASSED!")
print("="*70)
print("\nNext steps:")
print("1. Review migration changes: python manage.py makemigrations")
print("2. Apply migrations: python manage.py migrate")
print("3. Run tests: python manage.py test")
