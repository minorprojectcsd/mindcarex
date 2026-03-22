import api from '@/lib/api';

export interface Doctor {
  id: string;
  email?: string;
  fullName?: string;
  name?: string;
  specialization?: string;
  experienceYears?: number | null;
  qualifications?: string | null;
  bio?: string | null;
  languages?: string | null;
  clinicAddress?: string | null;
  consultationFee?: string | null;
  availabilityStatus?: string;
  licenseNumber?: string;
}

export interface PatientAppointment {
  id: string;
  doctor: {
    id: string;
    name: string;
    specialization?: string;
  };
  startTime: string;
  endTime?: string;
  status: 'PENDING' | 'BOOKED' | 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  sessionId?: string | null;
  sessionStatus?: string | null;
  notes?: string;
}

export interface DoctorAppointment {
  id: string;
  patient: {
    id: string;
    name?: string;
    fullName?: string;
  };
  startTime: string;
  endTime?: string;
  status: 'PENDING' | 'BOOKED' | 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  sessionId?: string | null;
  sessionStatus?: string | null;
  notes?: string;
}

export interface CreateAppointmentRequest {
  doctorId: string;
  startTime: string;
  endTime: string;
}

export const appointmentService = {
  async getDoctors(): Promise<Doctor[]> {
    const response = await api.get<Doctor[]>('/api/users/doctors');
    return response.data;
  },

  async createAppointment(data: CreateAppointmentRequest): Promise<any> {
    const response = await api.post('/api/appointments', data);
    return response.data;
  },

  async getMyAppointments(): Promise<PatientAppointment[]> {
    const response = await api.get<PatientAppointment[]>('/api/appointments/my');
    return response.data;
  },

  async getDoctorAppointments(): Promise<DoctorAppointment[]> {
    const response = await api.get<DoctorAppointment[]>('/api/doctor/appointments');
    return response.data;
  },

  async cancelAppointment(appointmentId: string): Promise<any> {
    const response = await api.post(`/api/appointments/${appointmentId}/cancel`);
    return response.data;
  },

  async confirmAppointment(appointmentId: string): Promise<any> {
    const response = await api.post(`/api/appointments/${appointmentId}/confirm`);
    return response.data;
  },

  async rejectAppointment(appointmentId: string, reason: string): Promise<any> {
    const response = await api.post(`/api/appointments/${appointmentId}/reject`, { reason });
    return response.data;
  },

  async getDoctorDashboard(): Promise<{ doctorName: string; pendingAppointments: number; confirmedAppointments: number; completedSessions: number }> {
    const response = await api.get('/api/doctor/dashboard');
    return response.data;
  },

  async getDoctorPending(): Promise<any[]> {
    const response = await api.get('/api/doctor/pending');
    return response.data;
  },
};
