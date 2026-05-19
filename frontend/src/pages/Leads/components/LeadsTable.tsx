import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@components/ui/Button';
import { cn } from '@lib/cn';
import { usePermissions } from '@hooks/usePermissions';
import { LeadStatusBadge, LeadSourceLabel, LeadAvatar } from './LeadBadges';
import type { Lead, LeadSortOrder } from '@/types';

// ── Column definitions ────────────────────────────────────────────────

const buildColumns = (
  onSort:   (s: LeadSortOrder) => void,
  sortOrder: LeadSortOrder,
  onEdit:   (lead: Lead) => void,
  onDelete: (lead: Lead) => void,
  canEdit:  boolean,
  canDelete: boolean
): ColumnDef<Lead>[] => [
  {
    id:     'name',
    header: 'Name',
    cell:   ({ row }) => {
      const { name, email } = row.original;
      return (
        <div className="flex items-center gap-2.5 min-w-0">
          <LeadAvatar name={name} />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-[hsl(var(--text-primary))]">
              {name}
            </p>
            <p className="truncate text-[12px] text-[hsl(var(--text-tertiary))]">
              {email}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    id:     'company',
    header: 'Company',
    cell:   ({ row }) => (
      <span className="text-[13px] text-[hsl(var(--text-secondary))]">
        {row.original.company ?? <span className="text-[hsl(var(--text-tertiary))]">—</span>}
      </span>
    ),
  },
  {
    id:     'status',
    header: 'Status',
    cell:   ({ row }) => <LeadStatusBadge status={row.original.status} />,
  },
  {
    id:     'source',
    header: 'Source',
    cell:   ({ row }) => (
      <LeadSourceLabel
        source={row.original.source}
        className="text-[13px] text-[hsl(var(--text-secondary))]"
      />
    ),
  },
  {
    id:   'createdAt',
    header: () => (
      <button
        type="button"
        onClick={() => onSort(sortOrder === 'latest' ? 'oldest' : 'latest')}
        className="flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-wide text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] transition-colors"
        aria-label={`Sort by date — currently ${sortOrder}`}
      >
        Date Added
        {sortOrder === 'latest' ? (
          <ArrowDown className="h-3 w-3" aria-hidden="true" />
        ) : sortOrder === 'oldest' ? (
          <ArrowUp className="h-3 w-3" aria-hidden="true" />
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-40" aria-hidden="true" />
        )}
      </button>
    ),
    cell: ({ row }) => {
      const d = new Date(row.original.createdAt);
      return (
        <time
          dateTime={row.original.createdAt}
          className="text-[12px] text-[hsl(var(--text-tertiary))] whitespace-nowrap"
        >
          {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </time>
      );
    },
  },
  {
    id:     '_actions',
    header: () => <span className="sr-only">Actions</span>,
    size:   60,
    cell:   ({ row }) => (
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {canEdit && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(row.original)}
            aria-label={`Edit ${row.original.name}`}
            className="text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--brand))]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </Button>
        )}
        {canDelete && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(row.original)}
            aria-label={`Delete ${row.original.name}`}
            className="text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--danger))]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </Button>
        )}
      </div>
    ),
  },
];

// ── Skeleton row ──────────────────────────────────────────────────────

const SkeletonRow = () => (
  <tr className="border-b border-[hsl(var(--border-subtle))] last:border-0">
    {/* Avatar + name */}
    <td className="px-4 py-3">
      <div className="flex items-center gap-2.5">
        <div className="h-7 w-7 rounded-full bg-[hsl(var(--bg-muted))] animate-pulse" />
        <div className="space-y-1.5">
          <div className="h-3 w-28 rounded bg-[hsl(var(--bg-muted))] animate-pulse" />
          <div className="h-2.5 w-20 rounded bg-[hsl(var(--bg-muted))] animate-pulse" />
        </div>
      </div>
    </td>
    <td className="px-4 py-3"><div className="h-3 w-20 rounded bg-[hsl(var(--bg-muted))] animate-pulse" /></td>
    <td className="px-4 py-3"><div className="h-5 w-16 rounded-full bg-[hsl(var(--bg-muted))] animate-pulse" /></td>
    <td className="px-4 py-3"><div className="h-3 w-16 rounded bg-[hsl(var(--bg-muted))] animate-pulse" /></td>
    <td className="px-4 py-3"><div className="h-3 w-20 rounded bg-[hsl(var(--bg-muted))] animate-pulse" /></td>
    <td className="px-4 py-3"><div className="h-6 w-6 rounded bg-[hsl(var(--bg-muted))] animate-pulse" /></td>
  </tr>
);

// ── LeadsTable ────────────────────────────────────────────────────────

interface LeadsTableProps {
  data:       Lead[];
  isLoading:  boolean;
  isFetching: boolean; // background refetch (page change)
  sort:       LeadSortOrder;
  onSort:     (s: LeadSortOrder) => void;
  onEdit:     (lead: Lead) => void;
  onDelete:   (lead: Lead) => void;
}

export const LeadsTable = ({
  data, isLoading, isFetching, sort, onSort, onEdit, onDelete,
}: LeadsTableProps) => {
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission('leads:edit');
  const canDelete = hasPermission('leads:delete');

  const columns = buildColumns(onSort, sort, onEdit, onDelete, canEdit, canDelete);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // Sorting, filtering, pagination are ALL server-side.
    // TanStack Table is used here purely for column definitions + rendering.
    manualSorting:    true,
    manualFiltering:  true,
    manualPagination: true,
  });

  return (
    <div
      className={cn(
        'overflow-x-auto transition-opacity duration-200',
        isFetching && !isLoading && 'opacity-60 pointer-events-none'
      )}
    >
      <table className="w-full min-w-[640px] border-collapse text-left" role="grid">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr
              key={hg.id}
              className="border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-subtle))]"
            >
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-2.5 text-[12px] font-medium uppercase tracking-wide text-[hsl(var(--text-tertiary))] whitespace-nowrap first:rounded-tl-lg last:rounded-tr-lg"
                  scope="col"
                  style={{ width: header.column.columnDef.size }}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
            : (
              <AnimatePresence mode="wait" initial={false}>
                {table.getRowModel().rows.map((row, i) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.03, ease: 'easeOut' }}
                    className={cn(
                      'group border-b border-[hsl(var(--border-subtle))] last:border-0',
                      'hover:bg-[hsl(var(--bg-muted))] transition-colors duration-150 ease-out',
                      'cursor-default'
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 py-3 align-middle"
                        style={{ width: cell.column.columnDef.size }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </AnimatePresence>
            )
          }
        </tbody>
      </table>
    </div>
  );
};
