from django.shortcuts import get_object_or_404, render
from django.http import HttpResponse
from .models import Route, Pass
from django.utils import timezone
import json

# Create your views here.
def index(request):
    return HttpResponse("To Make Top Page !!!")


def getGIS(request):
    if request.method == "POST":
        print json.loads(request.body) # [[123.32,23.44],[123.32,23.44],[123.32,23.44]]
        pass1 = json.loads(request.body)
        newRoute = Route(route_name = "test_3",log_date = timezone.now())
        newRoute.save()
        newRoute.pass_set.create(order=12,latitude=pass1[0][1],longitude=4.8)
        return render(request, 'touringApp/getGIS.html')
    else:
        return render(request, 'touringApp/getGIS.html')


def showGIS(request):
    newRoute = Route(route_name = "test_1",log_date = timezone.now())
    newRoute.save()
    newRoute.pass_set.create(order=1,latitude=2.5,longitude=4.8)
    return HttpResponse("a")
    #route = Route
    #route.route_name = "test"
    #route.
    # data = request.POST
