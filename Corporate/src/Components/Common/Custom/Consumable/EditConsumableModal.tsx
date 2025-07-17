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
import { z } from "zod";
import { toast } from "react-toastify";
import { useApiPut } from "../../../../helpers/api_helper";
import { useQueryClient } from "@tanstack/react-query";

const updateSchema = z.object({
  name: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  unit_of_measure: z.string().optional(),
  reorder_level: z.union([z.number(), z.nan()]).optional(),
});

interface EditConsumableModalProps {
  isOpen: boolean;
  toggle: () => void;
  consumable: any;
}

const EditConsumableModal: React.FC<EditConsumableModalProps> = ({
  isOpen,
  toggle,
  consumable,
}) => {
  const queryClient = useQueryClient();

  const updateConsumable = useApiPut(
    `/update/consumable/${consumable?.id}`,
    () => {
      toast.success("✅ Consumable updated successfully");
      queryClient.invalidateQueries({ queryKey: ["consumables"] });
      toggle();
    },
    (err: any) => {
      let msg = "Update failed";
      if (err?.response?.data?.error) {
        const error = err.response.data.error;
        if (typeof error === "string") {
          msg = error;
        } else if (typeof error === "object") {
          msg = Object.entries(error)
            .map(([k, v]) => `${k}: ${(v as string[]).join(", ")}`)
            .join("\n");
        }
      } else if (err?.message) {
        msg = err.message;
      }
      toast.error(msg);
    },
  );

  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {},
  );

  const form = useForm({
    defaultValues: {},
    onSubmit: async ({ value }) => {
      const payload = Object.entries(value).reduce(
        (acc, [key, val]) => {
          if (touchedFields[key]) acc[key] = val;
          return acc;
        },
        {} as Record<string, any>,
      );

      updateConsumable.mutate(payload);
    },
  });

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>Edit Consumable</ModalHeader>
      <ModalBody>
        <form onSubmit={form.handleSubmit} className="row gy-3">
          {["name", "category", "brand", "model", "unit_of_measure"].map(
            (name) => (
              <form.Field key={name} name={name as any}>
                {(field) => (
                  <div className="col-md-6">
                    <label className="form-label">
                      {name
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </label>
                    <input
                      className="form-control"
                      placeholder={consumable?.[name] || ""}
                      value={
                        typeof field.state.value === "string"
                          ? field.state.value
                          : ""
                      }
                      onChange={(e) => {
                        setTouchedFields((prev) => ({ ...prev, [name]: true }));
                        field.handleChange(e.target.value);
                      }}
                    />
                  </div>
                )}
              </form.Field>
            ),
          )}

          <form.Field name="reorder_level">
            {(field) => (
              <div className="col-md-6">
                <label className="form-label">Reorder Level</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder={consumable?.reorder_level?.toString() || ""}
                  value={
                    typeof field.state.value === "number" ||
                    field.state.value === 0
                      ? field.state.value
                      : ""
                  }
                  onChange={(e) => {
                    setTouchedFields((prev) => ({
                      ...prev,
                      reorder_level: true,
                    }));
                    const val = e.target.value;
                    field.handleChange(val ? Number(val) : undefined);
                  }}
                />
              </div>
            )}
          </form.Field>
        </form>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>
        <Button color="primary" onClick={() => form.handleSubmit()}>
          {updateConsumable.isPending ? <Spinner size="sm" /> : "Update"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default EditConsumableModal;
