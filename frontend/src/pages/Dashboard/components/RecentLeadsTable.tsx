import { Link } from 'react-router-dom';
import { Card } from '@components/ui/Card';
import { useLeads } from '@hooks/useLeads';
import { LeadStatusBadge, LeadSourceLabel, LeadAvatar } from '@pages/Leads/components/LeadBadges';

export const RecentLeadsTable = () => {
  const { data, isLoading, isError } = useLeads({
    params: { limit: 5, sort: 'latest' },
  });

  const leads = data?.data ?? [];

  return (
    <Card className="flex flex-col h-full min-h-[350px]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-[14px] font-medium text-[hsl(var(--text-primary))]">
            Recent Leads
          </h3>
          <p className="text-[13px] text-[hsl(var(--text-secondary))] mt-1">
            Newest additions to your pipeline
          </p>
        </div>
        <Link
          to="/leads"
          className="text-[13px] font-medium text-[hsl(var(--brand))] hover:text-[hsl(var(--brand-dark))] transition-colors"
        >
          View all
        </Link>
      </div>

      <div className="flex-1 overflow-x-auto">
        {isLoading ? (
          <div className="space-y-4 py-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 animate-pulse rounded-full bg-[hsl(var(--border-subtle))]" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-32 animate-pulse rounded bg-[hsl(var(--border-subtle))]" />
                  <div className="h-2 w-24 animate-pulse rounded bg-[hsl(var(--border-subtle))]" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="flex h-[200px] items-center justify-center text-[13px] text-[hsl(var(--danger))]">
            Failed to load recent leads.
          </div>
        ) : leads.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-[13px] text-[hsl(var(--text-tertiary))]">
            No leads found.
          </div>
        ) : (
          <div className="divide-y divide-[hsl(var(--border-subtle))]">
            {leads.map((lead) => (
              <div
                key={lead._id}
                className="flex items-center justify-between py-3 group"
              >
                <div className="flex items-center gap-3">
                  <LeadAvatar name={lead.name} />
                  <div>
                    <p className="text-[13px] font-medium text-[hsl(var(--text-primary))] group-hover:text-[hsl(var(--brand))] transition-colors">
                      {lead.name}
                    </p>
                    <p className="text-[12px] text-[hsl(var(--text-tertiary))]">
                      {lead.company || lead.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div className="hidden sm:block">
                    <LeadSourceLabel source={lead.source} />
                  </div>
                  <LeadStatusBadge status={lead.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
