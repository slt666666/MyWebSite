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
        pass1 = json.loads(request.body)
        print pass1 # [[123.32,23.44],[123.32,23.44],[123.32,23.44]...]
        newRoute = Route(route_name = pass1[len(pass1)-2],log_date = timezone.now())
        newRoute.save()
        for num in range(0, len(pass1)-3):
            newRoute.pass_set.create(order=num+1,latitude=pass1[num][0],longitude=pass1[num][1])
        return render(request, 'touringApp/getGIS.html')
    else:
        return render(request, 'touringApp/getGIS.html')
