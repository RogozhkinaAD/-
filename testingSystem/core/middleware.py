from core.include.UserAccess import UserAccess

def userRequestMiddleware(get_response):
    def middleware(request):
        request.access = UserAccess(request.user)
        return get_response(request)

    return middleware

