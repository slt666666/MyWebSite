from django.contrib import admin

from .models import Route, Pass
# Register your models here.

class PassInline(admin.TabularInline):
    model = Pass
    extra = 1


class RouteAdmin(admin.ModelAdmin):
    fieldsets = [
        (None, {'fields':['route_name']}),
        ('Date information', {'fields':['log_date']}),
    ]
    inlines = [PassInline]
    list_filter = ['log_date']
    list_display = ('route_name', 'log_date')


admin.site.register(Route, RouteAdmin)
