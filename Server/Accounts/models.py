from django.db import models


# Create your models here.
class Pilot(models.Model):
    full_name = models.CharField(max_length=100, verbose_name="نام کامل")
    first_flight = models.DateField(verbose_name="تجربه")
    date_of_birth = models.DateField(verbose_name="تاریخ تولد")
    phone_number = models.CharField(max_length=15, verbose_name="شماره تلفن")
    email = models.EmailField(unique=True, verbose_name="ایمیل")
    is_active = models.BooleanField(default=True, verbose_name="فعال")

    def __str__(self):
        return self.full_name

    class Meta:
        verbose_name = "خلبان"
        verbose_name_plural = "خلبانان"


class CoPilot(models.Model):
    full_name = models.CharField(max_length=100, verbose_name="نام کامل")
    training_hours = models.PositiveIntegerField(verbose_name="ساعات آموزش")
    date_of_hire = models.DateField(verbose_name="تاریخ استخدام")
    phone_number = models.CharField(max_length=15, verbose_name="شماره تلفن")
    email = models.EmailField(unique=True, verbose_name="ایمیل")
    is_active = models.BooleanField(default=True, verbose_name="فعال")

    def __str__(self):
        return self.full_name

    class Meta:
        verbose_name = "کمک خلبان"
        verbose_name_plural = "کمک خلبانان"


class SeniorFlightAttendant(models.Model):
    full_name = models.CharField(max_length=100, verbose_name="نام کامل")
    employee_id = models.CharField(max_length=20, unique=True, verbose_name="شناسه کارمند")
    first_flight = models.DateField(verbose_name="تجربه")
    language_skills = models.CharField(max_length=200, verbose_name="مهارت‌های زبانی")
    phone_number = models.CharField(max_length=15, verbose_name="شماره تلفن")
    email = models.EmailField(unique=True, verbose_name="ایمیل")
    is_active = models.BooleanField(default=True, verbose_name="فعال")
    def __str__(self):
        return self.full_name

    class Meta:
        verbose_name = "مهماندار ارشد"
        verbose_name_plural = "مهمانداران ارشد"


class FlightAttendant(models.Model):
    full_name = models.CharField(max_length=100, verbose_name="نام کامل")
    employee_id = models.CharField(max_length=20, unique=True, verbose_name="شناسه کارمند")
    date_of_hire = models.DateField(verbose_name="تاریخ استخدام")
    training_completed = models.BooleanField(default=False, verbose_name="آموزش تکمیل شده")
    phone_number = models.CharField(max_length=15, verbose_name="شماره تلفن")
    email = models.EmailField(unique=True, verbose_name="ایمیل")
    is_active = models.BooleanField(default=True, verbose_name="فعال")
    def __str__(self):
        return self.full_name

    class Meta:
        verbose_name = "مهماندار"
        verbose_name_plural = "مهمانداران"
