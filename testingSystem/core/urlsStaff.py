from django.urls import path

from . import viewsStaff

urlpatterns = [
    path("getDashboardData", viewsStaff.getDashboardData),
    path("getOrganizations", viewsStaff.getOrganizations),
    path("org/<int:id>", viewsStaff.getOrganizationPage),
    path("org/<int:id>/personal", viewsStaff.getOrganizationPersonal),
    path("org/edit", viewsStaff.editOrganization),
    path("org/delete", viewsStaff.deleteOrganization),
    path("org/restore", viewsStaff.restoreOrganization),

    path("personal/edit", viewsStaff.personalEdit),
    path("personal/resetPassword", viewsStaff.personalResetPassword),
    path("personal/delete", viewsStaff.personalDelete),
    path("personal/restore", viewsStaff.personalRestore),

]