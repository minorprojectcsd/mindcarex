// Direct Supabase API calls (used when USE_SUPABASE_DIRECT is true)
import { supabase } from '@/integrations/supabase/client';
import type { Session, Schedule, Patient } from '@/types';

export const supabaseScheduleApi = {
  async createSchedule(schedule: Omit<Schedule, 'id'>): Promise<Schedule> {
    const { data, error } = await supabase
      .from('schedules')
      .insert({
        doctor_id: schedule.doctor_id,
        patient_id: schedule.patient_id,
        scheduled_time: schedule.scheduled_time,
        duration: schedule.duration || 60,
        notes: schedule.notes,
        status: schedule.status || 'scheduled',
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Schedule;
  },

  async getDoctorSchedules(doctorId: string): Promise<Schedule[]> {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('scheduled_time', { ascending: true });

    if (error) throw new Error(error.message);
    return data as Schedule[];
  },

  async getPatientSchedules(patientId: string): Promise<Schedule[]> {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .eq('patient_id', patientId)
      .order('scheduled_time', { ascending: true });

    if (error) throw new Error(error.message);
    return data as Schedule[];
  },

  async updateSchedule(scheduleId: string, updates: Partial<Schedule>): Promise<void> {
    const { error } = await supabase
      .from('schedules')
      .update(updates)
      .eq('id', scheduleId);

    if (error) throw new Error(error.message);
  },

  async cancelSchedule(scheduleId: string): Promise<void> {
    await this.updateSchedule(scheduleId, { status: 'cancelled' });
  },
};

export const supabaseSessionApi = {
  async startSession(doctorId: string, patientId: string): Promise<Session> {
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        doctor_id: doctorId,
        patient_id: patientId,
        start_time: new Date().toISOString(),
        status: 'in-progress',
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Session;
  },

  async endSession(sessionId: string): Promise<Session> {
    const { data, error } = await supabase
      .from('sessions')
      .update({
        end_time: new Date().toISOString(),
        status: 'completed',
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Session;
  },

  async getSession(sessionId: string): Promise<Session | null> {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) return null;
    return data as Session;
  },

  async getSessionHistory(userId: string): Promise<Session[]> {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .or(`doctor_id.eq.${userId},patient_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data as Session[];
  },

  async getEmotionSummary(sessionId: string) {
    const { data, error } = await supabase
      .from('session_emotion_summary')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error) return null;
    return data;
  },

  async getSessionSummary(sessionId: string) {
    const { data, error } = await supabase
      .from('session_summaries')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error) return null;
    return data;
  },

  async getMessages(sessionId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return data;
  },

  async sendMessage(sessionId: string, senderId: string, content: string, senderRole: 'PATIENT' | 'DOCTOR') {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        session_id: sessionId,
        sender_id: senderId,
        content,
        sender_role: senderRole,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
};

export const supabasePatientApi = {
  async getPatients(doctorId: string): Promise<Patient[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('primary_doctor_id', doctorId);

    if (error) throw new Error(error.message);
    
    // Map profiles to Patient type
    return data.map(p => ({
      id: p.id,
      name: p.name,
      email: p.email || '',
      role: 'PATIENT' as const,
      created_at: p.created_at || '',
      dateOfBirth: p.date_of_birth || undefined,
      primaryDoctorId: p.primary_doctor_id || undefined,
    }));
  },

  async getPatient(patientId: string): Promise<Patient | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', patientId)
      .single();

    if (error) return null;
    
    return {
      id: data.id,
      name: data.name,
      email: data.email || '',
      role: 'PATIENT' as const,
      created_at: data.created_at || '',
      dateOfBirth: data.date_of_birth || undefined,
      primaryDoctorId: data.primary_doctor_id || undefined,
    };
  },

  async assignDoctor(patientId: string, doctorId: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ primary_doctor_id: doctorId })
      .eq('id', patientId);

    if (error) throw new Error(error.message);
  },
};
