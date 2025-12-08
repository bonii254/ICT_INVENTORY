import React, { useState } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
  Row,
  Col,
  Label,
} from 'reactstrap';
import DatePicker from 'react-datepicker';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { useStore } from '@tanstack/react-store';

import AsyncSelectInput from '../../../../helpers/AsyncSelectInput';
import { useAssetOptions } from '../../../../hooks/useAssetOptions';
import { useApiPost } from '../../../../helpers/api_helper';
import AddUserModal from '../../Custom/User/AddUserModal';

import 'react-datepicker/dist/react-datepicker.css';
import 'react-toastify/dist/ReactToastify.css';

const assetLoanSchema = z.object({
  asset_id: z.number().min(1, 'Asset is required'),
  borrower_id: z.number().min(1, 'Borrower is required'),
  expected_return_date: z.string().nonempty('Expected return date required'),
  condition_before: z.string().optional(),
  remarks: z.string().optional(),
});

interface AddAssetLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formatLocalDate = (date: Date) => {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().split('T')[0];
};

const AddAssetLoanModal: React.FC<AddAssetLoanModalProps> = ({ isOpen, onClose }) => {
  const [userModalOpen, setUserModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { assets, users, refetch } = useAssetOptions();

  const createLoan = useApiPost(
    '/register/asset-loans',
    () => {
      toast.success('✅ Asset loan created successfully.');
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['asset_loans'] });
      onClose();
    },
    (err) => {
      const msg = err?.response?.data?.error || err?.message || '❌ Failed to create asset loan.';
      toast.error(msg, { position: 'top-center', theme: 'colored' });
    },
  );

  const form = useForm({
    defaultValues: {
      asset_id: 0,
      borrower_id: 0,
      expected_return_date: '',
      condition_before: '',
      remarks: '',
    },
    onSubmit: async ({ value, formApi }) => {
      const parsed = assetLoanSchema.safeParse(value);
      if (!parsed.success) {
        const fieldErrors = parsed.error.flatten().fieldErrors;
        for (const [field, msgs] of Object.entries(fieldErrors)) {
          if (msgs?.[0]) {
            formApi.setFieldMeta(field as any, (meta) => ({
              ...meta,
              errors: msgs,
              isTouched: true,
            }));
          }
        }
        return;
      }
      createLoan.mutate(parsed.data);
    },
  });

  const expected_return_date = useStore(form.baseStore, (s: any) => s.values.expected_return_date);

  const handleUserCreated = (newUser: { id: number; fullname: string; payroll_no: string }) => {
    refetch?.();
    form.setFieldValue('borrower_id', newUser.id);
    toast.success(`Borrower "${newUser.fullname} - ${newUser.payroll_no}" added and selected!`);
  };

  return (
    <>
      <Modal isOpen={isOpen} toggle={onClose} centered size="lg" fade>
        <ModalHeader toggle={onClose}>Add Asset Loan</ModalHeader>
        <ModalBody>
          <form onSubmit={form.handleSubmit}>
            <Row className="gy-3">
              {/* Select Asset */}
              <form.Field name="asset_id">
                {(field) => (
                  <Col md="6">
                    <Label className="form-label">Select Asset</Label>
                    <AsyncSelectInput
                      field={field}
                      options={assets || []}
                      placeholder="Choose Asset"
                    />
                    {field.state.meta?.errors && (
                      <div className="text-danger small">{field.state.meta.errors}</div>
                    )}
                  </Col>
                )}
              </form.Field>

              <form.Field name="borrower_id">
                {(field) => (
                  <Col md="6">
                    <Label className="form-label d-flex justify-content-between">
                      <span>Select Borrower</span>
                      <Button color="link" size="sm" onClick={() => setUserModalOpen(true)}>
                        + Add Borrower
                      </Button>
                    </Label>
                    <AsyncSelectInput
                      field={field}
                      options={users || []}
                      placeholder="Choose Borrower"
                    />
                    {field.state.meta?.errors && (
                      <div className="text-danger small">{field.state.meta.errors}</div>
                    )}
                  </Col>
                )}
              </form.Field>

              {/* Expected Return Date */}
              <Col md="6">
                <Label className="form-label">Expected Return Date</Label>
                <DatePicker
                  className="form-control"
                  selected={expected_return_date ? new Date(expected_return_date) : null}
                  onChange={(date) => {
                    if (date) {
                      const formatted = formatLocalDate(date);
                      form.setFieldValue('expected_return_date', formatted);
                    } else {
                      form.setFieldValue('expected_return_date', '');
                    }
                  }}
                  dateFormat="yyyy-MM-dd"
                  showYearDropdown
                  showMonthDropdown
                />
              </Col>

              {/* Condition Before */}
              <form.Field name="condition_before">
                {(field) => (
                  <Col md="6">
                    <Label className="form-label">Condition Before</Label>
                    <input
                      className="form-control"
                      placeholder="e.g., Good, minor scratches"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </Col>
                )}
              </form.Field>

              {/* Remarks */}
              <form.Field name="remarks">
                {(field) => (
                  <Col md="12">
                    <Label className="form-label">Remarks</Label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Any additional notes..."
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </Col>
                )}
              </form.Field>
            </Row>
          </form>
        </ModalBody>

        <ModalFooter>
          <Button color="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={() => form.handleSubmit()}
            disabled={createLoan.isPending}
          >
            {createLoan.isPending ? <Spinner size="sm" /> : 'Create Loan'}
          </Button>
        </ModalFooter>
      </Modal>

      <AddUserModal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        onSuccess={handleUserCreated}
      />
    </>
  );
};

export default AddAssetLoanModal;
