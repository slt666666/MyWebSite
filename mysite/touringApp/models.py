from __future__ import unicode_literals

from django.db import models

# Create your models here.

class Route(models.Model):
    route_name = models.CharField(max_length=50)
    log_date = models.DateTimeField('date of the touring')
    def __str__(self):
        return self.route_name


class RoutePass(models.Model):
    route = models.ForeignKey(Route, on_delete=models.CASCADE)
    order = models.IntegerField()
    latitude = models.FloatField()
    longitude =  models.FloatField()
    def __str__(self):
        return self.id
