import { format } from 'date-fns';
import { Users, Calendar, Clock, AlertTriangle, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DoctorDashboard() {
  const navigate = useNavigate();

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
          <Button onClick={() => navigate('/schedule')} className="w-full sm:w-auto">
            <Calendar className="mr-2 h-4 w-4" />
            New Appointment
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Patients"
            value={0}
            icon={<Users className="h-6 w-6" />}
          />
          <StatsCard
            title="Today's Sessions"
            value={0}
            icon={<Calendar className="h-6 w-6" />}
          />
          <StatsCard
            title="This Week"
            value={0}
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
            <Button variant="outline" size="sm" onClick={() => navigate('/schedule')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="py-8 text-center">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                No sessions scheduled for today
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Connect to your backend to load data
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Patients */}
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold md:text-xl">Recent Patients</h2>
            <Button variant="outline" onClick={() => navigate('/patients')} className="w-full sm:w-auto">
              View All Patients
            </Button>
          </div>
          <Card>
            <CardContent className="py-8 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                No patients found
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Connect to your backend to load patient data
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
