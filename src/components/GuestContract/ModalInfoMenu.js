import React from "react";
import { Modal, Button, Row, Col, Image } from "react-bootstrap";
import { FaTimes } from "react-icons/fa";

function ModalInfoMenu({ show, onClose, menuDishes, status, totalMenu }) {
  const formatCurrency = (amount) => {
    return amount
      ? amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
      : "0";
  };

  const categoryList = [1, 2, 3];

  return status === true ? ( //true là bên contract info
    <Modal show={show} onHide={onClose} centered>
      <div style={{ width: "420px", margin: "30px auto" }}>
        <button
          className="add-button"
          onClick={onClose}
          style={{ color: "hsl(32, 100%, 59%)" }}
        >
          <FaTimes
            style={{ color: "#341c0e", width: "12px", marginTop: "12px" }}
          />{" "}
        </button>
        <div className="chiTietThucDon m-0">
          <div className="menu-view-control">
            {categoryList.map((categoryId, index) => (
              <div key={index} style={{ marginBottom: "8px" }}>
                <h3 className="text-left fw-bold">
                  {categoryId === 1
                    ? "Khai vị"
                    : categoryId === 2
                    ? "Món chính"
                    : categoryId === 3
                    ? "Tráng miệng"
                    : "Đồ uống"}
                </h3>
                <ul>
                  {menuDishes
                    .filter(
                      (menudish) =>
                        menudish.categories.categoryId === categoryId
                    )
                    .map((dish, index) => (
                      <li key={index}>
                        <strong>{dish.name}</strong>{" "}
                      </li>
                    ))}
                </ul>
              </div>
            ))}
            <div
              className="d-flex"
              style={{ position: "absolute", bottom: "35px", left: "40px" }}
            >
              <h3 className="fw-bold">Tổng giá trị:</h3>
              <span className="text-success fw-bold">
                {formatCurrency(totalMenu)} VND
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  ) : (
    //false là bên bước 3
    <Modal show={show} onHide={onClose} centered>
      <div style={{ width: "420px", margin: "30px auto" }}>
        <button
          className="add-button"
          onClick={onClose}
          style={{ color: "hsl(32, 100%, 59%)" }}
        >
          <FaTimes
            style={{ color: "#341c0e", width: "12px", marginTop: "12px" }}
          />
        </button>
        <div className="chiTietThucDon m-0">
          <div className="menu-view-control">
            {menuDishes &&
              status === false &&
              // Thứ tự và ánh xạ tiêu đề tiếng Việt
              ["Appetizers", "Main Courses", "Desserts"].map(
                (category, index) => (
                  <div key={index} style={{ marginBottom: "8px" }}>
                    <h3 className="fw-bold">
                      {category === "Appetizers"
                        ? "Khai vị"
                        : category === "Main Courses"
                        ? "Món chính"
                        : category === "Desserts"
                        ? "Tráng miệng"
                        : ""}
                    </h3>
                    <ul>
                      {menuDishes[category]?.map((dish) => (
                        <li key={dish.dishId}>
                          <strong>{dish.name}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              )}
            <div
              className="d-flex"
              style={{ position: "absolute", bottom: "35px", left: "40px" }}
            >
              <h3 className="fw-bold">Tổng giá trị:</h3>
              <span className="text-success fw-bold">
                {formatCurrency(totalMenu)} VND
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default ModalInfoMenu;
