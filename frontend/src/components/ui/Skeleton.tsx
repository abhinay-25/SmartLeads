import { cn } from '@lib/cn';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string;
  height?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

export const Skeleton = ({
  className,
  width,
  height = '1rem',
  rounded = 'sm',
  style,
  ...props
}: SkeletonProps) => {
  return (
    <div
      className={cn(
        'skeleton',
        rounded === 'sm'   && 'rounded-sm',
        rounded === 'md'   && 'rounded-md',
        rounded === 'lg'   && 'rounded-lg',
        rounded === 'full' && 'rounded-full',
        className
      )}
      style={{ width, height, ...style }}
      aria-hidden="true"
      {...props}
    />
  );
};

/* Pre-built skeleton patterns */

export const SkeletonText = ({ lines = 3, className }: { lines?: number; className?: string }) => (
  <div className={cn('flex flex-col gap-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        height="0.875rem"
        width={i === lines - 1 ? '65%' : '100%'}
      />
    ))}
  </div>
);

export const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn('card p-5 space-y-3', className)}>
    <div className="flex items-center gap-3">
      <Skeleton height="2.5rem" width="2.5rem" rounded="full" />
      <div className="flex flex-col gap-1.5 flex-1">
        <Skeleton height="0.875rem" width="60%" />
        <Skeleton height="0.75rem" width="40%" />
      </div>
    </div>
    <Skeleton height="0.875rem" width="100%" />
    <Skeleton height="0.875rem" width="80%" />
  </div>
);

export const SkeletonTableRow = ({ cols = 5 }: { cols?: number }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton height="0.875rem" width={i === 0 ? '70%' : '55%'} />
      </td>
    ))}
  </tr>
);
