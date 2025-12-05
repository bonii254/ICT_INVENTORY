import React from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  Label,
  Input,
  FormFeedback,
} from 'reactstrap';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { useApiPut } from '../../../../helpers/api_helper';
import { useAssetOptions } from '../../../../hooks/useAssetOptions';

// ✅ Zod Schema — matches your Flask + Marshmallow schema
const updateMaintenanceSchema = z.object({
  asset_id: z.number().optional(),
  provider_id: z.number().optional(),
  maintenance_type: z.enum(['REPAIR', 'REFURBISH', 'CALIBRATION', 'UPGRADE', 'OTHER']).optional(),
  description: z.string().max(500).optional(),
  expected_return_date: z.string().optional(),
  actual_return_date: z.string().optional(),
  cost_estimate: z.number().min(0, 'Must be positive').optional(),
  actual_cost: z.number().min(0, 'Must be positive').optional(),
  status: z.enum(['SENT', 'IN_PROGRESS', 'RETURNED', 'CANCELLED']).optional(),
  collected_by: z.string().max(255).optional(),
  received_by: z.string().max(255).optional(),
});

export type UpdateMaintenance = z.infer<typeof updateMaintenanceSchema>;

interface UpdateMaintenanceResponse {
  message: string;
  maintenance: any;
}

interface UpdateExternalMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  maintenanceId: number;
  initialData: UpdateMaintenance;
  onSuccess?: (maintenance: any) => void;
}

const UpdateExternalMaintenanceModal: React.FC<UpdateExternalMaintenanceModalProps> = ({
  isOpen,
  onClose,
  maintenanceId,
  initialData,
  onSuccess,
}) => {
  const [formValues, setFormValues] = React.useState<UpdateMaintenance>(initialData);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const { assets, providers } = useAssetOptions();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: ['cost_estimate', 'actual_cost'].includes(name)
        ? parseFloat(value) || 0
        : name.endsWith('_id')
          ? parseInt(value) || undefined
          : value,
    }));
  };

  const updateMaintenance = useApiPut<UpdateMaintenance, UpdateMaintenanceResponse>(
    `/maintenance/update/${maintenanceId}`,
    (res) => {
      toast.success(res.message || 'Maintenance record updated successfully!');
      onSuccess?.(res.maintenance);
      onClose();
    },
    (err) => {
      const data = err?.response?.data;
      if (data?.errors) {
        const fieldErrors: Record<string, string> = {};
        Object.entries(data.errors).forEach(([key, msgs]) => {
          fieldErrors[key] = (msgs as string[])[0];
        });
        setErrors(fieldErrors);
      }
      toast.error(data?.error || 'Failed to update maintenance record.');
    },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = updateMaintenanceSchema.safeParse(formValues);
    if (!result.success) {
      const fieldErrors = Object.fromEntries(
        Object.entries(result.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0] || '']),
      );
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    updateMaintenance.mutate(result.data);
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose} centered>
      <ModalHeader toggle={onClose}>Update External Maintenance</ModalHeader>
      <Form onSubmit={handleSubmit}>
        <ModalBody>
          {/* Asset */}
          <div className="mb-3">
            <Label>Asset</Label>
            <Input
              type="select"
              name="asset_id"
              value={formValues.asset_id || ''}
              onChange={handleChange}
              invalid={!!errors.asset_id}
            >
              <option value="">Select Asset</option>
              {assets?.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </Input>
            <FormFeedback>{errors.asset_id}</FormFeedback>
          </div>

          {/* Provider */}
          <div className="mb-3">
            <Label>Provider</Label>
            <Input
              type="select"
              name="provider_id"
              value={formValues.provider_id || ''}
              onChange={handleChange}
              invalid={!!errors.provider_id}
            >
              <option value="">Select Provider</option>
              {providers?.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </Input>
            <FormFeedback>{errors.provider_id}</FormFeedback>
          </div>

          {/* Description */}
          <div className="mb-3">
            <Label>Description</Label>
            <Input
              type="textarea"
              name="description"
              value={formValues.description || ''}
              onChange={handleChange}
              invalid={!!errors.description}
            />
            <FormFeedback>{errors.description}</FormFeedback>
          </div>

          {/* Maintenance Type */}
          <div className="mb-3">
            <Label>Maintenance Type</Label>
            <Input
              type="select"
              name="maintenance_type"
              value={formValues.maintenance_type || ''}
              onChange={handleChange}
              invalid={!!errors.maintenance_type}
            >
              <option value="">Select Type</option>
              <option value="REPAIR">Repair</option>
              <option value="REFURBISH">Refurbish</option>
              <option value="CALIBRATION">Calibration</option>
              <option value="UPGRADE">Upgrade</option>
              <option value="OTHER">Other</option>
            </Input>
            <FormFeedback>{errors.maintenance_type}</FormFeedback>
          </div>

          {/* Dates */}
          <div className="mb-3">
            <Label>Expected Return Date</Label>
            <Input
              type="date"
              name="expected_return_date"
              value={formValues.expected_return_date || ''}
              onChange={handleChange}
              invalid={!!errors.expected_return_date}
            />
            <FormFeedback>{errors.expected_return_date}</FormFeedback>
          </div>

          <div className="mb-3">
            <Label>Actual Return Date</Label>
            <Input
              type="date"
              name="actual_return_date"
              value={formValues.actual_return_date || ''}
              onChange={handleChange}
              invalid={!!errors.actual_return_date}
            />
            <FormFeedback>{errors.actual_return_date}</FormFeedback>
          </div>

          {/* Costs */}
          <div className="mb-3">
            <Label>Cost Estimate</Label>
            <Input
              type="number"
              name="cost_estimate"
              value={formValues.cost_estimate ?? ''}
              onChange={handleChange}
              invalid={!!errors.cost_estimate}
            />
            <FormFeedback>{errors.cost_estimate}</FormFeedback>
          </div>

          <div className="mb-3">
            <Label>Actual Cost</Label>
            <Input
              type="number"
              name="actual_cost"
              value={formValues.actual_cost ?? ''}
              onChange={handleChange}
              invalid={!!errors.actual_cost}
            />
            <FormFeedback>{errors.actual_cost}</FormFeedback>
          </div>

          {/* Status */}
          <div className="mb-3">
            <Label>Status</Label>
            <Input
              type="select"
              name="status"
              value={formValues.status || ''}
              onChange={handleChange}
              invalid={!!errors.status}
            >
              <option value="">Select Status</option>
              <option value="SENT">Sent</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RETURNED">Returned</option>
              <option value="CANCELLED">Cancelled</option>
            </Input>
            <FormFeedback>{errors.status}</FormFeedback>
          </div>

          {/* Collected / Received */}
          <div className="mb-3">
            <Label>Collected By</Label>
            <Input
              type="text"
              name="collected_by"
              value={formValues.collected_by || ''}
              onChange={handleChange}
              invalid={!!errors.collected_by}
            />
            <FormFeedback>{errors.collected_by}</FormFeedback>
          </div>

          <div className="mb-3">
            <Label>Received By</Label>
            <Input
              type="text"
              name="received_by"
              value={formValues.received_by || ''}
              onChange={handleChange}
              invalid={!!errors.received_by}
            />
            <FormFeedback>{errors.received_by}</FormFeedback>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button color="light" onClick={onClose}>
            Cancel
          </Button>
          <Button color="primary" type="submit" disabled={updateMaintenance.isPending}>
            {updateMaintenance.isPending ? 'Saving...' : 'Update'}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default UpdateExternalMaintenanceModal;
