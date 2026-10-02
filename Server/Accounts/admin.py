from django.contrib import admin

from Accounts.models import Pilot, CoPilot, SeniorFlightAttendant, FlightAttendant

# Register your models here.
admin.site.register(Pilot)
admin.site.register(CoPilot)
admin.site.register(SeniorFlightAttendant)
admin.site.register(FlightAttendant)
