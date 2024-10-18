from email.policy import default

from django.db import models

class Organization(models.Model):
    class DeletedEnum(models.IntegerChoices):
        NOT_DELETED = 0
        DELETED = 1
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    address = models.CharField(max_length=150)
    phone = models.CharField(max_length=12)
    deleted = models.IntegerField(choices=DeletedEnum, default=DeletedEnum.NOT_DELETED)

class OrganizationPersonal(models.Model):
    class LayerEnum(models.IntegerChoices):
        ADMIN = 0
        TEACHER = 1
    id = models.AutoField(primary_key=True)
    org_id = models.IntegerField()
    uid = models.IntegerField()
    layer = models.IntegerField(choices=LayerEnum, default=LayerEnum.TEACHER)

class OrganizationStudents(models.Model):
    id = models.AutoField(primary_key=True)
    org_id = models.IntegerField()
    uid = models.IntegerField()
    cl_id = models.IntegerField()

class OrganizationClasses(models.Model):
    id = models.AutoField(primary_key=True)
    org_id = models.IntegerField()
    name = models.CharField(max_length=25, default='')

class OrganizationSubjects(models.Model):
    id = models.AutoField(primary_key=True)
    org_id = models.IntegerField()
    name = models.CharField(max_length=50, default='')

class TeacherSettings(models.Model):
    uid = models.IntegerField(primary_key=True)
    settings = models.JSONField()

class Tasks(models.Model):
    class DeletedEnum(models.IntegerChoices):
        NOT_DELETED = 0
        DELETED = 1
    class InProductionEnum(models.IntegerChoices):
        NOT_PRODUCTION = 0
        IN_PRODUCTION = 1
    id = models.AutoField(primary_key=True)
    author = models.IntegerField()
    org_id = models.IntegerField(default=0)
    subject_id = models.IntegerField(default=0)
    name = models.CharField(max_length=250, default='')
    description = models.TextField(default='')
    content = models.JSONField()
    criteria = models.JSONField()
    deleted = models.IntegerField(choices=DeletedEnum, default=DeletedEnum.NOT_DELETED)
    in_production = models.IntegerField(choices=InProductionEnum, default=InProductionEnum.NOT_PRODUCTION)
    timer = models.IntegerField(default=0)
    check_by_teacher = models.BooleanField(default=False)

class TaskToClasses(models.Model):
    class_id = models.IntegerField()
    task_id = models.IntegerField()

class TaskResults(models.Model):
    uid = models.IntegerField()
    task_id = models.IntegerField()
    percent = models.FloatField()
    grade = models.IntegerField()
    answers = models.JSONField()
    datetime = models.DateTimeField()