from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import Registration, Home, GuestProfile, Feedback, Contact, Episode, Talent, TalentSubmission, TalentRole, Subscription, VideoLike, VideoComment, Notification

class TalentRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = TalentRole
        fields = "__all__"

class SubscriptionSerializer(serializers.ModelSerializer):
    subscriber_name = serializers.CharField(source='subscriber.username', read_only=True)
    subscribed_to_name = serializers.CharField(source='subscribed_to.username', read_only=True)
    class Meta:
        model = Subscription
        fields = "__all__"

class VideoLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoLike
        fields = "__all__"

class VideoCommentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    user_profile = serializers.ImageField(source='user.profile', read_only=True)
    class Meta:
        model = VideoComment
        fields = ['id', 'user', 'username', 'full_name', 'user_profile', 'talent_video', 'text', 'created_at']
        read_only_fields = ['user', 'talent_video']

class NotificationSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    
    def get_sender_name(self, obj):
        return obj.sender.username if obj.sender else "Unknown"
    class Meta:
        model = Notification
        fields = "__all__"

class RegistrationSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True, required=False)
    confirm_password = serializers.CharField(write_only=True, required=False)
    role = serializers.PrimaryKeyRelatedField(queryset=TalentRole.objects.all(), required=False, allow_null=True)

    class Meta:
        model = Registration
        fields = [
            "username",
            "full_name",
            "bio",
            "email",
            "phone_number",
            "profile",
            "password",
            "confirm_password",
            "role",
            "gender"
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

class UserSimpleSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source='role.name', read_only=True)
    class Meta:
        model = Registration
        fields = ['id', 'username', 'full_name', 'profile', 'role_name']

class HomeSerializer(serializers.ModelSerializer):

    class Meta:
        model = Home
        fields = "__all__"

class ProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = GuestProfile
        fields = "__all__"

class FeedbackSerializer(serializers.ModelSerializer):
    is_approved = serializers.BooleanField(read_only=True)
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
    likes_count = serializers.IntegerField(source='likes.count', read_only=True)
    comments_count = serializers.IntegerField(source='comments.count', read_only=True)
    is_following = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    uploaded_count = serializers.SerializerMethodField()
    
    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and obj.user:
            return Subscription.objects.filter(subscriber=request.user, subscribed_to=obj.user).exists()
        return False

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return VideoLike.objects.filter(user=request.user, talent_video=obj).exists()
        return False

    def get_followers_count(self, obj):
        return Subscription.objects.filter(subscribed_to=obj.user).count() if obj.user else 0

    def get_following_count(self, obj):
        return Subscription.objects.filter(subscriber=obj.user).count() if obj.user else 0

    user_bio = serializers.SerializerMethodField()
    
    def get_user_bio(self, obj):
        return obj.user.bio if obj.user else ""

    def get_uploaded_count(self, obj):
        return Talent.objects.filter(user=obj.user).count() if obj.user else 0

    uploader_username = serializers.CharField(source='user.username', read_only=True)
    uploader_full_name = serializers.CharField(source='user.full_name', read_only=True)
    uploader_profile = serializers.ImageField(source='user.profile', read_only=True)

    class Meta:
        model = Talent
        fields = [
            'id', 'user', 'submission', 'name', 'email', 'phone_number', 
            'state', 'country', 'story_about_person', 'quotation', 'talent', 
            'thumbnail', 'talentvideo', 'desc_of_talent', 'is_new',
            'likes_count', 'comments_count', 'is_following', 'is_liked', 
            'followers_count', 'following_count', 'uploaded_count', 'user_bio',
            'uploader_username', 'uploader_full_name', 'uploader_profile'
        ]

class TalentSubmissionSerializer(serializers.ModelSerializer):
    talent_story_id = serializers.SerializerMethodField()

    def get_talent_story_id(self, obj):
        if obj.status == 'approved':
            story = obj.approved_story.first()
            return story.id if story else None
        return None

    class Meta:
        model = TalentSubmission
        fields = '__all__'
        read_only_fields = ('status', 'rejection_reason', 'dismissed_by_user', 'submission_date', 'user')