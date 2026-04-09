# backend/apps/drivers/serializers/driver.py
from rest_framework import serializers

from apps.drivers.models import Driver, DriverLicense


class DriverLicenseSerializer(serializers.ModelSerializer):
    is_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = DriverLicense
        fields = [
            "id",
            "license_number",
            "license_class",
            "issue_date",
            "expiry_date",
            "status",
            "issuing_authority",
            "restrictions",
            "notes",
            "is_expired",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "is_expired", "created_at", "updated_at"]


class DriverReadSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    license = DriverLicenseSerializer(read_only=True)

    class Meta:
        model = Driver
        fields = [
            "id",
            "employee_id",
            "first_name",
            "last_name",
            "full_name",
            "national_id",
            "phone_number",
            "alternate_phone_number",
            "email",
            "date_of_birth",
            "hire_date",
            "employment_status",
            "emergency_contact_name",
            "emergency_contact_phone",
            "address",
            "notes",
            "is_active",
            "license",
            "created_at",
            "updated_at",
        ]


class DriverWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Driver
        fields = [
            "id",
            "employee_id",
            "first_name",
            "last_name",
            "national_id",
            "phone_number",
            "alternate_phone_number",
            "email",
            "date_of_birth",
            "hire_date",
            "employment_status",
            "emergency_contact_name",
            "emergency_contact_phone",
            "address",
            "notes",
            "is_active",
        ]
        read_only_fields = ["id"]


class DriverWithLicenseCreateSerializer(serializers.ModelSerializer):
    license = DriverLicenseSerializer(write_only=True)

    class Meta:
        model = Driver
        fields = [
            "id",
            "employee_id",
            "first_name",
            "last_name",
            "national_id",
            "phone_number",
            "alternate_phone_number",
            "email",
            "date_of_birth",
            "hire_date",
            "employment_status",
            "emergency_contact_name",
            "emergency_contact_phone",
            "address",
            "notes",
            "is_active",
            "license",
        ]
        read_only_fields = ["id"]

    def create(self, validated_data):
        license_data = validated_data.pop("license")
        driver = Driver.objects.create(**validated_data)
        DriverLicense.objects.create(driver=driver, **license_data)
        return driver


class DriverLicenseWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = DriverLicense
        fields = [
            "id",
            "license_number",
            "license_class",
            "issue_date",
            "expiry_date",
            "status",
            "issuing_authority",
            "restrictions",
            "notes",
        ]
        read_only_fields = ["id"]
