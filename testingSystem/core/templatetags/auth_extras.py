from django import template
from core.include.UserGroup import UserGroup

register = template.Library()

@register.filter(name='personal_or_staff')
def personal_or_staff(user):
    return (user.is_authenticated and
            (
                    user.is_staff or
                    not user.groups.filter(id=UserGroup.Student.value).exists()
            )
        )

@register.filter(name='has_group')
def has_group(user, group_name):
    if group_name == 'student':
        return user.groups.filter(id=UserGroup.Student.value).exists()
    elif group_name == 'teacher':
        return user.groups.filter(id=UserGroup.Teacher.value).exists()
    elif group_name == 'admin':
        return user.groups.filter(id=UserGroup.Admin.value).exists()
    return False

@register.filter(name='replace_name')
def replace_name(value):
    return value.replace("$$", " ")

@register.filter(name='get_menu_selected')
def get_menu_selected(request, needle):
    if request.path == needle:
        return 'selected'
    if request.path[:15] == "/personal/task/" and needle == "/":
        return 'selected'
    if request.path[:11] == "/staff/org/" and needle == "/":
        return 'selected'
    return ""
