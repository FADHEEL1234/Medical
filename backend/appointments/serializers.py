from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Doctor, Appointment, PatientProfile


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)
    gender = serializers.ChoiceField(choices=PatientProfile.GENDER_CHOICES)
    address = serializers.CharField(max_length=255)
    age = serializers.IntegerField(min_value=0)
    
    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'password',
            'password_confirm',
            'first_name',
            'last_name',
            'gender',
            'address',
            'age',
        ]
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords do not match")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        gender = validated_data.pop('gender')
        address = validated_data.pop('address')
        age = validated_data.pop('age')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        PatientProfile.objects.create(
            user=user,
            gender=gender,
            address=address,
            age=age,
        )
        return user


# extend simplejwt serializer to include username in the response
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # add additional response fields
        data['username'] = self.user.username
        # include a flag so the frontend can detect an admin/staff user
        data['is_staff'] = self.user.is_staff
        data['is_superuser'] = self.user.is_superuser
        return data


class DoctorSerializer(serializers.ModelSerializer):
    """Serializer for Doctor model."""
    available_days = serializers.ListField(
        child=serializers.IntegerField(min_value=0, max_value=6),
        source='available_days_list',
        required=False,
        allow_empty=True,
        default=list,
    )

    class Meta:
        model = Doctor
        fields = ['id', 'name', 'specialization', 'email', 'phone', 'available_from', 'available_to', 'available_days', 'created_at']
        read_only_fields = ['id', 'created_at']


class AppointmentSerializer(serializers.ModelSerializer):
    """Serializer for Appointment model."""
    doctor_name = serializers.CharField(source='doctor.name', read_only=True)
    doctor_specialization = serializers.CharField(source='doctor.specialization', read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'user', 'user_name', 'doctor', 'doctor_name', 
            'doctor_specialization', 'appointment_date', 'status', 
            'created_at', 'updated_at'
        ]
        # regular users should never be able to change status directly
        read_only_fields = ['id', 'status', 'created_at', 'updated_at']


class AppointmentAdminSerializer(AppointmentSerializer):
    """Variant used by admin endpoints that permits changing status."""
    patient_first_name = serializers.CharField(source='user.first_name', read_only=True)
    patient_last_name = serializers.CharField(source='user.last_name', read_only=True)
    patient_email = serializers.CharField(source='user.email', read_only=True)
    patient_gender = serializers.SerializerMethodField()
    patient_address = serializers.SerializerMethodField()
    patient_age = serializers.SerializerMethodField()

    class Meta(AppointmentSerializer.Meta):
        # copy fields but make `status` writable so staff can update it
        fields = AppointmentSerializer.Meta.fields + [
            'patient_first_name',
            'patient_last_name',
            'patient_email',
            'patient_gender',
            'patient_address',
            'patient_age',
        ]
        read_only_fields = [
            f for f in AppointmentSerializer.Meta.read_only_fields
            if f != 'status'
        ]

    def get_patient_gender(self, obj):
        profile = getattr(obj.user, 'profile', None)
        return getattr(profile, 'gender', None)

    def get_patient_address(self, obj):
        profile = getattr(obj.user, 'profile', None)
        return getattr(profile, 'address', None)

    def get_patient_age(self, obj):
        profile = getattr(obj.user, 'profile', None)
        return getattr(profile, 'age', None)


class AppointmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating appointments.  We include the `id` field in
    the response so clients can immediately know the new record's identifier.
    """
    
    class Meta:
        model = Appointment
        fields = ['id', 'doctor', 'appointment_date']
        read_only_fields = ['id']
    
    def validate(self, data):
        # ensure the appointment is within doctor's availability window
        appt_date = data.get('appointment_date')
        doctor = data.get('doctor')
        from django.utils import timezone
        if appt_date and appt_date < timezone.now():
            raise serializers.ValidationError("Appointment date cannot be in the past")
        if doctor and appt_date:
            # check times
            appt_time = appt_date.time()
            if doctor.available_from and appt_time < doctor.available_from:
                raise serializers.ValidationError("Appointment time is before the doctor's available hours")
            if doctor.available_to and appt_time > doctor.available_to:
                raise serializers.ValidationError("Appointment time is after the doctor's available hours")
            # check weekday availability (0=Monday ... 6=Sunday)
            weekday = appt_date.weekday()
            available_days = getattr(doctor, 'available_days_list', None)
            if available_days is not None and len(available_days) > 0 and weekday not in available_days:
                raise serializers.ValidationError("Doctor is not available on the selected day")
        return data
