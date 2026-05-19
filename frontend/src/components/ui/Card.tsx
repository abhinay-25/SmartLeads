import { cn } from '@lib/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

export const Card = ({ className, hover, padding = 'md', children, ...props }: CardProps) => {
  return (
    <div
      className={cn(
        'card',
        hover && 'card-hover cursor-pointer',
        padding === 'none' && 'p-0',
        padding === 'sm'  && 'p-4',
        padding === 'md'  && 'p-5',
        padding === 'lg'  && 'p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mb-4 flex items-start justify-between gap-3', className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('type-h3', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('type-body-sm mt-0.5', className)} {...props}>
    {children}
  </p>
);

export const CardContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn(className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'mt-4 flex items-center gap-2 border-t border-[hsl(var(--border-subtle))] pt-4',
      className
    )}
    {...props}
  >
    {children}
  </div>
);
