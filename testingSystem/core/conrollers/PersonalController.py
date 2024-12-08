from django.contrib.auth.models import User, Group
from core.include.Response import Response
from core.include.Utils import Utils
from core.include.UserGroup import UserGroup
from core.models import Organization
from core.models import OrganizationStudents
from core.models import OrganizationClasses
from core.models import OrganizationSubjects
from core.models import OrganizationPersonal
from core.models import TeacherSettings
from core.models import TaskToClasses
from core.models import Tasks
from core.models import TaskResults
import json

class PersonalController:
    def __init__(self, request):
        if not request.access.isPersonal():
            raise Exception("Fail access")
        self.request = request
        self.uid = self.request.user.id
        self.org_id = self.request.access.getOrganizationId()
        try:
            self.organization = Organization.objects.get(id=self.org_id, deleted=0)
        except:
            raise Exception("Organization not found")

        self.access_text = 'admin' if request.access.isAdmin() else 'teacher'

        self.context = {
                'id': self.organization.id,
                'name': self.organization.name,
                'address': self.organization.address,
                'deleted': self.organization.deleted == 1,
                'phoneFormated': Utils().formatPhone(self.organization.phone),
                'access': self.access_text
            }

    def personalPage(self, type):
        template = 'admin' if type == UserGroup.Admin.value else 'teacher'
        return Response().html(self.request, 'personal/' + template + 's.html', self.context)

    def resultsPage(self):
        return Response().html(self.request, 'personal/results.html', self.context)

    def resultsList(self):
        if self.request.access.isAdmin():
            tasksRes = Tasks.objects.filter(org_id=self.org_id)
            classesRes = OrganizationClasses.objects.filter(org_id=self.org_id)
        else:
            settings = self._getTeacherSetting(self.uid)
            tasksRes = Tasks.objects.filter(org_id=self.org_id, author=self.uid)
            classesRes = OrganizationClasses.objects.filter(org_id=self.org_id, id__in=settings.settings['classes'])

        classes = {}
        for cl in classesRes:
            classes[cl.id] = {'id': cl.id, 'name': cl.name}

        task_ids = []
        subject_ids = []
        teacher_ids = []
        tasks = {}
        for t in tasksRes:
            task_ids.append(t.id)
            subject_ids.append(t.subject_id)
            teacher_ids.append(t.author)
            tasks[t.id] = {'subject_id': t.subject_id, 'author': t.author}

        subjectsRes = OrganizationSubjects.objects.filter(org_id=self.org_id, id__in=subject_ids)
        subjects = {}
        for s in subjectsRes:
            subjects[s.id] = {'id': s.id, 'name': s.name}

        teachers = {}
        if self.request.access.isAdmin():
            teachersRes = User.objects.filter(id__in=teacher_ids)
            for user in teachersRes:
                user_ar = Utils().userToJsonObject(user)
                teachers[user.id] = {'id': user_ar['id'], 'name': user_ar['last_name'] + " " + user_ar['first_name'] + " " + user_ar['second_name']}

        task_results = TaskResults.objects.filter(task_id__in=task_ids)

        student_ids = [tr['uid'] for tr in task_results.values()]
        orgStudRes = OrganizationStudents.objects.filter(uid__in=student_ids)
        stud2cl = {}
        for st_cl in orgStudRes:
            stud2cl[st_cl.uid] = st_cl.cl_id


        res_list = []
        for tr in task_results:
            res_list.append(
                {
                    'percent': tr.percent,
                    'grade': tr.grade,
                    'subject': tasks[tr.task_id]['subject_id'],
                    'teacher': tasks[tr.task_id]['author'],
                    'class': stud2cl[tr.uid]
                }
            )

        return Response().jsonOk(
            {
                'list': res_list,
                'teachers': list(teachers.values()),
                'subjects': list(subjects.values()),
                'classes': list(classes.values()),
            }
        )


    def studentsPage(self):
        return Response().html(self.request, 'personal/students.html', self.context)

    def studentsList(self):
        studentsObj = OrganizationStudents.objects.filter(org_id=self.org_id)
        studentsIds = [so.get('uid') for so in studentsObj.values()]
        if len(studentsIds) > 0:
            students = {}
            users = User.objects.filter(id__in=studentsIds)
            for user in users:
                students[user.id] = Utils().userToJsonObject(user)
            for so in studentsObj.values():
                students[so['uid']]['classId'] = so['cl_id']

            students = [v for k,v in students.items()]
        else:
            students = []

        return Response().jsonOk(
            {
                'list': students,
                'classes': self._getClasses(),
            }
        )

    def studentEdit(self):
        post = json.loads(self.request.body.decode('utf-8'))

        id = post['id'] if 'id' in post else None
        username = post['login'] if 'login' in post else None
        last_name = post['last_name'] if 'last_name' in post else None
        first_name = post['first_name'] if 'first_name' in post else None
        second_name = post['second_name'] if 'second_name' in post else None
        email = post['email'] if 'email' in post else None
        password = post['password'] if 'password' in post else None
        classId = post['classId'] if 'classId' in post else None

        if username is None or last_name is None or first_name is None or email is None or classId is None:
            return Response().jsonError({'message': 'Необходимо заполнить все поля'})

        if Utils().loginExists(username, id):
            return Response().jsonError({'message': 'Логин уже используется в системе'})

        if id is None:
            if password is None:
                return Response().jsonError({'message': 'Необходимо заполнить все поля'})

            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=Utils().joinFirstName(first_name, second_name),
                last_name=last_name,
            )
            student_group = Group.objects.get(id=UserGroup.Student.value)
            student_group.user_set.add(user)
            os = OrganizationStudents(org_id=self.org_id, uid=user.id, cl_id=classId)
            os.save()
        else:
            try:
                user = User.objects.get(id=id)
            except Exception as e:
                return Response().jsonError({'message': 'Пользователь не найден'})

            haveChanges = False
            if username is not None and user.username != username:
                haveChanges = True
                user.username = username
            if email is not None and user.email != email:
                haveChanges = True
                user.email = email
            fn = Utils().joinFirstName(first_name, second_name)
            if first_name is not None and user.first_name != fn:
                haveChanges = True
                user.first_name = fn
            if last_name is not None and user.last_name != last_name:
                haveChanges = True
                user.last_name = last_name
            if haveChanges:
                user.save()

            os = OrganizationStudents.objects.get(uid=id)
            if os.cl_id != classId:
                os.cl_id = classId
                os.save()

        respUser = Utils().userToJsonObject(user)
        respUser['classId'] = classId
        return Response().jsonOk({'user': respUser})

    def studentResetPassword(self):
        post = json.loads(self.request.body.decode('utf-8'))

        id = post['id'] if 'id' in post else None
        if not id:
            return Response().jsonError({'message': 'Ученик не найден'})

        try:
            user = User.objects.get(id=id)
        except Exception as e:
            return Response().jsonError({'message': 'Ученик не найден'})
        if not user.groups.filter(id=UserGroup.Student.value).exists():
            return Response().jsonError({'message': 'Ученик не найден'})

        password = Utils().generatePassword()

        user.set_password(password)
        user.save()
        return Response().jsonOk({'data': password})

    def studentDelete(self):
        post = json.loads(self.request.body.decode('utf-8'))
        id = post['id'] if 'id' in post else None
        if not id:
            return Response().jsonError({'message': 'Ученик не найден'})

        try:
            user = User.objects.get(id=id)
        except Exception as e:
            return Response().jsonError({'message': 'Ученик не найден'})
        if not user.groups.filter(id=UserGroup.Student.value).exists():
            return Response().jsonError({'message': 'Ученик не найден'})
        user.is_active = False
        user.save()

        return Response().jsonOk()

    def studentRestore(self):
        post = json.loads(self.request.body.decode('utf-8'))
        id = post['id'] if 'id' in post else None
        if not id:
            return Response().jsonError({'message': 'Ученик не найден'})

        try:
            user = User.objects.get(id=id)
        except Exception as e:
            return Response().jsonError({'message': 'Ученик не найден'})
        if not user.groups.filter(id=UserGroup.Student.value).exists():
            return Response().jsonError({'message': 'Ученик не найден'})

        user.is_active = True
        user.save()
        return Response().jsonOk()


    def subjectsList(self):
        return Response().jsonOk({'list': self._getSubjects()})


    def tasksPage(self):
        return Response().html(self.request, 'personal/tasks.html', self.context)

    def tasksList(self):
        if self.request.access.isAdmin():
            tasks = Tasks.objects.filter(org_id=self.org_id)

            op = OrganizationPersonal.objects.filter(org_id=self.org_id)
            uids = [c.get('uid') for c in op.values()]
            users = User.objects.filter(id__in=uids)

            classes = OrganizationClasses.objects.filter(org_id=self.org_id)
        else:
            settings = self._getTeacherSetting(self.uid)
            tasks = Tasks.objects.filter(org_id=self.org_id, author=self.uid)
            users = User.objects.filter(id=self.uid)
            classes = OrganizationClasses.objects.filter(org_id=self.org_id, id__in=settings.settings['classes'])

        task_ids = [task['id'] for task in tasks.values()]

        cl_dict = {}
        for cl in classes:
            cl_dict[int(cl.id)] = cl.name

        t2cs = TaskToClasses.objects.filter(task_id__in=task_ids)
        t2c = {}
        for t in t2cs:
            if t.class_id not in cl_dict:
                continue;
            task_id = int(t.task_id)
            if task_id not in t2c:
                t2c[task_id] = []
            t2c[task_id].append({'id': t.class_id, 'name': cl_dict[t.class_id]})

        return Response().jsonOk(
            {
                'tasks': [
                    {
                        'id': task['id'],
                        'author': task['author'],
                        'subject_id': task['subject_id'],
                        'name': task['name'],
                        'description': task['description'],
                        'deleted': task['deleted'],
                        'in_production': task['in_production'] == 1,
                        'classes': t2c[task['id']] if task['id'] in t2c else [],
                        'check_by_teacher': task['check_by_teacher'],
                    } for task in tasks.values()
                ],
                'personal': [Utils().userToJsonObject(c, True) for c in users],
                'subjects': self._getSubjects(),
                'classes': self._getClasses(),
            }
        )


    def _getClasses(self, cfilter = []):
        classesObj = OrganizationClasses.objects.filter(org_id=self.org_id)
        if cfilter == []:
            return [{'id': c.get('id'), 'name': c.get('name')} for c in classesObj.values()]
        else:
            return list(filter(lambda lr: lr['id'] in cfilter, [{'id': c.get('id'), 'name': c.get('name')} for c in classesObj.values()]))

    def _getSubjects(self, sfilter = []):
        subjectsObj = OrganizationSubjects.objects.filter(org_id=self.org_id)
        if sfilter == []:
            return [{'id': c.get('id'), 'name': c.get('name')} for c in subjectsObj.values()]
        else:
            return list(filter(lambda lr: lr['id'] in sfilter, [{'id': c.get('id'), 'name': c.get('name')} for c in subjectsObj.values()]))

    def _getTeacherSetting(self, uid):
        try:
            settings = TeacherSettings.objects.get(uid=uid)
        except Exception as e:
            settings = TeacherSettings(uid=uid, settings={'classes':[],'subjects': []})
            settings.save()
        return settings
