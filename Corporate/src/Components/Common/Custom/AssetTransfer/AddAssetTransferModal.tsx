import React from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
} from "reactstrap";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { toast } from "react-toastify";
import AsyncSelectInput from "../../../../helpers/AsyncSelectInput";
import { useApiPost } from "../../../../helpers/api_helper";
import { useAssetTransferOptions } from "../../../../hooks/useAssetTransferOptions";

const transferSchema = z.object({
  asset_id: z.number().min(1, "Select an asset"),
  to_location_id: z.number().min(1, "Select a location"),
  transferred_to: z.number().min(1, "Select a recipient"),
  notes: z.string().min(1, "Notes are required"),
});

type AssetTransferForm = z.infer<typeof transferSchema>;

interface AddAssetTransferProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddAssetTransfer: React.FC<AddAssetTransferProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { assets, users, locations, isLoading } = useAssetTransferOptions();

  const transferAsset = useApiPost<{ assettransfer: any }, AssetTransferForm>(
    "/register/assettransfer",
    (res) => {
      toast.success("✅ Asset transferred successfully");
      form.reset();
      onSuccess?.();
    },
    (err) => {
      const error =
        err?.response?.data?.error ||
        err?.response?.data?.errors ||
        err?.message ||
        "Transfer failed";
      toast.error(`❌ ${JSON.stringify(error)}`);
    },
  );

  const form = useForm({
    defaultValues: {
      asset_id: 0,
      to_location_id: 0,
      transferred_to: 0,
      notes: "",
    },
    onSubmit: async ({ value, formApi }) => {
      const result = transferSchema.safeParse(value);
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
      transferAsset.mutate(result.data);
    },
  });

  return (
    <Modal isOpen={isOpen} toggle={onClose} centered>
      <ModalHeader toggle={onClose}>New Asset Transfer</ModalHeader>
      <ModalBody>
        <form onSubmit={form.handleSubmit} className="row gy-3">
          <form.Field name="asset_id">
            {(field) => (
              <div className="col-12">
                <label className="form-label">Select Asset</label>
                <AsyncSelectInput
                  field={field}
                  options={assets}
                  placeholder="Choose asset"
                  isSearchable
                />
              </div>
            )}
          </form.Field>

          <form.Field name="to_location_id">
            {(field) => (
              <div className="col-12">
                <label className="form-label">To Location</label>
                <AsyncSelectInput
                  field={field}
                  options={locations}
                  placeholder="Select location"
                  isSearchable
                />
              </div>
            )}
          </form.Field>

          <form.Field name="transferred_to">
            {(field) => (
              <div className="col-12">
                <label className="form-label">Transfer To (User)</label>
                <AsyncSelectInput
                  field={field}
                  options={users}
                  placeholder="Select user"
                  isSearchable
                />
              </div>
            )}
          </form.Field>

          <form.Field name="notes">
            {(field) => (
              <div className="col-12">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>
        </form>
      </ModalBody>

      <ModalFooter>
        <Button color="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          color="primary"
          onClick={() => form.handleSubmit()}
          disabled={transferAsset.isPending}
        >
          {transferAsset.isPending ? <Spinner size="sm" /> : "Transfer Asset"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddAssetTransfer;
