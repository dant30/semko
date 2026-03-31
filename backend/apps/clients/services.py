from django.db.models import QuerySet

from apps.clients.models import Client, Quarry


def get_active_clients() -> QuerySet[Client]:
    """Return active corporate and individual clients."""
    return Client.objects.filter(is_active=True, status=Client.Status.ACTIVE)


def get_client_by_code(code: str) -> QuerySet[Client]:
    """Return a client queryset filtered by code."""
    return Client.objects.filter(code=code)


def get_active_quarries() -> QuerySet[Quarry]:
    """Return all active quarries with related client data."""
    return Quarry.objects.filter(is_active=True).select_related("client")


def get_quarries_for_client(client_id: int) -> QuerySet[Quarry]:
    """Return quarries associated with the given client."""
    return Quarry.objects.filter(client_id=client_id).select_related("client")
