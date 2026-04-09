#!/usr/bin/env python
"""
Test script to verify all imports work correctly after fixing submodule paths.
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

# Test imports from various modules
test_imports = [
    ("Vehicle from vehicles.models.vehicle", "from apps.vehicles.models.vehicle import Vehicle"),
    ("VehicleType from vehicles.models.vehicle_type", "from apps.vehicles.models.vehicle_type import VehicleType"),
    ("VehicleOwnership from vehicles.models.ownership", "from apps.vehicles.models.ownership import VehicleOwnership"),
    ("VehicleStatus from vehicles.constants", "from apps.vehicles.constants import VehicleStatus"),
    ("core views api", "from apps.core.views.api import HealthCheckAPIView, DashboardSummaryAPIView"),
    ("trips serializers", "from apps.trips.serializers.trip import TripSerializer"),
    ("fuel serializers", "from apps.fuel.serializers.fuel import FuelTransactionSerializer"),
    ("maintenance serializers", "from apps.maintenance.serializers.maintenance import MaintenanceScheduleSerializer"),
]

print("Testing imports...\n")
failed = []
for test_name, import_stmt in test_imports:
    try:
        exec(import_stmt)
        print(f"✓ {test_name}")
    except Exception as e:
        print(f"✗ {test_name}: {e}")
        failed.append((test_name, e))

if failed:
    print(f"\n❌ {len(failed)} import(s) failed:")
    for name, err in failed:
        print(f"  - {name}: {err}")
    sys.exit(1)
else:
    print("\n" + "="*60)
    print("✅ ALL IMPORTS SUCCESSFUL!")
    print("="*60)
    print("\nYou can now run:")
    print("  python manage.py makemigrations")
    print("  python manage.py migrate")
