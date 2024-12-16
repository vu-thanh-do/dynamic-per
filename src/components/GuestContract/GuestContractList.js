import guestContractApi from "api/guestContractApi";
import React from "react";
import { Card, Form, InputGroup } from "react-bootstrap";
import { FaSearch } from "react-icons/fa"; // Icon tìm kiếm
import {
  LuChevronFirst,
  LuChevronLast,
  LuChevronLeft,
  LuChevronRight,
} from "react-icons/lu";

const ContractList = () => {
  const [contractList, setContractList] = React.useState([]);
  const [filteredContracts, setFilteredContracts] = React.useState([]);

  const [filterStatus, setFilterStatus] = React.useState(""); // Trạng thái lọc
  const [totalPages, setTotalPages] = React.useState(1); // Tổng số trang
  const [currentPage, setCurrentPage] = React.useState(1); // Trang hiện tại

  const currentUserId = localStorage.getItem("userId"); // Parse chuỗi JSON thành đối tượng

  const fetchContractListData = async (page, size) => {
    try {
      const response = await guestContractApi.getContractList(
        currentUserId,
        page,
        size
      );
      const fetchedContracts = response.result.content.reverse();
      setContractList(fetchedContracts); // Lưu toàn bộ danh sách từ API
      setTotalPages(response.result.totalPages); // Lưu tổng số trang từ API
    } catch (error) {
      console.error("Error fetching contract list:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "var(--sonic-silver)"; // Tương ứng với class text-sonic-silver
      case "Approved":
        return "var(--deep-saffron)"; // Tương ứng với class text-deep-saffron
      case "Actived":
        return "var(--green-success)";
      case "Completed":
        return "var(--green-success)"; // Tương ứng với class text-green-success
      default:
        return "muted"; // Màu mặc định nếu không khớp trạng thái nào
    }
  };

  const formatCurrency = (amount) => {
    return amount
      ? amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
      : "0";
  };

  React.useEffect(() => {
    // Dynamically import Bootstrap CSS
    import("bootstrap/dist/css/bootstrap.min.css");
    import("../../assets/css/mainStyle.css");
    import("../../assets/css/contractGuestStyle.css");
    fetchContractListData(1, 6);
  }, []);

  React.useEffect(() => {
    const filtered = contractList.filter(
      (contract) => !filterStatus || contract.status === filterStatus
    );
    setFilteredContracts(filtered);
  }, [filterStatus, contractList]);

  return (
    <section
      className="section section-divider white account-section pt-5"
      id="blog"
    >
      <div className="container" style={{ marginTop: "120px" }}>
        <Card border="1" className="p-5 pt-4">
          <h1 className="text-center">Danh sách hợp đồng</h1>
          <div className="row row-cols-sm-1 row-cols-md-3 ">
            <div className="col mb-3 d-flex align-items-center gap-2">
              <label className="mb-0">Trạng thái: </label>
              <Form.Select
                className="fs-4 w-75"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="Pending">Chờ xác nhận</option>
                <option value="Approved">Đã xác nhận</option>
                <option value="Actived">Đang hoạt động</option>
                <option value="Completed">Đã hoàn thành</option>
              </Form.Select>
            </div>
          </div>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-3 justify-content-center mt-3">
            {filteredContracts.length > 0 ? (
              filteredContracts.map((contract, index) => (
                <div className="col mb-4 px-4" key={index}>
                  <Card className="p-3">
                    <div className="card-title text-body-secondary fw-bold d-flex justify-content-center align-items-center text-center">
                      {contract.name}
                    </div>
                    <div className="d-flex justify-content-center align-items-center fw-bold">
                      Sự kiện:{" "}
                      <span className="ps-1 fw-normal">{contract.type}</span>
                    </div>
                    <div className="d-flex justify-content-center align-items-center fw-bold">
                      Ngày tạo:
                      <span className="ps-1 fw-normal">
                        {contract.createdAt}
                      </span>
                    </div>
                    <div className="d-flex justify-content-center align-items-center fw-bold">
                      SĐT khách hàng:{" "}
                      <span className="ps-1 fw-normal">
                        {contract.custphone}
                      </span>
                    </div>
                    <div className="d-flex justify-content-center align-items-center fw-bold">
                      Tổng giá trị:{" "}
                      <span className="text-success ps-1 fw-bold">
                        {formatCurrency(contract.totalcost)} VND
                      </span>
                    </div>

                    <div className="d-flex justify-content-center align-items-center fw-bold">
                      Trạng thái:{" "}
                      <span
                        className="ps-1"
                        style={{ color: getStatusColor(contract.status) }}
                      >
                        {contract.status === "Pending"
                          ? "Chờ xác nhận"
                          : contract.status === "Approved"
                          ? "Đã xác nhận"
                          : contract.status === "Actived"
                          ? "Đang hoạt động"
                          : "Đã hoàn thành"}
                      </span>
                    </div>

                    <div className="d-flex justify-content-center align-items-center mt-3">
                      <a
                        href={`/contract/info/${contract.contractId}`}
                        className="btn btn-secondary btn-sm p-3"
                      >
                        Chi tiết
                      </a>
                      {contract.paymentstatus !== "Paid" &&
                        contract.status !== "Pending" && (
                          <a
                            href={`/contract/info/${contract.contractId}`}
                            className="btn btn-secondary btn-sm p-3 mx-3 btn-vnp"
                          >
                            Thanh toán
                          </a>
                        )}
                    </div>
                  </Card>
                </div>
              ))
            ) : (
              <div className="d-flex justify-content-center text-center">
                <p >Bạn chưa có hợp đồng nào.</p>
                <a href="/menu">Tạo tại đây</a>
              </div>
            )}
          </div>

          <div className="d-flex justify-content-center mt-4">
            <div
              className="btn-group w-25"
              role="group"
              aria-label="Pagination"
            >
              <button
                type="button"
                className="btn d-flex align-items-center justify-content-center"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
              >
                <LuChevronFirst size={20} /> {/* Tăng kích thước icon */}
              </button>
              <button
                type="button"
                className="btn d-flex align-items-center justify-content-center"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                <LuChevronLeft size={20} /> {/* Tăng kích thước icon */}
              </button>
              <button
                type="button"
                className="btn d-flex align-items-center justify-content-center"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
              >
                <LuChevronRight size={20} /> {/* Tăng kích thước icon */}
              </button>
              <button
                type="button"
                className="btn d-flex align-items-center justify-content-center"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
              >
                <LuChevronLast size={20} /> {/* Tăng kích thước icon */}
              </button>
            </div>
          </div>

          <div className="row mt-2">
            <div className="col-12 text-center">
              {currentPage}/{totalPages}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default ContractList;
