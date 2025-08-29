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

import { assetUpdateSchema } from "../../../../schemas/assetSchema";
import { useAssetOptions } from "../../../../hooks/useAssetOptions";
import { useApiPut } from "../../../../helpers/api_helper";
import AsyncSelectInput from "../../../../helpers/AsyncSelectInput";

import AddDepartmentModal from "../Department/AddDepartmentModal";
import AddCategoryModal from "../Category/AddCategoryModal";
import AddLocationModal from "../Location/AddLocationModal";
import AddUserModal from "../User/AddUserModal";

// ✅ Asset type
type Asset = {
  id: number;
  serial_number?: string;
  model_number?: string;
  purchase_date?: string;
  warranty_expiry?: string;
  configuration?: string;
  department_id?: number;
  location_id?: number;
  category_id?: number;
  assigned_to?: number;
  status_id?: number;
};

export type AssetFormValues = Omit<Asset, "id">;

interface UpdateAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
  onEditSuccess?: () => void;
}

const UpdateAssetModal: React.FC<UpdateAssetModalProps> = ({
  isOpen,
  onClose,
  asset,
  onEditSuccess,
}) => {
  const [depModalOpen, setDepModalOpen] = useState(false);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [locModalOpen, setLocModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);

  const queryClient = useQueryClient();
  const { departments, locations, statuses, users, categories, refetch } =
    useAssetOptions();

  const updateAsset = useApiPut<Partial<Asset>, any>(
    asset?.id ? `/update/asset/${asset.id}` : "",
    () => {
      toast.success("✅ Asset updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      onClose();
      if (onEditSuccess) onEditSuccess();
    },
    (err) => {
      let msg = "Asset update failed";

      if (err?.response?.data?.error) {
        const error = err.response.data.error;
        if (typeof error === "string") {
          msg = error;
        } else {
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
      console.error("Asset update failed:", err);
    },
  );

  // ✅ Strongly typed form with `undefined` defaults
  const form = useForm<
    AssetFormValues,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >({
    defaultValues: {
      serial_number: undefined,
      model_number: undefined,
      purchase_date: undefined,
      warranty_expiry: undefined,
      configuration: undefined,
      department_id: undefined,
      location_id: undefined,
      category_id: undefined,
      assigned_to: undefined,
      status_id: undefined,
    },
    onSubmit: async ({ value }) => {
      const result = assetUpdateSchema.safeParse(value);
      if (!result.success) {
        // show validation errors
        toast.error("❌ Validation failed. Please check inputs.", {
          position: "top-center",
          autoClose: 4000,
          theme: "colored",
        });
        return;
      }

      const payload: Partial<Asset> = {};

      if (asset) {
        (Object.keys(result.data) as (keyof AssetFormValues)[]).forEach(
          (key) => {
            const newVal = result.data[key];
            const oldVal = asset[key];
            // ✅ Only include fields that changed AND are defined
            if (newVal !== undefined && newVal !== "" && newVal !== oldVal) {
              payload[key] = newVal as any;
            }
          },
        );
      } else {
        Object.assign(payload, result.data);
      }

      // ✅ If no changes, don't call API
      if (Object.keys(payload).length === 0) {
        toast.info("No changes detected.", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored",
        });
        return;
      }

      updateAsset.mutate(payload);
    },
  });

  // ✅ Prefill form when editing existing asset
  useEffect(() => {
    if (asset) {
      form.reset({
        serial_number: asset.serial_number || undefined,
        model_number: asset.model_number || undefined,
        purchase_date: asset.purchase_date || undefined,
        warranty_expiry: asset.warranty_expiry || undefined,
        configuration: asset.configuration || undefined,
        department_id: asset.department_id || undefined,
        location_id: asset.location_id || undefined,
        category_id: asset.category_id || undefined,
        assigned_to: asset.assigned_to || undefined,
        status_id: asset.status_id || undefined,
      });
    }
  }, [asset, form]);

  const { purchase_date, warranty_expiry } = useStore(form.baseStore, (s) => ({
    purchase_date: s.values.purchase_date,
    warranty_expiry: s.values.warranty_expiry,
  }));

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <>
      <Modal isOpen={isOpen} toggle={handleClose} centered size="lg" fade>
        <ModalHeader toggle={handleClose}>Update Asset</ModalHeader>
        <ModalBody>
          <form onSubmit={form.handleSubmit} className="row gy-3">
            {(
              ["serial_number", "model_number", "configuration"] as Array<
                keyof AssetFormValues
              >
            ).map((fieldName) => (
              <form.Field key={fieldName} name={fieldName}>
                {(field) => (
                  <div
                    className={
                      fieldName === "configuration" ? "col-12" : "col-md-6"
                    }
                  >
                    <label className="form-label">
                      {fieldName.replace("_", " ").toUpperCase()}
                    </label>
                    {fieldName === "configuration" ? (
                      <textarea
                        rows={3}
                        className="form-control"
                        value={field.state.value || ""}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    ) : (
                      <input
                        className="form-control"
                        value={field.state.value || ""}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    )}
                  </div>
                )}
              </form.Field>
            ))}

            {/* Date pickers */}
            {[
              {
                name: "purchase_date",
                label: "Purchase Date",
                value: purchase_date,
              },
              {
                name: "warranty_expiry",
                label: "Warranty Expiry",
                value: warranty_expiry,
              },
            ].map(({ name, label, value }) => (
              <div className="col-md-6" key={name}>
                <label className="form-label">{label}</label>
                <DatePicker
                  className="form-control"
                  selected={value ? new Date(value) : null}
                  onChange={(date) =>
                    form.setFieldValue(
                      name as keyof AssetFormValues,
                      date?.toISOString().split("T")[0] || undefined,
                    )
                  }
                  dateFormat="yyyy-MM-dd"
                  showYearDropdown
                  showMonthDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={100}
                />
              </div>
            ))}

            {/* Select dropdowns */}
            {[
              {
                name: "department_id",
                label: "Department",
                options: departments,
                modalOpen: depModalOpen,
                setModalOpen: setDepModalOpen,
              },
              {
                name: "location_id",
                label: "Location",
                options: locations,
                modalOpen: locModalOpen,
                setModalOpen: setLocModalOpen,
              },
              {
                name: "category_id",
                label: "Category",
                options: categories,
                modalOpen: catModalOpen,
                setModalOpen: setCatModalOpen,
              },
              {
                name: "assigned_to",
                label: "User",
                options: users,
                modalOpen: userModalOpen,
                setModalOpen: setUserModalOpen,
              },
            ].map(({ name, label, modalOpen, setModalOpen, options }) => (
              <form.Field key={name} name={name as keyof AssetFormValues}>
                {(field) => (
                  <div className="col-md-6">
                    <label className="form-label d-flex justify-content-between">
                      <span>Select {label}</span>
                      <Button
                        color="link"
                        size="sm"
                        onClick={() => setModalOpen(true)}
                      >
                        + Add New
                      </Button>
                    </label>
                    <AsyncSelectInput
                      field={field}
                      options={options || []}
                      placeholder={`Select ${label}`}
                    />
                  </div>
                )}
              </form.Field>
            ))}

            {/* Status */}
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
          <Button color="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={() => form.handleSubmit()}
            disabled={updateAsset.isPending}
          >
            {updateAsset.isPending ? <Spinner size="sm" /> : "Update Asset"}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Sub-modals */}
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

export default UpdateAssetModal;
