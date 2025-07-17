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
import { useAssetOptions } from "../../../../hooks/useAssetOptions";

const transactionSchema = z.object({
  quantity: z.number().min(1, "Quantity must be at least 1"),
  department_id: z.number().min(1, "Select a department"),
  transaction_type: z.enum(["IN", "OUT"]),
});

type TransactionForm = z.infer<typeof transactionSchema>;

interface Consumable {
  id: number;
  name: string;
}

interface StockTransactionModalProps {
  isOpen: boolean;
  toggle: () => void;
  consumable: Consumable;
  onSuccess?: () => void;
}

const StockTransactionModal: React.FC<StockTransactionModalProps> = ({
  isOpen,
  toggle,
  consumable,
  onSuccess,
}) => {
  const { departments = [] } = useAssetOptions() as any;

  const createTransaction = useApiPost<
    any,
    TransactionForm & { consumable_id: number }
  >(
    "/register/stocktransaction",
    () => {
      form.reset();
      toast.success("✅ Stock transaction registered.");
      onSuccess?.();
      toggle();
    },
    (err) => {
      toast.error(
        err?.message || "❌ Failed to register transaction. Try again.",
        {
          position: "top-center",
          autoClose: 5000,
          theme: "colored",
        },
      );
    },
  );

  const form = useForm({
    defaultValues: {
      quantity: 1,
      department_id: 0,
      transaction_type: "IN" as "IN" | "OUT",
    },
    onSubmit: async ({ value, formApi }) => {
      const parsed = transactionSchema.safeParse(value);
      if (!parsed.success) {
        const errors = parsed.error.flatten().fieldErrors;
        (Object.keys(errors) as (keyof typeof errors)[]).forEach((key) => {
          const msg = errors[key]?.[0];
          if (msg) {
            formApi.setFieldMeta(key, (meta) => ({
              ...meta,
              error: msg,
              isTouched: true,
            }));
          }
        });
        return;
      }

      createTransaction.mutate({
        ...parsed.data,
        consumable_id: consumable.id, // ✅ Injected manually, not in schema
      });
    },
  });

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>Stock Transaction</ModalHeader>
      <ModalBody>
        <form onSubmit={form.handleSubmit} className="row gy-3">
          <div className="col-12">
            <label className="form-label">Consumable</label>
            <input className="form-control" value={consumable.name} disabled />
          </div>

          <form.Field name="transaction_type">
            {(field) => (
              <div className="col-12">
                <label className="form-label">Transaction Type</label>
                <select
                  className="form-select"
                  value={field.state.value}
                  onChange={(e) =>
                    field.handleChange(e.target.value as "IN" | "OUT")
                  }
                >
                  <option value="IN">Check-In</option>
                  <option value="OUT">Check-Out</option>
                </select>
              </div>
            )}
          </form.Field>

          <form.Field name="quantity">
            {(field) => (
              <div className="col-12">
                <label className="form-label">Quantity</label>
                <input
                  type="number"
                  className="form-control"
                  min="1"
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
        </form>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>
        <Button
          type="submit"
          color="primary"
          onClick={() => form.handleSubmit()}
          disabled={createTransaction.status === "pending"}
        >
          {createTransaction.status === "pending" ? (
            <Spinner size="sm" />
          ) : (
            "Submit"
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default StockTransactionModal;
