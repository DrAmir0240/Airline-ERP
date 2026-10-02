from django.urls import path
from .views import FlightListAPIView, FlightDetailAPIView, FlightEditAPIView, FlightRemoveAPIView, FlightAddAPIView

urlpatterns = [
    path('flights/', FlightListAPIView.as_view(), name='flight-list'),
    path('flights/<int:pk>/', FlightDetailAPIView.as_view(), name='flight-detail'),
    path('flights/delete/<int:pk>/', FlightRemoveAPIView.as_view(), name='flight-delete'),
    path('flights/edit/<int:pk>/', FlightEditAPIView.as_view(), name='flight-edit'),
    path('flights/add/', FlightAddAPIView.as_view(), name='flight-add'),

]
