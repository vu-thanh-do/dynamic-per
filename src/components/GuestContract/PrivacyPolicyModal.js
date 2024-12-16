import React from "react";
import { Modal, Button } from "react-bootstrap";

function PrivacyPolicyModal({ show, handleClose }) {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Điều khoản và chính sách</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Chào mừng bạn đến với OBBM – nền tảng đặt tiệc trực tuyến hàng đầu!
          Chúng tôi cam kết bảo mật thông tin của bạn. Vui lòng đọc kỹ chính
          sách bảo mật dưới đây:
        </p>
        <ul>
          <li>
            Thông tin cá nhân của bạn chỉ được sử dụng cho mục đích đặt tiệc.
          </li>
          <li>
            Chúng tôi sẽ không chia sẻ thông tin của bạn với bên thứ ba khi chưa
            có sự đồng ý.
          </li>
          <li>
            Bạn có thể yêu cầu xóa thông tin của mình bất cứ lúc nào bằng cách
            liên hệ với chúng tôi.
          </li>
          <li className="text-primary">
            Nếu bạn đã thanh toán nhưng muốn hủy hợp đồng, hãy liên hệ trực tiếp
            số hotline: 0888 787 499 để được hoàn trả tiền trong vòng 24h
          </li>
        </ul>
        <p>
          Khi tiếp tục, bạn đồng ý với các điều khoản và chính sách bảo mật.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default PrivacyPolicyModal;
