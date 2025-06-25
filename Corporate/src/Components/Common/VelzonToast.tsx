import React, { useEffect } from "react";

interface VelzonToastProps {
  message: string;
  type?: "danger" | "success" | "info" | "warning";
  id?: string;
}

const toastColors = {
  danger: "text-bg-danger",
  success: "text-bg-success",
  info: "text-bg-info",
  warning: "text-bg-warning",
};

const toastIcons = {
  danger: "ri-close-circle-line",
  success: "ri-checkbox-circle-line",
  info: "ri-information-line",
  warning: "ri-alert-line",
};

const VelzonToast: React.FC<VelzonToastProps> = ({
  message,
  type = "info",
  id = "velzon-toast",
}) => {
  useEffect(() => {
    const toastEl = document.getElementById(id);
    if (toastEl) {
      const toast = new (window as any).bootstrap.Toast(toastEl);
      toast.show();
    }
  }, [id]);

  const bgClass = toastColors[type] || "text-bg-info";
  const iconClass = toastIcons[type] || "ri-information-line";

  return (
    <div
      className={`toast align-items-center ${bgClass} border-0 position-fixed top-0 end-0 m-4 show`}
      id={id}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      style={{ zIndex: 9999 }}
    >
      <div className="d-flex">
        <div className="toast-body text-white fw-semibold">
          <i className={`${iconClass} me-2`} />
          {message}
        </div>
        <button
          type="button"
          className="btn-close btn-close-white me-2 m-auto"
          data-bs-dismiss="toast"
          aria-label="Close"
        />
      </div>
    </div>
  );
};

export default VelzonToast;
