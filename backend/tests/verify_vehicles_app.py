#!/usr/bin/env python
"""
Django app initialization test script.
Verifies that all models can be imported and the app registry is ready.
"""
import os
import sys
import django

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Setup Django before any model imports
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'semko.settings.development')

print("Initializing Django...")
try:
    django.setup()
    print("✓ Django setup successful\n")
except Exception as e:
    print(f"✗ Django setup failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Now test model imports
print("Testing model imports...")
try:
    from apps.vehicles.models.vehicle import Vehicle
    from apps.vehicles.models.vehicle_type import VehicleType
    from apps.vehicles.models.ownership import VehicleOwnership
    print("✓ Vehicle models imported successfully")
except ImportError as e:
    print(f"✗ Model import failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test serializer imports
print("\nTesting serializer imports...")
try:
    from apps.vehicles.serializers import (
        VehicleReadSerializer,
        VehicleWriteSerializer,
        VehicleTypeSerializer,
        VehicleOwnershipSerializer,
    )
    print("✓ Vehicle serializers imported successfully")
except ImportError as e:
    print(f"✗ Serializer import failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Test app registry
print("\nTesting Django app registry...")
try:
    from django.apps import apps
    vehicles_app = apps.get_app_config('vehicles')
    print(f"✓ Vehicles app config loaded: {vehicles_app.name}")
    print(f"  - Models: {[m.__name__ for m in vehicles_app.get_models()]}")
except Exception as e:
    print(f"✗ App registry check failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n" + "="*60)
print("✅ ALL CHECKS PASSED!")
print("="*60)
print("\nThe vehicles app is ready. You can now run:")
print("  python manage.py makemigrations")
print("  python manage.py migrate")
