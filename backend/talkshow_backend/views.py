import random
from django.conf import settings
from django.core.mail import send_mail, EmailMultiAlternatives
from django.utils.html import strip_tags
from django.contrib.auth.hashers import check_password, make_password
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, permissions
from rest_framework_simplejwt.tokens import RefreshToken

from django.utils import timezone
from datetime import timedelta
from django.db.models import Q
from django.shortcuts import get_object_or_404

from .models import Registration, Home, GuestProfile, Feedback, Contact, Episode, Talent, TalentSubmission, TalentRole, Subscription, VideoLike, VideoComment, Notification
from .serializers import (
    HomeSerializer, ProfileSerializer, FeedbackSerializer, ContactSerializer, 
    EpisodeSerializer, TalentSerializer, TalentSubmissionSerializer, 
    TalentRoleSerializer, VideoLikeSerializer, VideoCommentSerializer, 
    SubscriptionSerializer, NotificationSerializer, UserSimpleSerializer
)

def send_cool_email(subject, title, message, to_email, attachment=None):
    if not to_email:
        return
    html_content = f"""
    <div style="background: #0b0b0b; padding: 40px; color: #fff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; border-radius: 20px; border: 1px solid #ff0000; max-width: 600px; margin: auto;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ff0000; font-size: 36px; margin: 0; text-transform: uppercase; letter-spacing: 5px;">TALKSHOW</h1>
            <p style="color: #888; text-transform: uppercase; font-size: 12px; margin: 5px 0;">Voices of the Future</p>
        </div>
        <div style="background: rgba(255,255,255,0.05); padding: 30px; border-radius: 15px;">
            <h2 style="color: #fff; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 15px;">{title}</h2>
            <p style="color: #aaa; line-height: 1.6; font-size: 16px;">{message}</p>
        </div>
        <div style="text-align: center; margin-top: 30px; color: #555; font-size: 11px;">
            &copy; 2026 TalkShow Dynamic Platform. All rights reserved.
        </div>
    </div>
    """
    text_content = strip_tags(html_content)
    try:
        msg = EmailMultiAlternatives(subject, text_content, settings.EMAIL_HOST_USER, [to_email])
        msg.attach_alternative(html_content, "text/html")
        if attachment:
            try:
                msg.attach(attachment.name, attachment.read(), attachment.content_type)
            except Exception:
                pass
        msg.send()
    except Exception:
        pass

class RegisterView(APIView):
    def post(self, request):
        email = request.data.get("email")
        username = request.data.get("username")
        full_name = request.data.get("full_name")
        phone = request.data.get("phone_number")
        password = request.data.get("password")
        gender = request.data.get("gender")

        if not username and email:
            username = email.split('@')[0]

        if not username:
            return Response({"error": "Username is required"})

        user = Registration.objects.filter(Q(username=username) | (Q(email=email) if email else Q(id=-1))).first()

        if email and not password:
            otp = str(random.randint(100000, 999999))
            if user:
                user.otp = otp
                user.username = username or user.username
                user.full_name = full_name or user.full_name
                user.phone_number = phone or user.phone_number
                user.is_verified = False
                user.save()
            else:
                user = Registration.objects.create(
                    email=email, username=username, full_name=full_name, phone_number=phone,
                    otp=otp, is_verified=False, role_id=request.data.get('role'),
                    gender=gender
                )
            send_mail("Account OTP", f"Your OTP is {otp}", settings.EMAIL_HOST_USER, [email])
            with open("i:/TalkShow/backend/otp.txt", "w") as f:
                f.write(otp)
            return Response({"message": "OTP sent to email"})

        if not password:
            return Response({"error": "Password required for registration"})

        if not user:
            if not email:
                user = Registration.objects.create(
                    username=username, full_name=full_name, phone_number=phone,
                    is_verified=True, role_id=request.data.get('role'),
                    gender=gender, password=make_password(password)
                )
                return Response({"message": "Registration complete"})
            return Response({"error": "Verify email first"})

        user.password = make_password(password)
        
        role_id = request.data.get("role")
        profile_img = request.FILES.get("profile")

        if full_name: user.full_name = full_name
        if phone: user.phone_number = phone
        if role_id: user.role_id = role_id
        if profile_img: user.profile = profile_img
        if gender: user.gender = gender
        if not email: user.is_verified = True
        
        user.save()
        return Response({"message": "Registration complete"})

class VerifyOTP(APIView):
    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")
        user = Registration.objects.filter(email=email).first()
        if not user:
            return Response({"error": "User not found"})
        if user.otp != otp:
            return Response({"error": "Invalid OTP"})
        user.is_verified = True
        user.otp = ""
        user.save()
        return Response({"message": "OTP verified"})

