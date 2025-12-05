import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Alert, Spinner } from 'reactstrap';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import apiClient from '../../../../helpers/api_helper';

interface DeleteMaintenanceConfirmModalProps {
  isOpen: boolean;
  toggle: () => void;
  maintenance: {
    id: number;
    asset_name?: string;
    provider_name?: string;
  };
  onDeleteSuccess: () => void;
}

const DeleteMaintenanceConfirmModal: React.FC<DeleteMaintenanceConfirmModalProps> = ({
  isOpen,
  toggle,
  maintenance,
  onDeleteSuccess,
}) => {
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { mutate: deleteMaintenance, isPending } = useMutation({
    mutationFn: async () => {
      const response = await apiClient.delete(`/maintenance/${maintenance.id}`);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Maintenance record deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['maintenance-records'] });
      onDeleteSuccess();
      toggle();
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.error || err.message || 'Failed to delete maintenance record.';
      setError(msg);
      toast.error(msg);
    },
  });

  const handleDelete = () => {
    setError('');
    deleteMaintenance();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle} className="bg-light">
        Confirm Deletion
      </ModalHeader>
      <ModalBody>
        {error && <Alert color="danger">{error}</Alert>}
        <p className="mb-2">
          You are about to permanently delete the following maintenance record:
        </p>
        <ul className="mb-3">
          <li>
            <strong>Asset:</strong> {maintenance?.asset_name || 'Unknown'}
          </li>
          <li>
            <strong>Provider:</strong> {maintenance?.provider_name || 'N/A'}
          </li>
        </ul>
        <p className="text-danger fw-semibold mb-0">This action cannot be undone.</p>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle} disabled={isPending}>
          Cancel
        </Button>
        <Button color="danger" onClick={handleDelete} disabled={isPending}>
          {isPending ? <Spinner size="sm" /> : 'Delete'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteMaintenanceConfirmModal;
