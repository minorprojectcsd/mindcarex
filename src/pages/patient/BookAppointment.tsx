import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Calendar, Clock, User, ArrowLeft, Loader2, Info, MapPin, BadgeCheck, Languages, DollarSign, Briefcase, GraduationCap } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { appointmentService, Doctor } from '@/services/appointmentService';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DURATION_OPTIONS = [
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '45', label: '45 minutes' },
  { value: '60', label: '1 hour (max)' },
];

export default function BookAppointment() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState('60');
  const [notes, setNotes] = useState('');

  const { data: doctors, isLoading: loadingDoctors } = useQuery({
    queryKey: ['doctors'],
    queryFn: appointmentService.getDoctors,
  });

  const bookMutation = useMutation({
    mutationFn: appointmentService.createAppointment,
    onSuccess: () => {
      toast({
        title: 'Appointment Booked',
        description: 'Your appointment has been scheduled.',
      });
      navigate('/patient/appointments');
    },
    onError: (error: any) => {
      toast({
        title: 'Booking Failed',
        description: error?.response?.data?.message || error?.response?.data || 'Failed to book appointment.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDoctor || !scheduledAt) {
      toast({ title: 'Missing Information', description: 'Please select a doctor and time.', variant: 'destructive' });
      return;
    }

    const start = new Date(scheduledAt);
    if (start <= new Date()) {
      toast({ title: 'Invalid Time', description: 'Please select a future date and time.', variant: 'destructive' });
      return;
    }

    const end = new Date(start);
    end.setMinutes(end.getMinutes() + parseInt(duration));

    bookMutation.mutate({
      doctorId: selectedDoctor,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    });
  };

  const now = new Date();
  now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0);
  const minDateTime = now.toISOString().slice(0, 16);

  return (
    <DashboardLayout requireRole="PATIENT">
      <div className="mx-auto max-w-2xl space-y-4 sm:space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold">Book Appointment</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Schedule a session with a doctor</p>
          </div>
        </div>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
              Select a Doctor
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Choose from our available mental health professionals</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
            {loadingDoctors ? (
              <div className="space-y-3">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : doctors && doctors.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {doctors.map((doctor: Doctor) => {
                  const isSelected = selectedDoctor === doctor.id;
                  return (
                    <div key={doctor.id}>
                      <div
                        onClick={() => setSelectedDoctor(isSelected ? '' : doctor.id)}
                        className={`cursor-pointer rounded-lg border p-3 sm:p-4 transition-all ${
                          isSelected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-medium text-sm sm:text-base truncate">
                              {doctor.fullName || doctor.name || doctor.email || 'Doctor'}
                            </p>
                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                              {doctor.specialization && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{doctor.specialization}</Badge>
                              )}
                              {doctor.experienceYears != null && (
                                <span className="text-[10px] text-muted-foreground">{doctor.experienceYears}yr exp</span>
                              )}
                              {doctor.consultationFee && (
                                <span className="text-[10px] text-muted-foreground">₹{doctor.consultationFee}</span>
                              )}
                            </div>
                          </div>
                          <div className={`h-4 w-4 shrink-0 rounded-full border-2 ${
                            isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                          }`} />
                        </div>
                      </div>

                      {isSelected && (
                        <div className="mt-2 rounded-lg border border-primary/20 bg-muted/30 p-3 sm:p-4 space-y-3 text-sm animate-in fade-in slide-in-from-top-2 duration-200">
                          {doctor.bio && (
                            <p className="text-muted-foreground text-xs leading-relaxed">{doctor.bio}</p>
                          )}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {doctor.qualifications && (
                              <div className="flex items-start gap-2">
                                <GraduationCap className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                                <div>
                                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Qualifications</p>
                                  <p className="text-xs">{doctor.qualifications}</p>
                                </div>
                              </div>
                            )}
                            {doctor.experienceYears != null && (
                              <div className="flex items-start gap-2">
                                <Briefcase className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                                <div>
                                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Experience</p>
                                  <p className="text-xs">{doctor.experienceYears} years</p>
                                </div>
                              </div>
                            )}
                            {doctor.languages && (
                              <div className="flex items-start gap-2">
                                <Languages className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                                <div>
                                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Languages</p>
                                  <p className="text-xs">{doctor.languages}</p>
                                </div>
                              </div>
                            )}
                            {doctor.clinicAddress && (
                              <div className="flex items-start gap-2">
                                <MapPin className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                                <div>
                                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Location</p>
                                  <p className="text-xs">{doctor.clinicAddress}</p>
                                </div>
                              </div>
                            )}
                            {doctor.consultationFee && (
                              <div className="flex items-start gap-2">
                                <DollarSign className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                                <div>
                                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Consultation Fee</p>
                                  <p className="text-xs">₹{doctor.consultationFee}</p>
                                </div>
                              </div>
                            )}
                            {doctor.licenseNumber && (
                              <div className="flex items-start gap-2">
                                <BadgeCheck className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                                <div>
                                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">License</p>
                                  <p className="text-xs">{doctor.licenseNumber}</p>
                                </div>
                              </div>
                            )}
                          </div>
                          {doctor.availabilityStatus && (
                            <Badge variant={doctor.availabilityStatus === 'AVAILABLE' ? 'default' : 'secondary'} className="text-[10px]">
                              {doctor.availabilityStatus === 'AVAILABLE' ? '🟢 Available' : doctor.availabilityStatus}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">No doctors available at the moment.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
              Schedule
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Choose your preferred appointment time and duration</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledAt" className="text-sm">Appointment Date & Time</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={scheduledAt}
                  min={minDateTime}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  required
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm">Session Duration</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Info className="h-3 w-3 shrink-0" />
                  Maximum session duration is 1 hour
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Describe how you're feeling..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="text-sm"
                />
              </div>

              <Button type="submit" className="w-full" disabled={bookMutation.isPending || !selectedDoctor}>
                {bookMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Booking...
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Appointment
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
