import React from "react";
import { Card, CardBody, CardHeader, Col, Container, Row } from "reactstrap";
import AssetTable from "./AssetTable";

const MyAssetTable = () => {
  document.title = "FRESHA Asset Table";
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Row>
            <Col lg={12}>
              <Card>
                <CardHeader>
                  <h5 className="card-title mb-0">Asset Table</h5>
                </CardHeader>
                <CardBody>
                  <AssetTable />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default MyAssetTable;
