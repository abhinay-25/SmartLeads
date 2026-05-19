import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@components/ui/Input';
import { Select } from '@components/ui/Select';
import { Button } from '@components/ui/Button';
import { usePermissions } from '@hooks/usePermissions';
import { leadSchema, type LeadFormData } from '../schemas/lead.schema';
import type { SelectOption } from '@/types';

interface LeadFormProps {
  defaultValues?: Partial<LeadFormData>;
  onSubmit: (data: LeadFormData) => Promise<void>;
  submitLabel?: string;
  onCancel?: () => void;
}

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'converted', label: 'Converted' },
  { value: 'lost', label: 'Lost' },
];

const SOURCE_OPTIONS: SelectOption[] = [
  { value: 'website', label: 'Website' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'referral', label: 'Referral' },
  { value: 'social', label: 'Social' },
  { value: 'email', label: 'Email' },
  { value: 'other', label: 'Other' },
];

export const LeadForm = ({ defaultValues, onSubmit, submitLabel = 'Save Lead', onCancel }: LeadFormProps) => {
  const { isRole } = usePermissions();
  const isAdmin = isRole('admin');

  // Sales users (non-admins) can only edit Status, Source, and Notes
  // when editing an existing lead (defaultValues has an ID or we just assume if not admin).
  // Wait, if it's a new lead (Create), admins are the only ones who can see this form anyway due to LeadsPage protection.
  // So disabling fields for non-admins is safe here.
  const disableCoreFields = !isAdmin;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema) as any,
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      status: 'new',
      source: 'website',
      notes: '',
      ...defaultValues,
    },
  });

  const onFormSubmit: SubmitHandler<LeadFormData> = (data) => {
    return onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Full Name *"
          placeholder="Jane Doe"
          error={errors.name?.message}
          disabled={isSubmitting || disableCoreFields}
          {...register('name')}
        />
        <Input
          label="Email Address *"
          type="email"
          placeholder="jane@example.com"
          error={errors.email?.message}
          disabled={isSubmitting || disableCoreFields}
          {...register('email')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Company"
          placeholder="Acme Corp"
          error={errors.company?.message}
          disabled={isSubmitting || disableCoreFields}
          {...register('company')}
        />
        <Input
          label="Phone Number"
          type="tel"
          placeholder="+1 (555) 000-0000"
          error={errors.phone?.message}
          disabled={isSubmitting || disableCoreFields}
          {...register('phone')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Status *"
          options={STATUS_OPTIONS}
          error={errors.status?.message}
          disabled={isSubmitting}
          {...register('status')}
        />
        <Select
          label="Source *"
          options={SOURCE_OPTIONS}
          error={errors.source?.message}
          disabled={isSubmitting}
          {...register('source')}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="notes" className="type-label text-[hsl(var(--text-primary))]">
          Notes
        </label>
        <textarea
          id="notes"
          placeholder="Any additional context about this lead..."
          className="input-base min-h-[100px] resize-y"
          disabled={isSubmitting}
          aria-invalid={!!errors.notes}
          {...register('notes')}
        />
        {errors.notes && (
          <p className="type-caption text-[hsl(var(--danger))]" role="alert">
            {errors.notes.message}
          </p>
        )}
      </div>

      {/* Form Actions */}
      <div className="mt-2 flex items-center justify-end gap-3 border-t border-[hsl(var(--border-subtle))] pt-5">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};
