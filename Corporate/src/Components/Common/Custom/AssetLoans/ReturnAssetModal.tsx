import React from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
  Label,
  Input,
  Form,
  FormFeedback,
} from 'reactstrap';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { useApiPut } from '../../../../helpers/api_helper';

// ✅ Schema matches backend expectations
const returnAssetSchema = z.object({
  actual_return_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  condition_after: z.string().optional(),
  remarks: z.string().optional(),
});

type ReturnAssetForm = z.infer<typeof returnAssetSchema>;

interface ReturnAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetLoanId: number;
  initialCondition?: string;
  onSuccess?: (loan: any) => void;
}

const ReturnAssetModal: React.FC<ReturnAssetModalProps> = ({
  isOpen,
  onClose,
  assetLoanId,
  initialCondition = '',
  onSuccess,
}) => {
  const [formValues, setFormValues] = React.useState<ReturnAssetForm>({
    actual_return_date: new Date().toISOString().split('T')[0], // ✅ clean YYYY-MM-DD
    condition_after: initialCondition,
    remarks: '',
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (isOpen) {
      setFormValues({
        actual_return_date: new Date().toISOString().split('T')[0],
        condition_after: initialCondition,
        remarks: '',
      });
      setErrors({});
    }
  }, [isOpen, initialCondition]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // ✅ Ensure date stays in YYYY-MM-DD format
    if (name === 'actual_return_date') {
      const cleanDate = value ? value.split('T')[0] : '';
      setFormValues((prev) => ({ ...prev, [name]: cleanDate }));
      return;
    }

    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const updateLoan = useApiPut<ReturnAssetForm, { message: string; loan: any }>(
    `/asset-loans/${assetLoanId}`,
    (res) => {
      toast.success(res.message || '✅ Asset marked as returned.');
      onSuccess?.(res.loan);
      onClose();
    },
    (err) => {
      const data = err?.response?.data;
      let msg = '❌ Failed to return asset.';

      if (data?.error) {
        if (typeof data.error === 'object') {
          const fieldErrors: Record<string, string> = {};
          Object.entries(data.error).forEach(([key, val]) => {
            fieldErrors[key] = Array.isArray(val) ? val[0] : String(val);
          });
          setErrors(fieldErrors);
          msg = 'Please correct the highlighted errors.';
        } else {
          msg = data.error;
        }
      } else if (err.message) {
        msg = err.message;
      }

      toast.error(msg);
    },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = returnAssetSchema.safeParse(formValues);
    if (!result.success) {
      const fieldErrors = Object.fromEntries(
        Object.entries(result.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0] || '']),
      );
      setErrors(fieldErrors);
      toast.error('Please fix validation errors before submitting.');
      return;
    }

    setErrors({});
    updateLoan.mutate(result.data);
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose} centered>
      <ModalHeader toggle={onClose}>Return Asset</ModalHeader>
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

          {/* Condition After */}
          <div className="mb-3">
            <Label>Condition After</Label>
            <Input
              type="text"
              name="condition_after"
              value={formValues.condition_after || ''}
              onChange={handleChange}
              invalid={!!errors.condition_after}
            />
            <FormFeedback>{errors.condition_after}</FormFeedback>
          </div>

          {/* Remarks */}
          <div className="mb-3">
            <Label>Remarks (Optional)</Label>
            <Input
              type="textarea"
              name="remarks"
              rows={3}
              value={formValues.remarks}
              onChange={handleChange}
              invalid={!!errors.remarks}
            />
            <FormFeedback>{errors.remarks}</FormFeedback>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button color="light" onClick={onClose}>
            Cancel
          </Button>
          <Button color="primary" type="submit" disabled={updateLoan.isPending}>
            {updateLoan.isPending ? <Spinner size="sm" /> : 'Return Asset'}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default ReturnAssetModal;
