from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^showRoute/$', views.showRoute, name='showRoute'),
    url(r'^getGIS/$', views.getGIS, name='getGIS'),
]
