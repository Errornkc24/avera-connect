import { cn } from '@/lib/utils';

const statusMap: Record<number, { label: string; className: string }> = {
  0: { label: 'Not Active', className: 'bg-secondary text-muted-foreground' },
  1: { label: 'Active', className: 'bg-success/10 text-success' },
  2: { label: 'Paused', className: 'bg-warning/10 text-warning' },
};

export default function StatusBadge({ status }: { status: number }) {
  const s = statusMap[status] ?? statusMap[0];
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', s.className)}>
      {s.label}
    </span>
  );
}
