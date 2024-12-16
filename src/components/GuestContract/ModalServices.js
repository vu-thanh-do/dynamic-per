import * as React from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import { CiSearch } from "react-icons/ci";
import { FaRegTrashAlt, FaEdit } from "react-icons/fa";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { multiStepContext } from "../../StepContext";
import serviceApi from "api/serviceApi";
import guestEventServiceApi from "api/guestEventServicesApi";
import AudioRecorderWithAPI from "./SpeechToTextInput";
import { checkAccessToken } from "services/checkAccessToken";
import { useNavigate } from "react-router-dom";

function ModalServices({ onUpdateTotalCost = () => {}, readOnly = false }) {
  const {
    eventServicesData,
    setEventServicesData,
    tempServicesData,
    setTempServicesData,
  } = React.useContext(multiStepContext);

  const currentUserId = JSON.parse(sessionStorage.getItem("currentUserId"));
  const currentEventId = JSON.parse(localStorage.getItem("currentEventId"));

  const [lgShow, setLgShow] = React.useState(false);

  const [servicesList, setServicesList] = React.useState([]);
  // const [selectedServices, setSelectedServices] = React.useState([]);
  const [eventServices, setEventServices] = React.useState([]);
  const [total, setTotal] = React.useState(0);

  const [searchTerm, setSearchTerm] = React.useState("");
  const navigate = useNavigate();

  //Khởi tạo dịch vụ mặc định theo Event
  React.useEffect(() => {
    const initializeServices = async () => {
      try {
        // Fetch dữ liệu từ APIs
        const servicesResponse = await serviceApi.getPaginate(1, 5000);
        const eventServicesResponse = await guestEventServiceApi.getByEventId(
          currentEventId,
          1,
          5000
        );

        const fetchedServicesList = servicesResponse.result.content;
        const fetchedEventServices = eventServicesResponse.result.content;

        // Cập nhật state servicesList và eventServices
        setServicesList(fetchedServicesList);
        setEventServices(fetchedEventServices);

        // Chỉ khởi tạo tempServicesData nếu nó đang rỗng
        if (tempServicesData.length === 0) {
          const eventServiceIds = new Set(
            fetchedEventServices.map((item) => item.services.serviceId)
          );

          const initialSelectedServices = fetchedServicesList.filter(
            (service) => eventServiceIds.has(service.serviceId)
          );

          const eventServicesSendToApi = initialSelectedServices.map(
            (item) => ({
              quantity: 1,
              cost: item.price,
              eventId: 0,
              serviceId: item.serviceId,
            })
          );

          setTempServicesData(initialSelectedServices);
          setEventServicesData(eventServicesSendToApi);
        }
      } catch (error) {
        checkAccessToken(navigate);
      }
    };

    initializeServices();
  }, [currentEventId]); // Loại bỏ tempServicesData khỏi dependency array

  React.useEffect(() => {
    const calculatedTotal = tempServicesData.reduce((sum, service) => {
      return sum + service.price; // Sử dụng field `cost` của từng service
    }, 0);

    // Gọi hàm callback để cập nhật giá trị tổng cho cha
    setTotal(calculatedTotal);
    onUpdateTotalCost(calculatedTotal);
  }, [tempServicesData, onUpdateTotalCost]);

  // Fetch danh sách dịch vụ
  const fetchServices = async () => {
    const List = await serviceApi.getPaginate(1, 5000);
    setServicesList(List.result.content);
    console.log("Services:", List);
  };

  // Fetch danh sách dịch vụ theo event
  const fetchEventServices = async () => {
    const List = await guestEventServiceApi.getByEventId(
      currentEventId,
      1,
      5000
    );
    setEventServices(List.result.content);
    console.log("Event Services:", List);
  };

  // Đóng modal
  const handleClose = () => setLgShow(false);

  // Hàm chọn dịch vụ
  const handleSelect = (service) => {
    // Kiểm tra nếu dịch vụ chưa tồn tại trong tempServicesData
    if (
      !tempServicesData.some(
        (selected) => selected.serviceId === service.serviceId
      )
    ) {
      // Tạo một đối tượng dịch vụ mới với các trường cần thiết
      const newService = {
        quantity: 1, // Giá trị cứng
        cost: service.price, // Gán giá trị từ service.price
        eventId: 0, // Tạm thời là 0
        serviceId: service.serviceId, // Gán ID dịch vụ
      };

      // Cập nhật state tempServicesData
      setEventServicesData((prev) => [...prev, newService]);
      const updatedSelectedServices = [...tempServicesData, service];

      // Cập nhật state tempServicesData
      setTempServicesData(updatedSelectedServices);
    }
  };

  const handleDeselect = (service) => {
    // Loại bỏ dịch vụ khỏi tempServicesData
    const updatedSelectedServices = tempServicesData.filter(
      (selected) => selected.serviceId !== service.serviceId
    );
    setTempServicesData(updatedSelectedServices);

    // Loại bỏ dịch vụ khỏi eventServicesData
    const updatedEventServicesData = eventServicesData.filter(
      (eventService) => eventService.serviceId !== service.serviceId
    );
    setEventServicesData(updatedEventServicesData);

    console.log("Services còn lại gửi đi API:", updatedEventServicesData);
  };

  const handleSearch = () => {};

  // Lấy style cho từng card
  const getCardStyle = (service) => {
    return tempServicesData.some(
      (selected) => selected.serviceId === service.serviceId
    )
      ? {
          width: "100%",
          backgroundColor: "rgba(255, 147, 25, 0.1)",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        }
      : { width: "100%" };
  };

  const getButtonStyle = (service) => {
    return tempServicesData.some(
      (selected) => selected.serviceId === service.serviceId
    )
      ? true
      : false;
  };

  const formatCurrency = (amount) => {
    return amount
      ? amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
      : "0";
  };

  return (
    <>
      <div
        className="form-control fs-4 input-hienthi-popup"
        onClick={() => setLgShow(true)}
        style={{ cursor: "pointer" }}
      >
        <p
          className="mb-0"
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {tempServicesData[0]?.name} -{" "}
          {formatCurrency(tempServicesData[0]?.price)} ...
        </p>
      </div>

      <Modal
        size="xl"
        show={lgShow}
        onHide={handleClose}
        aria-labelledby="example-modal-sizes-title-lg"
      >
        <Modal.Header closeButton>
          <Modal.Title className="fs-1">
            {readOnly ? "Xem lại dịch vụ" : "Chọn dịch vụ"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container>
            {/* Ô tìm kiếm */}
            <Row lg={2} sm={2} className="d-flex align-items-center">
              <Col className="p-2">
                <AudioRecorderWithAPI onSearch={handleSearch} />
              </Col>
            </Row>

            {/* Danh sách dịch vụ */}
            <Row lg={2} sm={2}>
              <div
                style={{
                  maxHeight: "470px", // Chiều cao tối đa
                  overflowY: "auto", // Kích hoạt cuộn dọc
                  padding: "1rem", // Thêm khoảng cách bên trong nếu cần
                }}
              >
                <Col>
                  <Row lg={2} sm={2}>
                    {servicesList.map((item, index) => (
                      <Col key={index} className="p-2">
                        <Card
                          className="h-100 card-select"
                          style={getCardStyle(item)}
                        >
                          <Card.Img
                            variant="top"
                            style={{ height: "150px" }}
                            src={item.image}
                          />
                          <Card.Body className="d-flex flex-column">
                            <Card.Title className="fs-2">
                              {item.name}
                            </Card.Title>
                            <div>
                              <p>{item.address}</p>
                              <h3 className="text-success fw-bold">
                                {formatCurrency(item.price)} VND
                              </h3>
                              <p>{item.description}</p>
                            </div>
                            <Button
                              variant="primary"
                              onClick={() => {
                                getButtonStyle(item)
                                  ? handleDeselect(item)
                                  : handleSelect(item);
                              }}
                              className="mt-auto"
                            >
                              {getButtonStyle(item) ? "Đã chọn" : "Chọn"}
                            </Button>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Col>
              </div>

              {/* Dịch vụ đã chọn */}
              <Col>
                <Card>
                  <Card.Body>
                    <h2>Dịch vụ hiện tại</h2>
                    <div
                      style={{
                        maxHeight: "320px", // Chiều cao tối đa
                        overflowY: "auto", // Kích hoạt cuộn dọc
                        padding: "1rem", // Thêm khoảng cách bên trong nếu cần
                      }}
                    >
                      <Row lg={1} sm={1}>
                        {tempServicesData.length > 0 ? (
                          tempServicesData.map((service, index) => (
                            <Col key={index} className="p-2">
                              <Card className="h-100 p-0 card-select">
                                <Card.Body className="d-flex align-items-center justify-content-between">
                                  <div>
                                    <Card.Title className="fs-3 mb-0">
                                      {service.name}{" "}
                                      <span className="text-success fw-bold mb-0">
                                        {formatCurrency(service.price)} VND
                                      </span>
                                    </Card.Title>
                                  </div>
                                  <Button
                                    variant="danger"
                                    onClick={() => handleDeselect(service)}
                                  >
                                    Bỏ chọn
                                  </Button>
                                </Card.Body>
                              </Card>
                            </Col>
                          ))
                        ) : (
                          <p>Chưa có dịch vụ nào được chọn</p>
                        )}
                      </Row>
                    </div>

                    <div className="mb-3 d-flex align-items-center">
                      <label className="form-label fw-bold mb-0 me-2 fs-3">
                        Tổng chi phí dịch vụ:
                      </label>
                      <span
                        className="fw-bold fs-3"
                        style={{ color: "var(--deep-saffron)" }}
                      >
                        {formatCurrency(total)} VND
                      </span>
                    </div>
                    <div className="mb-3 d-flex align-items-center justify-content-center">
                      <Button
                        variant="info"
                        onClick={() => {
                          console.log("Selected Services:", tempServicesData);
                          console.log(
                            "eventServices gửi đi API:",
                            eventServicesData
                          );
                          setLgShow(false);
                        }}
                      >
                        Lưu
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ModalServices;
