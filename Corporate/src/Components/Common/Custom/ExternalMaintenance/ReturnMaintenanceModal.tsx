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
  Spinner,
} from 'reactstrap';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { useApiPut } from '../../../../helpers/api_helper';

// ✅ Zod schema for validation
const receiveSchema = z.object({
  actual_return_date: z.string(),
  actual_cost: z.number().min(0, 'Cost must be non-negative').optional(),
  Condition_After_Maintenance: z.string().optional(),
});

type ReceiveForm = z.infer<typeof receiveSchema>;

interface ReturnMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  maintenanceId: number;
  initialCondition?: string;
  initialActualCost?: number;
  onSuccess?: (maintenance: any) => void;
}

const ReturnMaintenanceModal: React.FC<ReturnMaintenanceModalProps> = ({
  isOpen,
  onClose,
  maintenanceId,
  initialCondition = '',
  initialActualCost,
  onSuccess,
}) => {
  const [formValues, setFormValues] = React.useState<ReceiveForm>({
    actual_return_date: new Date().toISOString().split('T')[0],
    actual_cost: initialActualCost ?? 0,
    Condition_After_Maintenance: initialCondition,
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: name === 'actual_cost' ? (value === '' ? undefined : parseFloat(value)) : value,
    }));
  };

  const receiveAsset = useApiPut<ReceiveForm, { message: string; maintenance: any }>(
    `/maintenance/receive/${maintenanceId}`,
    (res) => {
      toast.success(res.message || '✅ Asset successfully marked as returned.');
      onSuccess?.(res.maintenance);
      onClose();
    },
    (err) => {
      const msg =
        err?.response?.data?.error || err?.message || '❌ Failed to mark asset as returned.';
      toast.error(msg);
    },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = receiveSchema.safeParse(formValues);
    if (!result.success) {
      const fieldErrors = Object.fromEntries(
        Object.entries(result.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0] || '']),
      );
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    receiveAsset.mutate(result.data);
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose} centered>
      <ModalHeader toggle={onClose}>Receive Returned Asset</ModalHeader>
      <Form onSubmit={handleSubmit}>
        <ModalBody>
          {/* Return Date */}
          <div className="mb-3">
            <Label>Return Date</Label>
            <Input
              type="date"
              name="actual_return_date"
              value={formValues.actual_return_date}
              onChange={handleChange}
              invalid={!!errors.actual_return_date}
            />
            <FormFeedback>{errors.actual_return_date}</FormFeedback>
          </div>

          {/* Actual Cost */}
          <div className="mb-3">
            <Label>Actual Cost (Optional)</Label>
            <Input
              type="number"
              name="actual_cost"
              min={0}
              value={formValues.actual_cost ?? ''}
              onChange={handleChange}
              invalid={!!errors.actual_cost}
            />
            <FormFeedback>{errors.actual_cost}</FormFeedback>
          </div>

          {/* Condition After Maintenance */}
          <div className="mb-3">
            <Label>Condition After Maintenance</Label>
            <Input
              type="text"
              name="Condition_After_Maintenance"
              value={formValues.Condition_After_Maintenance || ''}
              onChange={handleChange}
              invalid={!!errors.Condition_After_Maintenance}
            />
            <FormFeedback>{errors.Condition_After_Maintenance}</FormFeedback>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button color="light" onClick={onClose}>
            Cancel
          </Button>
          <Button color="primary" type="submit" disabled={receiveAsset.isPending}>
            {receiveAsset.isPending ? <Spinner size="sm" /> : 'Mark as Returned'}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default ReturnMaintenanceModal;
