from django.db import models

class TalentRole(models.Model):
    name = models.CharField(max_length=100, unique=True)
    def __str__(self):
        return self.name

class Registration(models.Model):
    username = models.CharField(max_length=100, unique=True)
    full_name = models.CharField(max_length=150, null=True, blank=True)
    email = models.EmailField(unique=True, null=True, blank=True)
    phone_number = models.CharField(max_length=15, null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    last_name_change = models.DateTimeField(null=True, blank=True)
    last_bio_change = models.DateTimeField(null=True, blank=True)
    profile = models.ImageField(upload_to='profile/', null=True, blank=True)
    password = models.CharField(max_length=128, null=True, blank=True)
    otp = models.CharField(max_length=6, null=True, blank=True)
    role = models.ForeignKey(TalentRole, on_delete=models.SET_NULL, null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    temp_email = models.EmailField(null=True, blank=True)
    gender = models.CharField(max_length=10, null=True, blank=True)
    deletion_scheduled_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username or self.email

    @property
    def is_authenticated(self):
        return True

class Home(models.Model):
    no_of_talents = models.CharField(max_length=30)
    no_of_episodes = models.CharField(max_length=30)
    no_of_views = models.CharField(max_length=50)
    year_of_impact = models.CharField(max_length=50)
    def __str__(self):
        return self.no_of_talents

class GuestProfile(models.Model):
    profile = models.ImageField(upload_to="profile/", null=True, blank=True)
    name = models.CharField(max_length=100)
    designation = models.CharField(max_length=100)
    reason = models.TextField()
    bio = models.TextField()
    is_new = models.BooleanField(default=False)
    user = models.OneToOneField(Registration, on_delete=models.SET_NULL, null=True, blank=True, related_name='guest_profile_link')

    def __str__(self):
        return self.name

class Feedback(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    feedback = models.TextField()
    is_approved = models.BooleanField(default=False)
    def __str__(self):
        return self.name

class Contact(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone_number = models.CharField(max_length=15)
    subject = models.TextField()
    message = models.TextField()
    def __str__(self):
        return self.name

class Episode(models.Model):
    guest = models.ForeignKey(GuestProfile, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    bio = models.TextField()
    thumbnail = models.ImageField(upload_to="thumbnails/", null=True, blank=True)
    promo_video = models.FileField(upload_to='promo_videos/')
    full_video = models.FileField(upload_to='full_video/')
    upload_datetime = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    is_new = models.BooleanField(default=False)
    def __str__(self):
        return self.name

class Talent(models.Model):
    user = models.ForeignKey(Registration, on_delete=models.CASCADE, null=True, blank=True)
    submission = models.ForeignKey('TalentSubmission', on_delete=models.CASCADE, null=True, blank=True, related_name='approved_story')
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone_number = models.CharField(max_length=15)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    story_about_person = models.TextField()
    quotation = models.CharField(max_length=200)
    talent = models.CharField(max_length=100)
    thumbnail = models.ImageField(upload_to="talentsstories/", null=True, blank=True)
    talentvideo = models.FileField(upload_to="talentsstories/")
    desc_of_talent = models.TextField()
    is_new = models.BooleanField(default=False)

class TalentSubmission(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    user = models.ForeignKey(Registration, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone_number = models.CharField(max_length=15)
    state = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    story_about_person = models.TextField()
    quotation = models.CharField(max_length=200)
    talent = models.CharField(max_length=100)
    thumbnail = models.ImageField(upload_to="submissions/thumbnails/", null=True, blank=True)
    talentvideo = models.FileField(upload_to="submissions/videos/")
    desc_of_talent = models.TextField()
    submission_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    gender = models.CharField(max_length=10, null=True, blank=True)
    rejection_reason = models.TextField(null=True, blank=True, help_text="Reason shown to the user when rejected")
    dismissed_by_user = models.BooleanField(default=False, help_text="User has acknowledged and dismissed this rejection")

    def __str__(self):
        return f"{self.name} - {self.status}"

class Subscription(models.Model):
    subscriber = models.ForeignKey(Registration, on_delete=models.CASCADE, related_name='subscriptions')
    subscribed_to = models.ForeignKey(Registration, on_delete=models.CASCADE, related_name='subscribers')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('subscriber', 'subscribed_to')

class VideoLike(models.Model):
    user = models.ForeignKey(Registration, on_delete=models.CASCADE)
    talent_video = models.ForeignKey(Talent, on_delete=models.CASCADE, related_name='likes', null=True, blank=True)
    episode = models.ForeignKey(Episode, on_delete=models.CASCADE, related_name='likes', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # unique_together = ('user', 'talent_video') # Removing this to handle both types manually or via validation
        pass

class VideoComment(models.Model):
    user = models.ForeignKey(Registration, on_delete=models.CASCADE)
    talent_video = models.ForeignKey(Talent, on_delete=models.CASCADE, related_name='comments', null=True, blank=True)
    episode = models.ForeignKey(Episode, on_delete=models.CASCADE, related_name='comments', null=True, blank=True)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('like', 'Like'),
        ('comment', 'Comment'),
        ('follow', 'Follow'),
    ]
    recipient = models.ForeignKey(Registration, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(Registration, on_delete=models.CASCADE)
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    text = models.TextField()
    talent_video = models.ForeignKey(Talent, on_delete=models.CASCADE, null=True, blank=True)
    episode = models.ForeignKey(Episode, on_delete=models.CASCADE, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']