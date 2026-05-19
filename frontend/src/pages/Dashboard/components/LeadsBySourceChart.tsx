import { motion } from 'framer-motion';
import { Card } from '@components/ui/Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface LeadsBySourceChartProps {
  data: Record<string, number>;
  isLoading?: boolean;
}

const formatSource = (source: string) => {
  if (!source) return 'Unknown';
  return source.charAt(0).toUpperCase() + source.slice(1);
};

export const LeadsBySourceChart = ({ data, isLoading }: LeadsBySourceChartProps) => {
  // Convert Record<string, number> to array for Recharts
  const chartData = Object.entries(data || {})
    .map(([source, count]) => ({
      source: formatSource(source),
      count,
    }))
    .sort((a, b) => b.count - a.count); // Sort by highest count

  return (
    <Card className="flex flex-col h-full min-h-[350px]">
      <div className="mb-6">
        <h3 className="text-[14px] font-medium text-[hsl(var(--text-primary))]">
          Leads by Source
        </h3>
        <p className="text-[13px] text-[hsl(var(--text-secondary))] mt-1">
          Distribution of your pipeline acquisition channels
        </p>
      </div>

      <div className="flex-1 w-full min-h-[250px]">
        {isLoading ? (
          <div className="flex h-full items-end justify-between gap-2 px-2 pb-8 pt-4">
            {[40, 70, 45, 90, 60].map((height, i) => (
              <div
                key={i}
                className="w-full animate-pulse rounded-t-sm bg-[hsl(var(--border-subtle))]"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-[13px] text-[hsl(var(--text-tertiary))]">
            No source data available.
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="source"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--text-secondary))' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--text-secondary))' }}
                  dx={-10}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--border-subtle))' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--bg-elevated))',
                    borderRadius: '8px',
                    border: '1px solid hsl(var(--border-default))',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    fontSize: '13px',
                    padding: '8px 12px',
                  }}
                  itemStyle={{
                    color: 'hsl(var(--text-primary))',
                    fontWeight: 500,
                  }}
                />
                <Bar
                  dataKey="count"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                  animationDuration={1000}
                >
                  {chartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill="hsl(var(--brand))"
                      className="opacity-90 hover:opacity-100 transition-opacity"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>
    </Card>
  );
};
