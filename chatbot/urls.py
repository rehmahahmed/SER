from django.urls import path
from . import views

urlpatterns = [
    path("", views.ser_view, name="ser"),  # renamed main view
    path("analyze-audio/", views.analyze_audio_view, name="analyze_audio"),
]
