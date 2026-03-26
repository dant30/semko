from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.clients.models import Client, Quarry
from apps.core.constants import RolePermissionCodes
from apps.core.permissions import HasRolePermissions
from apps.materials.models import Material
from apps.rules.models import DeductionRule, PenaltyThresholdRule, StatutoryRate, TripClassificationRule
from apps.rules.serializers import (
    DeductionRuleSerializer,
    PenaltyThresholdRuleSerializer,
    StatutoryRateSerializer,
    TripClassificationRuleSerializer,
)
from apps.rules.services import evaluate_trip_rules


class TripClassificationRuleListCreateAPIView(generics.ListCreateAPIView):
    queryset = TripClassificationRule.objects.select_related("client", "quarry", "material").order_by("priority", "name")
    serializer_class = TripClassificationRuleSerializer
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_RULES],
        "POST": [RolePermissionCodes.MANAGE_RULES],
    }


class TripClassificationRuleDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TripClassificationRule.objects.select_related("client", "quarry", "material")
    serializer_class = TripClassificationRuleSerializer
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_RULES],
        "PUT": [RolePermissionCodes.MANAGE_RULES],
        "PATCH": [RolePermissionCodes.MANAGE_RULES],
        "DELETE": [RolePermissionCodes.MANAGE_RULES],
    }


class PenaltyThresholdRuleListCreateAPIView(generics.ListCreateAPIView):
    queryset = PenaltyThresholdRule.objects.order_by("priority", "minimum_percentage")
    serializer_class = PenaltyThresholdRuleSerializer
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_RULES],
        "POST": [RolePermissionCodes.MANAGE_RULES],
    }


class PenaltyThresholdRuleDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PenaltyThresholdRule.objects.order_by("priority", "minimum_percentage")
    serializer_class = PenaltyThresholdRuleSerializer
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_RULES],
        "PUT": [RolePermissionCodes.MANAGE_RULES],
        "PATCH": [RolePermissionCodes.MANAGE_RULES],
        "DELETE": [RolePermissionCodes.MANAGE_RULES],
    }


class StatutoryRateListCreateAPIView(generics.ListCreateAPIView):
    queryset = StatutoryRate.objects.order_by("statutory_type", "-effective_from", "name")
    serializer_class = StatutoryRateSerializer
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_RULES],
        "POST": [RolePermissionCodes.MANAGE_RULES],
    }


class StatutoryRateDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = StatutoryRate.objects.order_by("statutory_type", "-effective_from", "name")
    serializer_class = StatutoryRateSerializer
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_RULES],
        "PUT": [RolePermissionCodes.MANAGE_RULES],
        "PATCH": [RolePermissionCodes.MANAGE_RULES],
        "DELETE": [RolePermissionCodes.MANAGE_RULES],
    }


class DeductionRuleListCreateAPIView(generics.ListCreateAPIView):
    queryset = DeductionRule.objects.order_by("priority", "name")
    serializer_class = DeductionRuleSerializer
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_RULES],
        "POST": [RolePermissionCodes.MANAGE_RULES],
    }


class DeductionRuleDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DeductionRule.objects.order_by("priority", "name")
    serializer_class = DeductionRuleSerializer
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_RULES],
        "PUT": [RolePermissionCodes.MANAGE_RULES],
        "PATCH": [RolePermissionCodes.MANAGE_RULES],
        "DELETE": [RolePermissionCodes.MANAGE_RULES],
    }


class EvaluateTripRulesAPIView(APIView):
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "POST": [RolePermissionCodes.VIEW_RULES],
    }

    def post(self, request):
        client = None
        quarry = None
        material = None
        if request.data.get("client_id"):
            client = Client.objects.filter(pk=request.data["client_id"]).first()
        if request.data.get("quarry_id"):
            quarry = Quarry.objects.filter(pk=request.data["quarry_id"]).first()
        if request.data.get("material_id"):
            material = Material.objects.filter(pk=request.data["material_id"]).first()
        result = evaluate_trip_rules(
            destination=request.data.get("destination", ""),
            client=client,
            quarry=quarry,
            material=material,
            percentage_difference=request.data.get("percentage_difference"),
            agreed_unit_price=request.data.get("agreed_unit_price", 0),
            weight_difference=request.data.get("weight_difference", 0),
        )
        return Response(
            {
                "classification_label": result["classification_label"],
                "tolerance_percentage": result["tolerance_percentage"],
                "penalty_amount": result["penalty_amount"],
                "penalty_rule": getattr(result["penalty_rule"], "code", None),
            }
        )
