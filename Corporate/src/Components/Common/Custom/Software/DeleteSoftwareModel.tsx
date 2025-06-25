import React, { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Alert,
  Spinner,
} from "reactstrap";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import apiClient from "../../../../helpers/api_helper";

const DeleteSoftwareConfirmModal = ({
  isOpen,
  toggle,
  software,
  onDeleteSuccess,
}: {
  isOpen: boolean;
  toggle: () => void;
  software: { id: number; name?: string };
  onDeleteSuccess: () => void;
}) => {
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  const { mutate: deleteSoftware, isPending } = useMutation({
    mutationFn: async () => {
      const response = await apiClient.delete(`/software/${software.id}`);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Software deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["softwares"] });
      onDeleteSuccess();
      toggle();
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.error ||
        err.message ||
        "Failed to delete software.";
      setError(msg);
      toast.error(msg);
    },
  });

  const handleDelete = () => {
    setError("");
    deleteSoftware();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>Confirm Deletion</ModalHeader>
      <ModalBody>
        {error && <Alert color="danger">{error}</Alert>}
        Are you sure you want to delete software{" "}
        <strong>{software?.name || "Unknown"}</strong>?
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

export default DeleteSoftwareConfirmModal;
