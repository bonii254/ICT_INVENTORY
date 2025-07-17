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
import { departmentSchema } from "../../../../schemas/departmentSchema";

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

  const registerDepartment = useApiPost<
    { department: Department },
    z.infer<typeof departmentSchema>
  >(
    "/register/department",
    (res) => {
      const dep = res?.department;
      if (!dep || !dep.name) {
        toast.warning(
          "✅ Department created, but couldn't read name from response.",
        );
        onSuccess?.({ name: "Unknown" });
        return;
      }

      setCreatedDepartment(dep);
      toast.success(`✅ Department "${dep.name}" registered.`);
      form.reset();
      onSuccess?.(dep);
      console.log("Department response:", res);
    },
    (err) => {
      let msg = "Department registration failed";
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
      registerDepartment.mutate(result.data);
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
      </ModalBody>

      <ModalFooter>
        <Button type="button" color="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          color="primary"
          onClick={() => form.handleSubmit()}
          disabled={registerDepartment.isPending}
        >
          {registerDepartment.isPending ? <Spinner size="sm" /> : "Register"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddDepartmentModal;
