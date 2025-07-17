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
import { useQueryClient } from "@tanstack/react-query";

interface DeleteConsumableModalProps {
  isOpen: boolean;
  toggle: () => void;
  consumable: { id: number; name: string } | null;
}

const DeleteConsumableModal: React.FC<DeleteConsumableModalProps> = ({
  isOpen,
  toggle,
  consumable,
}) => {
  const queryClient = useQueryClient();
  const deleteConsumable = useApiDelete(`/consumable/${consumable?.id}`);

  const handleDelete = () => {
    if (!consumable) return;

    deleteConsumable.mutate(undefined, {
      onSuccess: () => {
        toast.success("Consumable deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["consumables"] });
        toggle();
      },
      onError: (err: any) => {
        toast.error(`Failed to delete: ${err.message || "Unknown error"}`);
      },
    });
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>Delete Consumable</ModalHeader>
      <ModalBody>
        {`Are you sure you want to delete "${consumable?.name}"? This action cannot be undone.`}
      </ModalBody>
      <ModalFooter>
        <Button
          color="secondary"
          onClick={toggle}
          disabled={deleteConsumable.isPending}
        >
          Cancel
        </Button>
        <Button
          color="danger"
          onClick={handleDelete}
          disabled={deleteConsumable.isPending}
        >
          {deleteConsumable.isPending ? <Spinner size="sm" /> : "Delete"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteConsumableModal;
