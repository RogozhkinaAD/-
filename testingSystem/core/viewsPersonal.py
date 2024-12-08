from core.include.Response import Response
from core.include.UserGroup import UserGroup
from core.conrollers.PersonalController import PersonalController
from core.conrollers.AdminPersonalController import AdminPersonalController
from core.conrollers.TeacherPersonalController import TeacherPersonalController


def teachersPage(request):
    try:
        return PersonalController(request).personalPage(UserGroup.Teacher.value)
    except Exception as e:
        return Response().notFoundHtml()

def adminsList(request):
    try:
        return AdminPersonalController(request).personalList(UserGroup.Admin.value)
    except Exception as e:
        return Response().notFoundJson()

def personalEdit(request):
    try:
        return AdminPersonalController(request).personalEdit()
    except Exception as e:
        return Response().notFoundJson()

def personalResetPassword(request):
    try:
        return AdminPersonalController(request).personalResetPassword()
    except Exception as e:
        return Response().notFoundJson()

def personalDelete(request):
    try:
        return AdminPersonalController(request).personalDelete()
    except Exception as e:
        return Response().notFoundJson()

def personalRestore(request):
    try:
        return AdminPersonalController(request).personalRestore()
    except Exception as e:
        return Response().notFoundJson()

def resultsPage(request):
    if not request.access.is_admin and not request.access.is_teacher:
        return Response().notFoundHtml()
    try:
        return PersonalController(request).resultsPage()
    except Exception as e:
        return Response().notFoundHtml()

def resultsList(request):
    return PersonalController(request).resultsList()
    if not request.access.is_admin and not request.access.is_teacher:
        print('NF 1')
        return Response().notFoundHtml()
    try:
        print('OK')
        return PersonalController(request).resultsList()
    except Exception as e:
        print('NF 2' , e)
        return Response().notFoundHtml()



def teachersList(request):
    try:
        return AdminPersonalController(request).personalList(UserGroup.Teacher.value)
    except Exception as e:
        return Response().notFoundJson()

def teacherSettings(request):
    try:
        return AdminPersonalController(request).teacherSettings()
    except Exception as e:
        return Response().notFoundJson()

def teacherSettingsSave(request):
    try:
        return AdminPersonalController(request).teacherSettingsSave()
    except Exception as e:
        return Response().notFoundJson()



def studentsPage(request):
    try:
        return PersonalController(request).studentsPage()
    except Exception as e:
        return Response().notFoundJson()

def studentsList(request):
    try:
        return PersonalController(request).studentsList()
    except Exception as e:
        return Response().notFoundJson()

def studentEdit(request):
    try:
        return PersonalController(request).studentEdit()
    except Exception as e:
        return Response().notFoundJson()

def studentResetPassword(request):
    try:
        return PersonalController(request).studentResetPassword()
    except Exception as e:
        return Response().notFoundJson()

def studentDelete(request):
    try:
        return PersonalController(request).studentDelete()
    except Exception as e:
        return Response().notFoundJson()

def studentRestore(request):
    try:
        return PersonalController(request).studentRestore()
    except Exception as e:
        return Response().notFoundJson()


def classesPage(request):
    try:
        return AdminPersonalController(request).classesPage()
    except Exception as e:
        return Response().notFoundJson()

def classesList(request):
    try:
        return AdminPersonalController(request).classesList()
    except Exception as e:
        return Response().notFoundJson()

def classesEdit(request):
    try:
        return AdminPersonalController(request).classesEdit()
    except Exception as e:
        return Response().notFoundJson()


def subjectsPage(request):
    try:
        return AdminPersonalController(request).subjectsPage()
    except Exception as e:
        return Response().notFoundJson()

def subjectsList(request):
    try:
        return PersonalController(request).subjectsList()
    except Exception as e:
        return Response().notFoundJson()

def subjectEdit(request):
    try:
        return AdminPersonalController(request).subjectEdit()
    except Exception as e:
        return Response().notFoundJson()


def tasksPage(request):
    try:
        return PersonalController(request).tasksPage()
    except Exception as e:
        return Response().notFoundHtml()

def tasksList(request):
    try:
        return PersonalController(request).tasksList()
    except Exception as e:
        return Response().notFoundJson()

def taskDelete(request):
    try:
        return TeacherPersonalController(request).taskDelete(True)
    except Exception as e:
        return Response().notFoundJson()

def taskRestore(request):
    try:
        return TeacherPersonalController(request).taskDelete(False)
    except Exception as e:
        return Response().notFoundJson()

def taskSaveInProduction(request):
    try:
        return TeacherPersonalController(request).taskSaveInProduction()
    except Exception as e:
        return Response().notFoundJson()

def taskNew(request):
    try:
        return TeacherPersonalController(request).taskPage(0)
    except Exception as e:
        return Response().notFoundHtml()

def taskPage(request, id):
    try:
        return TeacherPersonalController(request).taskPage(id)
    except Exception as e:
        return Response().notFoundJson()

def taskGet(request, id):
    try:
        return TeacherPersonalController(request).taskGet(id)
    except Exception as e:
        return Response().notFoundJson()

def taskSave(request):
    try:
        return TeacherPersonalController(request).taskSave()
    except Exception as e:
        return Response().notFoundJson()

def taskResultsPage(request, id):
    try:
        return TeacherPersonalController(request).taskResultsPage(id)
    except Exception as e:
        return Response().notFoundHtml()

def taskResultsGet(request, id):
    try:
        return TeacherPersonalController(request).taskResultsGet(id)
    except Exception as e:
        return Response().notFoundJson()

def taskViewCompletePage(request, id, uid):
    try:
        return TeacherPersonalController(request).taskViewCompletePage(id, uid)
    except Exception as e:
        return Response().notFoundHtml()

def taskViewCompleteGet(request, id, uid):
    try:
        return TeacherPersonalController(request).taskViewCompleteGet(id, uid)
    except Exception as e:
        return Response().notFoundJson()

def taskCalcGrade(request, id, uid):
    return TeacherPersonalController(request).taskCalcGrade(id, uid)
    try:
        return TeacherPersonalController(request).taskCalcGrade(id, uid)
    except Exception as e:
        return Response().notFoundJson()

def taskSetGrade(request, id, uid):
    try:
        return TeacherPersonalController(request).taskSetGrade(id, uid)
    except Exception as e:
        return Response().notFoundJson()
