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
import { useApiPost } from "../../../../helpers/api_helper";
import { softwareSchema } from "../../../../schemas/softwareSchema";

import "react-toastify/dist/ReactToastify.css";
import "react-datepicker/dist/react-datepicker.css";

type Software = {
  name: string;
  version?: string;
  license_key?: string;
  expiry_date?: string;
};

interface AddSoftwareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddSoftwareModal: React.FC<AddSoftwareModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [createdSoftware, setCreatedSoftware] = useState<Software | null>(null);

  const createSoftware = useApiPost<
    { Software: Software },
    z.infer<typeof softwareSchema>
  >(
    "/register/software",
    (res) => {
      setCreatedSoftware(res.Software);
      form.reset();
      toast.success("✅ Software registered successfully.");
    },
    (err) => {
      let msg = "Software registration failed";

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
      console.error("Software registration failed:", err);
    },
  );

  const form = useForm({
    defaultValues: {
      name: "",
      version: "",
      license_key: "",
      expiry_date: "",
    },
    onSubmit: async ({ value, formApi }) => {
      const result = softwareSchema.safeParse(value);
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
      createSoftware.mutate(result.data);
    },
  });

  const { expiry_date } = useStore(form.baseStore, (s: any) => ({
    expiry_date: s.values.expiry_date,
  }));

  const handleClose = () => {
    form.reset();
    setCreatedSoftware(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} toggle={handleClose} centered fade>
      <ModalHeader toggle={handleClose}>Register New Software</ModalHeader>
      <ModalBody>
        <form onSubmit={form.handleSubmit} className="row gy-3">
          <form.Field name="name">
            {(field) => (
              <div className="col-12">
                <label className="form-label">Software Name</label>
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

          <form.Field name="version">
            {(field) => (
              <div className="col-md-6">
                <label className="form-label">Version</label>
                <input
                  className="form-control"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="license_key">
            {(field) => (
              <div className="col-md-6">
                <label className="form-label">License Key</label>
                <input
                  className="form-control"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>

          <div className="col-md-6">
            <label className="form-label">Expiry Date</label>
            <DatePicker
              className="form-control"
              selected={expiry_date ? new Date(expiry_date) : null}
              onChange={(date) =>
                form.setFieldValue(
                  "expiry_date",
                  date?.toISOString().split("T")[0] || "",
                )
              }
              dateFormat="yyyy-MM-dd"
            />
          </div>
        </form>

        {createdSoftware && (
          <div className="mt-4 alert alert-success">
            <h5>✅ Software Registered</h5>
            <ul className="mb-0">
              {Object.entries(createdSoftware).map(([key, val]) => (
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
          disabled={createSoftware.isPending}
        >
          {createSoftware.isPending ? <Spinner size="sm" /> : "Register"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddSoftwareModal;
