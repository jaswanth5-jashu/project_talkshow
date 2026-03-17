import random
from django.conf import settings
from django.core.mail import send_mail, EmailMultiAlternatives
from django.utils.html import strip_tags
from django.contrib.auth.hashers import check_password, make_password
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, permissions
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Registration, Home, GuestProfile, Feedback, Contact, Episode, Talent, TalentSubmission
from .serializers import HomeSerializer, ProfileSerializer, FeedbackSerializer, ContactSerializer, EpisodeSerializer, TalentSerializer, TalentSubmissionSerializer

def send_cool_email(subject, title, message, to_email, attachment=None):
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
            except Exception as attach_err:
                print(f"Attachment failed: {attach_err}")
        msg.send()
    except Exception as e:
        print(f"Email failed: {e}")

class RegisterView(APIView):
    def post(self, request):
        email = request.data.get("email")
        username = request.data.get("username")
        full_name = request.data.get("full_name")
        phone = request.data.get("phone_number")
        password = request.data.get("password")

        if not email:
            return Response({"error": "Email is required"})

        user = Registration.objects.filter(email=email).first()

        if not password:
            otp = str(random.randint(100000, 999999))
            if user:
                user.otp = otp
                user.is_verified = False
                user.save()
            else:
                user = Registration.objects.create(
                    email=email, username=username, full_name=full_name, phone_number=phone,
                    otp=otp, is_verified=False
                )
            send_mail("Account OTP", f"Your OTP is {otp}", settings.EMAIL_HOST_USER, [email])
            return Response({"message": "OTP sent to email"})

        if not user:
            return Response({"error": "Verify email first"})

        user.password = make_password(password)
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
        email = request.data.get("email")
        password = request.data.get("password")
        if not email or not password:
            return Response({"error": "Email and password required"})
        user = Registration.objects.filter(email=email).first()
        if not user:
            return Response({"error": "User not found"})
        if not user.is_verified:
            return Response({"error": "Account not verified"})
        if not check_password(password, user.password):
            return Response({"error": "Wrong password"})
        
        refresh = RefreshToken.for_user(user)
        
        send_cool_email(
            "Login Alert - TalkShow", "Successful Login",
            f"Hello {user.username}, you have successfully logged into your TalkShow account.",
            user.email
        )
        return Response({
            "message": "Login successful",
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "username": user.username,
            "full_name": user.full_name,
            "email": user.email,
            "profile": user.profile.url if user.profile else None
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
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    
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
                New feedback received!<br><br>
                <b>From:</b> {fb.name} ({fb.email})<br>
                <b>Phone:</b> {fb.phone_number}<br>
                <b>Message:</b><br>{fb.feedback}
                """
                send_cool_email("New Feedback Received", "Feedback Alert", admin_msg, settings.EMAIL_HOST_USER)
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
                send_cool_email("New Contact Request", "Contact Alert", admin_msg, settings.EMAIL_HOST_USER)
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

class TalentSubmissionView(generics.CreateAPIView):
    queryset = TalentSubmission.objects.all()
    serializer_class = TalentSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 201:
            talent = TalentSubmission.objects.get(id=response.data['id'])
            # 20MB Limit for email attachments
            is_large = talent.talentvideo.size > 20 * 1024 * 1024
            video_info = ""
            if is_large:
                video_info = f"<b>Review Video:</b> <a href='http://localhost:8000{talent.talentvideo.url}'>Watch Now</a> (File too large for email attachment)"
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
            send_cool_email("New Talent Application", "Action Required", admin_msg, settings.EMAIL_HOST_USER, attachment=attach_file)
        return response

class UpdateTalentView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Talent.objects.all()
    serializer_class = TalentSerializer

class UpdateRegistrationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        new_email = request.data.get('new_email')
        full_name = request.data.get('full_name')
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

        if full_name:
            user.full_name = full_name
            user.save()

        return Response({'message': 'Updated', 'username': user.username, 'full_name': user.full_name, 'email': user.email, 'profile': user.profile.url if user.profile else None})

class GetRegistrationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        return Response({
            'username': user.username,
            'full_name': user.full_name,
            'email': user.email,
            'phone_number': user.phone_number,
            'profile': user.profile.url if user.profile else None
        })
