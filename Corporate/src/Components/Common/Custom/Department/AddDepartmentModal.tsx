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
import { toast } from "react-toastify";
import { z } from "zod";

import { departmentSchema } from "../../../../schemas/departmentSchema";
import { useApiPost } from "../../../../helpers/api_helper";

import "react-toastify/dist/ReactToastify.css";

type Department = {
  name: string;
};

interface AddDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newDep: Department) => void;
}

const AddDepartmentModal: React.FC<AddDepartmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [createdDepartment, setCreatedDepartment] = useState<Department | null>(
    null,
  );

  const createDepartment = useApiPost<
    { Department: Department },
    z.infer<typeof departmentSchema>
  >(
    "/register/department",
    (res) => {
      setCreatedDepartment(res.Department);
      form.reset();
      onSuccess?.(res.Department);
      toast.success("✅ Department registered successfully.");
    },
    (err) => {
      let msg = "Department registration failed";
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

      console.error("Department registration failed:", err);
    },
  );

  const form = useForm({
    defaultValues: {
      name: "",
    },
    onSubmit: async ({ value, formApi }) => {
      const result = departmentSchema.safeParse(value);
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

      createDepartment.mutate(result.data);
    },
  });

  const handleClose = () => {
    form.reset();
    setCreatedDepartment(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} toggle={handleClose} centered fade>
      <ModalHeader toggle={handleClose}>Register New Department</ModalHeader>
      <ModalBody>
        <form onSubmit={form.handleSubmit} className="row gy-3">
          <form.Field name="name">
            {(field) => (
              <div className="col-12">
                <label className="form-label">Department Name</label>
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
        </form>

        {createdDepartment && (
          <div className="mt-4 alert alert-success">
            <h5>✅ Department Registered</h5>
            <ul className="mb-0">
              <li>
                <strong>Name:</strong> {createdDepartment.name}
              </li>
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
          disabled={createDepartment.isPending}
        >
          {createDepartment.isPending ? <Spinner size="sm" /> : "Register"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddDepartmentModal;
