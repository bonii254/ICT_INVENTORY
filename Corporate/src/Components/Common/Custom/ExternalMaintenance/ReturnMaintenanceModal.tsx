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

// ✅ Zod schema for frontend validation
const receiveSchema = z.object({
  actual_return_date: z.string(),
  actual_cost: z.number().min(0, 'Cost must be non-negative').optional(),
  Condition_After_Maintenance: z.string().optional(),
  delivery_note: z.string().optional(),
});

type ReceiveForm = z.infer<typeof receiveSchema>;

interface ReturnMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  maintenanceId: number;
  initialCondition?: string;
  initialActualCost?: number;
  initialdeliverynote?: string;
  onSuccess?: (maintenance: any) => void;
}

const ReturnMaintenanceModal: React.FC<ReturnMaintenanceModalProps> = ({
  isOpen,
  onClose,
  maintenanceId,
  initialCondition = '',
  initialdeliverynote = '',
  initialActualCost,
  onSuccess,
}) => {
  const [formValues, setFormValues] = React.useState<ReceiveForm>({
    actual_return_date: new Date().toISOString().split('T')[0],
    actual_cost: initialActualCost ?? 0,
    Condition_After_Maintenance: initialCondition,
    delivery_note: initialdeliverynote,
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
    () => {
      // Backend errors will be handled in handleSubmit onError
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1️⃣ Frontend Zod validation
    const result = receiveSchema.safeParse(formValues);
    const newErrors: Record<string, string> = {};

    if (!result.success) {
      Object.entries(result.error.flatten().fieldErrors).forEach(([key, val]) => {
        newErrors[key] = val?.[0] || '';
      });
      setErrors(newErrors);
      return;
    }

    setErrors({}); // clear frontend errors

    // 2️⃣ Submit to backend
    receiveAsset.mutate(formValues, {
      onError: (err: any) => {
        const backendErrors: Record<string, string> = {};

        // Field-level backend validation errors
        if (err?.response?.data?.errors) {
          Object.entries(err.response.data.errors).forEach(([key, val]) => {
            backendErrors[key] = Array.isArray(val) ? val[0] : String(val);
          });
        }

        // If no field-level errors, show generic error toast
        if (Object.keys(backendErrors).length === 0) {
          const msg =
            err?.response?.data?.error || err?.message || '❌ Failed to mark asset as returned.';
          toast.error(msg);
        }

        setErrors(backendErrors);
      },
    });
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

          {/* Delivery Note */}
          <div className="mb-3">
            <Label>Delivery Note</Label>
            <Input
              type="text"
              name="delivery_note"
              value={formValues.delivery_note || ''}
              onChange={handleChange}
              invalid={!!errors.delivery_note}
            />
            <FormFeedback>{errors.delivery_note}</FormFeedback>
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