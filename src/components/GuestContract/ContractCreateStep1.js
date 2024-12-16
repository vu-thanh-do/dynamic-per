import * as React from "react";
import { multiStepContext } from "../../StepContext";
import { IoIosInformationCircle } from "react-icons/io";
import { Form, Card, Row, Col } from "react-bootstrap";
import axiosClient from "config/axiosClient";

const ContractCreateStep1 = () => {
  const { setStep, contractData, setContractData, setTempData } =
    React.useContext(multiStepContext);
  const [userInfo, setUserInfo] = React.useState({});
  const [errors, setErrors] = React.useState({ custname: "", custphone: "" });

  const fetchUserInfo = async () => {
    try {
      const userInfoFetch = await axiosClient.get(
        "https://62c6-2001-ee0-5722-4dc0-a8e7-eaeb-2e68-34e5.ngrok-free.app/obbm/users/myInfo"
      );
      console.log("Fetch thành công");
      setUserInfo(userInfoFetch.result);
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  React.useEffect(() => {
    fetchUserInfo();
  }, []);

  React.useEffect(() => {
    // Only set initial values if fields are empty
    if (
      !contractData.custname &&
      !contractData.custphone &&
      userInfo.fullname
    ) {
      setContractData((prevData) => ({
        ...prevData,
        custname: userInfo.fullname,
        custphone: userInfo.phone,
      }));
      setTempData((prevData) => ({
        ...prevData,
        custmail: userInfo.email,
      }));
    }
    sessionStorage.setItem("currentUserId", JSON.stringify(userInfo.userId));
  }, [userInfo, contractData, setContractData]);

  // Function to validate the form fields
  const validateForm = () => {
    let isValid = true;
    const newErrors = { custname: "", custphone: "" };

    // Check if the customer's name is empty
    if (!contractData.custname || contractData.custname.trim() === "") {
      newErrors.custname = "Tên khách hàng không được để trống.";
      isValid = false;
    }

    // Check if the customer's phone is valid
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!contractData.custphone || !phoneRegex.test(contractData.custphone)) {
      newErrors.custphone =
        "Số điện thoại phải có đúng 10 số và hợp lệ ở Việt Nam.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle click on "Next" button
  const handleNextClick = () => {
    if (validateForm()) {
      setStep(2);
    }
  };

  return (
    <div>
      <Card className="card p-5 w-100 mt-5">
        <div className="text-center mb-5">
          <h1>Bước 1: Cung cấp thông tin khách hàng</h1>
        </div>

        <Form name="contractForm" className="contractForm">
          <div className="container w-75">
            <Row lg={2} md={2} xs={2}>
              <Col>
                <div className="mb-3">
                  <label className="form-label fw-bold ">
                    Tên Khách Hàng
                    <span className="text-danger d-inline-block">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Tên"
                    className="form-control fs-4"
                    value={contractData.custname || ""}
                    onChange={(e) =>
                      setContractData({
                        ...contractData,
                        custname: e.target.value,
                      })
                    }
                  />
                  {errors.custname && (
                    <div className="text-danger fs-5">{errors.custname}</div>
                  )}
                </div>
              </Col>
              <Col>
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Số Điện Thoại Khách Hàng
                    <span className="text-danger d-inline-block">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Số điện thoại"
                    className="form-control fs-4 me-2"
                    value={contractData.custphone || ""}
                    onChange={(e) =>
                      setContractData({
                        ...contractData,
                        custphone: e.target.value,
                      })
                    }
                  />
                  {errors.custphone && (
                    <div className="text-danger fs-5">{errors.custphone}</div>
                  )}
                </div>
              </Col>
              <Col>
                <div className="mb-3">
                  <label className="form-label fw-bold">Email tài khoản</label>
                  <div className="form-control fs-4 input-hienthi" required>
                    {userInfo.email || "Biến"}
                  </div>
                </div>
              </Col>
              <Col>
                <div className="mb-3">
                  <label className="form-label fw-bold">CCCD tài khoản</label>
                  <div className="form-control fs-4 input-hienthi" required>
                    {userInfo.citizenIdentity || "CCCD nè"}
                  </div>
                </div>
              </Col>
            </Row>
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
                Email và CCCD là của tài khoản hiện tại. Tải lên CCCD mới nếu
                muốn thay đổi
              </span>
              <a className="fw-bold" href="/account" style={{ marginLeft: "4px" }}>
                tại đây
              </a>
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <button
              type="button"
              className="btn btn-save-form mx-3"
              onClick={handleNextClick}
              style={{ marginTop: "1rem" }}
            >
              Tiếp theo
            </button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ContractCreateStep1;
