from django.http import HttpResponse, HttpResponseNotFound
from django.shortcuts import render, redirect
import json

class Response:
    def html(self, request, tpl, context=None):
        return render(request, tpl, context)

    def jsonOk(self, data={}):
        data['status'] = 'OK'
        return HttpResponse(json.dumps(data), content_type="application/json")

    def jsonError(self, data={}):
        data['status'] = 'Error'
        return HttpResponse(json.dumps(data), content_type="application/json")

    def redirect(self, url):
        # return redirect(reverse(url))
        return redirect(url)

    def notFoundHtml(self):
        return HttpResponseNotFound()

    def notFoundJson(self):
        data = {'status': 'ERROR', 'message': '404 Not Found'}
        return HttpResponseNotFound(json.dumps(data), content_type="application/json")
