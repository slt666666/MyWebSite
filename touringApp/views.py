from django.shortcuts import get_object_or_404, render
from django.http import HttpResponse

# Create your views here.
def index(request):
    return HttpResponse("To Make Top Page !!!")

def getGIS(request):
    return render(request, 'touringApp/getGIS.html')
