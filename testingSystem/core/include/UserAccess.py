from core.include.UserGroup import UserGroup
from core.models import OrganizationPersonal, OrganizationStudents

class UserAccess():
    uid = 0
    is_staff = False
    is_admin = False
    is_teacher = False
    is_student = False
    organization_id = 0

    def __init__(self, user):
        if user.is_authenticated:
            self.uid = user.id
            self.is_staff = user.is_staff
            self.is_admin = user.groups.filter(id=UserGroup.Admin.value).exists()
            self.is_teacher = user.groups.filter(id=UserGroup.Teacher.value).exists()
            self.is_student = user.groups.filter(id=UserGroup.Student.value).exists()
            self.__fillOrganizationId()

    def isPersonal(self, withStaff=False):
        return self.is_teacher or self.is_admin or (withStaff and self.is_staff)

    def isAdmin(self, withStaff=False):
        return self.is_admin or (withStaff and self.is_staff)

    def isTeacher(self, withStaff=False):
        return self.is_teacher or (withStaff and self.is_staff)

    def isStudent(self, withStaff=False):
        return self.is_student or (withStaff and self.is_staff)

    def isOrganizationPersonal(self, org_id, withStaff=False):
        return (self.isPersonal() and self.organization_id == org_id) or (withStaff and self.is_staff)

    def isOrganizationAdmin(self, org_id, withStaff=False):
        return (self.isAdmin() and self.organization_id == org_id) or (withStaff and self.is_staff)

    def isOrganizationTeacher(self, org_id, withStaff=False):
        return (self.isTeacher() and self.organization_id == org_id) or (withStaff and self.is_staff)

    def isOrganizationStudent(self, org_id):
        return self.isStudent() and self.organization_id == org_id

    def getOrganizationId(self):
        return self.organization_id

    def __fillOrganizationId(self):
        if self.isPersonal():
            try:
                op = OrganizationPersonal.objects.get(uid=self.uid)
            except Exception as e:
                return
            self.organization_id = op.org_id
        elif self.isStudent():
            try:
                os = OrganizationStudents.objects.get(uid=self.uid)
            except Exception as e:
                return
            self.organization_id = os.org_id