class LoginView(APIView):
    def post(self, request):
        identifier = request.data.get("email")
        password = request.data.get("password")
        if not identifier or not password:
            return Response({"error": "Identifier and password required"})
        
        user = Registration.objects.filter(Q(email=identifier) | Q(username=identifier)).first()
        
        if not user:
            return Response({"error": "User not found"})
        if not user.is_verified:
            return Response({"error": "Account not verified"})
        if not check_password(password, user.password):
            return Response({"error": "Wrong password"})
        
        refresh = RefreshToken.for_user(user)
        
        if user.email:
            send_cool_email(
                "Login Alert - TalkShow", "Successful Login",
                f"Hello {user.username}, you have successfully logged into your TalkShow account.",
                user.email
            )
        return Response({
            "message": "Login successful",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "bio": user.bio,
            "profile": user.profile.url if user.profile else None,
            "role": user.role.name if user.role else None,
            "gender": user.gender
        })

class ForgotPassword(APIView):
    def post(self, request):
        email = request.data.get("email")
        user = Registration.objects.filter(email=email).first()
        if not user:
            return Response({"error": "Email not registered"})
        otp = str(random.randint(100000, 999999))
        user.otp = otp
        user.save()
        send_mail("Password Reset OTP", f"Your OTP is {otp}", settings.EMAIL_HOST_USER, [email])
        return Response({"message": "OTP sent to email"})

class VerifyResetOTP(APIView):
    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")
        user = Registration.objects.filter(email=email).first()
        if not user or user.otp != otp:
            return Response({"error": "Invalid OTP"})
        return Response({"message": "OTP verified"})

class ResetPassword(APIView):
    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")
        password = request.data.get("password")
        user = Registration.objects.filter(email=email).first()
        if not user or user.otp != otp:
            return Response({"error": "Invalid OTP"})
        user.password = make_password(password)
        user.otp = ""
        user.save()
        send_cool_email("Security Alert - TalkShow", "Password Reset Successful", f"Hello {user.username}, your password has been reset.", user.email)
        return Response({"message": "Password reset successful"})

class HomeView(generics.ListCreateAPIView):
    queryset = Home.objects.all()
    serializer_class = HomeSerializer
    permission_classes = [permissions.AllowAny]

class ProfileView(generics.ListCreateAPIView):
    queryset = GuestProfile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.AllowAny]

class UpdateProfileView(generics.RetrieveUpdateDestroyAPIView):
    queryset = GuestProfile.objects.all()
    serializer_class = ProfileSerializer

class FeedbackView(generics.ListCreateAPIView):
    serializer_class = FeedbackSerializer
    
    def get_queryset(self):
        if self.request.method == 'GET':
            return Feedback.objects.filter(is_approved=True)
        return Feedback.objects.all()

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 201:
            feedback_id = response.data.get('id')
            if feedback_id:
                fb = Feedback.objects.get(id=feedback_id)
                admin_msg = f"""
                New feedback received! It requires your approval from the admin panel before being displayed on the Home Page.<br><br>
                <b>From:</b> {fb.name} ({fb.email})<br>
                <b>Phone:</b> {getattr(fb, 'phone_number', 'Not provided')}<br>
                <b>Message:</b><br>{getattr(fb, 'message', getattr(fb, 'feedback', ''))}
                """
                send_cool_email("New Feedback Received", "Feedback Alert", admin_msg, settings.ADMIN_EMAIL)
        return response

class ContactView(generics.ListCreateAPIView):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 201:
            contact_id = response.data.get('id')
            if contact_id:
                c = Contact.objects.get(id=contact_id)
                admin_msg = f"""
                New contact message received!<br><br>
                <b>From:</b> {c.name} ({c.email})<br>
                <b>Phone:</b> {c.phone_number}<br>
                <b>Subject:</b> {c.subject}<br>
                <b>Message:</b><br>{c.message}
                """
                send_cool_email("New Contact Request", "Contact Alert", admin_msg, settings.ADMIN_EMAIL)
        return response

class EpisodeView(generics.ListCreateAPIView):
    queryset = Episode.objects.all()
    serializer_class = EpisodeSerializer
    permission_classes = [permissions.AllowAny]

class UpdateEpisodeView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Episode.objects.all()
    serializer_class = EpisodeSerializer

