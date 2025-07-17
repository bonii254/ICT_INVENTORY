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
import AsyncSelectInput from "../../../../helpers/AsyncSelectInput";
import { useApiPost } from "../../../../helpers/api_helper";
import { useAssetOptions } from "../../../../hooks/useAssetOptions";

const userSchema = z.object({
  fullname: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  department_id: z.number().min(1, "Select a department"),
  role_id: z.number().min(1, "Select a role"),
});

type User = {
  fullname: string;
  email: string;
  password: string;
  department_id: number;
  role_id: number;
};

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: { username: string }) => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [createdUser, setCreatedUser] = useState<Partial<User> | null>(null);
  const { departments = [], roles = [] } = useAssetOptions() as any;

  const createUser = useApiPost<{ user: User }, z.infer<typeof userSchema>>(
    "/auth/register",
    (res) => {
      setCreatedUser(res.user);
      form.reset();
      onSuccess?.({ username: res.user.fullname });
      toast.success("✅ User registered successfully.");
    },
    (err) => {
      let msg = "User registration failed";
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
      fullname: "",
      email: "",
      password: "",
      department_id: 0,
      role_id: 0,
    },
    onSubmit: async ({ value, formApi }) => {
      const result = userSchema.safeParse(value);
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
      createUser.mutate(result.data);
    },
  });

  const handleClose = () => {
    form.reset();
    setCreatedUser(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} toggle={handleClose} centered>
      <ModalHeader toggle={handleClose}>Add New User</ModalHeader>
      <ModalBody>
        <form onSubmit={form.handleSubmit} className="row gy-3">
          <form.Field name="fullname">
            {(field) => (
              <div className="col-12">
                <label className="form-label">Full Name</label>
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

          <form.Field name="email">
            {(field) => (
              <div className="col-12">
                <label className="form-label">Email</label>
                <input
                  type="email"
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

          <form.Field name="password">
            {(field) => (
              <div className="col-12">
                <label className="form-label">Password</label>
                <input
                  type="password"
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

          <form.Field name="department_id">
            {(field) => (
              <div className="col-12">
                <label className="form-label">Select Department</label>
                <AsyncSelectInput
                  field={field}
                  options={departments}
                  placeholder="Search or select department"
                  isSearchable={true}
                />
              </div>
            )}
          </form.Field>

          <form.Field name="role_id">
            {(field) => (
              <div className="col-12">
                <label className="form-label">Select Role</label>
                <AsyncSelectInput
                  field={field}
                  options={roles}
                  placeholder="Search or select role"
                  isSearchable={true}
                />
              </div>
            )}
          </form.Field>
        </form>

        {createdUser && (
          <div className="mt-4 alert alert-success">
            <h5>✅ User Registered</h5>
            <ul className="mb-0">
              <li>
                <strong>Name:</strong> {createdUser.fullname}
              </li>
              <li>
                <strong>Email:</strong> {createdUser.email}
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
          disabled={createUser.isPending}
        >
          {createUser.isPending ? <Spinner size="sm" /> : "Add User"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddUserModal;
