from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from apps.users.views.api import (
    ChangePasswordAPIView,
    ForgotPasswordAPIView,
    LoginAPIView,
    LogoutAPIView,
    MeAPIView,
    RegisterAPIView,
    ResetPasswordAPIView,
    RoleDetailAPIView,
    RoleListCreateAPIView,
    UserDetailAPIView,
    UserListCreateAPIView,
)

urlpatterns = [
    path("register/", RegisterAPIView.as_view(), name="user-register"),
    path("login/", LoginAPIView.as_view(), name="token-obtain-pair"),
    path("logout/", LogoutAPIView.as_view(), name="user-logout"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("me/", MeAPIView.as_view(), name="user-me"),
    path("password/change/", ChangePasswordAPIView.as_view(), name="user-password-change"),
    path("password/forgot/", ForgotPasswordAPIView.as_view(), name="user-password-forgot"),
    path("password/reset/", ResetPasswordAPIView.as_view(), name="user-password-reset"),
    path("roles/", RoleListCreateAPIView.as_view(), name="role-list-create"),
    path("roles/<int:pk>/", RoleDetailAPIView.as_view(), name="role-detail"),
    path("", UserListCreateAPIView.as_view(), name="user-list-create"),
    path("<int:pk>/", UserDetailAPIView.as_view(), name="user-detail"),
]
