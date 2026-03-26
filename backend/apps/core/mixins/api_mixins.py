from rest_framework.response import Response


class StandardizedSuccessResponseMixin:
    def success_response(self, data, status_code=200):
        return Response({"success": True, "data": data}, status=status_code)
