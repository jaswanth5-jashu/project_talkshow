from django.contrib import admin
from .models import Registration,Home,GuestProfile,Feedback,Contact,Episode,Talent,TalentSubmission

# Register your models here.
admin.site.register(Registration)
admin.site.register(GuestProfile)
admin.site.register(Feedback)
admin.site.register(Contact)
admin.site.register(Episode)
admin.site.register(Talent)
admin.site.register(Home)
admin.site.register(TalentSubmission)
