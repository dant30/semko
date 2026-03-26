from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from apps.core.constants import RolePermissionCodes
from apps.users.models import Role

User = get_user_model()


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ["id", "name", "code", "description", "permissions", "is_system"]
        read_only_fields = ["id", "is_system"]

    def validate_permissions(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Permissions must be a list.")
        if any(not isinstance(item, str) or not item.strip() for item in value):
            raise serializers.ValidationError("Each permission must be a non-empty string.")
        return sorted(set(value))


class UserReadSerializer(serializers.ModelSerializer):
    effective_permissions = serializers.SerializerMethodField()
    role = RoleSerializer(read_only=True)
    role_id = serializers.PrimaryKeyRelatedField(
        source="role",
        queryset=Role.objects.all(),
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "role",
            "role_id",
            "is_superuser",
            "is_active",
            "is_staff",
            "must_change_password",
            "effective_permissions",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "is_superuser",
            "is_active",
            "is_staff",
            "must_change_password",
            "effective_permissions",
            "created_at",
            "updated_at",
        ]

    def get_effective_permissions(self, obj):
        permissions = set(obj.role.permissions or []) if obj.role else set()
        permissions.update(
            f"{permission.content_type.app_label}.{permission.codename}"
            for permission in obj.user_permissions.select_related("content_type").all()
        )
        permissions.update(
            f"{permission.content_type.app_label}.{permission.codename}"
            for group in obj.groups.prefetch_related("permissions__content_type").all()
            for permission in group.permissions.all()
        )
        return sorted(permissions)


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    role_id = serializers.PrimaryKeyRelatedField(
        source="role",
        queryset=Role.objects.all(),
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "role_id",
            "password",
            "password_confirm",
        ]

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match."}
            )
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User.objects.create_user(password=password, **validated_data)
        return user


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    role_id = serializers.PrimaryKeyRelatedField(
        source="role",
        queryset=Role.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "role_id",
            "is_active",
            "is_staff",
            "must_change_password",
            "password",
            "password_confirm",
        ]
        read_only_fields = ["id"]

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError(
                {"password_confirm": "Passwords do not match."}
            )
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        return User.objects.create_user(password=password, **validated_data)


class UserUpdateSerializer(serializers.ModelSerializer):
    role_id = serializers.PrimaryKeyRelatedField(
        source="role",
        queryset=Role.objects.all(),
        required=False,
        allow_null=True,
    )
    password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=False,
        validators=[validate_password],
    )

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "role_id",
            "is_active",
            "is_staff",
            "must_change_password",
            "password",
        ]

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save(update_fields=["password", "updated_at"])
        return user


class UserSelfUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["first_name", "last_name", "email", "phone_number"]


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError({"new_password_confirm": "Passwords do not match."})
        return attrs

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError({"new_password_confirm": "Passwords do not match."})
        return attrs


DEFAULT_ADMIN_ROLE_PERMISSIONS = sorted(
    {
        RolePermissionCodes.VIEW_USERS,
        RolePermissionCodes.MANAGE_USERS,
        RolePermissionCodes.VIEW_ROLES,
        RolePermissionCodes.MANAGE_ROLES,
        RolePermissionCodes.VIEW_AUDIT_LOGS,
        RolePermissionCodes.VIEW_VEHICLES,
        RolePermissionCodes.MANAGE_VEHICLES,
        RolePermissionCodes.VIEW_DRIVERS,
        RolePermissionCodes.MANAGE_DRIVERS,
        RolePermissionCodes.VIEW_CLIENTS,
        RolePermissionCodes.MANAGE_CLIENTS,
        RolePermissionCodes.VIEW_MATERIALS,
        RolePermissionCodes.MANAGE_MATERIALS,
        RolePermissionCodes.VIEW_TRIPS,
        RolePermissionCodes.MANAGE_TRIPS,
        RolePermissionCodes.VIEW_RULES,
        RolePermissionCodes.MANAGE_RULES,
        RolePermissionCodes.VIEW_CESS,
        RolePermissionCodes.MANAGE_CESS,
        RolePermissionCodes.VIEW_PAYROLL,
        RolePermissionCodes.MANAGE_PAYROLL,
        RolePermissionCodes.VIEW_OWN_PAYSLIP,
        RolePermissionCodes.VIEW_NOTIFICATIONS,
        RolePermissionCodes.MANAGE_NOTIFICATIONS,
        RolePermissionCodes.VIEW_STORES,
        RolePermissionCodes.MANAGE_STORES,
        RolePermissionCodes.VIEW_FUEL,
        RolePermissionCodes.MANAGE_FUEL,
        RolePermissionCodes.VIEW_MAINTENANCE,
        RolePermissionCodes.MANAGE_MAINTENANCE,
    }
)
