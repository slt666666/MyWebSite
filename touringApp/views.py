from django.shortcuts import get_object_or_404, render
from django.http import HttpResponse
from .models import Route, Pass
from django.utils import timezone
import json as simplejson

# Create your views here.
def index(request):
    return HttpResponse("To Make Top Page !!!")


def getGIS(request):
    return render(request, 'touringApp/getGIS.html')


def showGIS(request):
    newRoute = Route.objects.get(pk=1)
    newRoute.pass_set.create(order=1,latitude=2.5,longitude=4.8)
    return HttpResponse("a")
    #route = Route
    #route.route_name = "test"
    #route.
    # data = request.POST
