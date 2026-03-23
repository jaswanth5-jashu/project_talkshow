import os
import django
from dotenv import load_dotenv

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
load_dotenv()
django.setup()

from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp
from django.conf import settings

def sync_social():
    client_id = os.getenv('GOOGLE_CLIENT_ID')
    client_secret = os.getenv('GOOGLE_CLIENT_SECRET')
    
    if not client_id or "google-client-id" in client_id:
        print("Error: GOOGLE_CLIENT_ID not properly set in .env")
        return

    # Ensure the Site exists
    site_id = getattr(settings, 'SITE_ID', 1)
    site, created = Site.objects.get_or_create(id=site_id, defaults={'domain': 'localhost:8000', 'name': 'TalkShow Local'})
    
    # Create or update the SocialApp
    app, created = SocialApp.objects.get_or_create(
        provider='google',
        defaults={
            'name': 'Google Login',
            'client_id': client_id,
            'secret': client_secret,
        }
    )
    
    if not created:
        app.client_id = client_id
        app.secret = client_secret
        app.save()
        print(f"Updated Google SocialApp with new credentials.")
    else:
        print(f"Created new Google SocialApp.")
        
    # Associate with the site
    if site not in app.sites.all():
        app.sites.add(site)
        print(f"Associated Google SocialApp with Site ID {site_id}")

if __name__ == "__main__":
    sync_social()
