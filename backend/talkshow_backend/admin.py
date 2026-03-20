from django.contrib import admin
from .models import Registration, Home, GuestProfile, Feedback, Contact, Episode, Talent, TalentSubmission, TalentRole, Subscription, VideoLike, VideoComment
from .views import send_cool_email

class GuestProfileAdmin(admin.ModelAdmin):
    list_display = ('name', 'designation', 'is_new')
    list_editable = ('is_new',)

class EpisodeAdmin(admin.ModelAdmin):
    list_display = ('name', 'guest', 'is_active', 'is_new')
    list_editable = ('is_active', 'is_new')

class TalentAdmin(admin.ModelAdmin):
    list_display = ('name', 'talent', 'is_new')
    list_editable = ('is_new',)

admin.site.register(GuestProfile, GuestProfileAdmin)
admin.site.register(Episode, EpisodeAdmin)
admin.site.register(Talent, TalentAdmin)
admin.site.register(Registration)
admin.site.register(Contact)
admin.site.register(Home)
admin.site.register(TalentRole)
admin.site.register(Subscription)
admin.site.register(VideoLike)
admin.site.register(VideoComment)

class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'is_approved')
    list_editable = ('is_approved',)

admin.site.register(Feedback, FeedbackAdmin)


class TalentSubmissionAdmin(admin.ModelAdmin):
    list_display = ('name', 'talent', 'status_badge', 'submission_date', 'rejection_reason')
    list_filter = ('status',)
    search_fields = ('name', 'email', 'talent')
    readonly_fields = ('name', 'email', 'phone_number', 'state', 'country',
                       'story_about_person', 'quotation', 'talent', 'desc_of_talent',
                       'thumbnail', 'talentvideo', 'submission_date', 'user')
    fields = ('user', 'name', 'email', 'phone_number', 'state', 'country',
              'story_about_person', 'quotation', 'talent', 'desc_of_talent',
              'thumbnail', 'talentvideo', 'submission_date',
              'status', 'rejection_reason', 'dismissed_by_user')

    def status_badge(self, obj):
        from django.utils.html import mark_safe
        if obj.status == 'approved':
            return mark_safe('<span style="color:#22c55e;font-weight:bold;">✔ Approved</span>')
        elif obj.status == 'rejected':
            return mark_safe('<span style="color:#ef4444;font-weight:bold;">✖ Rejected</span>')
        return mark_safe('<span style="color:#f59e0b;font-weight:bold;">⏳ Pending</span>')
    status_badge.allow_tags = True
    status_badge.short_description = 'Status'

    def save_model(self, request, obj, form, change):
        if change:
            try:
                old = TalentSubmission.objects.get(pk=obj.pk)
                old_status = old.status
            except TalentSubmission.DoesNotExist:
                old_status = None

            if obj.status == 'approved' and old_status != 'approved':
                super().save_model(request, obj, form, change)
                talent_data = dict(
                    user=obj.user,
                    submission=obj,
                    name=obj.name,
                    email=obj.email,
                    phone_number=obj.phone_number,
                    state=obj.state,
                    country=obj.country,
                    story_about_person=obj.story_about_person,
                    quotation=obj.quotation,
                    talent=obj.talent,
                    thumbnail=obj.thumbnail,
                    talentvideo=obj.talentvideo,
                    desc_of_talent=obj.desc_of_talent
                )
                try:
                    Talent.objects.update_or_create(
                        submission=obj,
                        defaults=talent_data
                    )
                except Exception:
                    pass
                send_cool_email(
                    "🎉 Your Talent Has Been Approved! - TalkShow",
                    "Congratulations! You're Live on TalkShow",
                    f"""
                    Dear {obj.name},<br><br>
                    We are thrilled to inform you that your talent submission <b>"{obj.talent}"</b> has been
                    <b style="color:#00c853;">APPROVED</b>!<br><br>
                    Your video is now live on the TalkShow Talent Stories page for the world to see.<br>
                    You can also view it on your profile under <b>Your Uploaded Videos</b>.<br><br>
                    Keep shining and inspiring others!<br><br>
                    — The TalkShow Team
                    """,
                    obj.email
                )
                if obj.user:
                    for sub in Subscription.objects.filter(subscribed_to=obj.user):
                        send_cool_email(
                            f"New Video by {obj.name} - TalkShow",
                            f"{obj.name} just uploaded a new talent!",
                            f"""
                            Hello {sub.subscriber.username},<br><br>
                            Someone you follow — <b>{obj.name}</b> — just had a new talent video approved on TalkShow!<br><br>
                            Head over to the Talent Stories page to be among the first to watch it.
                            """,
                            sub.subscriber.email
                        )
                return

            if obj.status == 'rejected' and old_status != 'rejected':
                super().save_model(request, obj, form, change)
                reason_text = obj.rejection_reason or "No specific reason was provided."
                send_cool_email(
                    "Your Talent Submission Update - TalkShow",
                    "Submission Not Approved",
                    f"""
                    Dear {obj.name},<br><br>
                    Thank you for submitting your talent <b>"{obj.talent}"</b> to TalkShow.<br><br>
                    After careful review, we are unable to approve your submission at this time.<br><br>
                    <b>Reason:</b> {reason_text}<br><br>
                    We encourage you to keep working on your talent and reapply in the future.
                    Every great story starts with perseverance!<br><br>
                    — The TalkShow Team
                    """,
                    obj.email
                )
                return

        super().save_model(request, obj, form, change)


admin.site.register(TalentSubmission, TalentSubmissionAdmin)
