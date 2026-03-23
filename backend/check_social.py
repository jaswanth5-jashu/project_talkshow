import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp
from django.conf import settings

def check_social_config():
    print(f"SITE_ID in settings: {getattr(settings, 'SITE_ID', 'Not set')}")
    
    sites = Site.objects.all()
    print("\nSites in database:")
    for site in sites:
        print(f"- ID: {site.id}, Domain: {site.domain}, Name: {site.name}")
    
    apps = SocialApp.objects.all()
    print("\nSocial Apps in database:")
    for app in apps:
        print(f"- Provider: {app.provider}, Name: {app.name}, Client ID: {app.client_id[:10]}...")
        print(f"  Associated Sites: {[s.id for s in app.sites.all()]}")

if __name__ == "__main__":
    check_social_config()
