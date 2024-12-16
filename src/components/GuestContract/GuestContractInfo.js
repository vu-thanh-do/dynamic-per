import * as React from "react";
import { Card, Row, Col } from "react-bootstrap";
import { FaEye } from "react-icons/fa6";

import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import guestContractApi from "api/guestContractApi";
import ConfirmCancelModal from "./ModalCancelContract";
import Swal from "sweetalert2";
import ModalInfoMenu from "./ModalInfoMenu";
import PaymentCard from "./PaymentCard";
import guestEventServiceApi from "api/guestEventServicesApi";
import menudishApi from "api/menudishApi";
import ModalInfoServices from "./ModalInfoServices";

const ContractInfo = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams(); // Lấy query params từ URL
  const paymentStatus = searchParams.get("payment");
  const [totalServicesCost, setTotalServicesCost] = React.useState(0);

  const [contractInfo, setContractInfo] = React.useState({});
  const [eventServicesInfo, setEventServicesInfo] = React.useState([]);
  const [menuDishesInfo, setMenuDishesInfo] = React.useState([]);

  const navigate = useNavigate();
  const [showModalCancel, setShowModalCancel] = React.useState(false);
  const [showModalMenu, setShowModalMenu] = React.useState(false);
  const [showModalServices, setShowModalServices] = React.useState(false);
  const [showPaymentCard, setShowPaymentCard] = React.useState(false);

  const finaltotalMenuCost =
    contractInfo.totalcost - (totalServicesCost + contractInfo.locations?.cost);

  // Hàm mở modal
  const handleShowModalCancel = () => {
    setShowModalCancel(true);
  };

  // Hàm đóng modal
  const handleCloseModalCancel = () => {
    setShowModalCancel(false);
  };

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

  const handleTogglePaymentCard = () => {
    setShowPaymentCard((prevShowForm) => !prevShowForm);
  };

  const alertPaymentStatus = () => {
    if (paymentStatus === "CANCELLED" || paymentStatus === "02") {
      Swal.fire({
        icon: "error",
        title: "Thanh toán thất bại",
        text: "Bạn đã hủy thanh toán",
        timer: 2000, // Tự động đóng sau 2 giây
        showConfirmButton: false,
      });
      navigate(`/contract/info/${id}`);
    }
    if (paymentStatus === "PAID" || paymentStatus === "00") {
      Swal.fire({
        icon: "success",
        title: "Thanh toán thành công",
        text: "Chúng tôi sẽ liên lạc với bạn trong thời gian sớm nhất để tổ chức tiệc cho bạn nhé",
        timer: 5000,
        showConfirmButton: true,
      });
      navigate(`/contract/info/${id}`);
    }
  };

  const autoScroll = (status, pStatus) => {
    console.log("status:", status);
    if (status !== "Pending" && status !== "Completed" && pStatus !== "Paid") {
      // Cuộn xuống 500px từ vị trí hiện tại
      window.scrollTo({
        top: 720,
        behavior: "smooth", // Cuộn mượt mà
      });
    } else {
    }
  };

  const handleServicesTotalCost = (cost) => {
    setTotalServicesCost(cost);
  };
  const calculateGuestPerTable = (totalMenu, finalTotalMenu, table) => {
    if (!totalMenu || !table || table === 0) {
      return "Không xác định"; // Trả về chuỗi nếu dữ liệu không hợp lệ
    }
    const guestPerTable = Math.round(finalTotalMenu / (totalMenu * table));
    return guestPerTable;
  };
  // Hàm xóa hợp đồng và thực đơn
  const handleDeleteContractAndMenu = async () => {
    try {
      // Gọi API xóa hợp đồng
      await guestContractApi.delete(contractInfo.contractId);

      // Gọi API xóa thực đơn
      await guestContractApi.deleteMenu(contractInfo.menus?.menuId);
      await Swal.fire({
        icon: "success",
        title: "Thành công",
        text: "Hủy hợp đồng thành công!",
        timer: 2000, // Tự động đóng sau 2 giây
        showConfirmButton: false,
      });

      // Điều hướng về danh sách hợp đồng khi xóa thành công
      navigate("/user/contract-list");
    } catch (error) {
      console.error("Xóa thất bại:", error);
      await Swal.fire({
        icon: "danger",
        title: "Hủy hợp đồng",
        text: "Hủy hợp đồng thất bại!",
        timer: 2000, // Tự động đóng sau 2 giây
        showConfirmButton: true,
      });
    }
  };

  const fetchContractInfo = async () => {
    try {
      const contractInfoFetch = await guestContractApi.get(id);
      const eventServicesFetch = await guestEventServiceApi.getByEventId(
        contractInfoFetch.result.events.eventId,
        1,
        5000
      );
      const menuDishesFetch = await menudishApi.getByMenu(
        contractInfoFetch.result.menus.menuId,
        1,
        5000
      );

      const servicesList = eventServicesFetch.result.content.map(
        (item) => item.services
      );
      const menuDishes = menuDishesFetch.result.content.map(
        (item) => item.dishes
      );
      setEventServicesInfo(servicesList);
      setContractInfo(contractInfoFetch.result);
      setMenuDishesInfo(menuDishes);
      console.log("Fetch contract thành công", contractInfo);
      console.log("Fetch event Services thành công:", eventServicesInfo);
      console.log("Fetch menu dishes thành công", menuDishesInfo);
      autoScroll(
        contractInfoFetch.result.status,
        contractInfoFetch.result.paymentstatus
      );
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  const checkStates = () => {
    console.log("Fetch contract thành công", contractInfo);
    console.log("Fetch event Services thành công:", eventServicesInfo);
    console.log("Fetch menu dishes thành công", menuDishesInfo);
  };

  React.useEffect(() => {
    // Dynamically import Bootstrap CSS
    import("bootstrap/dist/css/bootstrap.min.css");
    import("../../assets/css/mainStyle.css");
    import("../../assets/css/contractGuestStyle.css");

    console.log("Id hứng được:", id);
    console.log("paymentStatus hứng được:", paymentStatus);
    alertPaymentStatus();
    fetchContractInfo();
  }, []);

  const formatCurrency = (amount) => {
    return amount
      ? amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
      : "0";
  };

  const handlePayment = () => {};

  return (
    <>
      <Card
        name="contractInfo"
        className="p-5"
        style={{ opacity: 0.9, borderTopLeftRadius: 0 }}
      >
        <h2 style={{ color: "hsl(28, 100%, 58%)" }}>Thông tin hợp đồng</h2>
        <div name="contractForm" className="contractForm">
          <div className="row row-cols-sm-1 row-cols-md-2">
            <div className="col">
              <div className="mb-3">
                <label className="form-label fw-bold">Thực đơn</label>
                <button
                  className="form-control fs-4 d-flex justify-content-between align-middle input-hienthi-popup"
                  onClick={handleShowModalMenu}
                >
                  Thực đơn {contractInfo.events?.name}
                  <FaEye style={{ marginTop: 4 }} />
                </button>
              </div>

              <div className="row row-cols-md-2 mb-3">
                <div className="col">
                  <label className="form-label fw-bold">Địa điểm</label>
                  <div className="form-control fs-4 d-flex justify-content-between align-middle input-hienthi">
                    <p
                      className="mb-0"
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {contractInfo.locations?.name} -{" "}
                      {contractInfo.locations?.address}
                    </p>
                  </div>
                </div>
                <div className="col">
                  <label className="form-label fw-bold">Dịch vụ</label>
                  <div className="d-flex align-items-center ">
                    <div
                      className="form-control fs-4  input-hienthi-popup d-flex justify-content-between align-items-center w-100"
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
                        {eventServicesInfo[0]?.name} -{" "}
                        {formatCurrency(eventServicesInfo[0]?.price)} ...
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
                  {contractInfo.organizdate}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Ghi chú</label>
                <div className="form-control input-hienthi fs-4 me-2">
                  {contractInfo.description ? (
                    <div>{contractInfo.description}</div>
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
                  {contractInfo.events?.name}
                </div>
              </div>
            </div>

            <div className="col">
              <div className="mb-3">
                <label className="form-label fw-bold">
                  Số lượng khách ước tính
                </label>
                <div className="form-control input-hienthi fs-4">
                  {contractInfo.guest}
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
                    contractInfo.menus?.totalcost,
                    finaltotalMenuCost,
                    contractInfo.table
                  )}
                </div>
              </div>
            </div>

            <div className="col">
              <div className="mb-3">
                <label className="form-label fw-bold">Số bàn cuối cùng</label>
                <div className="form-control input-hienthi fs-4">
                  {contractInfo.table}
                </div>
              </div>
            </div>
          </div>

          <h3 style={{ color: "var(--dark-orange)" }}>Thông Tin Khách Hàng</h3>
          <Row lg={3} md={3} xs={1}>
            <Col>
              <div className="mb-3">
                <label className="form-label fw-bold ">Tên Khách Hàng</label>
                <div className="form-control input-hienthi fs-4">
                  {contractInfo.custname}
                </div>
              </div>
            </Col>
            <Col>
              <div className="mb-3">
                <label className="form-label fw-bold">
                  Số Điện Thoại Khách Hàng
                </label>
                <div className="form-control input-hienthi fs-4">
                  {contractInfo.custphone}
                </div>
              </div>
            </Col>
            <Col>
              <div className="mb-3">
                <label className="form-label fw-bold">Email liên hệ</label>
                <div className="form-control input-hienthi fs-4">
                  {contractInfo.custmail}
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
                  {formatCurrency(contractInfo.locations?.cost)} VND
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
                  {formatCurrency(finaltotalMenuCost)} VND
                </span>
              </div>
            </div>

            <div className="ms-auto">
              <div className="mb-3 d-flex align-items-center">
                <label className="form-label fw-bold mb-0 me-2">
                  Tổng giá trị hợp đồng:
                </label>
                <span className="text-success fw-bold">
                  {formatCurrency(contractInfo.totalcost)} VND
                </span>
              </div>
              <div className="mb-3 d-flex align-items-center">
                <label className="form-label fw-bold mb-0 me-2">
                  Đã thanh toán:
                </label>
                <span className="text-success fw-bold">
                  {formatCurrency(contractInfo.prepay)} VND
                </span>
              </div>
              <div className="mb-3 d-flex align-items-center">
                <label className="form-label fw-bold mb-0 me-2">
                  Số tiền còn lại:
                </label>
                <span className="text-success fw-bold">
                  {formatCurrency(
                    contractInfo.totalcost - contractInfo.prepay //sau này tính ở đây
                  )}{" "}
                  VND
                </span>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-between">
            <h3 style={{ color: "var(--dark-orange)" }}>
              Trạng thái hợp đồng:{" "}
              <span
                className="d-inline-block"
                style={{
                  color:
                    contractInfo.status === "Pending"
                      ? "var(--sonic-silver)"
                      : contractInfo.status === "Approved"
                      ? "var(--deep-saffron)"
                      : "var(--green-success)",
                }}
              >
                {contractInfo.status === "Pending"
                  ? "Chờ xác nhận"
                  : contractInfo.status === "Approved"
                  ? "Đã xác nhận"
                  : contractInfo.status === "Actived"
                  ? "Đang hoạt động"
                  : "Đã hoàn thành"}
              </span>
            </h3>

            <h3 style={{ color: "var(--dark-orange)" }}>
              Trạng thái thanh toán:{" "}
              <span
                className="d-inline-block"
                style={{
                  color:
                    contractInfo.paymentstatus === "Unpaid"
                      ? "var(--sonic-silver)"
                      : contractInfo.paymentstatus === "Prepay 50%"
                      ? "var(--green-success)"
                      : contractInfo.paymentstatus === "Prepay 70%"
                      ? "var(--green-success)"
                      : "var(--green-success)",
                }}
              >
                {contractInfo.paymentstatus === "Unpaid"
                  ? "Chưa thanh toán"
                  : contractInfo.paymentstatus === "Prepay 50%"
                  ? "Đã thanh toán 50%"
                  : contractInfo.paymentstatus === "Prepay 70%"
                  ? "Đã thanh toán 70%"
                  : "Đã thanh toán"}
              </span>
            </h3>
          </div>
        </div>
      </Card>
      <div style={{ textAlign: "center" }}>
        {contractInfo.status === "Pending" &&
          contractInfo.paymentstatus === "Unpaid" && (
            <button
              type="button"
              className="btn btn-save-form btn-huy mx-3"
              style={{ marginTop: "1rem" }}
              onClick={handleShowModalCancel}
            >
              Hủy hợp đồng
            </button>
          )}
      </div>
      {(contractInfo.paymentstatus === "Unpaid" ||
        contractInfo.paymentstatus === "Prepay 50%" ||
        contractInfo.paymentstatus === "Prepay 70%") &&
        contractInfo.status !== "Pending" && (
          <PaymentCard onHide={handlePayment} contractInfo={contractInfo} />
        )}

      <ConfirmCancelModal
        show={showModalCancel}
        onHide={handleCloseModalCancel}
        onConfirm={handleDeleteContractAndMenu}
      />

      <ModalInfoMenu
        show={showModalMenu}
        onClose={handleCloseModalMenu}
        totalMenu={contractInfo.menus?.totalcost}
        menuDishes={menuDishesInfo}
        status={true}
      />
      <ModalInfoServices
        show={showModalServices}
        onClose={handleCloseModalServices}
        onTotalCost={handleServicesTotalCost}
        servicesList={eventServicesInfo}
      />
    </>
  );
};

export default ContractInfo;
