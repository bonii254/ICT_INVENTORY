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

const locationSchema = z.object({
  name: z.string().min(1, "Location name is required"),
  address: z.string().optional(),
});

type Location = {
  name: string;
  address?: string;
};

interface AddLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (location: Location) => void;
}

const AddLocationModal: React.FC<AddLocationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [createdLocation, setCreatedLocation] = useState<Location | null>(null);

  const createLocation = useApiPost<
    { Location: Location },
    z.infer<typeof locationSchema>
  >(
    "/register/location",
    (res) => {
      setCreatedLocation(res.Location);
      form.reset();
      onSuccess?.(res.Location);
      toast.success("✅ Location registered successfully.");
    },
    (err) => {
      let msg = "Location registration failed";
      if (err?.response?.data?.error) {
        const error = err.response.data.error;
        msg = typeof error === "string" ? error : JSON.stringify(error);
      } else if (err?.message) {
        msg = err.message;
      }

      toast.error(`❌ ${msg}`, {
        position: "top-center",
        autoClose: 5000,
        theme: "colored",
      });
    },
  );

  const form = useForm({
    defaultValues: {
      name: "",
      address: "",
    },
    onSubmit: async ({ value, formApi }) => {
      const result = locationSchema.safeParse(value);
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
      createLocation.mutate(result.data);
    },
  });

  const handleClose = () => {
    form.reset();
    setCreatedLocation(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} toggle={handleClose} centered>
      <ModalHeader toggle={handleClose}>Add New Location</ModalHeader>
      <ModalBody>
        <form onSubmit={form.handleSubmit} className="row gy-3">
          <form.Field name="name">
            {(field) => (
              <div className="col-12">
                <label className="form-label">Location Name</label>
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

          <form.Field name="address">
            {(field) => (
              <div className="col-12">
                <label className="form-label">Address</label>
                <textarea
                  className="form-control"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>
        </form>

        {createdLocation && (
          <div className="mt-4 alert alert-success">
            <h5>✅ Location Registered</h5>
            <ul className="mb-0">
              <li>
                <strong>Name:</strong> {createdLocation.name}
              </li>
              {createdLocation.address && (
                <li>
                  <strong>Address:</strong> {createdLocation.address}
                </li>
              )}
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
          disabled={createLocation.isPending}
        >
          {createLocation.isPending ? <Spinner size="sm" /> : "Add Location"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddLocationModal;
