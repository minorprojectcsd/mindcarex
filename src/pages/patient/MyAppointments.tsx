import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Calendar, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { appointmentService } from '@/services/appointmentService';

export default function MyAppointments() {
  const navigate = useNavigate();
  
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['my-appointments'],
    queryFn: appointmentService.getMyAppointments,
  });

  const upcomingAppointments = appointments?.filter(a => a.status === 'BOOKED') || [];
  const completedAppointments = appointments?.filter(a => a.status === 'COMPLETED') || [];
  const cancelledAppointments = appointments?.filter(a => a.status === 'CANCELLED') || [];

  const AppointmentCard = ({ appointment }: { appointment: any }) => (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div>
        <p className="font-medium">
          Dr. {appointment.doctor?.name || appointment.doctor?.email || 'Doctor'}
        </p>
        <p className="text-sm text-muted-foreground">
          {format(new Date(appointment.startTime), 'EEEE, MMMM d, yyyy')}
        </p>
        <p className="text-sm text-muted-foreground">
          {format(new Date(appointment.startTime), 'h:mm a')} - {format(new Date(appointment.endTime), 'h:mm a')}
        </p>
      </div>
      <Badge 
        variant={
          appointment.status === 'BOOKED' ? 'default' : 
          appointment.status === 'COMPLETED' ? 'secondary' : 
          'destructive'
        }
      >
        {appointment.status}
      </Badge>
    </div>
  );

  return (
    <DashboardLayout requireRole="PATIENT">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/patient/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">My Appointments</h1>
              <p className="text-muted-foreground">View and manage your appointments</p>
            </div>
          </div>
          <Button onClick={() => navigate('/patient/book-appointment')}>
            <Calendar className="mr-2 h-4 w-4" />
            Book New
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({cancelledAppointments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : upcomingAppointments.length === 0 ? (
                  <div className="py-8 text-center">
                    <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">No upcoming appointments</p>
                    <Button className="mt-4" onClick={() => navigate('/patient/book-appointment')}>
                      Book an Appointment
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingAppointments.map(apt => (
                      <AppointmentCard key={apt.id} appointment={apt} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                {completedAppointments.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">No completed appointments</p>
                ) : (
                  <div className="space-y-4">
                    {completedAppointments.map(apt => (
                      <AppointmentCard key={apt.id} appointment={apt} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cancelled" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                {cancelledAppointments.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">No cancelled appointments</p>
                ) : (
                  <div className="space-y-4">
                    {cancelledAppointments.map(apt => (
                      <AppointmentCard key={apt.id} appointment={apt} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
