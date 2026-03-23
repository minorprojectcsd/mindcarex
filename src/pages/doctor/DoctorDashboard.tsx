import { format } from 'date-fns';
import { Users, Calendar, Clock, AlertTriangle, Video, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { appointmentService, DoctorAppointment } from '@/services/appointmentService';
import { AppointmentStatusBadge } from '@/components/appointments/AppointmentStatusBadge';
import { sessionService } from '@/services/sessionService';
import { useToast } from '@/hooks/use-toast';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['doctor-appointments'],
    queryFn: appointmentService.getDoctorAppointments,
    refetchInterval: 10000,
  });

  const { data: dashboardData } = useQuery({
    queryKey: ['doctor-dashboard'],
    queryFn: appointmentService.getDoctorDashboard,
    refetchInterval: 10000,
  });

  const startSessionMutation = useMutation({
    mutationFn: (appointmentId: string) => sessionService.startSession(appointmentId),
    onSuccess: (data) => {
      navigate(`/video/${data.sessionId}`);
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to start session',
        description: error?.response?.data?.message || 'Could not start the session.',
        variant: 'destructive',
      });
    },
  });

  const pendingCount = dashboardData?.pendingAppointments ?? appointments?.filter(a => a.status === 'PENDING').length ?? 0;

  const todayAppointments = appointments?.filter(a => {
    const aptDate = new Date(a.startTime).toDateString();
    return aptDate === new Date().toDateString() && ['PENDING', 'SCHEDULED', 'BOOKED', 'CONFIRMED', 'IN_PROGRESS'].includes(a.status);
  }) || [];

  const upcoming = appointments?.filter(a => ['SCHEDULED', 'BOOKED', 'CONFIRMED'].includes(a.status)) || [];
  const uniquePatients = new Set(appointments?.map(a => a.patient?.id)).size;

  return (
    <DashboardLayout requireRole="DOCTOR">
      <div className="space-y-6 md:space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground md:text-base">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <div className="flex gap-2">
            {pendingCount > 0 && (
              <Button variant="outline" onClick={() => navigate('/doctor/appointments')} className="w-full sm:w-auto">
                <Bell className="mr-2 h-4 w-4 text-orange-500" />
                {pendingCount} Pending
              </Button>
            )}
            <Button onClick={() => navigate('/doctor/appointments')} className="w-full sm:w-auto">
              <Calendar className="mr-2 h-4 w-4" />
              View Appointments
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Total Patients" value={uniquePatients} icon={<Users className="h-6 w-6" />} />
          <StatsCard title="Today's Sessions" value={todayAppointments.length} icon={<Calendar className="h-6 w-6" />} />
          <StatsCard title="Pending Requests" value={pendingCount} icon={<AlertTriangle className="h-6 w-6" />} />
          <StatsCard title="Upcoming" value={upcoming.length} icon={<Clock className="h-6 w-6" />} />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Today's Schedule</CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/doctor/appointments')}>View All</Button>
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
                <p className="mt-4 text-muted-foreground">No sessions scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayAppointments.map((apt: DoctorAppointment) => {
                  const isLive = apt.status === 'IN_PROGRESS';
                  const isConfirmed = ['CONFIRMED', 'BOOKED', 'SCHEDULED'].includes(apt.status);
                  return (
                    <div key={apt.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <p className="font-medium">{apt.patient?.fullName || 'Patient'}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(apt.startTime), 'h:mm a')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <AppointmentStatusBadge status={apt.status} />
                        {isLive ? (
                          <Button size="sm" onClick={() => navigate(`/video/${apt.sessionId || apt.id}`)}>
                            <Video className="mr-2 h-4 w-4" />
                            Resume
                          </Button>
                        ) : isConfirmed ? (
                          <Button
                            size="sm"
                            disabled={startSessionMutation.isPending}
                            onClick={() => startSessionMutation.mutate(apt.id)}
                          >
                            <Video className="mr-2 h-4 w-4" />
                            Start Session
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
