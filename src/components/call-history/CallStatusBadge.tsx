// src/components/calls/CallStatusBadge.tsx

import { Badge } from '@/components/ui/Badge';
import type { CallStatus } from '@/types/call';

const config: Record<
  CallStatus,
  { variant: 'gray' | 'blue' | 'success' | 'error' | 'warning'; label: string; animate?: boolean }
> = {
  PENDING: { variant: 'gray', label: 'Pending' },
  CALLING: { variant: 'blue', label: 'Calling', animate: true },
  COMPLETED: { variant: 'success', label: 'Completed' },
  FAILED: { variant: 'error', label: 'Failed' },
  NO_ANSWER: { variant: 'warning', label: 'No Answer' },
  BUSY: { variant: 'gray', label: 'BUSY' },
};

export function CallStatusBadge({ status }: { status: CallStatus }) {
  const { variant, label, animate } = config[status] ?? {
    variant: 'gray',
    label: status,
  };
  return (
    <Badge variant={variant} dot animate={animate}>
      {label}
    </Badge>
  );
}