class TalentView(generics.ListAPIView):
    queryset = Talent.objects.all()
    serializer_class = TalentSerializer
    permission_classes = [permissions.AllowAny]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class TalentSubmissionView(generics.CreateAPIView):
    queryset = TalentSubmission.objects.all()
    serializer_class = TalentSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        talent_name = user.role.name if user.role else serializer.validated_data.get('talent')
        serializer.save(user=user, talent=talent_name)

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 201:
            talent = TalentSubmission.objects.get(id=response.data['id'])
            is_large = talent.talentvideo.size > 20 * 1024 * 1024
            site_url = getattr(settings, 'SITE_URL', 'http://localhost:8000')
            video_info = ""
            if is_large:
                video_info = f"<b>Review Video:</b> <a href='{site_url}{talent.talentvideo.url}'>Watch Now</a> (File too large for email attachment)"
            else:
                video_info = "The talent video is attached to this email."

            admin_msg = f"""
            A new talent application has been submitted!<br><br>
            <b>Applicant:</b> {talent.name}<br>
            <b>Email:</b> {talent.email}<br>
            <b>Phone:</b> {talent.phone_number}<br>
            <b>Talent:</b> {talent.talent}<br><br>
            <b>Story:</b> {talent.story_about_person[:200]}...<br><br>
            {video_info}
            """
            
            attach_file = talent.talentvideo if not is_large else None
            send_cool_email("New Talent Application", "Action Required", admin_msg, settings.ADMIN_EMAIL, attachment=attach_file)
        return response

class TalentRoleView(generics.ListAPIView):
    queryset = TalentRole.objects.all()
    serializer_class = TalentRoleSerializer
    permission_classes = [permissions.AllowAny]

class ToggleLikeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        talent_video = get_object_or_404(Talent, pk=pk)
        like, created = VideoLike.objects.get_or_create(user=request.user, talent_video=talent_video)
        if not created:
            like.delete()
            return Response({"message": "Unliked", "liked": False, "count": talent_video.likes.count()})
        
        if talent_video.user and talent_video.user != request.user:
            Notification.objects.create(
                recipient=talent_video.user,
                sender=request.user,
                notification_type='like',
                text=f"{request.user.username} liked your video: {talent_video.talent}",
                talent_video=talent_video
            )
            if talent_video.user.email:
                send_cool_email(
                    "New Like! - TalkShow",
                    "Your video got a like!",
                    f"Hello {talent_video.user.username}, {request.user.username} liked your talent story '{talent_video.talent}'. Check it out!",
                    talent_video.user.email
                )

        return Response({"message": "Liked", "liked": True, "count": talent_video.likes.count()})

class CommentView(generics.ListCreateAPIView):
    serializer_class = VideoCommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return VideoComment.objects.filter(talent_video_id=self.kwargs['pk']).order_by('-created_at')

    def perform_create(self, serializer):
        talent_video = get_object_or_404(Talent, pk=self.kwargs['pk'])
        serializer.save(user=self.request.user, talent_video=talent_video)
        
        if talent_video.user and talent_video.user != self.request.user:
            Notification.objects.create(
                recipient=talent_video.user,
                sender=self.request.user,
                notification_type='comment',
                text=f"{self.request.user.username} commented: {serializer.validated_data['text'][:50]}...",
                talent_video=talent_video
            )
            if talent_video.user.email:
                send_cool_email(
                    "New Comment! - TalkShow",
                    "Someone commented on your video!",
                    f"Hello {talent_video.user.username}, {self.request.user.username} commented on your video: '{serializer.validated_data['text']}'.",
                    talent_video.user.email
                )

class DeleteCommentView(generics.DestroyAPIView):
    queryset = VideoComment.objects.all()
    serializer_class = VideoCommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

class ToggleSubscriptionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        subscribed_to = get_object_or_404(Registration, pk=pk)
        if request.user == subscribed_to:
            return Response({"error": "Cannot subscribe to yourself"}, status=400)
        
        sub, created = Subscription.objects.get_or_create(subscriber=request.user, subscribed_to=subscribed_to)
        if not created:
            sub.delete()
            return Response({"message": "Unsubscribed", "subscribed": False})
        
        Notification.objects.create(
            recipient=subscribed_to,
            sender=request.user,
            notification_type='follow',
            text=f"{request.user.username} started following you!"
        )
        if subscribed_to.email:
            send_cool_email(
                "New Follower! - TalkShow",
                "You have a new follower!",
                f"Hello {subscribed_to.username}, {request.user.username} is now following you on TalkShow.",
                subscribed_to.email
            )

        return Response({"message": "Subscribed", "subscribed": True})

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

class MarkNotificationReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        notif = get_object_or_404(Notification, pk=pk, recipient=request.user)
        notif.is_read = True
        notif.save()
        return Response({"message": "Marked as read"})

class UserTalentVideosView(generics.ListAPIView):
    serializer_class = TalentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Talent.objects.filter(user=self.request.user)

class MySubmissionsView(generics.ListAPIView):
    serializer_class = TalentSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TalentSubmission.objects.filter(
            user=self.request.user,
            dismissed_by_user=False
        ).order_by('-submission_date')

class DismissSubmissionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        submission = get_object_or_404(TalentSubmission, pk=pk, user=request.user)
        if submission.status == 'rejected':
            submission.dismissed_by_user = True
            submission.save()
            return Response({"message": "Submission dismissed"})
        return Response({"error": "Only rejected submissions can be dismissed"}, status=400)

class UpdateTalentView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TalentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_queryset(self):
        if self.request.method == 'GET':
            return Talent.objects.all()
        return Talent.objects.filter(user=self.request.user)

class DeleteTalentSubmissionView(generics.DestroyAPIView):
    serializer_class = TalentSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TalentSubmission.objects.filter(user=self.request.user)

class UpdateRegistrationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        new_email = request.data.get('new_email')
        full_name = request.data.get('full_name')
        bio = request.data.get('bio')
        otp = request.data.get('otp')
        password = request.data.get('password')
        profile_img = request.FILES.get('profile')

        if profile_img:
            user.profile = profile_img
            user.save()

        if new_email and new_email != user.email:
            if not otp:
                if Registration.objects.filter(email=new_email).exists():
                    return Response({'error': 'Already registered'})
                otp_code = str(random.randint(100000, 999999))
                user.otp = otp_code
                user.temp_email = new_email
                user.save()
                send_mail('Email Change OTP', f'OTP: {otp_code}', settings.EMAIL_HOST_USER, [new_email])
                return Response({'message': 'OTP sent'})
            else:
                if user.otp == otp and user.temp_email == new_email:
                    old_email = user.email
                    user.email = new_email
                    user.temp_email = ''
                    user.otp = ''
                    user.save()
                    send_cool_email("Email Updated", "Success", f"Email changed from {old_email} to {new_email}.", new_email)
                    return Response({'message': 'Email updated', 'new_email': new_email})
                return Response({'error': 'Invalid OTP'})

        if password:
            if not otp:
                if not user.email:
                     return Response({'error': 'Email required for password recovery/verification. Please set email first.'})
                otp_code = str(random.randint(100000, 999999))
                user.otp = otp_code
                user.save()
                send_mail('Security Alert - OTP Request', f'Your password change verification code is: {otp_code}', settings.EMAIL_HOST_USER, [user.email])
                return Response({'message': 'OTP sent'})
            else:
                if user.otp == otp:
                    user.password = make_password(password)
                    user.otp = ""
                    user.save()
                    send_cool_email("Security Alert", "Password Updated", f"Hello {user.username}, your password has been successfully hardened.", user.email)
                    return Response({'message': 'Password updated'})
                return Response({'error': 'Invalid OTP'})

        if full_name and full_name != user.full_name:
            if user.last_name_change and timezone.now() < user.last_name_change + timedelta(days=30):
                remaining = (user.last_name_change + timedelta(days=30)) - timezone.now()
                return Response({'error': f'Name can only be changed once every 30 days. Try again in {remaining.days} days.'}, status=400)
            user.full_name = full_name
            user.last_name_change = timezone.now()
            user.save()

        if bio is not None and bio != user.bio:
            if user.last_bio_change and timezone.now() < user.last_bio_change + timedelta(days=30):
                remaining = (user.last_bio_change + timedelta(days=30)) - timezone.now()
                return Response({'error': f'Bio can only be changed once every 30 days. Try again in {remaining.days} days.'}, status=400)
            user.bio = bio
            user.last_bio_change = timezone.now()
            user.save()

        return Response({
            'message': 'Updated', 
            'username': user.username, 
            'full_name': user.full_name, 
            'bio': user.bio, 
            'email': user.email, 
            'profile': user.profile.url if user.profile else None,
            'last_name_change': user.last_name_change,
            'last_bio_change': user.last_bio_change
        })

class GetRegistrationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        return Response({
            'username': user.username,
            'full_name': user.full_name,
            'bio': user.bio,
            'email': user.email,
            'phone_number': user.phone_number,
            'profile': user.profile.url if user.profile else None,
            'role': user.role.name if user.role else None,
            'followers_count': Subscription.objects.filter(subscribed_to=user).count(),
            'following_count': Subscription.objects.filter(subscriber=user).count(),
            'uploaded_count': Talent.objects.filter(user=user).count(),
            'last_name_change': user.last_name_change,
            'last_bio_change': user.last_bio_change,
            'created_at': user.created_at
        })

