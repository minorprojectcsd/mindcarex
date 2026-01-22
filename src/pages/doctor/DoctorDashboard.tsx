import { format } from 'date-fns';
import { Users, Calendar, Clock, AlertTriangle, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { appointmentService } from '@/services/appointmentService';

export default function DoctorDashboard() {
  const navigate = useNavigate();

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['doctor-appointments'],
    queryFn: appointmentService.getDoctorAppointments,
  });

  const todayAppointments = appointments?.filter(a => {
    const aptDate = new Date(a.startTime).toDateString();
    const today = new Date().toDateString();
    return aptDate === today && a.status === 'BOOKED';
  }) || [];

  const upcomingAppointments = appointments?.filter(a => a.status === 'BOOKED') || [];
  const uniquePatients = new Set(appointments?.map(a => a.patientId)).size;

  return (
    <DashboardLayout requireRole="DOCTOR">
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground md:text-base">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <Button onClick={() => navigate('/doctor/appointments')} className="w-full sm:w-auto">
            <Calendar className="mr-2 h-4 w-4" />
            View Appointments
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Patients"
            value={uniquePatients}
            icon={<Users className="h-6 w-6" />}
          />
          <StatsCard
            title="Today's Sessions"
            value={todayAppointments.length}
            icon={<Calendar className="h-6 w-6" />}
          />
          <StatsCard
            title="Upcoming"
            value={upcomingAppointments.length}
            icon={<Clock className="h-6 w-6" />}
          />
          <StatsCard
            title="Needs Attention"
            value={0}
            icon={<AlertTriangle className="h-6 w-6" />}
          />
        </div>

        {/* Today's Schedule */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Today's Schedule</CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/doctor/appointments')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : todayAppointments.length === 0 ? (
              <div className="py-8 text-center">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                  No sessions scheduled for today
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayAppointments.map((apt) => (
                  <div 
                    key={apt.id} 
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <p className="font-medium">
                        {apt.patient?.name || apt.patient?.email || 'Patient'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(apt.startTime), 'h:mm a')} - {format(new Date(apt.endTime), 'h:mm a')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{apt.status}</Badge>
                      <Button size="sm" onClick={() => navigate(`/video/${apt.id}`)}>
                        <Video className="mr-2 h-4 w-4" />
                        Start
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                No upcoming appointments
              </p>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.slice(0, 5).map((apt) => (
                  <div 
                    key={apt.id} 
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <p className="font-medium">
                        {apt.patient?.name || apt.patient?.email || 'Patient'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(apt.startTime), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                    <Badge>{apt.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
