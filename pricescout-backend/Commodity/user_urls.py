from django.urls import path

from . import user_views
from . import detail_views

urlpatterns = [
    path('sign_up/', user_views.user_add),
    path('sign_in/', user_views.user_log_in),
    path('change_password/', user_views.user_change_password),

    path('user_info/', user_views.get_user_info),
    path('add_favorite/', user_views.add_favorite),
    path('remove_favorite/', user_views.remove_favorite), 
    path('get_favorites/', user_views.get_favorites),
    path('trigger-price-check/', detail_views.trigger_price_check),
]