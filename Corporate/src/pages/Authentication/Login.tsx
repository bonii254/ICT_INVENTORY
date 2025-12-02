import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Col,
  Container,
  Input,
  Label,
  Row,
  Button,
  Form,
  FormFeedback,
  Toast,
  ToastBody,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import ParticlesAuth from "../AuthenticationInner/ParticlesAuth";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useLogin } from "../../hooks/uselogin";
import { DASHBOARD_ROUTE } from "../../helpers/url_helper";
import { useApiPut } from "../../helpers/api_helper";

interface ChangePasswordPayload {
  current_password: string;   
  new_password: string;
  confirm_password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [passwordShow, setPasswordShow] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  // --- Login hook ---
  const login = useLogin(
    (data) => {
      if (data.user.must_change_password) {
        setUserId(data.user.id);
        setMustChangePassword(true);
      } else {
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", formik.values.email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }
        const redirectTo = sessionStorage.getItem("postLoginRedirect") || DASHBOARD_ROUTE;
        sessionStorage.removeItem("postLoginRedirect");
        navigate(redirectTo, { replace: true });
      }
    },
    (msg: string) => {
      setErrorMsg(msg);
      setShowToast(true);
    }
  );

  const changePasswordMutation = useApiPut<ChangePasswordPayload, { message: string }>(
    "/auth/update-password",
    () => {
      setMustChangePassword(false);
      alert("Password changed successfully. Please login with your new password.");
    },
    (err) => {
      const msg = err?.response?.data?.error || err.message || "Failed to change password";
      setErrorMsg(msg);
      setShowToast(true);
    }
  );

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email address").required("Please Enter Your Email"),
      password: Yup.string().min(6, "Invalid password").required("Please Enter Your Password"),
    }),
    onSubmit: (values) => {
      login.mutate(values);
    },
  });

  const passwordFormik = useFormik({
    initialValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
    validationSchema: Yup.object({
      current_password: Yup.string().required("Current password is required"),
      new_password: Yup.string().min(6, "Password too short").required("New password is required"),
      confirm_password: Yup.string()
        .oneOf([Yup.ref("new_password")], "Passwords must match")
        .required("Please confirm your new password"),
    }),
    onSubmit: (values) => {
      changePasswordMutation.mutate({
        current_password: values.current_password,
        new_password: values.new_password,
        confirm_password: values.confirm_password,
      });
    },
  });

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      formik.setValues((prev) => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    document.title = "FRESHA INVENTORY";
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showToast) {
      timer = setTimeout(() => setShowToast(false), 3000);
    }
    return () => clearTimeout(timer);
  }, [showToast]);

  return (
    <ParticlesAuth>
      <div className="auth-page-content mt-lg-5">
        <Container>
          <Row>
            <Col lg={12}>
              <div className="text-center mt-sm-5 mb-4 text-white-50">
                <p className="mt-3 fs-1 fw-bold text-white">ICT INVENTORY SYSTEM</p>
              </div>
            </Col>
          </Row>

          <Row className="justify-content-center">
            <Col md={8} lg={6} xl={5}>
              <Card className="mt-4">
                <CardBody className="p-4">
                  <h5 className="text-primary">Welcome Back!</h5>
                  <p className="text-muted">Sign in to continue to Dashboard.</p>

                  <div className="p-2 mt-4">
                    <Form onSubmit={formik.handleSubmit}>
                      <div className="mb-3">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter email"
                          {...formik.getFieldProps("email")}
                          invalid={!!(formik.touched.email && formik.errors.email)}
                        />
                        <FormFeedback>{formik.errors.email}</FormFeedback>
                      </div>

                      <div className="mb-3">
                        <Label htmlFor="password">Password</Label>
                        <div className="position-relative auth-pass-inputgroup mb-3">
                          <Input
                            id="password"
                            type={passwordShow ? "text" : "password"}
                            placeholder="Enter Password"
                            {...formik.getFieldProps("password")}
                            invalid={!!(formik.touched.password && formik.errors.password)}
                          />
                          <FormFeedback>{formik.errors.password}</FormFeedback>
                          <button
                            type="button"
                            className="btn btn-link position-absolute end-0 top-0 text-muted"
                            onClick={() => setPasswordShow(!passwordShow)}
                            aria-label="Toggle password visibility"
                          >
                            <i className="ri-eye-fill align-middle"></i>
                          </button>
                        </div>
                      </div>

                      <div className="form-check mb-3">
                        <Input
                          type="checkbox"
                          className="form-check-input"
                          id="auth-remember-check"
                          checked={rememberMe}
                          onChange={() => setRememberMe(!rememberMe)}
                        />
                        <Label className="form-check-label" htmlFor="auth-remember-check">
                          Remember me
                        </Label>
                      </div>

                      <div className="mt-4">
                        <Button color="success" className="w-100" type="submit" disabled={login.isPending}>
                          {login.isPending && <Spinner size="sm" className="me-2" />}
                          Sign In
                        </Button>
                      </div>
                    </Form>

                    {showToast && (
                      <div
                        style={{
                          position: "fixed",
                          top: "20px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          zIndex: 1050,
                        }}
                      >
                        <Toast isOpen={showToast} fade timeout={5000}>
                          <ToastBody className="bg-danger text-white">{errorMsg}</ToastBody>
                        </Toast>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>

        {/* --- First-time / Password change modal --- */}
        <Modal isOpen={mustChangePassword} backdrop="static">
          <ModalHeader>Change Password</ModalHeader>
          <Form onSubmit={passwordFormik.handleSubmit}>
            <ModalBody>
              <div className="mb-3">
                <Label htmlFor="current_password">Current Password</Label>
                <Input
                  type="password"
                  {...passwordFormik.getFieldProps("current_password")}
                  invalid={!!(passwordFormik.touched.current_password && passwordFormik.errors.current_password)}
                />
                <FormFeedback>{passwordFormik.errors.current_password}</FormFeedback>
              </div>

              <div className="mb-3">
                <Label htmlFor="new_password">New Password</Label>
                <Input
                  type="password"
                  {...passwordFormik.getFieldProps("new_password")}
                  invalid={!!(passwordFormik.touched.new_password && passwordFormik.errors.new_password)}
                />
                <FormFeedback>{passwordFormik.errors.new_password}</FormFeedback>
              </div>

              <div className="mb-3">
                <Label htmlFor="confirm_password">Confirm Password</Label>
                <Input
                  type="password"
                  {...passwordFormik.getFieldProps("confirm_password")}
                  invalid={!!(passwordFormik.touched.confirm_password && passwordFormik.errors.confirm_password)}
                />
                <FormFeedback>{passwordFormik.errors.confirm_password}</FormFeedback>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                type="submit"
                color="primary"
                disabled={changePasswordMutation.isPending}
              >
                {changePasswordMutation.isPending && <Spinner size="sm" className="me-2" />}
                Update Password
              </Button>
            </ModalFooter>
          </Form>
        </Modal>
      </div>
    </ParticlesAuth>
  );
};

export default Login;
