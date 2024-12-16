import React from "react";
import { Modal, Button } from "react-bootstrap";
import { IoWarningOutline } from "react-icons/io5";

const ConfirmCancelModal = ({ show, onHide, onConfirm }) => {
  const [selectedReasons, setSelectedReasons] = React.useState([]);

  const handleCheckboxChange = (reason) => {
    setSelectedReasons(
      (prev) =>
        prev.includes(reason)
          ? prev.filter((r) => r !== reason) // Bỏ nếu đã có
          : [...prev, reason] // Thêm nếu chưa có
    );
  };
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Body>
        <div className="d-flex flex-column align-items-center text-center">
          <h3 className="mb-3">
            Xác nhận hủy hợp đồng và xóa thực đơn đã tạo?
          </h3>
          <div className="mb-3">
            <IoWarningOutline size={92} color="orange" />
          </div>
          <p>Hãy cho chúng tôi biết lí do bạn hủy hợp đồng?</p>
        </div>

        <div className="align-center w-75 m-auto">
          <div
            style={{
              display: "flex",
            }}
          >
            {/* Checkbox */}
            <input
              type="checkbox"
              id="reason1"
              onChange={() => handleCheckboxChange("Sai thông tin cá nhân")}
              style={{
                marginRight: "8px", // Khoảng cách giữa checkbox và label
                width: "20px", // Kích thước chiều rộng của checkbox
                height: "20px", // Kích thước chiều cao của checkbox
                flexShrink: 0, // Không thu nhỏ checkbox
              }}
            />
            {/* Label */}
            <label
              htmlFor="reason1"
              style={{
                display: "inline-flex", // Sử dụng inline-flex để label và span nằm cùng hàng
                alignItems: "center", // Căn giữa nội dung trong label
                cursor: "pointer",
              }}
            >
              Tôi bị sai sót thông tin cá nhân
            </label>
          </div>
          <div
            style={{
              display: "flex",
            }}
          >
            {/* Checkbox */}
            <input
              type="checkbox"
              id="reason2"
              onChange={() => handleCheckboxChange("Sai thông tin hợp đồng")}
              style={{
                marginRight: "8px", // Khoảng cách giữa checkbox và label
                width: "20px", // Kích thước chiều rộng của checkbox
                height: "20px", // Kích thước chiều cao của checkbox
                flexShrink: 0, // Không thu nhỏ checkbox
              }}
            />
            {/* Label */}
            <label
              htmlFor="reason2"
              style={{
                display: "inline-flex", // Sử dụng inline-flex để label và span nằm cùng hàng
                alignItems: "center", // Căn giữa nội dung trong label
                cursor: "pointer",
              }}
            >
              Sai sót nội dung hợp đồng
            </label>
          </div>
          <div
            style={{
              display: "flex",
            }}
          >
            {/* Checkbox */}
            <input
              type="checkbox"
              id="reason3"
              onChange={() => handleCheckboxChange("Đổi ý")}
              style={{
                marginRight: "8px", // Khoảng cách giữa checkbox và label
                width: "20px", // Kích thước chiều rộng của checkbox
                height: "20px", // Kích thước chiều cao của checkbox
                flexShrink: 0, // Không thu nhỏ checkbox
              }}
            />
            {/* Label */}
            <label
              htmlFor="reason3"
              style={{
                display: "inline-flex", // Sử dụng inline-flex để label và span nằm cùng hàng
                alignItems: "center", // Căn giữa nội dung trong label
                cursor: "pointer",
              }}
            >
              Tôi đổi ý rồi
            </label>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-center">
        <Button
          variant="secondary"
          className="btn-modal-delete-huy mx-2"
          onClick={onHide}
        >
          Không
        </Button>
        <Button
          variant="danger"
          className="btn-modal-delete mx-2"
          onClick={() => onConfirm(selectedReasons)} // Gửi danh sách lý do khi xác nhận
          disabled={selectedReasons.length === 0} // Disable nếu không có checkbox được chọn
        >
          Đồng ý
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmCancelModal;
