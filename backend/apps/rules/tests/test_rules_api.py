from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from apps.clients.models import Client, Quarry
from apps.core.constants import RolePermissionCodes
from apps.materials.models import Material
from apps.rules.models import DeductionRule, PenaltyThresholdRule, StatutoryRate, TripClassificationRule
from apps.users.models import Role

User = get_user_model()


class RulesAPITests(APITestCase):
    def setUp(self):
        self.manager_role = Role.objects.create(
            name="Rules Manager",
            code="rules-manager",
            permissions=[
                RolePermissionCodes.VIEW_RULES,
                RolePermissionCodes.MANAGE_RULES,
            ],
        )
        self.viewer_role = Role.objects.create(
            name="Rules Viewer",
            code="rules-viewer",
            permissions=[RolePermissionCodes.VIEW_RULES],
        )
        self.manager = User.objects.create_user(
            username="rules-admin",
            email="rules-admin@example.com",
            password="S3curePass123",
            role=self.manager_role,
        )
        self.viewer = User.objects.create_user(
            username="rules-viewer",
            email="rules-viewer@example.com",
            password="S3curePass123",
            role=self.viewer_role,
        )
        self.client_record = Client.objects.create(
            name="Rules Client",
            code="rules-client",
            client_type=Client.ClientType.CORPORATE,
            phone_number="0700111222",
            is_active=True,
        )
        self.quarry = Quarry.objects.create(
            name="Rules Quarry",
            code="rules-quarry",
            client=self.client_record,
            county="Kajiado",
            is_active=True,
        )
        self.material = Material.objects.create(
            name="Rules Material",
            code="rules-material",
            category=Material.MaterialCategory.AGGREGATE,
            unit_of_measure=Material.UnitOfMeasure.TONNE,
            is_active=True,
        )

    def authenticate(self, user):
        token = str(RefreshToken.for_user(user).access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def test_manager_can_create_classification_and_penalty_rules(self):
        self.authenticate(self.manager)

        classification_response = self.client.post(
            reverse("trip-classification-rule-list-create"),
            {
                "name": "Urban Delivery",
                "code": "urban-delivery",
                "classification_label": "Urban",
                "destination_keyword": "site",
                "client": self.client_record.id,
                "quarry": self.quarry.id,
                "material": self.material.id,
                "priority": 10,
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(classification_response.status_code, status.HTTP_201_CREATED)

        penalty_response = self.client.post(
            reverse("penalty-threshold-rule-list-create"),
            {
                "name": "Major Variance",
                "code": "major-variance",
                "minimum_percentage": "2.51",
                "maximum_percentage": "100.00",
                "tolerance_percentage": "2.50",
                "penalty_multiplier": "1.50",
                "priority": 10,
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(penalty_response.status_code, status.HTTP_201_CREATED)

        statutory_response = self.client.post(
            reverse("statutory-rate-list-create"),
            {
                "name": "Housing Levy",
                "code": "housing-levy",
                "statutory_type": StatutoryRate.StatutoryType.HOUSING_LEVY,
                "calculation_method": StatutoryRate.CalculationMethod.PERCENTAGE,
                "apply_on": StatutoryRate.ApplyOn.GROSS_POLICY,
                "rate_value": "1.50",
                "minimum_amount": "0.00",
                "effective_from": "2026-01-01",
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(statutory_response.status_code, status.HTTP_201_CREATED)

        deduction_rule_response = self.client.post(
            reverse("deduction-rule-list-create"),
            {
                "name": "Advance Recovery",
                "code": "advance-recovery",
                "deduction_category": DeductionRule.DeductionCategory.ADVANCE_RECOVERY,
                "calculation_method": DeductionRule.CalculationMethod.FIXED,
                "apply_on": DeductionRule.ApplyOn.GROSS_POLICY,
                "rate_value": "500.00",
                "minimum_verified_trips": 1,
                "require_verified_documents": True,
                "effective_from": "2026-01-01",
                "priority": 10,
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(deduction_rule_response.status_code, status.HTTP_201_CREATED)

    def test_viewer_can_list_but_cannot_create_rules(self):
        self.authenticate(self.viewer)

        list_response = self.client.get(reverse("trip-classification-rule-list-create"))
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)

        create_response = self.client.post(
            reverse("penalty-threshold-rule-list-create"),
            {
                "name": "Blocked",
                "code": "blocked",
                "minimum_percentage": "0.00",
                "tolerance_percentage": "2.50",
                "penalty_multiplier": "1.00",
                "priority": 100,
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(create_response.status_code, status.HTTP_403_FORBIDDEN)

    def test_evaluate_trip_rules_endpoint_returns_expected_rule_result(self):
        TripClassificationRule.objects.create(
            name="Kitengela Classification",
            code="kitengela-classification",
            classification_label="Urban",
            destination_keyword="kitengela",
            priority=1,
            is_active=True,
        )
        PenaltyThresholdRule.objects.create(
            name="Standard Threshold",
            code="standard-threshold",
            minimum_percentage="2.51",
            maximum_percentage="100.00",
            tolerance_percentage="2.50",
            penalty_multiplier="2.00",
            priority=1,
            is_active=True,
        )
        self.authenticate(self.viewer)

        response = self.client.post(
            reverse("evaluate-trip-rules"),
            {
                "destination": "Kitengela Main Site",
                "percentage_difference": "3.00",
                "agreed_unit_price": "2500.00",
                "weight_difference": "1.00",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["classification_label"], "Urban")
        self.assertEqual(response.data["penalty_rule"], "standard-threshold")
