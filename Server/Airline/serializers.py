from Airline.models import Flight, Airport, Aircraft, Airline
from rest_framework import serializers

from rest_framework import serializers
from .models import Flight, FlightAttendant, SeniorFlightAttendant, Pilot, CoPilot


class FlightAttendantSerializer(serializers.ModelSerializer):
    class Meta:
        model = FlightAttendant
        fields = '__all__'


class SeniorFlightAttendantSerializer(serializers.ModelSerializer):
    class Meta:
        model = SeniorFlightAttendant
        fields = '__all__'


class PilotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pilot
        fields = '__all__'


class CoPilotSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoPilot
        fields = '__all__'


class AirportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Airport
        fields = '__all__'


class AirlineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Airline
        fields = '__all__'


class AircraftSerializer(serializers.ModelSerializer):
    class Meta:
        model = Aircraft
        fields = '__all__'


class FlightSerializer(serializers.ModelSerializer):
    pilot = PilotSerializer()
    co_pilot = CoPilotSerializer()
    senior_flight_attendant = SeniorFlightAttendantSerializer()
    flight_attendant = FlightAttendantSerializer(many=True)  # برای لیست چندتایی
    departure_airport = AirportSerializer()
    arrival_airport = AirportSerializer()
    airline = AirlineSerializer()
    aircraft = AircraftSerializer()

    class Meta:
        model = Flight
        fields = '__all__'


class FlightIDSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flight
        fields = '__all__'
