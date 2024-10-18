from django.urls import path

from . import viewsPersonal

urlpatterns = [
    path("teachers", viewsPersonal.teachersPage),
    path("admins/list", viewsPersonal.adminsList),
    path("edit", viewsPersonal.personalEdit),
    path("resetPassword", viewsPersonal.personalResetPassword),
    path("delete", viewsPersonal.personalDelete),
    path("restore", viewsPersonal.personalRestore),

    path("teachers/list", viewsPersonal.teachersList),
    path("teacher/settings", viewsPersonal.teacherSettings),
    path("teacher/settings/save", viewsPersonal.teacherSettingsSave),

    path("students", viewsPersonal.studentsPage),
    path("students/list", viewsPersonal.studentsList),
    path("student/edit", viewsPersonal.studentEdit),
    path("student/resetPassword", viewsPersonal.studentResetPassword),
    path("student/delete", viewsPersonal.studentDelete),
    path("student/restore", viewsPersonal.studentRestore),

    path("classes", viewsPersonal.classesPage),
    path("classes/list", viewsPersonal.classesList),
    path("classes/edit", viewsPersonal.classesEdit),

    path("subjects", viewsPersonal.subjectsPage),
    path("subjects/list", viewsPersonal.subjectsList),
    path("subject/edit", viewsPersonal.subjectEdit),

    path("tasks", viewsPersonal.tasksPage),
    path("tasks/list", viewsPersonal.tasksList),
    path("task/saveInProduction", viewsPersonal.taskSaveInProduction),
    path("task/delete", viewsPersonal.taskDelete),
    path("task/restore", viewsPersonal.taskRestore),
    path("task/new", viewsPersonal.taskNew),
    path("task/<int:id>", viewsPersonal.taskPage),
    path("task/get/<int:id>", viewsPersonal.taskGet),
    path("task/save", viewsPersonal.taskSave),
    path("task/results/<int:id>", viewsPersonal.taskResultsPage),
    path("task/results/<int:id>/get", viewsPersonal.taskResultsGet),
    path("task/results/<int:id>/<int:uid>", viewsPersonal.taskViewCompletePage),
    path("task/results/<int:id>/<int:uid>/get", viewsPersonal.taskViewCompleteGet),
    path("task/results/<int:id>/<int:uid>/calcGrade", viewsPersonal.taskCalcGrade),
    path("task/results/<int:id>/<int:uid>/setGrade", viewsPersonal.taskSetGrade),

]