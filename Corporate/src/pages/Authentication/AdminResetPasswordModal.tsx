import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Spinner } from "reactstrap";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import apiClient from "../../helpers/api_helper";
import AsyncSelectInput from "../../helpers/AsyncSelectInput"; // Import it, DON'T export it
import { useAssetOptions } from "../../hooks/useAssetOptions";

// 1. ENSURE THIS INTERFACE IS DEFINED
interface AdminResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 2. ENSURE THE COMPONENT USES THE PROPS INTERFACE
const AdminResetPasswordModal: React.FC<AdminResetPasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { users, refetch } = useAssetOptions();

  const form = useForm({
    defaultValues: { user_id: null as number | null },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiClient.post(`/auth/admin/reset-password/${userId}`, {});
      return response.data;
    },
    onSuccess: () => {
      toast.success("✅ Password reset successfully.");
      form.reset();
      onClose();
      refetch?.();
    },
    onError: (err: any) => {
      toast.error(`❌ ${err?.message || "Failed"}`);
    },
  });

  const handleSubmit = () => {
    const userId = form.state.values.user_id;
    if (!userId) return toast.warning("Please select a user");
    mutate(userId);
  };

  return (
    <Modal isOpen={isOpen} toggle={onClose} centered fade>
      <ModalHeader toggle={onClose}>Reset User Password</ModalHeader>
      <ModalBody>
        <form.Field name="user_id">
          {(field) => (
            <AsyncSelectInput
              field={field}
              options={users || []}
              label="Select User"
            />
          )}
        </form.Field>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={onClose}>Cancel</Button>
        <Button color="danger" onClick={handleSubmit} disabled={isPending}>
          {isPending ? <Spinner size="sm" /> : "Reset Password"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

// 3. ENSURE THIS IS THE DEFAULT EXPORT
export default AdminResetPasswordModal;