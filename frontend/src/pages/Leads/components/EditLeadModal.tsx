import toast from 'react-hot-toast';
import { Modal } from '@components/ui/Modal';
import { LeadForm } from './LeadForm';
import { useUpdateLead } from '@hooks/useLeads';
import type { LeadFormData } from '../schemas/lead.schema';
import type { Lead } from '@/types';

interface EditLeadModalProps {
  lead: Lead | null;
  onClose: () => void;
}

export const EditLeadModal = ({ lead, onClose }: EditLeadModalProps) => {
  const updateLead = useUpdateLead();

  // If modal is mounted but no lead is selected yet, just return null 
  // (the Modal component handles animating out when lead becomes null if implemented that way,
  // but usually we render `open={!!lead}`)
  const open = !!lead;

  const handleSubmit = async (data: LeadFormData) => {
    if (!lead) return;
    try {
      await updateLead.mutateAsync({ id: lead._id, data });
      toast.success('Lead updated successfully');
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update lead');
      throw error;
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Lead"
      description="Update the lead's information."
      size="lg"
    >
      {/* We key by lead._id so the form completely re-initializes if the lead changes */}
      {lead && (
        <LeadForm
          key={lead._id}
          defaultValues={{
            name: lead.name,
            email: lead.email,
            phone: lead.phone ?? '',
            company: lead.company ?? '',
            status: lead.status,
            source: lead.source,
            notes: lead.notes ?? '',
          }}
          onSubmit={handleSubmit}
          onCancel={onClose}
          submitLabel="Save Changes"
        />
      )}
    </Modal>
  );
};
