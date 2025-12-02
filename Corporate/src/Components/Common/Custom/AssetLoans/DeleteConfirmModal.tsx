import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Alert, Spinner } from 'reactstrap';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import apiClient from '../../../../helpers/api_helper';

interface DeleteAssetLoanConfirmModalProps {
  isOpen: boolean;
  toggle: () => void;
  loan: {
    id: number;
    asset_name?: string;
    borrower_name?: string;
  };
  onDeleteSuccess: () => void;
}

const DeleteAssetLoanConfirmModal: React.FC<DeleteAssetLoanConfirmModalProps> = ({
  isOpen,
  toggle,
  loan,
  onDeleteSuccess,
}) => {
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { mutate: deleteAssetLoan, isPending } = useMutation({
    mutationFn: async () => {
      const response = await apiClient.delete(`/asset-loans/${loan.id}`);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Asset loan deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['asset-loans'] });
      onDeleteSuccess();
      toggle();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error || err.message || 'Failed to delete asset loan.';
      setError(msg);
      toast.error(msg);
    },
  });

  const handleDelete = () => {
    setError('');
    deleteAssetLoan();
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle} className="bg-light">
        Confirm Deletion
      </ModalHeader>
      <ModalBody>
        {error && <Alert color="danger">{error}</Alert>}
        <p className="mb-2">You are about to permanently delete the following asset loan record:</p>
        <ul className="mb-3">
          <li>
            <strong>Asset:</strong> {loan?.asset_name || 'Unknown'}
          </li>
          <li>
            <strong>Borrower:</strong> {loan?.borrower_name || 'N/A'}
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

export default DeleteAssetLoanConfirmModal;
