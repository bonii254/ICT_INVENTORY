import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Spinner } from 'reactstrap';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { useApiPost } from '../../../../helpers/api_helper';

// ✅ Zod schema for frontend validation (mirrors ProviderCreateSchema)
const providerSchema = z.object({
  name: z
    .string()
    .min(2, 'Provider name must be at least 2 characters')
    .max(255, 'Provider name too long'),
  contact_person: z.string().optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().max(100, 'Phone number too long').optional(),
  address: z.string().max(255, 'Address too long').optional(),
  provider_type: z.enum(['COMPANY', 'INDIVIDUAL']).optional(),
});



export type Provider = z.infer<typeof providerSchema> & { id?: number };

interface AddProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (provider: Provider) => void;
}

const AddProviderModal: React.FC<AddProviderModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [createdProvider, setCreatedProvider] = useState<Partial<Provider> | null>(null);

  // API hook
  const createProvider = useApiPost<{ provider: Provider }, Provider>(
    '/register/provider',
    (res) => {
      setCreatedProvider(res.provider);
      form.reset();
      onSuccess?.(res.provider);
      toast.success('✅ Provider created successfully.');
    },
    (err) => {
      let msg = 'Provider creation failed.';
      const data = err?.response?.data;

      if (data?.error) {
        const error = data.error;
        msg = typeof error === 'string' ? error : JSON.stringify(error);
      } else if (data?.errors) {
        msg = Object.entries(data.errors)
          .map(([f, m]) => `${f}: ${(m as string[]).join(', ')}`)
          .join('\n');
      } else if (err?.message) {
        msg = err.message;
      }

      toast.error(`❌ ${msg}`, {
        position: 'top-center',
        autoClose: 5000,
        theme: 'colored',
      });
    },
  );

  // React form setup
  const form = useForm({
    defaultValues: {
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      provider_type: 'COMPANY',
    },
    onSubmit: async ({ value, formApi }) => {
      const result = providerSchema.safeParse(value);
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        (Object.keys(errors) as (keyof typeof errors)[]).forEach((key) => {
          const message = errors[key]?.[0];
          if (message) {
            formApi.setFieldMeta(key, (meta) => ({
              ...meta,
              error: message,
              isTouched: true,
            }));
          }
        });
        return;
      }
      createProvider.mutate(result.data);
    },
  });

  const handleClose = () => {
    form.reset();
    setCreatedProvider(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} toggle={handleClose} centered>
      <ModalHeader toggle={handleClose}>Add New Provider</ModalHeader>
      <ModalBody>
        <form onSubmit={form.handleSubmit} className="row gy-3">
          {/* Provider Name */}
          <form.Field name="name">
            {(field) => (
              <div className="col-12">
                <label className="form-label">Provider Name</label>
                <input
                  className="form-control"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Enter provider name"
                />
                {field.state.meta.errors && (
                  <small className="text-danger">{field.state.meta.errors}</small>
                )}
              </div>
            )}
          </form.Field>

          {/* Contact Person */}
          <form.Field name="contact_person">
            {(field) => (
              <div className="col-12">
                <label className="form-label">Contact Person</label>
                <input
                  className="form-control"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Enter contact name"
                />
              </div>
            )}
          </form.Field>

          {/* Email */}
          <form.Field name="email">
            {(field) => (
              <div className="col-12">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="example@email.com"
                />
                {field.state.meta.errors && (
                  <small className="text-danger">{field.state.meta.errors}</small>
                )}
              </div>
            )}
          </form.Field>

          {/* Phone */}
          <form.Field name="phone">
            {(field) => (
              <div className="col-12">
                <label className="form-label">Phone</label>
                <input
                  className="form-control"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g. +1234567890"
                />
              </div>
            )}
          </form.Field>

          {/* Address */}
          <form.Field name="address">
            {(field) => (
              <div className="col-12">
                <label className="form-label">Address</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Enter address"
                />
              </div>
            )}
          </form.Field>

          {/* Provider Type */}
          <form.Field name="provider_type">
            {(field) => (
              <div className="col-12">
                <label className="form-label">Provider Type</label>
                <select
                  className="form-select"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value as 'COMPANY' | 'INDIVIDUAL')}
                >
                  <option value="COMPANY">Company</option>
                  <option value="INDIVIDUAL">Individual</option>
                </select>
              </div>
            )}
          </form.Field>
        </form>

        {/* ✅ Success Feedback */}
        {createdProvider && (
          <div className="mt-4 alert alert-success">
            <h5>✅ Provider Created</h5>
            <ul className="mb-0">
              <li>
                <strong>Name:</strong> {createdProvider.name}
              </li>
              {createdProvider.email && (
                <li>
                  <strong>Email:</strong> {createdProvider.email}
                </li>
              )}
              {createdProvider.phone && (
                <li>
                  <strong>Phone:</strong> {createdProvider.phone}
                </li>
              )}
            </ul>
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        <Button color="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          color="primary"
          onClick={() => form.handleSubmit()}
          disabled={createProvider.isPending}
        >
          {createProvider.isPending ? <Spinner size="sm" /> : 'Add Provider'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddProviderModal;
