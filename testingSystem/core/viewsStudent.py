from core.include.Response import Response
from core.conrollers.StudentController import StudentController


def getList(request):
    try:
        return StudentController(request).getList()
    except Exception as e:
        return Response().notFoundJson()

def pageTask(request, id):
    try:
        return StudentController(request).pageTask(id)
    except Exception as e:
        return Response().notFoundHtml()

def getTask(request, id):
    try:
        return StudentController(request).getTask(id)
    except Exception as e:
        return Response().notFoundJson()

def complete(request, id):
    return StudentController(request).complete(id)
    try:
        return StudentController(request).complete(id)
    except Exception as e:
        return Response().notFoundJson()
