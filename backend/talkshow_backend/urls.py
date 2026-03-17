from django.urls import path
from .views import (
    RegisterView, VerifyOTP, LoginView, ForgotPassword, VerifyResetOTP, 
    ResetPassword, HomeView, ProfileView, UpdateProfileView, FeedbackView, 
    ContactView, EpisodeView, UpdateEpisodeView, TalentView, 
    TalentSubmissionView, UpdateTalentView, UpdateRegistrationView, 
    GetRegistrationView
)

urlpatterns = [
    path("register/", RegisterView.as_view()),
    path("verify-otp/", VerifyOTP.as_view()),
    path("login/", LoginView.as_view()),
    path("forgot-password/", ForgotPassword.as_view()),
    path("verify-reset-otp/", VerifyResetOTP.as_view()),
    path("reset-password/", ResetPassword.as_view()),
    path("home/", HomeView.as_view()),
    path("guestprofile/", ProfileView.as_view()),
    path("guestprofile/<int:pk>/", UpdateProfileView.as_view()),
    path("feedback/", FeedbackView.as_view()),
    path("contact/", ContactView.as_view()),
    path("episode/", EpisodeView.as_view()),
    path("episode/<int:pk>/", UpdateEpisodeView.as_view()),
    path("talent/", TalentView.as_view()),
    path("talent-submission/", TalentSubmissionView.as_view()),
    path("talent/<int:pk>/", UpdateTalentView.as_view()),
    path("update-profile/", UpdateRegistrationView.as_view()),
    path("get-profile/", GetRegistrationView.as_view()),
]