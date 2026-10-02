# Create your views here.

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from Accounts.models import FlightAttendant, SeniorFlightAttendant, Pilot, CoPilot
from Airline.models import Flight, Airport
from Airline.serializers import FlightSerializer, FlightAttendantSerializer, SeniorFlightAttendantSerializer, \
    PilotSerializer, CoPilotSerializer, AirportSerializer, FlightIDSerializer


class FlightListAPIView(generics.ListAPIView):
    queryset = Flight.objects.all()
    serializer_class = FlightSerializer
    permission_classes = [IsAuthenticated]

class FlightDetailAPIView(generics.RetrieveAPIView):
    queryset = Flight.objects.all()
    serializer_class = FlightSerializer
    permission_classes = [IsAuthenticated]

class FlightAddAPIView(generics.CreateAPIView):
    queryset = Flight.objects.all()
    serializer_class = FlightIDSerializer
    permission_classes = [IsAuthenticated]
    def get(self, request, *args, **kwargs):
        attendants = FlightAttendant.objects.filter(is_active=True)
        senior_attendants = SeniorFlightAttendant.objects.filter(is_active=True)
        pilots = Pilot.objects.filter(is_active=True)
        co_pilots = CoPilot.objects.filter(is_active=True)
        airports = Airport.objects.filter(is_active=True)

        attendant_data = FlightAttendantSerializer(attendants, many=True).data
        senior_attendant_data = SeniorFlightAttendantSerializer(senior_attendants, many=True).data
        pilot_data = PilotSerializer(pilots, many=True).data
        co_pilot_data = CoPilotSerializer(co_pilots, many=True).data
        airports_data = AirportSerializer(airports, many=True).data
        # ترکیب داده‌ها در یک پاسخ
        response_data = {
            'flight_attendants': attendant_data,
            'senior_flight_attendants': senior_attendant_data,
            'pilots': pilot_data,
            'co_pilots': co_pilot_data,
            'airports': airports_data,
        }

        return Response(response_data)


class FlightRemoveAPIView(generics.DestroyAPIView):
    queryset = Flight.objects.all()
    serializer_class = FlightIDSerializer
    permission_classes = [IsAuthenticated]

class FlightEditAPIView(generics.UpdateAPIView):
    queryset = Flight.objects.all()
    serializer_class = FlightIDSerializer
    permission_classes = [IsAuthenticated]