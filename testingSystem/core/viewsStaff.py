from core.include.Response import Response
from core.conrollers.StaffController import StaffController


def getDashboardData(request):
    try:
        return StaffController(request).getDashboardData()
    except Exception as e:
        return Response().notFoundJson()

def getOrganizations(request):
    try:
        return StaffController(request).getOrganizations()
    except Exception as e:
        return Response().notFoundJson()

def getOrganizationPage(request, id):
    try:
        return StaffController(request).getOrganizationPage(id)
    except Exception as e:
        return Response().notFoundJson()

def editOrganization(request):
    try:
        return StaffController(request).editOrganization()
    except Exception as e:
        return Response().notFoundJson()

def deleteOrganization(request):
    try:
        return StaffController(request).deleteOrganization()
    except Exception as e:
        return Response().notFoundJson()

def restoreOrganization(request):
    try:
        return StaffController(request).restoreOrganization()
    except Exception as e:
        return Response().notFoundJson()

def getOrganizationPersonal(request, id):
    try:
        return StaffController(request).getOrganizationPersonal(id)
    except Exception as e:
        return Response().notFoundJson()


def personalEdit(request):
    try:
        return StaffController(request).personalEdit()
    except Exception as e:
        return Response().notFoundJson()

def personalResetPassword(request):
    try:
        return StaffController(request).personalResetPassword()
    except Exception as e:
        return Response().notFoundJson()

def personalDelete(request):
    try:
        return StaffController(request).personalDelete()
    except Exception as e:
        return Response().notFoundJson()

def personalRestore(request):
    try:
        return StaffController(request).personalRestore()
    except Exception as e:
        return Response().notFoundJson()
