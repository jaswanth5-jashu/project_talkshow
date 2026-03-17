from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import Registration, Home, GuestProfile, Feedback, Contact, Episode, Talent, TalentSubmission


class RegistrationSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True, required=False)
    confirm_password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Registration
        fields = [
            "username",
            "full_name",
            "email",
            "phone_number",
            "profile",
            "password",
            "confirm_password"
        ]

    def validate_email(self, value):

        if Registration.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered")

        return value

    def validate(self, data):
        if "password" in data and "confirm_password" in data:
            if data["password"] != data["confirm_password"]:
                raise serializers.ValidationError("Passwords do not match")
        return data

    def create(self, validated_data):
        validated_data.pop("confirm_password", None)
        if "password" in validated_data:
            validated_data["password"] = make_password(validated_data["password"])
        return Registration.objects.create(**validated_data)

    def update(self, instance, validated_data):
        validated_data.pop("confirm_password", None)
        if "password" in validated_data:
            validated_data["password"] = make_password(validated_data["password"])
        return super().update(instance, validated_data)


class HomeSerializer(serializers.ModelSerializer):

    class Meta:
        model = Home
        fields = "__all__"


class ProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = GuestProfile
        fields = "__all__"


class FeedbackSerializer(serializers.ModelSerializer):

    class Meta:
        model = Feedback
        fields = "__all__"


class ContactSerializer(serializers.ModelSerializer):

    class Meta:
        model = Contact
        fields = "__all__"


class EpisodeSerializer(serializers.ModelSerializer):

    class Meta:
        model = Episode
        fields = "__all__"


class TalentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Talent
        fields = "__all__"

class TalentSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TalentSubmission
        fields = "__all__"