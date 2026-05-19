import { Users, CheckCircle, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PageContainer, Section } from '@components/ui/Layout';
import { Button } from '@components/ui/Button';
import { useDocumentTitle } from '@hooks/useDocumentTitle';
import { useAuthStore } from '@store/authStore';
import { useLeadStats } from '@hooks/useLeads';
import { StatCard } from './components/StatCard';
import { LeadsBySourceChart } from './components/LeadsBySourceChart';
import { RecentLeadsTable } from './components/RecentLeadsTable';

import { staggerContainerVariants, staggerItemVariants } from '@lib/motion';

const DashboardPage = () => {
  useDocumentTitle('Dashboard');
  const user = useAuthStore((s) => s.user);
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  const { data: stats, isLoading, isError } = useLeadStats();

  const total = stats?.total ?? 0;
  const qualified = stats?.byStatus['qualified'] ?? 0;
  const contacted = stats?.byStatus['contacted'] ?? 0;
  const lost = stats?.byStatus['lost'] ?? 0;
  const bySource = stats?.bySource ?? {};

  return (
    <PageContainer>
      {/* ── Welcome banner ──────────────────────────────── */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[hsl(var(--text-primary))]">
            Good morning, {firstName} 👋
          </h1>
          <p className="text-[14px] text-[hsl(var(--text-secondary))] mt-1">
            Here's what's happening in your pipeline today.
          </p>
        </div>
        <Link to="/leads">
          <Button variant="secondary" size="sm" className="shrink-0">
            View all leads
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" aria-hidden="true" />
          </Button>
        </Link>
      </div>

      {isError && (
        <div className="mb-6 rounded-md bg-[hsl(var(--danger)/0.1)] p-4 text-[13px] text-[hsl(var(--danger))]">
          Failed to load dashboard metrics. Please refresh the page.
        </div>
      )}

      {/* ── Stat cards ──────────────────────────────────── */}
      <Section>
        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
          variants={staggerContainerVariants}
          initial="initial"
          animate="enter"
        >
          <motion.div variants={staggerItemVariants}>
            <StatCard
              title="Total Leads"
              value={total}
              icon={<Users className="h-4 w-4" />}
              isLoading={isLoading}
            />
          </motion.div>
          
          <motion.div variants={staggerItemVariants}>
            <StatCard
              title="Qualified"
              value={qualified}
              icon={<CheckCircle className="h-4 w-4" />}
              isLoading={isLoading}
            />
          </motion.div>
          
          <motion.div variants={staggerItemVariants}>
            <StatCard
              title="Contacted"
              value={contacted}
              icon={<TrendingUp className="h-4 w-4" />}
              isLoading={isLoading}
            />
          </motion.div>

          <motion.div variants={staggerItemVariants}>
            <StatCard
              title="Lost"
              value={lost}
              icon={<AlertCircle className="h-4 w-4 text-[hsl(var(--danger))]" />}
              isLoading={isLoading}
            />
          </motion.div>
        </motion.div>
      </Section>

      {/* ── Content grid ────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <LeadsBySourceChart data={bySource} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-2">
          <RecentLeadsTable />
        </div>
      </div>
    </PageContainer>
  );
};

export default DashboardPage;
