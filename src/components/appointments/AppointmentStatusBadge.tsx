import { Badge } from '@/components/ui/badge';

type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'BOOKED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-warning-light text-warning-foreground border-warning/20' },
  CONFIRMED: { label: 'Confirmed', className: 'bg-success-light text-success border-success/20' },
  BOOKED: { label: 'Confirmed', className: 'bg-success-light text-success border-success/20' },
  SCHEDULED: { label: 'Confirmed', className: 'bg-success-light text-success border-success/20' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-primary-light text-primary border-primary/20' },
  COMPLETED: { label: 'Completed', className: 'bg-muted text-muted-foreground border-border' },
  CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-600 border-red-200' },
};

interface Props {
  status: AppointmentStatus | string;
}

export function AppointmentStatusBadge({ status }: Props) {
  const config = statusConfig[status] || { label: status, className: 'bg-muted text-muted-foreground' };
  return (
    <Badge variant="outline" className={`text-xs font-medium ${config.className}`}>
      {config.label}
    </Badge>
  );
}
