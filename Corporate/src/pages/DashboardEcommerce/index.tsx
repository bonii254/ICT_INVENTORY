import React, { useState } from "react";
import { Col, Container, Row } from "reactstrap";
import Widget from "./Widgets";
import RecentActivity from "./RecentActivity";
import RecentAssets from "./RecentAssets";
import AssetCategorySummary from "./CategoryCount";
import SalesByLocations from "./SalesByLocations";
import Section from "./Section";
import StoreVisits from "./StoreVisits";
import AddAssetModal from "../../Components/Common/AssetForm";
import { useUser } from "../../context/UserContext";

const DashboardEcommerce = () => {
  document.title = "Dashboard | fresha - ICT inventory system";

  const [rightColumn, setRightColumn] = useState(false);
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const { isLoading } = useUser();

  const toggleRightColumn = () => setRightColumn(!rightColumn);
  const toggleAssetModal = () => setAssetModalOpen((prev) => !prev);

  if (isLoading) return <p>Loading user information...</p>;

  return (
    <div className="page-content">
      <Container fluid>
        <Row>
          <Col>
            <div className="h-100">
              <Section
                rightClickBtn={toggleRightColumn}
                onAddAsset={toggleAssetModal}
              />
              <Row>
                <Widget />
              </Row>
              <Row>
                <Col xl={8}>
                  <RecentAssets />
                </Col>
                <SalesByLocations />
              </Row>
              <Row>
                <StoreVisits />
                <Col xl={8}>
                  <AssetCategorySummary />
                </Col>
              </Row>
            </div>
          </Col>

          <RecentActivity
            rightColumn={rightColumn}
            hideRightColumn={toggleRightColumn}
          />
        </Row>
      </Container>
      <AddAssetModal isOpen={assetModalOpen} onClose={toggleAssetModal} />
    </div>
  );
};

export default DashboardEcommerce;
