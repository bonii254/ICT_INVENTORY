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

import "react-toastify/dist/ReactToastify.css";

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
});

type Category = z.infer<typeof categorySchema>;

type ApiCategoryResponse = {
  category: Category;
};

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (category: Category) => void;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [createdCategory, setCreatedCategory] = useState<Category | null>(null);

  const createCategory = useApiPost<ApiCategoryResponse, Category>(
    "/register/category",
    async (res) => {
      const category = res?.category;

      if (!category || !category.name) {
        toast.error("⚠️ Malformed response: missing category info.");
        return;
      }

      setCreatedCategory(category);
      form.reset();

      toast.success("✅ Category created successfully.");

      await onSuccess?.(category);
    },
    (err) => {
      let msg = "Department registration failed";
      const status = err?.response?.status;

      if (err?.response?.data?.error) {
        const error = err.response.data.error;

        if (typeof error === "string") {
          msg = `${status || "❌"}: ${error}`;
        } else if (typeof error === "object") {
          msg =
            `${status || "❌"}:\n` +
            Object.entries(error)
              .map(
                ([field, msgs]) => `${field}: ${(msgs as string[]).join(", ")}`,
              )
              .join("\n");
        }
      } else if (err?.message) {
        msg = `${status || "❌"}: ${err.message}`;
      }

      toast.error(`❌ ${msg}`, {
        position: "top-center",
        autoClose: 5000,
        theme: "colored",
      });

      console.error("Category creation error:", err);
    },
  );

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
    onSubmit: async ({ value, formApi }) => {
      const result = categorySchema.safeParse(value);
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

      createCategory.mutate(result.data);
    },
  });

  const handleClose = () => {
    form.reset();
    setCreatedCategory(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} toggle={handleClose} centered fade>
      <ModalHeader toggle={handleClose}>Add New Category</ModalHeader>
      <ModalBody>
        <form onSubmit={form.handleSubmit} className="row gy-3">
          <form.Field name="name">
            {(field) => (
              <div className="col-12">
                <label className="form-label">Category Name</label>
                <input
                  type="text"
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

          <form.Field name="description">
            {(field) => (
              <div className="col-12">
                <label className="form-label">Description</label>
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

        {createdCategory && (
          <div className="mt-4 alert alert-success">
            <h5>✅ Category Registered</h5>
            <ul className="mb-0">
              <li>
                <strong>Name:</strong> {createdCategory.name}
              </li>
              {createdCategory.description && (
                <li>
                  <strong>Description:</strong> {createdCategory.description}
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
          disabled={createCategory.isPending}
        >
          {createCategory.isPending ? <Spinner size="sm" /> : "Create Category"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddCategoryModal;
