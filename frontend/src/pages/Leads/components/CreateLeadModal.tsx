import toast from 'react-hot-toast';
import { Modal } from '@components/ui/Modal';
import { LeadForm } from './LeadForm';
import { useCreateLead } from '@hooks/useLeads';
import type { LeadFormData } from '../schemas/lead.schema';

interface CreateLeadModalProps {
  open: boolean;
  onClose: () => void;
}

export const CreateLeadModal = ({ open, onClose }: CreateLeadModalProps) => {
  const createLead = useCreateLead();

  const handleSubmit = async (data: LeadFormData) => {
    try {
      await createLead.mutateAsync(data);
      toast.success('Lead created successfully');
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create lead');
      // Re-throw to prevent the form from resetting if we want to keep data on error
      throw error;
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add New Lead"
      description="Enter the lead's details below to add them to your pipeline."
      size="lg" // slightly wider for the 2-column form layout
    >
      <LeadForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitLabel="Create Lead"
      />
    </Modal>
  );
};
