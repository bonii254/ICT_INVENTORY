import React from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
  Label,
  Col,
} from 'reactstrap';
import DatePicker from 'react-datepicker';
import { useForm } from '@tanstack/react-form';
import { toast } from 'react-toastify';
import { useApiPut } from '../../../../helpers/api_helper';
import 'react-datepicker/dist/react-datepicker.css';

interface ReturnAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetLoanId: number;
  initialCondition?: string;
}

const ReturnAssetModal: React.FC<ReturnAssetModalProps> = ({
  isOpen,
  onClose,
  assetLoanId,
  initialCondition = '',
}) => {
  const form = useForm({
    defaultValues: {
      actual_return_date: new Date(),
      condition_after: initialCondition,
      remarks: '',
    },
    onSubmit: async ({ value }) => {
      updateLoan.mutate(value);
    },
  });

  const updateLoan = useApiPut(
    `/asset-loans/${assetLoanId}`,
    () => {
      toast.success('✅ Asset marked as returned.');
      onClose();
    },
    (err) => {
      const msg = err?.response?.data?.error || err?.message || '❌ Failed to return asset.';
      toast.error(msg);
    },
  );

  return (
    <Modal isOpen={isOpen} toggle={onClose} centered>
      <ModalHeader toggle={onClose}>Return Asset</ModalHeader>
      <ModalBody>
        <form onSubmit={form.handleSubmit} className="row gy-3">
          <Col md="12">
            <Label>Return Date</Label>
            <DatePicker
              className="form-control"
              selected={form.getFieldValue('actual_return_date')}
              onChange={(date) => {
                if (date) {
                  form.setFieldValue('actual_return_date', date);
                }
              }}
              dateFormat="yyyy-MM-dd"
            />
          </Col>

          <Col md="12">
            <Label>Condition After</Label>
            <input
              type="text"
              className="form-control"
              value={form.getFieldValue('condition_after')}
              onChange={(e) => form.setFieldValue('condition_after', e.target.value)}
            />
          </Col>

          <Col md="12">
            <Label>Remarks (Optional)</Label>
            <textarea
              className="form-control"
              rows={3}
              value={form.getFieldValue('remarks')}
              onChange={(e) => form.setFieldValue('remarks', e.target.value)}
            />
          </Col>
        </form>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button color="primary" onClick={() => form.handleSubmit()} disabled={updateLoan.isPending}>
          {updateLoan.isPending ? <Spinner size="sm" /> : 'Return Asset'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ReturnAssetModal;
