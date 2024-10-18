from django.contrib.auth import authenticate, login, logout
from core.include.Response import Response
import json

def loginPage(request):
    return Response().html(request, 'login.html')

def logOutProcess(request):
    logout(request)
    return Response().redirect('/')

def authProcess(request):
    post = json.loads(request.body.decode('utf-8'))
    if 'login' not in post or 'password' not in post:
        return Response().jsonError({ 'message': 'Логин и/или пароль введены не верно' })

    user = authenticate(username=post['login'], password=post['password'])
    if user is not None:
        if user.is_active:
            login(request, user)
            return Response().jsonOk({})
        else:
            return Response().jsonError({'message': 'Логин и/или пароль введены не верно'})
    else:
        return Response().jsonError({ 'message': 'Логин и/или пароль введены не верно' })


