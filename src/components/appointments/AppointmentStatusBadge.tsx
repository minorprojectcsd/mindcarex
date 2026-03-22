import { Badge } from '@/components/ui/badge';

type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'BOOKED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: '⏳ Pending', className: 'bg-orange-100 text-orange-600 border-orange-200' },
  CONFIRMED: { label: '✓ Confirmed', className: 'bg-green-100 text-green-600 border-green-200' },
  BOOKED: { label: '✓ Confirmed', className: 'bg-green-100 text-green-600 border-green-200' },
  SCHEDULED: { label: '✓ Confirmed', className: 'bg-green-100 text-green-600 border-green-200' },
  IN_PROGRESS: { label: '🟢 Live', className: 'bg-blue-100 text-blue-600 border-blue-200' },
  COMPLETED: { label: 'Completed', className: 'bg-gray-100 text-gray-600 border-gray-200' },
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
