from django.urls import path

from . import viewsStudent

urlpatterns = [
    path("getList", viewsStudent.getList),
    path("task/<int:id>", viewsStudent.pageTask),
    path("task/<int:id>/get", viewsStudent.getTask),
    path("task/<int:id>/complete", viewsStudent.complete),
]