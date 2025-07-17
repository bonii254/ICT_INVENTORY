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

interface DeleteTransactionModalProps {
  isOpen: boolean;
  toggle: () => void;
  transactionId: number | null;
  onSuccess?: () => void;
}

const DeleteTransactionModal: React.FC<DeleteTransactionModalProps> = ({
  isOpen,
  toggle,
  transactionId,
  onSuccess,
}) => {
  const {
    mutate: deleteTransaction,
    isPending,
  } = useApiDelete(`/stocktransaction/${transactionId}`);

  const handleDelete = () => {
    if (!transactionId) return;

    deleteTransaction(undefined, {
      onSuccess: () => {
        toast.success("✅ Transaction deleted successfully.");
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
      <ModalHeader toggle={toggle}>Delete Transaction</ModalHeader>
      <ModalBody>
        Are you sure you want to delete this transaction? This will also update
        the consumable’s stock and alert status accordingly.
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

export default DeleteTransactionModal;