class UserPublicProfileView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        user = get_object_or_404(Registration, pk=pk)
        
        videos = Talent.objects.filter(user=user)
        video_serializer = TalentSerializer(videos, many=True, context={'request': request})
        
        is_following = False
        if request.user.is_authenticated:
            is_following = Subscription.objects.filter(subscriber=request.user, subscribed_to=user).exists()
        
        return Response({
            'id': user.id,
            'username': user.username,
            'full_name': user.full_name,
            'bio': user.bio,
            'profile': user.profile.url if user.profile else None,
            'role': user.role.name if user.role else None,
            'followers_count': Subscription.objects.filter(subscribed_to=user).count(),
            'following_count': Subscription.objects.filter(subscriber=user).count(),
            'uploaded_count': videos.count(),
            'created_at': user.created_at,
            'is_following': is_following,
            'videos': video_serializer.data
        })

class FollowersListView(generics.ListAPIView):
    serializer_class = UserSimpleSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['pk']
        user = get_object_or_404(Registration, pk=user_id)
        subscribers = Subscription.objects.filter(subscribed_to=user).values_list('subscriber', flat=True)
        return Registration.objects.filter(id__in=subscribers)

class FollowingListView(generics.ListAPIView):
    serializer_class = UserSimpleSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user_id = self.kwargs['pk']
        user = get_object_or_404(Registration, pk=user_id)
        following = Subscription.objects.filter(subscriber=user).values_list('subscribed_to', flat=True)
        return Registration.objects.filter(id__in=following)

class UserSearchView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '')
        if not query or len(query) < 2:
            return Response([])
        
        users = Registration.objects.filter(
            Q(username__icontains=query) | Q(email__icontains=query) | Q(full_name__icontains=query)
        ).distinct()[:10]
        
        results = []
        for user in users:
            results.append({
                'id': user.id,
                'username': user.username,
                'full_name': user.full_name,
                'profile': user.profile.url if user.profile else None,
                'bio': user.bio,
                'role': user.role.name if user.role else 'TalkShow Member',
                'video_count': Talent.objects.filter(user=user).count()
            })
        
        return Response(results)

class EpisodeSearchView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '')
        if not query or len(query) < 2:
            return Response([])
        
        episodes = Episode.objects.filter(
            Q(name__icontains=query) | 
            Q(bio__icontains=query) | 
            Q(guest__name__icontains=query)
        ).distinct()[:10]
        
        results = []
        for ep in episodes:
            results.append({
                'id': ep.id,
                'name': ep.name,
                'guest_name': ep.guest.name,
                'thumbnail': ep.thumbnail.url if ep.thumbnail else None,
                'bio': ep.bio,
                'upload_date': ep.upload_datetime,
                'id_label': f"EP #{ep.id}",
                'is_new': ep.is_new
            })
        
        return Response(results)

class GuestSearchView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '')
        if not query or len(query) < 2:
            return Response([])
        
        guests = GuestProfile.objects.filter(
            Q(name__icontains=query) | 
            Q(designation__icontains=query) | 
            Q(reason__icontains=query) | 
            Q(bio__icontains=query)
        ).distinct()[:10]
        
        results = []
        for guest in guests:
            results.append({
                'id': guest.id,
                'name': guest.name,
                'designation': guest.designation,
                'profile': guest.profile.url if guest.profile else None,
                'bio': guest.bio,
                'reason': guest.reason,
                'id_label': f"TS-{guest.id}X",
                'is_new': guest.is_new
            })
        
        return Response(results)

class TalentSearchView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '')
        if not query or len(query) < 2:
            return Response([])
        
        talents = Talent.objects.filter(
            Q(talent__icontains=query) | 
            Q(story_about_person__icontains=query) | 
            Q(user__username__icontains=query) |
            Q(user__full_name__icontains=query)
        ).distinct()[:10]
        
        results = []
        for t in talents:
            results.append({
                'id': t.id,
                'talent_name': t.talent,
                'creator': t.user.full_name if t.user and t.user.full_name else (t.user.username if t.user else "Anonymous"),
                'thumbnail': t.thumbnail.url if t.thumbnail else None,
                'bio': t.story_about_person,
                'id_label': f"TSV-{t.id}",
                'is_new': t.is_new
            })
        
        return Response(results)
