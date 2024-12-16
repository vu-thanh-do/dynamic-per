import React from "react";
import { Modal, Button } from "react-bootstrap";
import Swal from "sweetalert2"; 
import guestLocationApi from "../../api/guestLocationApi"; // Đảm bảo đường dẫn tới API đúng
import { IoWarningOutline } from "react-icons/io5";

function ModalDelete({ show, onClose, locationId, onDeleteSuccess, name }) {
  const handleDelete = async () => {
    try {
      await guestLocationApi.delete(locationId);

      // Hiển thị thông báo xóa thành công bằng sweetalert2
      Swal.fire({
        icon: "success",
        title: "Thành công",
        text: "Xóa địa điểm thành công!",
        timer: 2000, // Tự động đóng sau 2 giây
        showConfirmButton: true,
      });

      onDeleteSuccess(); // Gọi để tải lại dữ liệu
      onClose(); // Đóng modal sau khi xóa
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Thất bại",
        text: "Xóa địa điểm thất bại!",
        timer: 2000, // Tự động đóng sau 2 giây
      });
      console.error("Error deleting location:", error);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      style={{ backgroundColor: "rgba(0,0,0, 0.5)" }}
      centered
    >
      <Modal.Body className="d-flex flex-column align-items-center text-center">
        <h3 className="mb-3">Cảnh báo</h3>
        <div className="mb-3">
          <IoWarningOutline size={92} color="orange" />
        </div>
        <div>Xác nhận xóa địa điểm "{name}"?</div>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-center">
        <Button
          variant="secondary"
          className="btn-modal-delete-huy mx-2"
          onClick={onClose}
        >
          Hủy
        </Button>
        <Button
          variant="danger"
          className="btn-modal-delete mx-2"
          onClick={handleDelete}
        >
          Đồng ý
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalDelete;
