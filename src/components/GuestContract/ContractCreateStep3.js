import * as React from "react";
import { Card, Row, Col, Modal, Button } from "react-bootstrap";
import { FaEye } from "react-icons/fa6";
import { GiConfirmed } from "react-icons/gi";

import { multiStepContext } from "../../StepContext";
import { useNavigate } from "react-router-dom";
import ModalInfoMenu from "./ModalInfoMenu";
import LoadingPage from "components/LoadingPage";
import ModalServices from "./ModalServices";
import ModalInfoServices from "./ModalInfoServices";
import eventApi from "api/eventApi";
import { checkAccessToken } from "services/checkAccessToken";

const ContractCreateStep3 = () => {
  const {
    setStep,
    contractData,
    setContractData,
    tempData,
    submitData,
    menuData,
    setMenuData,
    tempServicesData,
    eventData,
    setEventData,
    eventServicesData,
    setMenuDishesData,
    menuDishesData,
  } = React.useContext(multiStepContext);
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);
  const createdMenu = JSON.parse(localStorage.getItem("createdMenu"));
  const createdMenuDishes = JSON.parse(
    localStorage.getItem("createdMenuDishes")
  );
  const menuDishesDetail = JSON.parse(localStorage.getItem("MenuDishesDetail"));
  const currentUserId = JSON.parse(sessionStorage.getItem("currentUserId")); // Parse chuỗi JSON thành đối tượng
  const currentEventId = JSON.parse(localStorage.getItem("currentEventId")); // Parse chuỗi JSON thành đối tượng
  const currentLocation = JSON.parse(localStorage.getItem("currentLocation")); // UserId có thể là chuỗi

  const [currentEventChoosen, setCurrentEventChoosen] = React.useState();
  const [totalServicesCost, setTotalServicesCost] = React.useState(0);

  const [showModalMenu, setShowModalMenu] = React.useState(false);
  const [showModalServices, setShowModalServices] = React.useState(false);
  const [showModalConfirm, setShowModalConfirm] = React.useState(false);

  const fetchEvent = async () => {
    try {
      const currentEvent = await eventApi.get(currentEventId);
      setCurrentEventChoosen(currentEvent.result);
    } catch (error) {
      checkAccessToken(navigate);
    }
  };

  const initStateEvent = async () => {
    try {
      const currentEvent = await eventApi.get(currentEventId);
      setEventData({
        name: currentEvent?.result.name + " của " + contractData.custname,
        totalcost: calculateTotalCost(),
        description:
          currentEvent?.result.name +
          " của " +
          contractData.custname +
          " hoành tráng",
        image: "",
        userId: currentUserId,
      });

      setContractData((prevData) => ({
        ...prevData,
        name:
          "Hợp đồng " +
          (currentEvent?.result.name?.toLowerCase() || "") +
          " của " +
          contractData.custname,
        type: currentEvent?.result.name,
      }));

      console.log("state eventData gửi đi API:", eventData);
    } catch (error) {
      console.error("Error fetching event info:", error);
    }
  };

  const calculateTotalCost = () => {
    const total = tempServicesData.reduce((sum, service) => {
      return sum + service.price; // Sử dụng field `cost` của từng service
    }, 0);
    return total;
  };

  const calculateGuestPerTable = (guest, table) => {
    const guestPerTable = Math.round(guest / table);
    return guestPerTable;
  };

  const initStateMenu = () => {
    setMenuData(createdMenu);
  };

  const initStateMenuDishes = () => {
    setMenuDishesData(createdMenuDishes);
  };

  const setInfoUrl = (contractId) => {
    setContractInfoUrl(`info/${contractId}`);
  };

  const createEverything = async () => {
    setShowModalConfirm(false);
    setLoading(true);
    window.scrollTo({ top: -1000, behavior: "smooth" });
    await submitData();
    setLoading(false);
  };

  const handleServicesTotalCost = (cost) => {
    setTotalServicesCost(cost);
  };

  React.useEffect(() => {
    fetchEvent();
    const userId = JSON.parse(sessionStorage.getItem("currentUserId")); // UserId có thể là chuỗi
    initStateMenu();
    initStateMenuDishes();
    initStateEvent();

    setContractData((prevData) => ({
      ...prevData,
      // eventId: currentEvent ? currentEvent.eventId : null,
      userId: userId,
      status: "Pending",
      paymentstatus: "Unpaid",
    }));
  }, []);

  // Biến lưu URL trả về từ API
  const [vnPayUrl, setVnPayUrl] = React.useState("");
  const [contractInfoUrl, setContractInfoUrl] = React.useState("");

  const checkState = () => {
    console.log("Contract data:", contractData);
    console.log("Menu data: ", menuData);
    console.log("Event data: ", eventData);
    console.log("Services data: ", eventServicesData);
    console.log("Menu Dishes Data: ", menuDishesData);
  };

  React.useEffect(() => {
    if (contractInfoUrl) {
      navigate(contractInfoUrl);
    }
  }, [contractInfoUrl, navigate]);

  //tắt mở các modal
  const handleShowModalMenu = () => {
    setShowModalMenu(true);
  };

  const handleCloseModalMenu = () => {
    setShowModalMenu(false);
  };

  const handleShowModalServices = () => {
    setShowModalServices(true);
  };

  const handleCloseModalServices = () => {
    setShowModalServices(false);
  };

  const formatCurrency = (amount) => {
    return amount
      ? amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
      : "0";
  };

  //VNPAY
  // React.useEffect(() => {
  //   const fetchPaymentUrl = async () => {
  //     try {
  //       // Gọi API từ backend
  //       const response = await axios.get("https://62c6-2001-ee0-5722-4dc0-a8e7-eaeb-2e68-34e5.ngrok-free.app/pay");
  //       if (response.data) {
  //         setVnPayUrl(response.data); // Gán URL nhận được từ API vào biến state
  //       } else {
  //         console.error("API trả về rỗng");
  //       }
  //     } catch (error) {
  //       console.error("Lỗi khi gọi API:", error);
  //     }
  //   };

  //   fetchPaymentUrl();
  // }, []);

  return (
    <div>
      {loading && <LoadingPage />}
      <div className="card p-5 w-100 mt-5 paymentCard">
        <div className="text-center mb-5 fw-bold">
          <h1>Bước 3: Xác nhận hợp đồng</h1>
        </div>
        <Card name="contractInfo" className="p-5" style={{ opacity: 0.9 }}>
          <h2 style={{ color: "hsl(28, 100%, 58%)" }}>Thông Tin Hợp Đồng</h2>
          <div name="contractForm" className="contractForm">
            <div className="row row-cols-sm-1 row-cols-md-2">
              <div className="col">
                <div className="mb-3">
                  <label className="form-label fw-bold">Thực đơn</label>
                  <button
                    className="form-control fs-4 d-flex justify-content-between align-middle input-hienthi-popup"
                    onClick={handleShowModalMenu}
                  >
                    Thực đơn đã chọn
                    <FaEye />
                  </button>
                </div>

                <div className="row row-cols-md-2 mb-3">
                  <div className="col">
                    <label className="form-label fw-bold">Địa điểm</label>
                    <button className="form-control fs-4 d-flex justify-content-between align-middle input-hienthi">
                      <p
                        className="mb-0"
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {currentLocation.name} - {currentLocation.address}{" "}
                      </p>
                    </button>
                  </div>
                  <div className="col">
                    <label className="form-label fw-bold">Dịch vụ</label>
                    <div className="d-flex align-items-center">
                      <div
                        className="form-control fs-4 input-hienthi-popup d-flex justify-content-between align-items-center w-100"
                        onClick={handleShowModalServices}
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
                        <FaEye />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col">
                <div className="mb-3">
                  <label className="form-label fw-bold ">Ngày tổ chức</label>
                  <div className="form-control input-hienthi fs-4">
                    {contractData?.organizdate}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Ghi chú</label>
                  <div className="form-control input-hienthi fs-4 me-2">
                    {contractData.description ? (
                      <div>{contractData?.description}</div>
                    ) : (
                      <div>Không có ghi chú...</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="row row-cols-sm-2 row-cols-lg-4">
              <div className="col">
                <div className="mb-3">
                  <label className="form-label fw-bold">Sự kiện</label>
                  <div className="form-control input-hienthi fs-4">
                    {currentEventChoosen?.name}
                  </div>
                </div>
              </div>

              <div className="col">
                <div className="mb-3">
                  <label className="form-label fw-bold">Số lượng khách</label>
                  <div className="form-control input-hienthi fs-4">
                    {contractData.guest}
                  </div>
                </div>
              </div>
              <div className="col">
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Số lượng khách / bàn
                    <span className="text-danger d-inline-block">*</span>
                  </label>
                  <div className="form-control input-hienthi fs-4">
                    {calculateGuestPerTable(
                      contractData.guest,
                      contractData.table
                    )}
                  </div>
                </div>
              </div>

              <div className="col">
                <div className="mb-3">
                  <label className="form-label fw-bold">Số bàn</label>
                  <div className="form-control input-hienthi fs-4">
                    {contractData.table}
                  </div>
                </div>
              </div>
            </div>

            <h3 style={{ color: "var(--dark-orange)" }}>
              Thông Tin Khách Hàng
            </h3>
            <Row lg={3} md={3} xs={1}>
              <Col>
                <div className="mb-3">
                  <label className="form-label fw-bold ">Tên Khách Hàng</label>
                  <div className="form-control input-hienthi fs-4">
                    {contractData.custname}
                  </div>
                </div>
              </Col>
              <Col>
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Số Điện Thoại Khách Hàng
                  </label>
                  <div className="form-control input-hienthi fs-4">
                    {contractData.custphone}
                  </div>
                </div>
              </Col>
              <Col>
                <div className="mb-3">
                  <label className="form-label fw-bold">Email liên hệ</label>
                  <div className="form-control input-hienthi fs-4">
                    {tempData.custmail}
                  </div>
                </div>
              </Col>
            </Row>
            <h3 style={{ color: "var(--dark-orange)" }}>Chi Phí</h3>
            <div className="row row-cols-sm-1 row-cols-lg-3 mt-3">
              <div className="col">
                <div className="mb-3 d-flex align-items-center">
                  <label className="form-label fw-bold mb-0 me-2">
                    Chi phí địa điểm:
                  </label>
                  <span
                    className="fw-bold"
                    style={{ color: "var(--deep-saffron)" }}
                  >
                    {formatCurrency(currentLocation.cost)} VND
                  </span>
                </div>
              </div>

              <div className="col">
                <div className="mb-3 d-flex align-items-center">
                  <label className="form-label fw-bold mb-0 me-2">
                    Tổng chi phí dịch vụ:
                  </label>
                  <span
                    className="fw-bold"
                    style={{ color: "var(--deep-saffron)" }}
                  >
                    {formatCurrency(totalServicesCost)} VND
                  </span>
                </div>
              </div>

              <div className="col">
                <div className="mb-3 d-flex align-items-center">
                  <label className="form-label fw-bold mb-0 me-2">
                    Tổng chi phí thực đơn:
                  </label>
                  <span
                    className="fw-bold"
                    style={{ color: "var(--deep-saffron)" }}
                  >
                    {formatCurrency(
                      contractData.totalcost -
                        totalServicesCost -
                        currentLocation?.cost
                    )}{" "}
                    VND
                  </span>
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-center">
              <div className="mb-3 d-flex align-items-center">
                <label className="form-label fw-bold mb-0 me-2">
                  Tổng cộng:
                </label>
                <span className="text-success fw-bold">
                  {formatCurrency(contractData.totalcost)} VND
                </span>
              </div>
            </div>
          </div>
        </Card>
        <div style={{ textAlign: "center" }}>
          <button
            type="button"
            className="btn btn-secondary btn-save-form mx-3"
            onClick={() => setStep(2)}
            style={{ marginTop: "1rem" }}
          >
            Trở về
          </button>

          <button
            onClick={() => {
              setShowModalConfirm(true);
            }}
            className="btn btn-vnp mx-3 d-inline-flex align-items-center"
            style={{ marginTop: "1rem" }}
          >
            <i className="me-2">
              <GiConfirmed />
            </i>
            Tạo hợp đồng
          </button>
        </div>
      </div>

      <ModalInfoServices
        show={showModalServices}
        onClose={handleCloseModalServices}
        onTotalCost={handleServicesTotalCost}
        servicesList={tempServicesData}
      />

      <ModalInfoMenu
        show={showModalMenu}
        onClose={handleCloseModalMenu}
        menuDishes={menuDishesDetail}
        totalMenu={createdMenu.totalcost}
        status={false}
      />

      <Modal
        show={showModalConfirm}
        onHide={() => {
          setShowModalConfirm(false);
        }}
        style={{ backgroundColor: "rgba(0,0,0, 0.5)" }}
      >
        <Modal.Body className="d-flex flex-column align-items-center text-center">
          <h3 className="mb-3">Chắc chắn tạo hợp đồng?</h3>
          <div className="mb-3">
            Bạn có thể hủy hợp đồng bất cứ lúc nào nếu chưa thanh toán
          </div>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-center">
          <Button
            variant="secondary"
            className="btn-modal-delete-huy mx-2"
            onClick={() => {
              setShowModalConfirm(false);
            }}
          >
            Để tôi kiểm tra lại
          </Button>
          <Button className="btn-modal-confirm mx-2" onClick={createEverything}>
            Đồng ý
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ContractCreateStep3;
