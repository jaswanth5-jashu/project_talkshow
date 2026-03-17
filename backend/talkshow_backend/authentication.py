from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from .models import Registration

from rest_framework_simplejwt.settings import api_settings

class CustomJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        try:
            user_id = validated_token[api_settings.USER_ID_CLAIM]
        except KeyError:
            raise AuthenticationFailed("Token contained no recognizable user identification", code="bad_token")

        user = Registration.objects.filter(id=user_id).first()
        if not user:
            raise AuthenticationFailed("User not found", code="user_not_found")
        
        if not getattr(user, 'is_verified', True):
            raise AuthenticationFailed("User account is not verified", code="user_inactive")

        return user
