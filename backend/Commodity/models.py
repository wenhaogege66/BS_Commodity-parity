# python manage.py makemigrations
# python manage.py migrate
from dateutil.relativedelta import relativedelta
from django.contrib.auth.hashers import make_password, check_password
from django.db import models
from datetime import datetime
from django.utils import timezone
from django.core.exceptions import ObjectDoesNotExist
# Create your models here.
class online_user(models.Model):
    user_id = models.AutoField(primary_key=True)
    user_name = models.CharField(max_length=30, null=False, default="Unknown",unique=True)
    password = models.CharField(max_length=30, null=False, default="Unknown")
    email = models.CharField(max_length=30, null=False, default="Unknown",unique=True)
    phone_num = models.CharField(max_length=30, null=False, default="Unknown")
    is_blacklisted = models.BooleanField(default=False)