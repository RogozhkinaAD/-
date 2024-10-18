from core.include.Response import Response
from core.include.Utils import Utils
from core.include.UserGroup import UserGroup
from core.conrollers.PersonalController import PersonalController
from core.conrollers.AdminPersonalController import AdminPersonalController

def indexPage(request):
    if request.user.is_staff:
        return Response().html(request, 'staff/dashboard.html')
    elif request.access.isAdmin():
        return AdminPersonalController(request).personalPage(UserGroup.Admin.value)
    elif request.access.isTeacher():
        return PersonalController(request).tasksPage()
    elif request.access.isStudent():
        return Response().html(request, 'student/dashboard.html')

    return Response().html(request, 'login.html')


def generatePassword(request):
    if not request.access.isPersonal(True):
        return Response().notFoundJson()
    return Response().jsonOk({ 'data': Utils().generatePassword() })
