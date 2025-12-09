import React from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
} from "reactstrap";
import { toast } from "react-toastify";
import { useApiDelete } from "../../../../helpers/api_helper";

interface DeleteAssetLifecycleModalProps {
  isOpen: boolean;
  toggle: () => void;
  eventId: number | null;
  onSuccess?: () => void;
}

const DeleteAssetLifecycleModal: React.FC<DeleteAssetLifecycleModalProps> = ({
  isOpen,
  toggle,
  eventId,
  onSuccess,
}) => {
  const { mutate: deleteAssetLifecycle, isPending } = useApiDelete(
    `/asset-lifecycles/${eventId}`
  );

  const handleDelete = () => {
    if (!eventId) return;

    deleteAssetLifecycle(undefined, {
      onSuccess: () => {
        toast.success("✅ Asset Lifecycle deleted successfully.");
        toggle();
        onSuccess?.();
      },
      onError: (error: any) => {
        const msg =
          error?.response?.data?.error ||
          error?.message ||
          "Something went wrong.";
        toast.error(`❌ ${msg}`);
      },
    });
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>Delete Asset Lifecycle</ModalHeader>
      <ModalBody>
        Are you sure you want to delete this Asset Lifecycle event? This action
        cannot be undone.
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle} disabled={isPending}>
          Cancel
        </Button>
        <Button color="danger" onClick={handleDelete} disabled={isPending}>
          {isPending ? <Spinner size="sm" /> : "Delete"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteAssetLifecycleModal;