from django.urls import path

from . import detail_views

urlpatterns = [
    path("price-trend/", detail_views.PriceTrendAPIView.as_view(), name="price-trend"),
    path("health/", detail_views.health_check, name="health-check"),
]