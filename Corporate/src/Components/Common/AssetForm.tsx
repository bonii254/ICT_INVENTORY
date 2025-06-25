import React, { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
} from "reactstrap";
import { useForm } from "@tanstack/react-form";
import { useStore } from "@tanstack/react-store";
import DatePicker from "react-datepicker";
import { z } from "zod";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-datepicker/dist/react-datepicker.css";
import { assetSchema } from "../../schemas/assetSchema";
import { useAssetOptions } from "../../hooks/useAssetOptions";
import { useApiPost } from "../../helpers/api_helper";
import AsyncSelectInput from "../../helpers/AsyncSelectInput";

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

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddAssetModal: React.FC<AddAssetModalProps> = ({ isOpen, onClose }) => {
  const [createdAsset, setCreatedAsset] = useState<CreatedAsset | null>(null);

  const { departments, locations, statuses, users, categories } =
    useAssetOptions();

  const createAsset = useApiPost<
    { asset: CreatedAsset },
    z.infer<typeof assetSchema>
  >(
    "/register/asset",
    (res) => {
      setCreatedAsset(res.asset);
      form.reset();
      toast.success("✅ Asset created successfully.");
    },
    (err) => {
      let msg = "Asset creation failed";

      if (err?.response?.data?.error) {
        const error = err.response.data.error;
        if (typeof error === "string") {
          msg = error;
        } else if (typeof error === "object") {
          msg = Object.entries(error)
            .map(
              ([field, msgs]) => `${field}: ${(msgs as string[]).join(", ")}`,
            )
            .join("\n");
        }
      } else if (err?.message) {
        msg = err.message;
      }

      toast.error(`❌ ${msg}`, {
        position: "top-center",
        autoClose: 5000,
        theme: "colored",
      });
      console.error("Asset creation failed:", err);
    },
  );

  const form = useForm({
    defaultValues: {
      serial_number: "",
      model_number: "",
      purchase_date: "",
      warranty_expiry: "",
      configuration: "",
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

  const { purchase_date, warranty_expiry } = useStore(
    form.baseStore,
    (s: any) => ({
      purchase_date: s.values.purchase_date,
      warranty_expiry: s.values.warranty_expiry,
    }),
  );

  const handleClose = () => {
    form.reset();
    setCreatedAsset(null);
    onClose();
  };

  return (
    <>
      <Modal isOpen={isOpen} toggle={handleClose} centered size="lg" fade>
        <ModalHeader toggle={handleClose}>Add New Asset</ModalHeader>
        <ModalBody>
          <form onSubmit={form.handleSubmit} className="row gy-3">
            {/* Input fields */}
            <form.Field name="serial_number">
              {(field) => (
                <div className="col-md-6">
                  <label className="form-label">Serial Number</label>
                  <input
                    className="form-control"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="model_number">
              {(field) => (
                <div className="col-md-6">
                  <label className="form-label">Model Number</label>
                  <input
                    className="form-control"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <div className="col-md-6">
              <label className="form-label">Purchase Date</label>
              <DatePicker
                className="form-control"
                selected={purchase_date ? new Date(purchase_date) : null}
                onChange={(date) =>
                  form.setFieldValue(
                    "purchase_date",
                    date?.toISOString().split("T")[0] || "",
                  )
                }
                dateFormat="yyyy-MM-dd"
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Warranty Expiry</label>
              <DatePicker
                className="form-control"
                selected={warranty_expiry ? new Date(warranty_expiry) : null}
                onChange={(date) =>
                  form.setFieldValue(
                    "warranty_expiry",
                    date?.toISOString().split("T")[0] || "",
                  )
                }
                dateFormat="yyyy-MM-dd"
              />
            </div>

            <form.Field name="configuration">
              {(field) => (
                <div className="col-12">
                  <label className="form-label">Configuration</label>
                  <textarea
                    rows={3}
                    className="form-control"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            {/* Selects */}
            <form.Field name="department_id">
              {(field) => (
                <AsyncSelectInput
                  className="col-md-6"
                  field={field}
                  options={departments || []}
                  placeholder="Select Department"
                />
              )}
            </form.Field>

            <form.Field name="location_id">
              {(field) => (
                <AsyncSelectInput
                  className="col-md-6"
                  field={field}
                  options={locations || []}
                  placeholder="Select Location"
                />
              )}
            </form.Field>

            <form.Field name="category_id">
              {(field) => (
                <AsyncSelectInput
                  className="col-md-6"
                  field={field}
                  options={categories || []}
                  placeholder="Select Category"
                />
              )}
            </form.Field>

            <form.Field name="assigned_to">
              {(field) => (
                <AsyncSelectInput
                  className="col-md-6"
                  field={field}
                  options={users || []}
                  placeholder="Assign To"
                />
              )}
            </form.Field>

            <form.Field name="status_id">
              {(field) => (
                <AsyncSelectInput
                  className="col-md-6"
                  field={field}
                  options={statuses || []}
                  placeholder="Select Status"
                />
              )}
            </form.Field>
          </form>

          {createdAsset && (
            <div className="mt-4 alert alert-success">
              <h5>✅ Asset Created</h5>
              <ul className="mb-0">
                {Object.entries(createdAsset).map(([key, val]) => (
                  <li key={key}>
                    <strong>{key}:</strong> {val}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button type="button" color="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            color="primary"
            onClick={() => form.handleSubmit()}
            disabled={createAsset.isPending}
          >
            {createAsset.isPending ? <Spinner size="sm" /> : "Create Asset"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default AddAssetModal;
