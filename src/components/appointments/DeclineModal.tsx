import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading?: boolean;
  patientName?: string;
}

export function DeclineModal({ open, onClose, onConfirm, loading, patientName }: Props) {
  const [reason, setReason] = useState('Not available at this time. Please book another slot.');

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="mx-4 max-w-[calc(100vw-2rem)] sm:mx-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Decline Appointment Request</DialogTitle>
          <DialogDescription>
            {patientName
              ? `Provide a reason for declining ${patientName}'s appointment request.`
              : 'Provide a reason for declining this appointment request.'}
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter reason for declining..."
          rows={3}
          className="resize-none"
        />
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={!reason.trim() || loading}
            onClick={() => onConfirm(reason.trim())}
            className="w-full sm:w-auto"
          >
            {loading ? 'Declining...' : 'Decline Appointment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
