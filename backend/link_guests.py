
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from talkshow_backend.models import Registration, GuestProfile, TalentRole

def link_guests():
    role, _ = TalentRole.objects.get_or_create(name='Official Guest')
    guests = GuestProfile.objects.filter(user__isnull=True)
    count = 0
    for g in guests:
        # Create a shadow user for the guest
        username = f"guest_{g.id}_{g.name.replace(' ', '_').lower()}"[:50]
        if Registration.objects.filter(username=username).exists():
             username = f"guest_{g.id}_{int(os.urandom(2).hex(), 16)}"
             
        u = Registration.objects.create(
            username=username,
            full_name=g.name,
            role=role,
            is_verified=True
        )
        g.user = u
        g.save()
        count += 1
    print(f'Linked {count} guests')

if __name__ == "__main__":
    link_guests()
