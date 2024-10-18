from django.contrib.auth.models import User, Group
from core.include.Response import Response
from core.include.Utils import Utils
from core.include.UserGroup import UserGroup
from core.models import Organization
from core.models import OrganizationPersonal
import json

class StaffController:

    def __init__(self, request):
        if not request.user.is_staff:
            raise Exception("Fail access")
        self.request = request

    def getDashboardData(self):
        return Response().jsonOk()

    def getOrganizations(self):
        list = Organization.objects.all()

        return Response().jsonOk(
            {
                'organizations': [
                    {
                        'id': org.id,
                        'name': org.name,
                        'address': org.address,
                        'phone': org.phone,
                        'phoneFormated': Utils().formatPhone(org.phone),
                        'deleted': org.deleted == 1,
                    } for org in list
                ]
            }
        )

    def getOrganizationPage(self, id, full=False):
        try:
            org = Organization.objects.get(id=id)
        except Exception as e:
            return Response().notFoundHtml()

        if org.deleted:
            return Response().notFoundHtml()

        return Response().html(
            self.request,
            'staff/organization.html',
            {
                'id': org.id,
                'name': org.name,
                'address': org.address,
                'deleted': org.deleted == 1,
                'phoneFormated': Utils().formatPhone(org.phone),
            }
        )

    def getOrganizationPersonal(self, id):
        admins = []
        teachers = []
        pers = OrganizationPersonal.objects.filter(org_id=id)
        personalIds = [p.get('uid') for p in pers.values()]
        if len(personalIds) > 0:
            users = User.objects.filter(id__in=personalIds)
            for user in users:
                if user.groups.filter(id=UserGroup.Admin.value).exists():
                    admins.append(Utils().userToJsonObject(user))
                else:
                    teachers.append(Utils().userToJsonObject(user))

        return Response().jsonOk(
            {
                'admins': admins,
                'teachers': teachers,
            }
        )

    def editOrganization(self):
        post = json.loads(self.request.body.decode('utf-8'))
        id = post['id'] if 'id' in post else None

        if id is None:
            org = Organization(name=post['name'], address=post['address'], phone=post['phone'], deleted=0)
        else:
            try:
                org = Organization.objects.get(id=id)
            except Exception as e:
                return Response().notFoundJson()
            org.name = post['name']
            org.address = post['address']
            org.phone = post['phone']
        org.save()
        return Response().jsonOk(
            {
                'organization': {
                    'id': org.id,
                    'name': org.name,
                    'address': org.address,
                    'phone': org.phone,
                    'phoneFormated': Utils().formatPhone(org.phone),
                    'deleted': org.deleted == 1,
                }
            }
        )

    def deleteOrganization(self):
        post = json.loads(self.request.body.decode('utf-8'))
        id = post['id'] if 'id' in post else None

        if id is None:
            return Response().notFoundJson()

        try:
            org = Organization.objects.get(id=id)
        except Exception as e:
            return Response().notFoundJson()

        org.deleted = 1
        org.save()

        return Response().jsonOk()

    def restoreOrganization(self):
        post = json.loads(self.request.body.decode('utf-8'))
        id = post['id'] if 'id' in post else None

        try:
            org = Organization.objects.get(id=id)
        except Exception as e:
            return Response().notFoundJson()

        org.deleted = 0
        org.save()

        return Response().jsonOk()

    def personalEdit(self):
        post = json.loads(self.request.body.decode('utf-8'))

        org_id = post['org_id'] if 'id' in post else None
        if org_id is None:
            return Response().jsonError({'message': 'Необходимо заполнить все поля'})
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

                op = OrganizationPersonal(org_id=org_id, uid=user.id, layer=UserGroup.Admin.value - 1)
                op.save()
            else:  # 'teacher'
                teachers_group = Group.objects.get(id=UserGroup.Teacher.value)
                teachers_group.user_set.add(user)
                op = OrganizationPersonal(org_id=org_id, uid=user.id, layer=UserGroup.Teacher.value - 1)
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



