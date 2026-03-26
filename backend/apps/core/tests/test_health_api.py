from rest_framework import status
from rest_framework.test import APITestCase


class HealthCheckAPITests(APITestCase):
    def test_health_endpoint_returns_ok(self):
        response = self.client.get("/api/core/health/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["success"], True)
        self.assertEqual(response.data["data"]["status"], "ok")
