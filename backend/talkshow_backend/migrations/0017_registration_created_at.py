from django.db import migrations, models
import django.utils.timezone

class Migration(migrations.Migration):

    dependencies = [
        ('talkshow_backend', '0016_registration_bio_registration_last_bio_change_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='registration',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
    ]
