import { Calendar, Filter, Download } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Sessions() {
  return (
    <DashboardLayout requireRole="PATIENT">
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">My Sessions</h1>
            <p className="mt-1 text-sm text-muted-foreground md:text-base">
              View and manage your consultation sessions
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Session Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="upcoming" className="flex-1 sm:flex-none">
              Upcoming (0)
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex-1 sm:flex-none">
              Completed (0)
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="flex-1 sm:flex-none">
              Cancelled (0)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                  No upcoming sessions
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Connect to your backend to load session data
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                  No completed sessions
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your completed sessions will appear here
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cancelled">
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                  No cancelled sessions
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
