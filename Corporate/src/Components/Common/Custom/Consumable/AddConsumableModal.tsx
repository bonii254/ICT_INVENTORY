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

import { useApiPost } from "../../../../helpers/api_helper";
import {
  consumableSchema,
  Consumable,
} from "../../../../schemas/consumableSchema";

type AddConsumableModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const AddConsumableModal: React.FC<AddConsumableModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [created, setCreated] = useState<Consumable | null>(null);

  const createConsumable = useApiPost<
    { [key: string]: Consumable },
    z.infer<typeof consumableSchema>
  >(
    "/register/consumable",
    (res) => {
      const firstKey = Object.keys(res).find((k) => k !== "message");
      setCreated(res[firstKey as keyof typeof res] as Consumable);
      form.reset();
      toast.success("✅ Consumable registered successfully.");
    },
    (err) => {
      let msg = "Consumable registration failed";
      if (err?.response?.data?.error) {
        const error = err.response.data.error;
        if (typeof error === "string") {
          msg = error;
        } else if (typeof error === "object") {
          msg = Object.entries(error)
            .map(([k, v]) => `${k}: ${(v as string[]).join(", ")}`)
            .join("\n");
        }
      }
      toast.error(`❌ ${msg}`, {
        position: "top-center",
        autoClose: 5000,
        theme: "colored",
      });
      console.error("Consumable registration failed:", err);
    },
  );

  const form = useForm({
    defaultValues: {
      name: "",
      category: "",
      brand: "",
      model: "",
      quantity: 1,
      unit_of_measure: "",
      reorder_level: 0,
    },
    onSubmit: async ({ value, formApi }) => {
      const result = consumableSchema.safeParse(value);
      if (!result.success) {
        const zodErrors = result.error.flatten().fieldErrors;
        for (const key in zodErrors) {
          const typedKey = key as keyof typeof zodErrors;
          const msg = zodErrors[typedKey]?.[0];
          if (msg) {
            formApi.setFieldMeta(typedKey, (meta) => ({
              ...meta,
              error: msg,
              isTouched: true,
            }));
          }
        }
        return;
      }
      createConsumable.mutate(result.data);
    },
  });

  const handleClose = () => {
    setCreated(null);
    form.reset();
    onClose();
  };

  const fields = [
    { name: "name", label: "Name" },
    { name: "category", label: "Category" },
    { name: "brand", label: "Brand" },
    { name: "model", label: "Model" },
    { name: "unit_of_measure", label: "Unit of Measure" },
  ] as const;

  return (
    <Modal isOpen={isOpen} toggle={handleClose} centered fade>
      <ModalHeader toggle={handleClose}>Register New Consumable</ModalHeader>
      <ModalBody>
        <form onSubmit={form.handleSubmit} className="row gy-3">
          {fields.map(({ name, label }) => (
            <form.Field key={name} name={name}>
              {(field) => (
                <div className="col-md-6">
                  <label className="form-label">{label}</label>
                  <input
                    className="form-control"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors && (
                    <small className="text-danger">
                      {field.state.meta.errors}
                    </small>
                  )}
                </div>
              )}
            </form.Field>
          ))}

          <form.Field name="quantity">
            {(field) => (
              <div className="col-md-6">
                <label className="form-label">Quantity</label>
                <input
                  type="number"
                  className="form-control"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                />
                {field.state.meta.errors && (
                  <small className="text-danger">
                    {field.state.meta.errors}
                  </small>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="reorder_level">
            {(field) => (
              <div className="col-md-6">
                <label className="form-label">Reorder Level</label>
                <input
                  type="number"
                  className="form-control"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                />
                {field.state.meta.errors && (
                  <small className="text-danger">
                    {field.state.meta.errors}
                  </small>
                )}
              </div>
            )}
          </form.Field>
        </form>

        {created && (
          <div className="mt-4 alert alert-success">
            <h5>✅ Consumable Registered</h5>
            <ul className="mb-0">
              {Object.entries(created).map(([key, val]) => (
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
          disabled={createConsumable.isPending}
        >
          {createConsumable.isPending ? <Spinner size="sm" /> : "Register"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddConsumableModal;
