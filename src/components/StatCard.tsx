import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: string;
  suffix?: string;
  icon?: React.ReactNode;
}

export default function StatCard({ label, value, suffix, icon }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-5 shadow-soft"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight-display text-foreground">
        {value}
        {suffix && <span className="ml-1 text-sm font-normal text-muted-foreground">{suffix}</span>}
      </p>
    </motion.div>
  );
}
