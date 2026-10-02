"""
URL configuration for Server project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path
from django.urls.conf import include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from Accounts.views import LoginView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('flight-operation/', include('Airline.urls'), name="flight_operation"),
    path('api/login/', LoginView.as_view(), name='login'),  # مسیر جدید برای لاگین
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # دریافت توکن دسترسی و نوسازی
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # نوسازی توکن
    path('schema/', SpectacularAPIView.as_view(), name='schema'),
    path('swagger/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
