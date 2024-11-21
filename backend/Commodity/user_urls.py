from django.urls import path

from . import user_views

urlpatterns = [
    path('sign_up/', user_views.user_add),
    path('sign_in/', user_views.user_log_in),
    path('change_password/', user_views.user_change_password),

    path('user_info/', user_views.get_user_info),
]