import React, { useEffect } from "react";
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
import { useApiPut } from "../../../../helpers/api_helper";
import { useAssetTransferOptions } from "../../../../hooks/useAssetTransferOptions";

const editSchema = z.object({
  asset_id: z.number().optional(),
  to_location_id: z.number().optional(),
  transferred_to: z.number().optional(),
  notes: z.string().min(1, "Notes are required"),
});

type EditPayload = z.infer<typeof editSchema>;

interface EditAssetTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  data: {
    id: number;
    asset_id: number;
    to_location_id: number;
    transferred_to: number;
    notes: string;
  };
}

const EditAssetTransferModal: React.FC<EditAssetTransferModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  data,
}) => {
  const { assets, locations, users } = useAssetTransferOptions();

  const updateTransfer = useApiPut(
    `/assettransfer/${data.id}`,
    () => {
      toast.success("✅ Asset transfer updated.");
      onSuccess?.();
      onClose();
    },
    (err) => {
      toast.error(`❌ ${err?.response?.data?.error || err.message}`);
    },
  );

  const form = useForm({
    defaultValues: {
      asset_id: data.asset_id,
      to_location_id: data.to_location_id,
      transferred_to: data.transferred_to,
      notes: data.notes || "",
    },
    onSubmit: async ({ value, formApi }) => {
      const result = editSchema.safeParse(value);
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

      updateTransfer.mutate(result.data);
    },
  });

  useEffect(() => {
    form.reset(); // reset when modal opens
  }, [data]);

  return (
    <Modal isOpen={isOpen} toggle={onClose} centered>
      <ModalHeader toggle={onClose}>Edit Asset Transfer</ModalHeader>
      <ModalBody>
        <form onSubmit={form.handleSubmit} className="row gy-3">
          <form.Field name="asset_id">
            {(field) => (
              <div className="col-12">
                <label className="form-label">Asset</label>
                <AsyncSelectInput
                  field={field}
                  options={assets}
                  placeholder="Select asset"
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
                <label className="form-label">Transferred To</label>
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
          disabled={updateTransfer.isPending}
        >
          {updateTransfer.isPending ? <Spinner size="sm" /> : "Update"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default EditAssetTransferModal;
