import React, { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
  Row,
  Col,
  FormGroup,
  Label,
  Input,
  Alert,
} from "reactstrap";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import apiClient from "../../../../helpers/api_helper";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Software {
  id: number;
  name: string;
  version?: string;
  license_key?: string;
  expiry_date?: string;
}

interface EditSoftwareModalProps {
  isOpen: boolean;
  toggle: () => void;
  software: Software | null;
  onEditSuccess?: () => void;
}

const EditSoftwareModal: React.FC<EditSoftwareModalProps> = ({
  isOpen,
  toggle,
  software,
  onEditSuccess,
}) => {
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [formValues, setFormValues] = useState({
    name: "",
    version: "",
    license_key: "",
    expiry_date: "",
  });

  const handleFocus = (field: string) => {
    if (!touchedFields.has(field)) {
      setTouchedFields((prev) => new Set(prev).add(field));
      setFormValues((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormValues({
      name: "",
      version: "",
      license_key: "",
      expiry_date: "",
    });
    setTouchedFields(new Set());
  };

  const { mutate: updateSoftware, isPending } = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.put(`/software/${software!.id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("✅ Software updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["softwares"] });

      resetForm();
      onEditSuccess?.();
      toggle();
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.error ||
        err.message ||
        "Failed to update software.";
      setFormError(typeof msg === "string" ? msg : JSON.stringify(msg));
      toast.error(`❌ ${msg}`);
    },
  });

  const handleSubmit = () => {
    setFormError(null);

    const payload: Record<string, string> = {};
    for (const key of Object.keys(formValues)) {
      if (
        touchedFields.has(key) &&
        formValues[key as keyof typeof formValues]
      ) {
        payload[key] = formValues[key as keyof typeof formValues];
      }
    }

    if (Object.keys(payload).length === 0) {
      setFormError("Please update at least one field.");
      return;
    }

    updateSoftware(payload);
  };

  const handleClose = () => {
    resetForm();
    toggle();
  };

  if (!software) {
    return (
      <Modal isOpen={isOpen} toggle={toggle} centered>
        <ModalHeader toggle={toggle}>Edit Software</ModalHeader>
        <ModalBody>Loading software details...</ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggle}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} toggle={handleClose} centered>
      <ModalHeader toggle={handleClose}>Update Software</ModalHeader>
      <ModalBody>
        {formError && <Alert color="danger">{formError}</Alert>}
        <Row>
          <Col md={6}>
            <FormGroup>
              <Label>Name</Label>
              <Input
                placeholder={software.name}
                value={formValues.name}
                onFocus={() => handleFocus("name")}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </FormGroup>
          </Col>

          <Col md={6}>
            <FormGroup>
              <Label>Version</Label>
              <Input
                placeholder={software.version}
                value={formValues.version}
                onFocus={() => handleFocus("version")}
                onChange={(e) => handleChange("version", e.target.value)}
              />
            </FormGroup>
          </Col>

          <Col md={6}>
            <FormGroup>
              <Label>License Key</Label>
              <Input
                placeholder={software.license_key}
                value={formValues.license_key}
                onFocus={() => handleFocus("license_key")}
                onChange={(e) => handleChange("license_key", e.target.value)}
              />
            </FormGroup>
          </Col>

          <Col md={6}>
            <FormGroup>
              <Label>Expiry Date</Label>
              <DatePicker
                className="form-control"
                placeholderText={software.expiry_date || "Select expiry date"}
                dateFormat="yyyy-MM-dd"
                selected={
                  formValues.expiry_date
                    ? new Date(formValues.expiry_date)
                    : null
                }
                onFocus={() => handleFocus("expiry_date")}
                onChange={(date) =>
                  handleChange(
                    "expiry_date",
                    date?.toISOString().split("T")[0] || "",
                  )
                }
              />
            </FormGroup>
          </Col>
        </Row>
      </ModalBody>

      <ModalFooter>
        <Button color="secondary" onClick={handleClose} disabled={isPending}>
          Cancel
        </Button>
        <Button color="primary" onClick={handleSubmit} disabled={isPending}>
          {isPending ? <Spinner size="sm" /> : "Update"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default EditSoftwareModal;
