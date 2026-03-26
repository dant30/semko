from django.conf import settings


def send_sms_notification(*, recipient, message):
    phone_number = getattr(recipient, "phone_number", "") or getattr(
        getattr(recipient, "driver_profile", None),
        "phone_number",
        "",
    )
    if not phone_number:
        return {
            "status": "skipped",
            "detail": "Recipient does not have a phone number.",
        }
    return {
        "status": "delivered",
        "detail": f"SMS delivered to {phone_number} from {settings.SMS_SENDER_ID}.",
    }
