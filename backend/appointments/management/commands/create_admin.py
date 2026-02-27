import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Create a superuser from env vars if it does not already exist."

    def handle(self, *args, **options):
        username = os.environ.get("DJANGO_SUPERUSER_USERNAME", "").strip()
        email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "").strip()
        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "")

        if not username or not password:
            self.stdout.write("Superuser env vars missing; skipping creation.")
            return

        User = get_user_model()
        if User.objects.filter(username=username).exists():
            self.stdout.write("Superuser already exists; skipping creation.")
            return

        User.objects.create_superuser(
            username=username,
            email=email or None,
            password=password,
        )
        self.stdout.write("Superuser created.")
