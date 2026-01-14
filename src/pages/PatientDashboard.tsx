import { format } from 'date-fns';
import { Calendar, Clock, CheckCircle, Heart, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <DashboardLayout requireRole="PATIENT">
      <div className="space-y-6 md:space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">
              Welcome back, {user?.name || 'Patient'}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground md:text-base">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <Button onClick={() => navigate('/sessions')} className="w-full sm:w-auto">
            <Video className="mr-2 h-4 w-4" />
            View Sessions
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Sessions"
            value={0}
            icon={<Calendar className="h-6 w-6" />}
          />
          <StatsCard
            title="Completed"
            value={0}
            icon={<CheckCircle className="h-6 w-6" />}
          />
          <StatsCard
            title="Upcoming"
            value={0}
            icon={<Clock className="h-6 w-6" />}
          />
          <StatsCard
            title="Wellness Score"
            value="--"
            icon={<Heart className="h-6 w-6" />}
          />
        </div>

        {/* Upcoming Sessions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Sessions</CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/sessions')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="py-8 text-center">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                No upcoming sessions
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Connect to your backend to load session data
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Past Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Past Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="py-8 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                No past sessions
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Your completed sessions will appear here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
