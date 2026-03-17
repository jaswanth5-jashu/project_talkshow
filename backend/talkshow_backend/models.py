from django.db import models


class Registration(models.Model):

    username = models.CharField(max_length=100, null=True, blank=True)
    full_name = models.CharField(max_length=150, null=True, blank=True)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, null=True, blank=True)
    profile = models.ImageField(upload_to='profile/', null=True, blank=True)
    password = models.CharField(max_length=128, null=True, blank=True)
    otp = models.CharField(max_length=6, null=True, blank=True)

    is_verified = models.BooleanField(default=False)
    temp_email = models.EmailField(null=True, blank=True)

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

    def __str__(self):
        return self.name


class Feedback(models.Model):

    name = models.CharField(max_length=100)

    email = models.EmailField()

    phone_number = models.CharField(max_length=15)

    feedback = models.TextField()

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

    def __str__(self):
        return self.name


class Talent(models.Model):

    name = models.CharField(max_length=100)

    email = models.EmailField(unique=True)

    phone_number = models.CharField(max_length=15, unique=True)

    state = models.CharField(max_length=100)

    country = models.CharField(max_length=100)

    story_about_person = models.TextField()

    quotation = models.CharField(max_length=200)

    talent = models.CharField(max_length=100)

    thumbnail = models.ImageField(upload_to="talentsstories/", null=True, blank=True)

    talentvideo = models.FileField(upload_to="talentsstories/")

    desc_of_talent = models.TextField()


class TalentSubmission(models.Model):
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
    status = models.CharField(max_length=20, default='pending')

    def __str__(self):
        return f"{self.name} - {self.status}"