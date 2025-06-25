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
import apiClient from "../../../helpers/api_helper";

const DeleteConfirmModal = ({
  isOpen,
  toggle,
  asset,
  onDeleteSuccess,
}: {
  isOpen: boolean;
  toggle: () => void;
  asset: any;
  onDeleteSuccess: () => void;
}) => {
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  const { mutate: deleteAsset, isPending } = useMutation({
    mutationFn: async () => {
      const response = await apiClient.delete("/delete/assets", {
        params: {
          name: asset.name,
          asset_tag: asset.asset_tag,
          serial_number: asset.serial_number,
          model_number: asset.model_number,
          category: asset.category,
          assigned_to: asset.assigned_to,
          location: asset.location,
          department: asset.department,
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Asset deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      onDeleteSuccess();
      toggle();
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.error || err.message || "Failed to delete asset.";
      setError(msg);
      toast.error(msg);
    },
  });

  const handleDelete = () => {
    setError("");
    deleteAsset();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>Confirm Deletion</ModalHeader>
      <ModalBody>
        {error && <Alert color="danger">{error}</Alert>}
        Are you sure you want to delete asset{" "}
        <strong>{asset?.name || "Unknown"}</strong>?
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

export default DeleteConfirmModal;
