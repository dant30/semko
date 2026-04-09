#!/usr/bin/env python
"""
Test script to verify Django app registry loads without errors.
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'semko.settings.development')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    django.setup()
    print("✓ Django setup successful")
    
    # Try importing models to ensure they're accessible
    from apps.vehicles.models.vehicle import Vehicle
    from apps.vehicles.models.vehicle_type import VehicleType
    from apps.vehicles.models.ownership import VehicleOwnership
    print("✓ Vehicle models imported successfully")
    
    # Check app registry
    from django.apps import apps
    vehicle_app = apps.get_app_config('vehicles')
    print(f"✓ Vehicle app config loaded: {vehicle_app.name}")
    
    print("\n✅ All checks passed! App is ready for migrations.")
    
except Exception as e:
    print(f"❌ Error during Django setup: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
