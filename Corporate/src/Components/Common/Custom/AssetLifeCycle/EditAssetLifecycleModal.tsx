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

import { useAssetOptions } from '../../../../hooks/useAssetOptions';
import AsyncSelectInput from '../../../../helpers/AsyncSelectInput';
import { useApiPut } from '../../../../helpers/api_helper';

import 'react-toastify/dist/ReactToastify.css';

interface EditAssetLifecycleModalProps {
  isOpen: boolean;
  onClose: () => void;
  lifecycle: {
    id: number;
    asset_id: number;
    event: string;
    notes?: string;
  } | null;
}

const alcUpdateSchema = z.object({
  asset_id: z.number().min(1, 'Asset is required'),
  event: z.string().min(1, 'Event is required'),
  notes: z.string().optional(),
});

const EditAssetLifecycleModal: React.FC<EditAssetLifecycleModalProps> = ({
  isOpen,
  onClose,
  lifecycle,
}) => {
  const queryClient = useQueryClient();
  const { assets } = useAssetOptions();

  const updateLifecycle = useApiPut(
    lifecycle ? `/asset-lifecycles/${lifecycle.id}` : '',
    () => {
      toast.success('✔ Asset lifecycle updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['asset_lifecycles'] });
      onClose();
    },
    (err) => {
      const msg = err?.response?.data?.error || err?.message || '❌ Failed to update lifecycle.';
      toast.error(msg, { position: 'top-center', theme: 'colored' });
    },
  );

  const form = useForm({
    defaultValues: {
      asset_id: lifecycle?.asset_id ?? 0,
      event: lifecycle?.event ?? '',
      notes: lifecycle?.notes ?? '',
    },
    onSubmit: async ({ value, formApi }) => {
      const parsed = alcUpdateSchema.safeParse(value);

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
      updateLifecycle.mutate(parsed.data);
    },
  });

  React.useEffect(() => {
    if (lifecycle) {
      form.setFieldValue('asset_id', lifecycle.asset_id);
      form.setFieldValue('event', lifecycle.event);
      form.setFieldValue('notes', lifecycle.notes || '');
    }
  }, [lifecycle]);

  return (
    <Modal isOpen={isOpen} toggle={onClose} centered size="lg" fade>
      <ModalHeader toggle={onClose}>Edit Asset Lifecycle</ModalHeader>

      <ModalBody>
        <form onSubmit={form.handleSubmit}>
          <Row className="gy-3">
            {/* Select Asset */}
            <form.Field name="asset_id">
              {(field) => (
                <Col md="6">
                  <Label className="form-label">Asset</Label>
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

            {/* Event */}
            <form.Field name="event">
              {(field) => (
                <Col md="6">
                  <Label className="form-label">Lifecycle Event</Label>
                  <input
                    className="form-control"
                    placeholder="e.g., Repaired, Transferred, Retired"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta?.errors && (
                    <div className="text-danger small">{field.state.meta.errors}</div>
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
                    placeholder="Additional notes…"
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
          disabled={updateLifecycle.isPending}
        >
          {updateLifecycle.isPending ? <Spinner size="sm" /> : 'Save Changes'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default EditAssetLifecycleModal;