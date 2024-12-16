import * as React from "react";
import moment from "moment";
import { Form, Card } from "react-bootstrap";
import { multiStepContext } from "../../StepContext";
import ModalLocations from "./ModalLocations";
import ModalServices from "./ModalServices";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import eventApi from "api/eventApi";
import { checkAccessToken } from "services/checkAccessToken";
import { useNavigate } from "react-router-dom";
import { IoIosInformationCircle } from "react-icons/io";

const ContractCreateStep2 = () => {
  const navigate = useNavigate();

  const { setStep, contractData, setContractData } =
    React.useContext(multiStepContext);
  const location = JSON.parse(localStorage.getItem("currentLocation")); // Parse chuỗi JSON thành đối tượng
  const servicesStored = JSON.parse(
    localStorage.getItem("currentEventServices")
  ); // Parse chuỗi JSON thành đối tượng
  const currentEventId = JSON.parse(localStorage.getItem("currentEventId")); // Parse chuỗi JSON thành đối tượng
  const createdMenu = JSON.parse(localStorage.getItem("createdMenu")); // Parse chuỗi JSON thành đối tượng
  const [errors, setErrors] = React.useState({});
  const [isInvalid, setIsInvalid] = React.useState(true);

  const [currentEventInfo, setCurrentEventInfo] = React.useState({});

  const [totalMenuCost, setTotalMenuCost] = React.useState(0);
  const [totalServicesCost, setTotalServicesCost] = React.useState(0);

  const [guestPerTable, setGuestPerTable] = React.useState(6);
  const [minTableCount, setMinTableCount] = React.useState(0);

  const [showModalMenu, setShowModalMenu] = React.useState(false);

  // const getCurrentMenuDishes = () => {
  //   const dishes = localStorage.getItem("currentMenuDishes");
  //   return dishes ? JSON.parse(dishes) : [];
  // };

  const fetchEvent = async () => {
    try {
      const currentEvent = await eventApi.get(currentEventId);
      setCurrentEventInfo(currentEvent.result);
    } catch (error) {
      checkAccessToken(navigate);
    }
  };

  const handleShowModalMenu = () => {
    setShowModalMenu(true);
  };

  const handleCloseModalMenu = () => {
    setShowModalMenu(false);
  };

  const handleUpdateTotalCost = (newTotal) => {
    setTotalServicesCost(newTotal);
  };

  React.useEffect(() => {
    const guestCount = parseInt(contractData.guest) || 0; // Số khách mặc định là 0 nếu không nhập
    const guestPerTableLocal = guestPerTable || 1; // Số khách trên một bàn mặc định là 1
    const minTableCount = Math.ceil(guestCount / guestPerTableLocal); // Tính số bàn tối thiểu

    setMinTableCount(minTableCount); // Gán giá trị tối thiểu (không set trực tiếp vào contractData)
  }, [contractData.guest, guestPerTable]);

  React.useEffect(() => {
    const guestCount = parseInt(contractData.guest) || 0;
    const menuCost = parseInt(createdMenu.totalcost);

    //set total cost của contract
    const totalMenuCost = menuCost * (guestPerTable * contractData.table);
    setTotalMenuCost(totalMenuCost);

    const totalCost =
      totalMenuCost + parseInt(location?.cost ?? 0) + totalServicesCost;

    setContractData((prevData) => ({
      ...prevData,
      totalcost: totalCost,
      locationId: location?.locationId,
    }));

    console.log("Cập nhật totalCost:", totalCost);
    console.log("contractData sau khi cập nhật totalCost:", {
      ...contractData,
      totalCost: totalCost,
    });
  }, [
    setContractData,
    location?.cost,
    totalServicesCost,
    guestPerTable,
    contractData.guest,
    contractData.table,
  ]);

  React.useEffect(() => {
    fetchEvent();
  }, []);

  React.useEffect(() => {
    if (contractData.guest === 0 || contractData.guest === null) {
      setErrors({
        ...errors,
        guestCount: null,
      });
    }
  }, [contractData.guest]);

  const formatCurrency = (amount) => {
    return amount
      ? amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
      : "0";
  };

  const handleDateChange = (date) => {
    if (date) {
      // Kiểm tra nếu ngày hợp lệ và thêm thời gian mặc định nếu cần
      const dateWithDefaultTime = new Date(date);
      if (
        dateWithDefaultTime.getHours() === 0 &&
        dateWithDefaultTime.getMinutes() === 0
      ) {
        dateWithDefaultTime.setHours(11, 0, 0, 0);
      }

      const formattedDate =
        moment(dateWithDefaultTime).format("DD/MM/YYYY HH:mm");
      setContractData({
        ...contractData,
        organizdate: formattedDate,
      });
    } else {
      console.error("Ngày không hợp lệ:", date);
    }
  };

  const handleGuestChange = (e) => {
    const value = parseInt(e.target.value) || 0;

    if (value < 0) {
      setErrors({
        ...errors,
        guestCount: "Số lượng khách không thể là số âm.",
      });
      setIsInvalid(true);
      setContractData({
        ...contractData,
        guest: 0,
        table: 0,
      });
      setMinTableCount(0);
    } else if (location) {
      const maxGuest = location.isCustom ? 5000 : location.capacity;
      if (value > maxGuest) {
        setErrors({
          ...errors,
          guestCount: `Sức chứa của địa điểm tối đa là: ${maxGuest}.`,
        });
        setContractData({
          ...contractData,
          guest: maxGuest,
          table: Math.ceil(maxGuest / guestPerTable),
        });
        setMinTableCount(Math.ceil(maxGuest / guestPerTable));
        setIsInvalid(true);
      } else {
        setErrors({
          ...errors,
          guestCount: null,
        });
        setIsInvalid(false);
        const tableCount = Math.ceil(value / guestPerTable);
        setContractData({
          ...contractData,
          guest: value,
          table: tableCount,
        });
        setMinTableCount(tableCount);
      }
    } else {
      setErrors({
        ...errors,
        guestCount: "Vui lòng chọn địa điểm trước.",
      });
      setIsInvalid(true);
    }
  };

  const handleGuestPerTableChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setGuestPerTable(value);
      if (contractData.guest >= 6) {
        const tableCount = Math.ceil(contractData.guest / value);
        setContractData({
          ...contractData,
          table: tableCount,
        });
        setMinTableCount(tableCount);
      }
    }
  };

  const handleTableChange = (e) => {
    let value = e.target.value.replace(/^0+/, "").replace(/\D+/g, "");
    value = parseInt(value) || 0;
    const minTable = minTableCount;
    const maxTable = minTableCount + 3;

    if (contractData.guest > 0) {
      setContractData({
        ...contractData,
        table: Math.max(Math.min(value, maxTable), minTable),
      });
      if (value > maxTable) {
        setErrors({
          ...errors,
          table: "Tối đa đặt dư 3 bàn.",
        });
      } else {
        setErrors({
          ...errors,
          table: null,
        });
      }
    }
  };

  const isFormValid =
    guestPerTable !== undefined &&
    contractData.guest !== undefined &&
    contractData.guest > 10 &&
    contractData.locationId !== undefined &&
    contractData.organizdate !== undefined &&
    !Number.isNaN(contractData.totalcost);

  return (
    <div>
      <Card className="card p-5 w-100 mt-5">
        <div className="text-center mb-5">
          <h1>Bước 2: Chọn nội dung hợp đồng</h1>
        </div>

        <Form name="contractForm" className="contractForm">
          <div className="row row-cols-sm-1 row-cols-md-2">
            <div className="col">
              <div className="mb-3">
                <label className="form-label fw-bold">
                  Địa điểm
                  <span className="text-danger d-inline-block">*</span>
                </label>
                <div className="d-flex align-items-center">
                  <ModalLocations />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">
                  Dịch vụ đi kèm
                  <span className="text-danger d-inline-block">*</span>
                </label>
                <div className="d-flex align-items-center">
                  <ModalServices onUpdateTotalCost={handleUpdateTotalCost} />
                </div>
              </div>
            </div>

            <div className="col">
              <div className="mb-3">
                <label className="form-label fw-bold" htmlFor="organizdate">
                  Ngày tổ chức
                  <span className="text-danger d-inline-block">*</span>
                </label>
                <div className="d-flex">
                  <DatePicker
                    selected={
                      contractData.organizdate
                        ? moment(
                            contractData.organizdate,
                            "DD/MM/YYYY HH:mm"
                          ).toDate()
                        : null
                    }
                    onChange={handleDateChange}
                    showTimeSelect
                    dateFormat="dd/MM/yyyy HH:mm"
                    timeFormat="HH:mm"
                    minDate={
                      new Date(new Date().setDate(new Date().getDate() + 8))
                    }
                    required
                    className="form-control fs-4 w-100"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Ghi chú</label>
                <input
                  className="form-control fs-4 me-2"
                  value={contractData["description"]}
                  onChange={(e) => {
                    setContractData({
                      ...contractData,
                      description: e.target.value,
                    });
                  }}
                  placeholder="Nhập ghi chú..."
                ></input>
              </div>
            </div>
          </div>

          <div className="row row-cols-sm-2 row-cols-lg-4">
            <div className="col">
              <div className="mb-3">
                <label className="form-label fw-bold">Sự kiện</label>
                <div
                  name="table"
                  id="table"
                  className="form-control input-hienthi fs-4"
                >
                  {currentEventInfo?.name}
                </div>
              </div>
            </div>

            <div className="col">
              <div className="mb-3">
                <label className="form-label fw-bold">
                  Số lượng khách ước tính
                  <span className="text-danger d-inline-block">*</span>
                </label>
                <input
                  type="number"
                  name="guest"
                  id="guest"
                  placeholder="Số lượng khách"
                  className={`form-control fs-4 ${
                    errors.guestCount ? "is-invalid" : ""
                  }`}
                  value={contractData.guest}
                  onChange={handleGuestChange}
                  required
                />
                {errors.guestCount && (
                  <div className="text-danger fs-5">{errors.guestCount}</div>
                )}
              </div>
            </div>

            {/* Select Số lượng khách / bàn */}
            <div className="col">
              <div className="mb-3">
                <label className="form-label fw-bold">
                  Số lượng khách / bàn
                  <span className="text-danger d-inline-block">*</span>
                </label>
                <select
                  name="guestPerTable"
                  id="guestPerTable"
                  className="form-select fs-4"
                  value={guestPerTable}
                  onChange={handleGuestPerTableChange}
                  required
                >
                  <option value={6}>6 người/bàn</option>
                  <option value={8}>8 người/bàn</option>
                  <option value={10}>10 người/bàn</option>
                </select>
              </div>
            </div>

            {/* Input Số bàn */}
            <div className="col">
              <div className="mb-3">
                <label className="form-label fw-bold">
                  Số bàn
                  <span className="text-danger d-inline-block">*</span>
                </label>
                <input
                  type="number"
                  name="table"
                  id="table"
                  className="form-control input-hienthi-popup fs-4"
                  value={contractData.table}
                  min={minTableCount}
                  max={200}
                  readOnly={false}
                  placeholder={minTableCount}
                  required
                  onChange={handleTableChange}
                />
                {errors.table && (
                  <div className="text-danger fs-5">{errors.table}</div>
                )}
              </div>
            </div>
          </div>

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
                  {formatCurrency(location?.cost)} VND
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
                  {formatCurrency(totalMenuCost)} VND
                </span>
              </div>
            </div>
          </div>
          <div className="d-flex justify-content-center">
            <div className="mb-3 d-flex align-items-center">
              <label className="form-label fw-bold mb-0 me-2">Tổng cộng:</label>
              <span className="text-success fw-bold">
                {formatCurrency(contractData.totalcost)} VND
              </span>
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <button
              type="button"
              className="btn btn-secondary btn-save-form mx-3"
              onClick={() => setStep(1)}
              style={{ margin: "10px auto" }}
            >
              Trở về
            </button>
            <button
              type="button"
              className="btn btn-save-form mx-2"
              onClick={() => setStep(3)}
              style={{ margin: "10px auto" }}
              disabled={!isFormValid}
            >
              Tiếp theo
            </button>
            <div style={{ display: "flex", alignItems: "center" }}>
              <p
                className="text-danger fw-bold mb-0"
                style={{
                  marginRight: "4px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <IoIosInformationCircle className="mt-1 me-2" />
                Lưu ý:{" "}
              </p>
              <span className="text-secondary fw-bold">
                Nhập vào "Số lượng khách ước tính" để tự động tính số bàn tối
                thiểu.
              </span>
            </div>
          </div>
        </Form>
      </Card>
      {/* <ModalInfoMenu show={showModalMenu} onClose={handleCloseModalMenu} /> */}
    </div>
  );
};

export default ContractCreateStep2;
