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
} from "reactstrap";
import ParticlesAuth from "../AuthenticationInner/ParticlesAuth";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useLogin } from "../../hooks/uselogin";
import { DASHBOARD_ROUTE } from "../../helpers/url_helper";

const Login = () => {
  const navigate = useNavigate();
  const [passwordShow, setPasswordShow] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const login = useLogin(
    () => {
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", formik.values.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      const redirectTo =
        sessionStorage.getItem("postLoginRedirect") || DASHBOARD_ROUTE;
      sessionStorage.removeItem("postLoginRedirect");
      navigate(redirectTo, { replace: true });
    },
    (msg: string) => {
      setErrorMsg(msg);
      setShowToast(true);
    },
  );

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Please Enter Your Email"),
      password: Yup.string()
        .min(6, "Invalid password")
        .required("Please Enter Your Password"),
    }),
    onSubmit: (values) => {
      login.mutate(values);
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
    document.body.className =
      theme === "dark" ? "bg-dark text-white" : "bg-light text-dark";
  }, [theme]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showToast) {
      timer = setTimeout(() => setShowToast(false), 3000);
    }
    return () => clearTimeout(timer);
  }, [showToast]);

  document.title = "FRESHA INVENTORY";

  return (
    <ParticlesAuth>
      <div
        className={`auth-page-content mt-lg-5 ${theme === "dark" ? "bg-dark text-white" : ""}`}
      >
        <Container>
          <Row>
            <Col lg={12}>
              <div className="text-center mt-sm-5 mb-4 text-white-50">
                <p className="mt-3 fs-1 fw-bold text-white">
                  ICT INVENTORY SYSTEM
                </p>
              </div>
            </Col>
          </Row>

          <Row className="justify-content-center">
            <Col md={8} lg={6} xl={5}>
              <Card className="mt-4">
                <CardBody className="p-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="text-primary">Welcome Back!</h5>
                    <Button
                      color="secondary"
                      size="sm"
                      onClick={() =>
                        setTheme((prev) =>
                          prev === "light" ? "dark" : "light",
                        )
                      }
                    >
                      Toggle {theme === "light" ? "Dark" : "Light"}
                    </Button>
                  </div>
                  <p className="text-muted">
                    Sign in to continue to Dashboard.
                  </p>

                  <div className="p-2 mt-4">
                    <Form onSubmit={formik.handleSubmit}>
                      <div className="mb-3">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Enter email"
                          value={formik.values.email}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          invalid={
                            !!(formik.touched.email && formik.errors.email)
                          }
                        />
                        <FormFeedback>{formik.errors.email}</FormFeedback>
                      </div>

                      <div className="mb-3">
                        <div className="float-end">
                          <Link to="/forgot-password" className="text-muted">
                            Forgot password?
                          </Link>
                        </div>
                        <Label htmlFor="password">Password</Label>
                        <div className="position-relative auth-pass-inputgroup mb-3">
                          <Input
                            id="password"
                            name="password"
                            type={passwordShow ? "text" : "password"}
                            placeholder="Enter Password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            invalid={
                              !!(
                                formik.touched.password &&
                                formik.errors.password
                              )
                            }
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
                        <Label
                          className="form-check-label"
                          htmlFor="auth-remember-check"
                        >
                          Remember me
                        </Label>
                      </div>

                      <div className="mt-4">
                        <Button
                          color="success"
                          className="w-100"
                          type="submit"
                          disabled={login.isPending}
                        >
                          {login.isPending && (
                            <Spinner size="sm" className="me-2" />
                          )}
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
                          <ToastBody className="bg-danger text-white">
                            {errorMsg}
                          </ToastBody>
                        </Toast>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>

              <div className="mt-4 text-center">
                <p>
                  Don't have an account yet?{" "}
                  <Link to="/register" className="fw-semibold text-primary">
                    Signup
                  </Link>
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </ParticlesAuth>
  );
};

export default Login;
