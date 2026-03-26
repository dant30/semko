from apps.clients.models import Client, Quarry


def get_active_clients():
    return Client.objects.filter(is_active=True, status=Client.Status.ACTIVE)


def get_active_quarries():
    return Quarry.objects.filter(is_active=True).select_related("client")
