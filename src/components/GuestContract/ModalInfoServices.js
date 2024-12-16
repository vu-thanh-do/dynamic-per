import React, { useEffect } from "react";
import { Modal, Button, Row, Col, Card } from "react-bootstrap";

function ModalInfoServices({ show, onClose, onTotalCost, servicesList }) {
  const formatCurrency = (amount) => {
    return amount
      ? amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
      : "0";
  };

  // Hàm tính tổng tiền
  const calculateTotalCost = () => {
    const total = servicesList?.reduce((sum, service) => {
      return sum + service.price; // Sử dụng field `cost` của từng service
    }, 0);
    return total;
  };

  // Gửi tổng tiền khi modal mở
  useEffect(() => {
    const totalCost = calculateTotalCost();
    onTotalCost(totalCost); // Gửi tổng tiền cho component cha
  }, [show, servicesList, onTotalCost]); // Chạy lại khi show thay đổi hoặc tempServicesData thay đổi

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title className="fs-1">
          <h2 className="mb-0">Các dịch vụ đã chọn</h2>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="d-flex flex-column align-items-center text-center">
        <Row lg={3} sm={2}>
          {servicesList?.map((item, index) => (
            <Col key={index} className="p-2">
              <Card className="h-100 card-select">
                <Card.Img
                  variant="top"
                  style={{ height: "150px" }}
                  src={item.image}
                />
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="fs-2">{item.name}</Card.Title>
                  <div>
                    <p>{item.address}</p>
                    <h3 className="text-success fw-bold">
                      {formatCurrency(item.price)} VND
                    </h3>
                    <p>{item.description}</p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-center">
        <Button
          variant="secondary"
          className="btn-modal-delete-huy mx-2"
          onClick={onClose}
        >
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalInfoServices;
