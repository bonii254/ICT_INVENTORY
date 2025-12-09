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

import { z } from 'zod';
import { toast } from 'react-toastify';
import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { useStore } from '@tanstack/react-store';

import AsyncSelectInput from '../../../../helpers/AsyncSelectInput';
import { useAssetOptions } from '../../../../hooks/useAssetOptions';
import { useApiPost } from '../../../../helpers/api_helper';

import 'react-toastify/dist/ReactToastify.css';

interface AddAssetLifecycleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const alcSchema = z.object({
  asset_id: z.number().min(1, 'Asset is required'),
  event: z.string().min(2, 'Event description is required'),
  notes: z.string().optional(),
});

const AddAssetLifecycleModal: React.FC<AddAssetLifecycleModalProps> = ({
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();

  const { assets, refetch } = useAssetOptions();

  const createAlc = useApiPost(
    '/register/assetlifecycle',
    () => {
      toast.success('✅ Asset lifecycle event created.');
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['asset_lifecycles'] });
      onClose();
    },
    (err) => {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        '❌ Failed to create asset lifecycle.';
      toast.error(msg, { position: 'top-center', theme: 'colored' });
    }
  );

  const form = useForm({
    defaultValues: {
      asset_id: 0,
      event: '',
      notes: '',
    },
    onSubmit: async ({ value, formApi }) => {
      const parsed = alcSchema.safeParse(value);
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
      createAlc.mutate(parsed.data);
    },
  });

  return (
    <Modal isOpen={isOpen} toggle={onClose} centered size="lg" fade>
      <ModalHeader toggle={onClose}>Add Asset Lifecycle Event</ModalHeader>

      <ModalBody>
        <form onSubmit={form.handleSubmit}>
          <Row className="gy-3">

            {/* Asset Select */}
            <form.Field name="asset_id">
              {(field) => (
                <Col md="6">
                  <Label className="form-label">Select Asset</Label>
                  <AsyncSelectInput
                    field={field}
                    options={assets || []}
                    placeholder="Choose asset"
                  />
                  {field.state.meta?.errors && (
                    <div className="text-danger small">
                      {field.state.meta.errors}
                    </div>
                  )}
                </Col>
              )}
            </form.Field>

            {/* Event */}
            <form.Field name="event">
              {(field) => (
                <Col md="6">
                  <Label className="form-label">Lifecycle Event</Label>
                  <input
                    className="form-control"
                    placeholder="e.g., Maintenance, Transfer, Repair"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta?.errors && (
                    <div className="text-danger small">
                      {field.state.meta.errors}
                    </div>
                  )}
                </Col>
              )}
            </form.Field>

            {/* Notes */}
            <form.Field name="notes">
              {(field) => (
                <Col md="12">
                  <Label className="form-label">Notes</Label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Optional notes..."
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
          disabled={createAlc.isPending}
        >
          {createAlc.isPending ? <Spinner size="sm" /> : 'Create Event'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddAssetLifecycleModal;