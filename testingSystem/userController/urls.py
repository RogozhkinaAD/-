from django.urls import path

from . import views

urlpatterns = [
    path("login", views.loginPage),
    path("logout", views.logOutProcess),
    path("auth", views.authProcess),
]