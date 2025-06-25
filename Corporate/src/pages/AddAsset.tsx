import React, { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { useStore } from '@tanstack/react-store';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Modal from 'react-modal';
import { z } from 'zod';
import { assetSchema } from '../schemas/assetSchema';
import AsyncSelectInput from '../helpers/AsyncSelectInput';
import { useAssetOptions } from '../hooks/useAssetOptions';
import { useApiPost } from '../helpers/api_helper';

type CreatedAsset = {
  asset_tag: string;
  name: string;
  serial_number: string;
  model_number: string;
  category: string;
  assigned_to: string;
  location: string;
  status: string;
  purchase_date: string;
  warranty_expiry: string;
  configuration: string;
  department: string;
};

const AddAssetPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [createdAsset, setCreatedAsset] = useState<CreatedAsset | null>(null);

  const {
    departments,
    locations,
    statuses,
    users,
    categories,
    isLoading,
    isError,
  } = useAssetOptions();

  const createAsset = useApiPost<{ asset: CreatedAsset }, z.infer<typeof assetSchema>>(
    '/assets',
    (res) => {
      setCreatedAsset(res.asset);
      setModalOpen(true);
      form.reset();
    },
    (err) => {
      alert(`Asset creation failed: ${err}`);
    }
  );

  const form = useForm({
    defaultValues: {
      serial_number: '',
      model_number: '',
      purchase_date: '',
      warranty_expiry: '',
      configuration: '',
      department_id: 0,
      location_id: 0,
      category_id: 0,
      assigned_to: 0,
      status_id: 0,
    },
    onSubmit: async ({ value, formApi }) => {
      const result = assetSchema.safeParse(value);

      if (!result.success) {
        const zodErrors = result.error.flatten().fieldErrors;
        type FieldName = keyof typeof zodErrors;

        (Object.keys(zodErrors) as FieldName[]).forEach((key) => {
          const message = zodErrors[key]?.[0];
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

      createAsset.mutate(result.data);
    },
  });

  const { purchase_date, warranty_expiry } = useStore(form.baseStore, (s: any) => ({
    purchase_date: s.values.purchase_date,
    warranty_expiry: s.values.warranty_expiry,
  }));

  if (isLoading) return <p>Loading form...</p>;
  if (isError) return <p>Error loading asset options</p>;

  return (
    <div className="add-asset-form">
      <h2>Add New Asset</h2>

      <form onSubmit={form.handleSubmit}>
        {/* Serial Number */}
        <form.Field name="serial_number">
          {(field) => (
            <div>
              <label>Serial Number</label>
              <input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.errors && <p className="error">{field.state.meta.errors}</p>}
            </div>
          )}
        </form.Field>

        {/* Model Number */}
        <form.Field name="model_number">
          {(field) => (
            <div>
              <label>Model Number</label>
              <input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.errors && <p className="error">{field.state.meta.errors}</p>}
            </div>
          )}
        </form.Field>

        {/* Purchase Date */}
        <div>
          <label>Purchase Date</label>
          <DatePicker
            selected={purchase_date ? new Date(purchase_date) : null}
            onChange={(date) =>
              form.setFieldValue(
                'purchase_date',
                date?.toISOString().split('T')[0] || ''
              )
            }
            dateFormat="yyyy-MM-dd"
            placeholderText="Select purchase date"
          />
        </div>

        {/* Warranty Expiry */}
        <div>
          <label>Warranty Expiry</label>
          <DatePicker
            selected={warranty_expiry ? new Date(warranty_expiry) : null}
            onChange={(date) =>
              form.setFieldValue(
                'warranty_expiry',
                date?.toISOString().split('T')[0] || ''
              )
            }
            dateFormat="yyyy-MM-dd"
            placeholderText="Select expiry date"
          />
        </div>

        {/* Configuration */}
        <form.Field name="configuration">
          {(field) => (
            <div>
              <label>Configuration</label>
              <textarea
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.errors && <p className="error">{field.state.meta.errors}</p>}
            </div>
          )}
        </form.Field>

        {/* Selects */}
        <form.Field name="department_id">
          {(field) => (
            <AsyncSelectInput
              field={field}
              options={departments || []}
              placeholder="Select Department"
            />
          )}
        </form.Field>

        <form.Field name="location_id">
          {(field) => (
            <AsyncSelectInput
              field={field}
              options={locations || []}
              placeholder="Select Location"
            />
          )}
        </form.Field>

        <form.Field name="category_id">
          {(field) => (
            <AsyncSelectInput
              field={field}
              options={categories || []}
              placeholder="Select Category"
            />
          )}
        </form.Field>

        <form.Field name="assigned_to">
          {(field) => (
            <AsyncSelectInput
              field={field}
              options={users || []}
              placeholder="Assign To"
            />
          )}
        </form.Field>

        <form.Field name="status_id">
          {(field) => (
            <AsyncSelectInput
              field={field}
              options={statuses || []}
              placeholder="Select Status"
            />
          )}
        </form.Field>

        <button type="submit" disabled={createAsset.isPending}>
          {createAsset.isPending ? 'Creating...' : 'Create Asset'}
        </button>
      </form>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        contentLabel="Asset Created"
      >
        <h2>Asset Created</h2>
        {createdAsset && (
          <ul>
            {Object.entries(createdAsset).map(([key, val]) => (
              <li key={key}>
                <strong>{key}:</strong> {val}
              </li>
            ))}
          </ul>
        )}
        <button onClick={() => setModalOpen(false)}>Close</button>
      </Modal>
    </div>
  );
};

export default AddAssetPage;
