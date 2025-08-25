import React, { useEffect, useState } from "react";
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
import { useQueryClient } from "@tanstack/react-query";
import DatePicker from "react-datepicker";
import { z } from "zod";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-datepicker/dist/react-datepicker.css";

import { updateAssetSchema } from "../../../../schemas/assetSchema";
import { useAssetOptions } from "../../../../hooks/useAssetOptions";
import { useApiPut } from "../../../../helpers/api_helper";
import AsyncSelectInput from "../../../../helpers/AsyncSelectInput";

import AddDepartmentModal from "../Department/AddDepartmentModal";
import AddCategoryModal from "../Category/AddCategoryModal";
import AddLocationModal from "../Location/AddLocationModal";
import AddUserModal from "../User/AddUserModal";

type Option = { label: string; value: number };

interface EditAssetModalProps {
  isOpen: boolean;
  toggle: () => void;
  asset: any | null;
  onEditSuccess: () => void;
}

const EditAssetModal: React.FC<EditAssetModalProps> = ({
  isOpen,
  toggle,
  asset,
  onEditSuccess,
}) => {
  const [depModalOpen, setDepModalOpen] = useState(false);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [locModalOpen, setLocModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);

  const { departments, locations, statuses, users, categories, refetch } =
    useAssetOptions();

  // mutation for update
  const updateAsset = useApiPut<z.infer<typeof updateAssetSchema>>(
    asset ? `/update/asset/${asset.id}` : "",
    () => {
      toast.success("✅ Asset updated successfully.");
      onEditSuccess();
      form.reset();
    },
    (err) => {
      let msg = "Asset update failed";
      if (err?.response?.data?.error) {
        const error = err.response.data.error;
        if (typeof error === "string") msg = error;
        else if (typeof error === "object") {
          msg = Object.entries(error)
            .map(
              ([field, msgs]) => `${field}: ${(msgs as string[]).join(", ")}`,
            )
            .join("\n");
        }
      } else if (err?.message) {
        msg = err.message;
      }
      toast.error(`❌ ${msg}`, { position: "top-center", autoClose: 5000 });
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
      const result = updateAssetSchema.safeParse(value);
      if (!result.success) {
        const zodErrors = result.error.flatten().fieldErrors;
        (Object.keys(zodErrors) as (keyof typeof zodErrors)[]).forEach(
          (key) => {
            const message = zodErrors[key]?.[0];
            if (message) {
              formApi.setFieldMeta(key, (meta) => ({
                ...meta,
                error: message,
                isTouched: true,
              }));
            }
          },
        );
        return;
      }
      if (asset) {
        updateAsset.mutate(result.data);
      }
    },
  });

  const { purchase_date, warranty_expiry } = useStore(
    form.baseStore,
    (s: any) => ({
      purchase_date: s.values.purchase_date,
      warranty_expiry: s.values.warranty_expiry,
    }),
  );

  // ✅ hydrate form when asset changes
  useEffect(() => {
    if (asset && isOpen) {
      form.setFieldValue("serial_number", asset.serial_number || "");
      form.setFieldValue("model_number", asset.model_number || "");
      form.setFieldValue("purchase_date", asset.purchase_date || "");
      form.setFieldValue("warranty_expiry", asset.warranty_expiry || "");
      form.setFieldValue("configuration", asset.configuration || "");
      form.setFieldValue("department_id", asset.department_id || 0);
      form.setFieldValue("location_id", asset.location_id || 0);
      form.setFieldValue("category_id", asset.category_id || 0);
      form.setFieldValue("assigned_to", asset.assigned_to || 0);
      form.setFieldValue("status_id", asset.status_id || 0);
    }
  }, [asset, isOpen]);

  return (
    <>
      <Modal isOpen={isOpen} toggle={toggle} centered size="lg" fade>
        <ModalHeader toggle={toggle}>Edit Asset</ModalHeader>
        <ModalBody>
          <form onSubmit={form.handleSubmit} className="row gy-3">
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
                showYearDropdown
                showMonthDropdown
                scrollableYearDropdown
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
                showYearDropdown
                showMonthDropdown
                scrollableYearDropdown
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

            {/* Selects with Add New buttons */}
            <form.Field name="department_id">
              {(field) => (
                <div className="col-md-6">
                  <label className="form-label d-flex justify-content-between">
                    <span>Select Department</span>
                    <Button
                      color="link"
                      size="sm"
                      onClick={() => setDepModalOpen(true)}
                    >
                      + Add New
                    </Button>
                  </label>
                  <AsyncSelectInput
                    field={field}
                    options={departments || []}
                    placeholder="Select Department"
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="location_id">
              {(field) => (
                <div className="col-md-6">
                  <label className="form-label d-flex justify-content-between">
                    <span>Select Location</span>
                    <Button
                      color="link"
                      size="sm"
                      onClick={() => setLocModalOpen(true)}
                    >
                      + Add New
                    </Button>
                  </label>
                  <AsyncSelectInput
                    field={field}
                    options={locations || []}
                    placeholder="Select Location"
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="category_id">
              {(field) => (
                <div className="col-md-6">
                  <label className="form-label d-flex justify-content-between">
                    <span>Select Category</span>
                    <Button
                      color="link"
                      size="sm"
                      onClick={() => setCatModalOpen(true)}
                    >
                      + Add New
                    </Button>
                  </label>
                  <AsyncSelectInput
                    field={field}
                    options={categories || []}
                    placeholder="Select Category"
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="assigned_to">
              {(field) => (
                <div className="col-md-6">
                  <label className="form-label d-flex justify-content-between">
                    <span>Assign To</span>
                    <Button
                      color="link"
                      size="sm"
                      onClick={() => setUserModalOpen(true)}
                    >
                      + Add New
                    </Button>
                  </label>
                  <AsyncSelectInput
                    field={field}
                    options={users || []}
                    placeholder="Assign To"
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="status_id">
              {(field) => (
                <AsyncSelectInput
                  className="col-md-6"
                  field={field}
                  options={statuses || []}
                  placeholder="Select Status"
                  label="Select Status"
                />
              )}
            </form.Field>
          </form>
        </ModalBody>

        <ModalFooter>
          <Button color="secondary" onClick={toggle}>
            Cancel
          </Button>
          <Button
            type="submit"
            color="primary"
            onClick={() => form.handleSubmit()}
            disabled={updateAsset.isPending}
          >
            {updateAsset.isPending ? <Spinner size="sm" /> : "Update Asset"}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Linked modals */}
      <AddDepartmentModal
        isOpen={depModalOpen}
        onClose={() => setDepModalOpen(false)}
        onSuccess={() => refetch?.()}
      />
      <AddCategoryModal
        isOpen={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        onSuccess={() => refetch?.()}
      />
      <AddLocationModal
        isOpen={locModalOpen}
        onClose={() => setLocModalOpen(false)}
        onSuccess={() => refetch?.()}
      />
      <AddUserModal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        onSuccess={() => refetch?.()}
      />
    </>
  );
};

export default EditAssetModal;
