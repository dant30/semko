# backend/apps/core/mixins/api_mixins.py
from rest_framework.response import Response


class StandardizedSuccessResponseMixin:
    """Mixin to produce a uniform success API response payload.

    Usage:
        class SomeAPIView(StandardizedSuccessResponseMixin, APIView):
            def get(self, request):
                data = {...}
                return self.success_response(data)

    This enforces a shared structure across endpoints, easing client-side handling.
    """

    def success_response(self, data, status_code=200):
        return Response({"success": True, "data": data}, status=status_code)
