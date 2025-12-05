import React from 'react';
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

import 'react-datepicker/dist/react-datepicker.css';
import 'react-toastify/dist/ReactToastify.css';

// Zod schema matching backend
const maintenanceSchema = z.object({
  asset_id: z.number().min(1, 'Asset is required'),
  parent_asset_id: z.number().optional(),
  provider_id: z.number().min(1, 'Provider is required'),
  maintenance_type: z.enum(['REPAIR', 'REFURBISH', 'CALIBRATION', 'UPGRADE', 'OTHER']),
  description: z.string().max(500).optional(),
  expected_return_date: z.string().optional(),
  cost_estimate: z.number().optional(),
  status: z.enum(['SENT', 'IN_PROGRESS', 'RETURNED', 'CANCELLED']).optional(),
  collected_by: z.string().max(255).optional(),
});

interface AddExternalMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formatLocalDate = (date: Date) => {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().split('T')[0];
};

const AddExternalMaintenanceModal: React.FC<AddExternalMaintenanceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const { assets, providers } = useAssetOptions();

  const createMaintenance = useApiPost(
    '/register/maintenance',
    () => {
      toast.success('✅ External maintenance record created successfully.');
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['external_maintenance'] });
      onClose();
    },
    (err) => {
      // Extract backend error
      const backendError =
        err?.response?.data?.error || // single error string
        (err?.response?.data?.errors && JSON.stringify(err.response.data.errors, null, 2)) || // validation errors
        err?.message || // fallback JS error
        '❌ Failed to create external maintenance record.';

      toast.error(backendError, { position: 'top-center', theme: 'colored' });
    },
  );

  const form = useForm({
    defaultValues: {
      asset_id: 0,
      parent_asset_id: 0,
      provider_id: 0,
      maintenance_type: 'REPAIR',
      description: '',
      expected_return_date: '',
      cost_estimate: 0,
      status: 'SENT',
      collected_by: '',
    },
    onSubmit: async ({ value, formApi }) => {
      const parsed = maintenanceSchema.safeParse(value);
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
      createMaintenance.mutate(parsed.data);
    },
  });

  const expectedReturnDate = useStore(form.baseStore, (s: any) => s.values.expected_return_date);
  const actualReturnDate = useStore(form.baseStore, (s: any) => s.values.actual_return_date);

  return (
    <Modal isOpen={isOpen} toggle={onClose} centered size="lg" fade>
      <ModalHeader toggle={onClose}>Add External Maintenance</ModalHeader>
      <ModalBody>
        <form onSubmit={form.handleSubmit}>
          <Row className="gy-3">
            {/* Asset */}
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

            {/* Parent Asset */}
            <form.Field name="parent_asset_id">
              {(field) => (
                <Col md="6">
                  <Label className="form-label">Parent Asset (Optional)</Label>
                  <AsyncSelectInput
                    field={field}
                    options={assets || []}
                    placeholder="Choose Parent Asset"
                  />
                </Col>
              )}
            </form.Field>

            {/* Provider */}
            <form.Field name="provider_id">
              {(field) => (
                <Col md="6">
                  <Label className="form-label">Select Provider</Label>
                  <AsyncSelectInput
                    field={field}
                    options={providers || []}
                    placeholder="Choose Provider"
                  />
                  {field.state.meta?.errors && (
                    <div className="text-danger small">{field.state.meta.errors}</div>
                  )}
                </Col>
              )}
            </form.Field>

            {/* Maintenance Type */}
            <form.Field name="maintenance_type">
              {(field) => (
                <Col md="6">
                  <Label className="form-label">Maintenance Type</Label>
                  <select
                    className="form-select"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  >
                    <option value="REPAIR">Repair</option>
                    <option value="REFURBISH">Refurbish</option>
                    <option value="CALIBRATION">Calibration</option>
                    <option value="UPGRADE">Upgrade</option>
                    <option value="OTHER">Other</option>
                  </select>
                </Col>
              )}
            </form.Field>

            {/* Expected Return Date */}
            <Col md="6">
              <Label className="form-label">Expected Return Date (Optional)</Label>
              <DatePicker
                className="form-control"
                selected={expectedReturnDate ? new Date(expectedReturnDate) : null}
                onChange={(date) =>
                  form.setFieldValue('expected_return_date', date ? formatLocalDate(date) : '')
                }
                dateFormat="yyyy-MM-dd"
                showMonthDropdown
                showYearDropdown
              />
            </Col>

            {/* Cost Estimate */}
            <form.Field name="cost_estimate">
              {(field) => (
                <Col md="6">
                  <Label className="form-label">Cost Estimate (Optional)</Label>
                  <input
                    type="number"
                    className="form-control"
                    value={field.state.value || ''}
                    onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)}
                  />
                </Col>
              )}
            </form.Field>

            {/* Collected By */}
            <form.Field name="collected_by">
              {(field) => (
                <Col md="6">
                  <Label className="form-label">Collected By</Label>
                  <input
                    className="form-control"
                    placeholder="Name of employee collecting from provider"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Col>
              )}
            </form.Field>

            {/* Description */}
            <form.Field name="description">
              {(field) => (
                <Col md="12">
                  <Label className="form-label">Description</Label>
                  <textarea
                    className="form-control"
                    rows={3}
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
          disabled={createMaintenance.isPending}
        >
          {createMaintenance.isPending ? <Spinner size="sm" /> : 'Create Maintenance'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddExternalMaintenanceModal;
