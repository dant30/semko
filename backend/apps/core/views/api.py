from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from apps.core.mixins.api_mixins import StandardizedSuccessResponseMixin


class HealthCheckAPIView(StandardizedSuccessResponseMixin, APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return self.success_response(
            {
                "status": "ok",
                "service": "semko-backend",
                "app": "core",
            }
        )
