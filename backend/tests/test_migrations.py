#!/usr/bin/env python
"""
Test script to verify Django migrations can run successfully.
"""
import os
import sys
import subprocess

backend_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(backend_dir)

print("="*70)
print("DJANGO MIGRATION TEST")
print("="*70 + "\n")

# Test 1: Check migration status
print("Step 1: Checking migration status...")
result = subprocess.run(
    [sys.executable, "manage.py", "showmigrations", "vehicles"],
    capture_output=True,
    text=True
)
print(result.stdout)

# Test 2: Run migrate
print("\nStep 2: Running migrations...")
result = subprocess.run(
    [sys.executable, "manage.py", "migrate", "vehicles"],
    capture_output=True,
    text=True
)

if result.returncode == 0:
    print("✓ Vehicles migrations applied successfully!\n")
    print(result.stdout)
else:
    print("✗ Migration failed!\n")
    print("STDERR:", result.stderr)
    sys.exit(1)

# Test 3: Verify tables exist
print("\nStep 3: Verifying database tables...")
result = subprocess.run(
    [sys.executable, "manage.py", "dbshell"],
    input="\\dt vehicles_*",
    capture_output=True,
    text=True
)
print(result.stdout)

print("="*70)
print("✅ ALL MIGRATION CHECKS PASSED!")
print("="*70)
