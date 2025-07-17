import React, { useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Form,
  Label,
  Input,
  FormFeedback,
  Button,
  Spinner,
  Alert,
} from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useUser } from "../../context/UserContext";
import { useApiPut } from "../../helpers/api_helper";
import { useAssetOptions } from "../../hooks/useAssetOptions";
import AsyncSelectInput from "../../helpers/AsyncSelectInput";

const UserProfile = () => {
  const { data: user, refetch } = useUser();
  const { departments = [], roles = [] } = useAssetOptions() as any;

  const updateUser = useApiPut<any>(
    `/auth/update/${user?.id}`,
    () => {
      toast.success("User info updated successfully");
      refetch();
    },
    (err) => {
      toast.error(`Update failed: ${err.message}`);
    },
  );

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      fullname: user?.fullname || "",
      email: user?.email || "",
      department_id:
        departments.find((d: any) => d.label === user?.department)?.value || 0,
      role_id: roles.find((r: any) => r.label === user?.role)?.value || 0,
    },
    validationSchema: Yup.object({
      fullname: Yup.string().required("Full name is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      department_id: Yup.number().min(1, "Select a department"),
      role_id: Yup.number().min(1, "Select a role"),
    }),
    onSubmit: (values) => {
      updateUser.mutate(values);
    },
  });

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner color="primary" />
      </div>
    );
  }

  return (
    <div className="page-content">
      <Container fluid>
        <Row>
          <Col lg="12">
            <Card>
              <CardBody>
                <div className="ms-3">
                  <h5>{user.fullname}</h5>
                  <p>Email: {user.email}</p>
                  <p>Department: {user.department}</p>
                  <p>Role: {user.role}</p>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <h4 className="card-title mb-4">Update User Info</h4>

        <Card>
          <CardBody>
            <Form onSubmit={validation.handleSubmit} className="row gy-3">
              <Col md={6}>
                <Label>Full Name</Label>
                <Input
                  name="fullname"
                  value={validation.values.fullname}
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  invalid={
                    !!(
                      validation.touched.fullname && validation.errors.fullname
                    )
                  }
                />
                <FormFeedback>{validation.errors.fullname}</FormFeedback>
              </Col>

              <Col md={6}>
                <Label>Email</Label>
                <Input
                  name="email"
                  type="email"
                  value={validation.values.email}
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  invalid={
                    !!(validation.touched.email && validation.errors.email)
                  }
                />
                <FormFeedback>{validation.errors.email}</FormFeedback>
              </Col>

              <Col md={6}>
                <Label>Department</Label>
                <AsyncSelectInput
                  field={{
                    state: { value: validation.values.department_id },
                    handleChange: (val: any) =>
                      validation.setFieldValue("department_id", val),
                    stateMeta: { errors: validation.errors },
                  }}
                  options={departments}
                  placeholder="Select department"
                />
              </Col>

              <Col md={6}>
                <Label>Role</Label>
                <AsyncSelectInput
                  field={{
                    state: { value: validation.values.role_id },
                    handleChange: (val: any) =>
                      validation.setFieldValue("role_id", val),
                    stateMeta: { errors: validation.errors },
                  }}
                  options={roles}
                  placeholder="Select role"
                />
              </Col>

              <Col xs={12} className="text-center mt-4">
                <Button
                  type="submit"
                  color="primary"
                  disabled={updateUser.isPending}
                >
                  {updateUser.isPending ? (
                    <Spinner size="sm" />
                  ) : (
                    "Update Profile"
                  )}
                </Button>
              </Col>
            </Form>
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default UserProfile;
