from django.contrib.auth.models import User, Group
from core.include.Response import Response
from core.include.Utils import Utils
from core.include.UserGroup import UserGroup
from core.conrollers.PersonalController import PersonalController
from core.models import OrganizationPersonal
from core.models import OrganizationClasses
from core.models import OrganizationSubjects
from core.models import TeacherSettings
import json


class AdminPersonalController(PersonalController):
    def __init__(self, request):
        super(AdminPersonalController, self).__init__(request)

        if not request.access.isAdmin():
            raise Exception("Fail admin access")

    def personalList(self, group_value):
        pers = OrganizationPersonal.objects.filter(org_id=self.org_id)
        personalIds = [p.get('uid') for p in pers.values()]
        personal = []
        if len(personalIds) > 0:
            users = User.objects.filter(id__in=personalIds)
            for user in users:
                if user.groups.filter(id=group_value).exists():
                    personal.append(Utils().userToJsonObject(user))

        if group_value == UserGroup.Admin.value:
            return Response().jsonOk({'list': personal})


        return Response().jsonOk(
            {
                'list': personal,
                'classes': self._getClasses(),
                'subjects': self._getSubjects()
            }
        )

    def personalEdit(self):
        post = json.loads(self.request.body.decode('utf-8'))

        id = post['id'] if 'id' in post else None
        username = post['login'] if 'login' in post else None
        last_name = post['last_name'] if 'last_name' in post else None
        first_name = post['first_name'] if 'first_name' in post else None
        second_name = post['second_name'] if 'second_name' in post else None
        email = post['email'] if 'email' in post else None
        password = post['password'] if 'password' in post else None
        layer = post['layer'] if 'layer' in post else None

        if username is None or last_name is None or first_name is None or email is None or layer is None or layer not in ['admin', 'teacher']:
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
            if layer == 'admin':
                admin_group = Group.objects.get(id=UserGroup.Admin.value)
                admin_group.user_set.add(user)

                op = OrganizationPersonal(org_id=self.org_id, uid=user.id, layer=UserGroup.Admin.value - 1)
                op.save()
            else:  # 'teacher'
                teachers_group = Group.objects.get(id=UserGroup.Teacher.value)
                teachers_group.user_set.add(user)
                op = OrganizationPersonal(org_id=self.org_id, uid=user.id, layer=UserGroup.Teacher.value - 1)
                op.save()
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
            if not haveChanges:
                return Response().jsonOk({'user': Utils().userToJsonObject(user)})
            user.save()
        return Response().jsonOk({'user': Utils().userToJsonObject(user)})

    def personalResetPassword(self):
        post = json.loads(self.request.body.decode('utf-8'))
        id = post['id'] if 'id' in post else None
        if not id:
            return Response().jsonError({'message': 'Пользователь не найден'})

        try:
            user = User.objects.get(id=id)
        except Exception as e:
            return Response().jsonError({'message': 'Пользователь не найден'})
        if not user.groups.filter(id__in=[UserGroup.Admin.value, UserGroup.Teacher.value]).exists():
            return Response().jsonError({'message': 'Пользователь не найден'})

        password = Utils().generatePassword()

        user.set_password(password)
        user.save()
        return Response().jsonOk({'data': password})

    def personalDelete(self):
        post = json.loads(self.request.body.decode('utf-8'))
        id = post['id'] if 'id' in post else None
        if not id:
            return Response().jsonError({'message': 'Пользователь не найден'})

        try:
            user = User.objects.get(id=id)
        except Exception as e:
            return Response().jsonError({'message': 'Пользователь не найден'})
        if not user.groups.filter(id__in=[UserGroup.Admin.value, UserGroup.Teacher.value]).exists():
            return Response().jsonError({'message': 'Пользователь не найден'})

        user.is_active = False
        user.save()

        return Response().jsonOk()

    def personalRestore(self):
        post = json.loads(self.request.body.decode('utf-8'))
        id = post['id'] if 'id' in post else None
        if not id:
            return Response().jsonError({'message': 'Пользователь не найден'})

        try:
            user = User.objects.get(id=id)
        except Exception as e:
            return Response().jsonError({'message': 'Пользователь не найден'})
        if not user.groups.filter(id__in=[UserGroup.Admin.value, UserGroup.Teacher.value]).exists():
            return Response().jsonError({'message': 'Пользователь не найден'})

        user.is_active = True
        user.save()

        return Response().jsonOk()

    def teacherSettings(self):
        post = json.loads(self.request.body.decode('utf-8'))
        teacher_id = post['teacher_id'] if 'teacher_id' in post else None

        try:
            settings = TeacherSettings.objects.get(uid=teacher_id)
        except Exception as e:
            settings = TeacherSettings(uid=teacher_id, settings={'classes':[],'subjects': []})
            settings.save()

        return Response().jsonOk({'teacherSettings': self._getTeacherSetting(teacher_id).settings})

    def teacherSettingsSave(self):
        post = json.loads(self.request.body.decode('utf-8'))
        teacher_id = post['teacher_id'] if 'teacher_id' in post else None

        newSettings = post['settings'] if 'settings' in post else None;
        if newSettings is None or 'classes' not in newSettings or 'subjects' not in newSettings:
            return Response().jsonError({'message': 'Данные заполнены не полностью'})

        try:
            settings = TeacherSettings.objects.get(uid=teacher_id)
            settings.settings = newSettings
        except Exception as e:
            settings = TeacherSettings(uid=teacher_id, settings=newSettings)
        settings.save()

        return Response().jsonOk({})

    def classesPage(self):
        return Response().html(self.request, 'personal/classes.html', self.context)

    def classesList(self):
        return Response().jsonOk({'list': self._getClasses()})

    def classesEdit(self):
        post = json.loads(self.request.body.decode('utf-8'))
        id = post['id'] if 'id' in post else None
        name = post['name'] if 'name' in post else None

        if name is None or len(name) == 0:
            return Response().jsonError({'message': 'Не заполнено наименование класса'})

        if id is None:
            cl = OrganizationClasses(name=name, org_id=self.org_id)
        else:
            try:
                cl = OrganizationClasses.objects.get(id=id, org_id=self.org_id)
            except Exception as e:
                return Response().notFoundJson()
            cl.name = name
        cl.save()
        return Response().jsonOk(
            {
                'data': {
                    'id': cl.id,
                    'name': cl.name,
                }
            }
        )


    def subjectsPage(self):
        return Response().html(self.request, 'personal/subjects.html', self.context)

    def subjectEdit(self):
        post = json.loads(self.request.body.decode('utf-8'))

        id = post['id'] if 'id' in post else None
        name = post['name'] if 'name' in post else None

        if name is None or len(name) == 0:
            return Response().jsonError({'message': 'Не заполнено название предмете'})

        if id is None:
            cl = OrganizationSubjects(name=name, org_id=self.org_id)
        else:
            try:
                cl = OrganizationSubjects.objects.get(id=id, org_id=self.org_id)
            except Exception as e:
                return Response().notFoundJson()
            cl.name = name
        cl.save()
        return Response().jsonOk(
            {
                'data': {
                    'id': cl.id,
                    'name': cl.name,
                }
            }
        )

