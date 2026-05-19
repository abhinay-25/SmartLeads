import { motion } from 'framer-motion';
import { Card } from '@components/ui/Card';

import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  isLoading?: boolean;
}

export const StatCard = ({ title, value, icon, isLoading }: StatCardProps) => {
  return (
    <Card className="flex flex-col p-5 h-[116px] justify-between relative overflow-hidden group border-[hsl(var(--border-subtle))] hover:border-[hsl(var(--border-default))] transition-colors">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-medium text-[hsl(var(--text-secondary))]">
          {title}
        </h3>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--brand)/0.04)] text-[hsl(var(--brand))] transition-colors group-hover:bg-[hsl(var(--brand)/0.08)]">
          {icon}
        </div>
      </div>

      <div className="mt-auto">
        {isLoading ? (
          <div className="h-8 w-20 animate-pulse rounded bg-[hsl(var(--border-subtle))] mt-1" />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-semibold tracking-tight text-[hsl(var(--text-primary))]"
          >
            {value.toLocaleString()}
          </motion.div>
        )}
      </div>
    </Card>
  );
};
