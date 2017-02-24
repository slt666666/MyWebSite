from django.shortcuts import get_object_or_404, render
from django.http import HttpResponse
from .models import Route, Pass
from django.utils import timezone
import json

# Create your views here.
def index(request):
    routePass = Route.objects.all()
    PassSet = routePass[1].pass_set.all()
    return render(request, 'touringApp/index.html', { 'all':PassSet })


def getGIS(request):
    if request.method == "POST":
        passData = json.loads(request.body)
        #print passData
        newRoute = Route(route_name = passData[len(passData)-2],log_date = passData[len(passData)-1])
        newRoute.save()
        for num in range(0, len(passData)-3):
            newRoute.pass_set.create(order=num+1,latitude=passData[num][0],longitude=passData[num][1])
        return render(request, 'touringApp/getGIS.html')
    else:
        return render(request, 'touringApp/getGIS.html')
