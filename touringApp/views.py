from django.shortcuts import get_object_or_404, render
from django.http import HttpResponse
import json as simplejson

# Create your views here.
def index(request):
    return HttpResponse("To Make Top Page !!!")


def getGIS(request):
    return render(request, 'touringApp/getGIS.html')


def showGIS(request):
    data = request.POST
    return HttpResponse("POST success!!")
    # return render(data, 'touringApp/showGIS.html')
