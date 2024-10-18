from datetime import datetime
import json
from core.include.Response import Response
from core.include.Utils import Utils
from core.tasks.TaskInterface import TaskInterface
from core.models import Organization
from core.models import OrganizationStudents
from core.models import OrganizationClasses

from core.models import TaskToClasses
from core.models import Tasks
from core.models import TaskResults

class StudentController:

    def __init__(self, request):
        if not request.access.isStudent():
            raise Exception("Fail access")
        self.request = request
        self.uid = self.request.user.id
        self.org_id = self.request.access.getOrganizationId()
        try:
            self.organization = Organization.objects.get(id=self.org_id, deleted=0)
        except:
            raise Exception("Organization not found")

    def getList(self):
        try:
            cl_id = OrganizationStudents.objects.get(org_id=self.org_id, uid=self.uid).cl_id
            className = OrganizationClasses.objects.get(id=cl_id, org_id=self.org_id).name
        except:
            raise Exception("Organization not found")

        task2classes_set = TaskToClasses.objects.filter(class_id=cl_id)
        task_ids = [t.task_id for t in task2classes_set]
        del task2classes_set

        tasks_results_set = TaskResults.objects.filter(uid=self.uid, task_id__in=task_ids)
        tasks_results_dict = {}
        for tr in tasks_results_set:
            tasks_results_dict[tr.task_id] = tr
        del tasks_results_set

        tasks_set = Tasks.objects.filter(org_id=self.org_id, id__in=task_ids, deleted=0, in_production=1)

        new_tasks = []
        ready_tasks = []

        ti = TaskInterface()

        for task in tasks_set:
            if task.id in tasks_results_dict:
                ready_tasks.append(ti.toStudentList(task, tasks_results_dict[task.id]))
            else:
                new_tasks.append(ti.toStudentList(task))

        return Response().jsonOk({
            'user': Utils().userToJsonObject(self.request.user, True),
            'organization': self.organization.name,
            'className': className,
            'newTasks': new_tasks,
            'readyTasks': ready_tasks,
        })

    def pageTask(self, id):
        TaskInterface().checkStudentAccess(self.org_id, self.uid, id)

        try:
            task_result = TaskResults.objects.get(uid=self.uid, task_id=id)
        except:
            task_result = None

        if task_result is not None:
            return Response().redirect("/")

        return Response().html(self.request, 'student/task.html', { 'id': id })

    def getTask(self, id):
        TaskInterface().checkStudentAccess(self.org_id, self.uid, id)

        try:
            task_result = TaskResults.objects.get(uid=self.uid, task_id=id)
        except:
            task_result = None

        if task_result is not None:
            raise Exception('Already complete')

        return Response().jsonOk(TaskInterface().toStudentComplete(Tasks.objects.get(id=id)))

    def complete(self, id):
        TaskInterface().checkStudentAccess(self.org_id, self.uid, id)

        post = json.loads(self.request.body.decode('utf-8'))

        result = TaskInterface().checkComplete(Tasks.objects.get(id=id), post['result'])

        now = datetime.now()
        task_result = TaskResults(
            uid=self.uid,
            task_id=id,
            percent=result['percent'],
            grade=result['grade'],
            answers=post['result'],
            datetime=now.strftime("%Y-%m-%d %H:%M:%S")
        )
        task_result.save()

        return Response().jsonOk(
            {
                'percent': result['percent'],
                'grade': result['grade'],
                'result_by_teacher': result['result_by_teacher']}
        )
