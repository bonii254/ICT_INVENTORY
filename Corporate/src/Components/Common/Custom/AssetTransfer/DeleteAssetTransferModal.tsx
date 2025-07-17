import React from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
} from "reactstrap";
import { useApiDelete } from "../../../../helpers/api_helper";
import { toast } from "react-toastify";

interface DeleteTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  transferId: number | null;
  onSuccess?: () => void;
}

const DeleteTransferModal: React.FC<DeleteTransferModalProps> = ({
  isOpen,
  onClose,
  transferId,
  onSuccess,
}) => {
  const deleteTransfer = useApiDelete(`/assettransfer/${transferId}`);

  const handleDelete = async () => {
    try {
      await deleteTransfer.mutateAsync();
      toast.success("✅ Asset transfer deleted successfully.");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.error || err.message || "Deletion failed.";
      toast.error(`❌ ${msg}`);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose} centered>
      <ModalHeader toggle={onClose}>Confirm Deletion</ModalHeader>
      <ModalBody>
        Are you sure you want to delete this asset transfer? This action cannot
        be undone.
      </ModalBody>
      <ModalFooter>
        <Button
          color="secondary"
          onClick={onClose}
          disabled={deleteTransfer.isPending}
        >
          Cancel
        </Button>
        <Button
          color="danger"
          onClick={handleDelete}
          disabled={deleteTransfer.isPending}
        >
          {deleteTransfer.isPending ? <Spinner size="sm" /> : "Delete"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteTransferModal;
