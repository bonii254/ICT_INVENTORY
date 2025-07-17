import React, { useState, lazy, Suspense } from "react";
import { Col, Container, Row } from "reactstrap";
import Widget from "./Widgets";
import RecentAssets from "./RecentAssets";
import AssetCategorySummary from "./CategoryCount";
import SalesByLocations from "./SalesByLocations";
import Section from "./Section";
import StoreVisits from "./StoreVisits";
import { useUser } from "../../context/UserContext";

const DashboardEcommerce = () => {
  document.title = "Dashboard | fresha - ICT inventory system";

  const { isLoading } = useUser();

  if (isLoading) return <p>Loading user information...</p>;

  return (
    <div className="page-content">
      <Container fluid>
        <Row>
          <Col>
            <div className="h-100">
              <Section />

              <Row className="mb-3">
                <Widget />
              </Row>

              <Row className="g-3 align-items-stretch">
                <Col xl={8} className="d-flex">
                  <RecentAssets />
                </Col>
                <Col xl={4} className="d-flex">
                  <SalesByLocations />
                </Col>
              </Row>

              <Row className="mt-3">
                <StoreVisits />
                <Col xl={8}>
                  <AssetCategorySummary />
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default DashboardEcommerce;
