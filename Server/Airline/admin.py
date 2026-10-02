from django.contrib import admin

from Airline.models import Airline, Airport, Aircraft, Flight

# Register your models here.
admin.site.register(Airline)
admin.site.register(Airport)
admin.site.register(Aircraft)
admin.site.register(Flight)