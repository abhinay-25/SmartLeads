import toast from 'react-hot-toast';
import { Modal } from '@components/ui/Modal';
import { Button } from '@components/ui/Button';
import { useDeleteLead } from '@hooks/useLeads';
import type { Lead } from '@/types';

interface DeleteLeadModalProps {
  lead: Lead | null;
  onClose: () => void;
}

export const DeleteLeadModal = ({ lead, onClose }: DeleteLeadModalProps) => {
  const deleteLead = useDeleteLead();
  const open = !!lead;

  const handleDelete = async () => {
    if (!lead) return;
    try {
      await deleteLead.mutateAsync(lead._id);
      toast.success('Lead deleted successfully');
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete lead');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete Lead"
      description={`Are you sure you want to delete ${lead?.name}? This action cannot be undone.`}
      size="sm"
      footer={
        <>
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={deleteLead.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            loading={deleteLead.isPending}
          >
            Delete Lead
          </Button>
        </>
      }
    >
      <div className="text-[14px] text-[hsl(var(--text-secondary))]">
        This will permanently remove the lead and all associated data from your workspace.
      </div>
    </Modal>
  );
};
