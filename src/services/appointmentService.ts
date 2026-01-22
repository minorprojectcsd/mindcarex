import api from '@/lib/api';

export interface Doctor {
  id: string;
  email: string;
  name?: string;
  specialization?: string;
}

export interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  startTime: string;
  endTime: string;
  status: 'BOOKED' | 'COMPLETED' | 'CANCELLED';
  doctor?: Doctor;
  patient?: { id: string; email: string; name?: string };
}

export interface CreateAppointmentRequest {
  doctorId: string;
  startTime: string;
  endTime: string;
}

export const appointmentService = {
  // Get list of all doctors (for patients to book)
  async getDoctors(): Promise<Doctor[]> {
    const response = await api.get<Doctor[]>('/api/users/doctors');
    return response.data;
  },

  // Create a new appointment (Patient)
  async createAppointment(data: CreateAppointmentRequest): Promise<Appointment> {
    const response = await api.post<Appointment>('/api/appointments', data);
    return response.data;
  },

  // Get patient's own appointments
  async getMyAppointments(): Promise<Appointment[]> {
    const response = await api.get<Appointment[]>('/api/appointments/my');
    return response.data;
  },

  // Get doctor's appointments
  async getDoctorAppointments(): Promise<Appointment[]> {
    const response = await api.get<Appointment[]>('/api/doctor/appointments');
    return response.data;
  },
};
