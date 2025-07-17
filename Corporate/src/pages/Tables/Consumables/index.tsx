import React from "react";
import { Card, CardBody, CardHeader, Col, Container, Row } from "reactstrap";
import ConsumableTable from "./ConsumablesTable";

const MyConsumableTable = () => {
  document.title = "FRESHA Software Table";
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Row>
            <Col lg={12}>
              <Card>
                <CardHeader>
                  <h5 className="card-title mb-0">Consumable Table</h5>
                </CardHeader>
                <CardBody>
                  <ConsumableTable />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default MyConsumableTable;
