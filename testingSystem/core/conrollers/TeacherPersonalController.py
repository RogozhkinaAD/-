from django.contrib.auth.models import User
from core.include.Response import Response
from core.conrollers.PersonalController import PersonalController
from core.tasks.TaskInterface import TaskInterface
from core.models import Tasks
from core.models import TaskToClasses
from core.models import OrganizationStudents
from core.models import TaskResults
import json

class TeacherPersonalController(PersonalController):
    def __init__(self, request):
        super(TeacherPersonalController, self).__init__(request)

        if not request.access.isTeacher():
            raise Exception("Fail teacher access")

    def taskSaveInProduction(self):
        post = json.loads(self.request.body.decode('utf-8'))
        classes = post['classes']

        task = Tasks.objects.get(id=post['id'], org_id=self.org_id, author=self.uid)
        if task.in_production:
            t2c = TaskToClasses.objects.filter(task_id=task.id)
            for t in t2c:
                t.delete()

        for cl in classes:
            TaskToClasses(class_id=cl['id'], task_id=task.id).save()
        task.in_production = 1 if len(classes) > 0 else 0
        task.save()

        return Response().jsonOk()

    def taskPage(self, id):
        context = self.context
        context['task_id'] = id
        if id > 0:
            try:
                Tasks.objects.get(id=id, org_id=self.org_id, author=self.uid)
            except Exception as e:
                Response().notFoundHtml()

        return Response().html(self.request, 'personal/task.html', context)

    def taskDelete(self, delete=True):
        post = json.loads(self.request.body.decode('utf-8'))
        try:
            task = Tasks.objects.get(id=post['id'], org_id=self.org_id, author=self.uid)
        except Exception as e:
            Response().notFoundJson()
        task.deleted = 1 if delete else 0
        task.save()
        return Response().jsonOk()

    def taskGet(self, id):
        task = Tasks.objects.get(id=id, author=self.uid, org_id=self.org_id)
        return Response().jsonOk({
            'id': task.id,
            'author': task.author,
            'subject_id': task.subject_id,
            'name': task.name,
            'content': task.content,
            'criteria': task.criteria,
            'description': task.description,
            'deleted': task.deleted,
            'in_production': task.in_production,
            'subjects': self._getSubjects()
        })

    def taskSave(self):
        post = json.loads(self.request.body.decode('utf-8'))
        id = post['id']

        if id == 0:
            task = Tasks(
                author = self.uid,
                org_id = self.org_id,
                subject_id = post['subject_id'],
                name = post['name'],
                description = post['description'],
                content = post['content'],
                criteria = post['criteria'],
                deleted = 0,
                in_production = 0
            )
        else:
            try:
                task = Tasks.objects.get(id=id, org_id=self.org_id, author=self.uid)
            except:
                return Response().notFoundJson()
            if task.deleted or task.in_production:
                return Response().notFoundJson()
            task.name = post['name']
            task.description = post['description']
            task.content = post['content']
            task.criteria = post['criteria']

        task = TaskInterface().setCheckByTeacher(task)
        task.save()
        return Response().jsonOk({})


    def taskResultsPage(self, id):
        task = Tasks.objects.get(id=id, author=self.uid, org_id=self.org_id)
        context = self.context

        context['task_id'] = task.id
        context['task_name'] = task.name

        return Response().html(self.request, 'personal/task.results.html', context)

    def taskResultsGet(self, id):
        task = Tasks.objects.get(id=id, author=self.uid, org_id=self.org_id)

        task_classes = [c.class_id for c in TaskToClasses.objects.filter(task_id=id)]

        students = {}
        students2class = {}
        for c in OrganizationStudents.objects.filter(org_id=self.org_id, cl_id__in=task_classes):
            students2class[c.uid] = c.cl_id
            if c.cl_id not in students:
                students[c.cl_id] = {}
            students[c.cl_id][c.uid] = {
                'uid': c.uid,
                'name': '',
                'percent': -1,
                'grade': -1,
                'datetime': None,
            }

        for r in TaskResults.objects.filter(task_id=id):
            if r.uid not in students2class:
                continue
            cl_id = students2class[r.uid]
            students[cl_id][r.uid]['percent'] = r.percent
            students[cl_id][r.uid]['grade'] = r.grade
            students[cl_id][r.uid]['datetime'] = r.datetime.strftime("%d.%m.%Y %H:%M:%S")

        for u in User.objects.filter(id__in=students2class.keys()):
            if u.id not in students2class:
                continue
            cl_id = students2class[u.id]
            students[cl_id][u.id]['name'] = u.last_name + " " + u.first_name.replace("$$", " ")


        for i in students:
            students[i] = list(students[i].values())

        return Response().jsonOk({
            'name': task.name,
            'subject': self._getSubjects([task.subject_id])[0]['name'],
            'classes': self._getClasses(task_classes),
            'results': students,
        })

    def taskViewCompletePage(self, id, uid):
        Tasks.objects.get(id=id, author=self.uid, org_id=self.org_id)
        context = self.context
        context['task_id'] = id
        context['uid'] = uid
        return Response().html(self.request, 'personal/task.view.complete.html', context)

    def taskViewCompleteGet(self, task_id, uid):
        task = Tasks.objects.get(id=task_id, author=self.uid, org_id=self.org_id)
        tasks_result = TaskResults.objects.get(uid=uid, task_id=task_id)
        student = User.objects.get(id=uid)
        cl_id = OrganizationStudents.objects.get(org_id=self.org_id, uid=uid).cl_id
        return Response().jsonOk({
            'uid': uid,
            'student': student.last_name + " " + student.first_name.replace("$$", " "),
            'className': self._getClasses([cl_id])[0]['name'],
            'task': TaskInterface().toTeacherShowResult(task, tasks_result),
            'percent': tasks_result.percent,
            'grade': tasks_result.grade,
        })

    def taskCalcGrade(self, task_id, uid):
        post = json.loads(self.request.body.decode('utf-8'))
        task = Tasks.objects.get(id=task_id, author=self.uid, org_id=self.org_id)
        return Response().jsonOk(TaskInterface().saveCheckByTeacher(task, uid, post['task']['questions']))

    def taskSetGrade(self, task_id, uid):
        post = json.loads(self.request.body.decode('utf-8'))
        results = TaskResults.objects.get(task_id=task_id, uid=uid)
        results.grade = post['grade']
        results.percent = post['percent']
        results.save()
        return Response().jsonOk()
