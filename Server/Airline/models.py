from django.db import models
from Accounts.models import Pilot, CoPilot, FlightAttendant, SeniorFlightAttendant


# Create your models here.
class Airline(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="نام ایرلاین")
    code = models.CharField(max_length=10, unique=True, verbose_name="کد ایرلاین")
    country = models.CharField(max_length=100, verbose_name="کشور")
    established_year = models.PositiveIntegerField(verbose_name="سال تاسیس")
    logo = models.ImageField(upload_to='airlines/logos/', null=True, blank=True, verbose_name="لوگو")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "ایرلاین"
        verbose_name_plural = "ایرلاین‌ها"


class Airport(models.Model):
    name = models.CharField(max_length=100, verbose_name="نام فرودگاه")
    code = models.CharField(max_length=3, unique=True, verbose_name="کد IATA")
    city = models.CharField(max_length=100, verbose_name="شهر")
    country = models.CharField(max_length=100, verbose_name="کشور")
    latitude = models.FloatField(verbose_name="عرض جغرافیایی")
    longitude = models.FloatField(verbose_name="طول جغرافیایی")

    def __str__(self):
        return f"{self.name} ({self.code})"

    class Meta:
        verbose_name = "فرودگاه"
        verbose_name_plural = "فرودگاه‌ها"


class Aircraft(models.Model):
    model = models.CharField(max_length=100, verbose_name="مدل هواپیما")
    registration_number = models.CharField(max_length=20, unique=True, verbose_name="شماره ثبت")
    airline = models.ForeignKey(Airline, on_delete=models.CASCADE, verbose_name="ایرلاین")
    capacity = models.PositiveIntegerField(verbose_name="ظرفیت")
    manufacture_year = models.PositiveIntegerField(verbose_name="سال ساخت")
    is_operational = models.BooleanField(default=True, verbose_name="عملیاتی")

    def __str__(self):
        return f"{self.model} ({self.registration_number})"

    class Meta:
        verbose_name = "هواپیما"
        verbose_name_plural = "هواپیماها"


class Flight(models.Model):
    flight_number = models.CharField(max_length=20, unique=True, verbose_name="شماره پرواز")
    status = models.CharField(max_length=20, choices=[
        ('Scheduled', 'برنامه‌ریزی شده'),
        ('In progress', 'درحال انجام'),
        ('Delayed', 'تاخیری'),
        ('Cancelled', 'لغو شده')
    ], default='scheduled', verbose_name="وضعیت")
    departure_airport = models.ForeignKey(Airport, related_name='departures', on_delete=models.CASCADE,
                                          verbose_name="فرودگاه مبدا")
    arrival_airport = models.ForeignKey(Airport, related_name='arrivals', on_delete=models.CASCADE,
                                        verbose_name="فرودگاه مقصد")
    airline = models.ForeignKey(Airline, on_delete=models.CASCADE, verbose_name="ایرلاین")
    departure_time = models.DateTimeField(verbose_name="زمان حرکت")
    arrival_time = models.DateTimeField(verbose_name="زمان رسیدن")
    aircraft = models.ForeignKey(Aircraft, on_delete=models.CASCADE, verbose_name="هواپیما")
    pilot = models.ForeignKey(Pilot, on_delete=models.SET_NULL, null=True, verbose_name="خلبان")
    co_pilot = models.ForeignKey(CoPilot, on_delete=models.SET_NULL, null=True, verbose_name="کمک خلبان")
    flight_attendant = models.ManyToManyField(FlightAttendant, verbose_name="مهماندار")
    senior_flight_attendant = models.ForeignKey(SeniorFlightAttendant, on_delete=models.SET_NULL, null=True,
                                                verbose_name="مهماندار ارشد")

    def __str__(self):
        return f"{self.flight_number} ({self.departure_airport} to {self.arrival_airport})"

    class Meta:
        verbose_name = "پرواز"
        verbose_name_plural = "پروازها"
