from apps.audit.models import AuditLog
from apps.audit.utils import get_client_ip, resolve_request_user


class AuditMiddleware:
    SENSITIVE_PATHS = {"/api/users/login/", "/api/users/token/refresh/"}

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        self._log_request(request, response)
        return response

    def _log_request(self, request, response):
        if request.path.startswith("/static/") or request.path.startswith("/media/"):
            return

        metadata = {
            "query_params": dict(request.GET.lists()),
            "has_body": request.META.get("CONTENT_LENGTH", "0") not in {"", "0"},
        }

        if request.path in self.SENSITIVE_PATHS:
            metadata["body_logged"] = False
        else:
            metadata["body_logged"] = False

        AuditLog.objects.create(
            actor=resolve_request_user(request),
            action=self._resolve_action(request),
            method=request.method,
            path=request.path[:255],
            status_code=response.status_code,
            ip_address=get_client_ip(request),
            user_agent=request.META.get("HTTP_USER_AGENT", ""),
            metadata=metadata,
        )

    def _resolve_action(self, request):
        if request.path.endswith("/register/") and request.method == "POST":
            return AuditLog.Action.REGISTER
        if request.path.endswith("/login/") and request.method == "POST":
            return AuditLog.Action.LOGIN

        return {
            "GET": AuditLog.Action.READ,
            "POST": AuditLog.Action.CREATE,
            "PUT": AuditLog.Action.UPDATE,
            "PATCH": AuditLog.Action.UPDATE,
            "DELETE": AuditLog.Action.DELETE,
        }.get(request.method, AuditLog.Action.OTHER)
