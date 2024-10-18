import random
from django.contrib.auth.models import User

class Utils:
    def formatPhone(self, phone):
        return phone[0:2] + "(" + phone[2:5] + ")" + phone[5:8] + "-" + phone[8:10] + "-" + phone[10:12]

    def userToJsonObject(self, user, short=False):
        exp_name = user.first_name.split("$$")
        if short:
            return {
                'id': user.id,
                'last_name': user.last_name,
                'first_name': exp_name[0],
                'second_name': exp_name[1],
            }
        return {
            'id': user.id,
            'last_name': user.last_name,
            'first_name': exp_name[0],
            'second_name': exp_name[1],
            'email': user.email,
            'login': user.username,
            'deleted': not user.is_active
        }

    def joinFirstName(self, f, s):
        return "$$".join([f, s])

    def generatePassword(self):
        alfabet = [
            'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'
            'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
            '1','2','3','4','5','6','7','8','9','0',
            '~','!','@','#','$','%','^','&','(',')','-','_','+','=',':',';',',','.','<','>','{','}','[',']'
        ]

        secure_random = random.SystemRandom()
        secure_random.shuffle(alfabet)
        return ''.join(secure_random.sample(alfabet, 12))

    def loginExists(self, username, id):
        try:
            user = User.objects.get(username=username)
        except Exception as e:
            return False

        return user.id != id