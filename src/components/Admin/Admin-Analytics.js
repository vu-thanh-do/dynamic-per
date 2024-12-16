import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  IconButton,
  Button,
  MenuItem,
  FormControl,
  Dialog,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
} from "@mui/material";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from "chart.js";
import WarningIcon from "@mui/icons-material/Warning";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import MoveToInboxIcon from "@mui/icons-material/MoveToInbox";
// import LaptopIcon from "@mui/icons-material/Laptop";
// import CloseIcon from "@mui/icons-material/Close";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import LogoutIcon from "@mui/icons-material/Logout";
import { DatePicker, message, Select, Modal } from "antd";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom"; // Thêm import này ở đầu file
// Đăng ký các thành phần của biểu đồ
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

const AdminAnalytics = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTimeRange, setSelectedTimeRange] = useState("thisMonth");
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate(); // Khởi tạo hook điều hướng

  const [pendingContracts, setPendingContracts] = useState([]); // Lưu trữ chi tiết hợp đồng
  const [selectedContract, setSelectedContract] = useState(null); // Lưu hợp đồng được chọn

  // Định nghĩa state cho ngày bắt đầu và ngày kết thúc
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [apiData, setApiData] = useState({
    activePaid: { count: 0, total: 0 },
    completedToday: { count: 0, total: 0 },
    revenueByDay: {},
    cancelled: { count: 0, total: 0 },
    pendingApproval: { count: 0, total: 0 },
  });

  const [chartData, setChartData] = useState({
    labels: [], // Nhãn của trục X
    datasets: [
      {
        label: "Doanh thu (VND)",
        data: [], // Dữ liệu biểu đồ
        backgroundColor: "rgba(0, 123, 255, 0.8)",
        borderColor: "rgba(0, 123, 255, 1)",
        borderWidth: 1,
        barThickness: 40,
      },
    ],
  });

  useEffect(() => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // Đầu tháng hiện tại
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Ngày cuối cùng của tháng hiện tại

    setStartDate(startOfMonth);
    setEndDate(endOfMonth);

    // Gọi API để lấy dữ liệu thống kê của tháng hiện tại
    fetchDataByDateRange(startOfMonth, endOfMonth);
  }, []);

  const handleDateChange = (field, value) => {
    if (field === "start") {
      setStartDate(value);
      if (endDate && value > endDate) {
        message.error("Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.");
        return;
      }
    } else if (field === "end") {
      setEndDate(value);
      if (startDate && value < startDate) {
        message.error("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.");
        return;
      }
    }

    // Gọi API khi cả startDate và endDate đều tồn tại và hợp lệ
    const updatedStartDate = field === "start" ? value : startDate;
    const updatedEndDate = field === "end" ? value : endDate;

    if (updatedStartDate && updatedEndDate) {
      fetchDataByDateRange(updatedStartDate, updatedEndDate);
    }
  };

  // Hàm gọi API để lấy hợp đồng chờ duyệt
  // const fetchPendingContracts = async (status, startDate, endDate) => {

  //   try {
  //     // Chuyển đổi startDate và endDate sang định dạng ISO 8601 (bao gồm thời gian)
  //     const startDateFormatted = startDate.toISOString(); // Định dạng chuẩn ISO 8601
  //     const endDateFormatted = endDate.toISOString(); // Định dạng chuẩn ISO 8601

  //     // Gửi yêu cầu GET với query parameters
  //     const response = await fetch(
  //       `https://798b-2001-ee0-5722-4dc0-a8e7-eaeb-2e68-34e5.ngrok-free.app/obbm/contract/byStatusAndDateRange?status=${status}&startDate=${startDateFormatted}&endDate=${endDateFormatted}&page=1&size=10`,
  //       {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  //         },
  //       }
  //     );

  //     const data = await response.json();
  //     console.log("Dữ danh sách chờ duyệt: ", data);

  //     // Cập nhật state với dữ liệu trả về từ API
  //     if (data.code === 1000) {
  //       setPendingContracts(data?.result?.content);
  //     } else {
  //       message.error("Không thể tải dữ liệu.");
  //     }
  //   } catch (error) {
  //     console.error("Lỗi khi lấy dữ liệu:", error);
  //   }
  // };

  // Hàm gọi khi click vào card
  const handlePendingClick = (status) => {
    // fetchPendingContracts(status, startDate, endDate); // Gọi API khi click vào card
    // setOpenModal(true); // Mở modal
    navigate(
      `/admin/ManageContracts?status=${status}&startDate=${startDate?.toISOString()}&endDate=${endDate?.toISOString()}`
    );
  };

  // Hàm đóng modal
  const handleOpenModal = () => {
    setOpenModal(true);
  };

  // Hàm đóng modal
  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedContract(null);
  };

  // Hàm chọn hợp đồng
  const handleContractSelect = (contract) => {
    setSelectedContract(contract); // Cập nhật hợp đồng được chọn
  };

  // Gửi API khi chọn ngày
  const fetchDataByDateRange = async (startDate, endDate) => {
    if (!startDate || !endDate) {
      message.error("Vui lòng chọn cả ngày bắt đầu và ngày kết thúc.");
      return;
    }

    try {
      // Chuyển đổi startDate và endDate sang định dạng ISO 8601 (bao gồm thời gian)
      const startDateFormatted = startDate.toISOString(); // Định dạng chuẩn ISO 8601
      const endDateFormatted = endDate.toISOString(); // Định dạng chuẩn ISO 8601

      // Gửi yêu cầu GET với query parameters
      const response = await fetch(
        `https://62c6-2001-ee0-5722-4dc0-a8e7-eaeb-2e68-34e5.ngrok-free.app/obbm/contract/statistics?startDate=${startDateFormatted}&endDate=${endDateFormatted}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      const data = await response.json();
      console.log("Dữ liệu thống kê: ", data);

      // Cập nhật state với dữ liệu trả về từ API
      if (data.code === 1000) {
        setApiData(data.result);
      } else {
        message.error("Không thể tải dữ liệu.");
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
      message.error("Có lỗi xảy ra khi lấy dữ liệu.");
    }
  };

  const handleTimeRangeChange = (selectedValue) => {
    console.log("Selected value:", selectedValue);

    if (!selectedValue) {
      console.error("Không thể đọc giá trị");
      return;
    }

    setSelectedTimeRange(selectedValue);

    setEndDate(null);
    setStartDate(null);

    // Logic xác định ngày bắt đầu và kết thúc
    let startDate, endDate;
    const today = new Date();

    switch (selectedValue) {
      case "today":
        startDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );
        endDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          23,
          59,
          59
        );
        break;
      case "yesterday":
        startDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - 1
        );
        endDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - 1,
          23,
          59,
          59
        );
        break;
      case "last7days":
        endDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          23,
          59,
          59
        );
        startDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - 7
        );
        break;
      case "thisMonth":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          23,
          59,
          59
        );
        break;
      case "lastMonth":
        const lastMonth = new Date(today);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        startDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
        endDate = new Date(
          lastMonth.getFullYear(),
          lastMonth.getMonth() + 1,
          0,
          23,
          59,
          59
        );
        break;
      default:
        return;
    }

    // Gọi API lấy dữ liệu theo khoảng thời gian
    fetchDataByDateRange(startDate, endDate);
  };

  useEffect(() => {
    if (!apiData || !apiData.revenueByDay) return;

    const revenueByDay = apiData?.revenueByDay || {};
    const sortedDates = Object.keys(revenueByDay).sort(
      (a, b) => new Date(a) - new Date(b)
    ); // Sắp xếp ngày

    setChartData({
      labels: sortedDates.map((date) => date.split("-")[2].padStart(2, "0")), // Chỉ lấy ngày (dd)
      datasets: [
        {
          label: "Doanh thu (VND)",
          data: sortedDates.map((date) => revenueByDay[date]), // Dữ liệu tương ứng
          backgroundColor: "rgba(0, 123, 255, 0.8)",
          borderColor: "rgba(0, 123, 255, 1)",
          borderWidth: 1,
          barThickness: 40,
        },
      ],
    });
  }, [apiData]); // Chạy lại khi `apiData` thay đổi

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Grid container spacing={2} sx={{ minHeight: "100vh" }}>
      {/* Modal hiển thị chi tiết hợp đồng */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        sx={{
          "& .MuiDialog-paper": {
            width: "80%", // Hoặc bất kỳ tỷ lệ nào bạn muốn (ví dụ: 80% chiều rộng màn hình)
            maxWidth: "1100px", // Bạn có thể giới hạn chiều rộng tối đa nếu muốn
          },
        }}
      >
        <Typography
          id="contract-modal-title"
          variant="h6"
          component="h2"
          style={{
            fontSize: "16px",
            marginTop: "10px",
            marginBottom: "10px",
            textAlign: "center",
          }}
        >
          Chi tiết hợp đồng
        </Typography>

        <Divider />

        {pendingContracts.length > 0 ? (
          <div>
            {pendingContracts.map((contract) => (
              <div
                key={contract.contractId}
                style={{
                  margin: "10px 10px",
                  cursor: "pointer",
                  padding: 15,
                  border: "1px solid #ddd",
                  borderRadius: 5,
                  transition: "all 0.3s ease-in-out", // Thêm hiệu ứng khi hover
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)", // Thêm hiệu ứng hover
                  },
                }}
                onClick={() => handleContractSelect(contract)}
              >
                <Typography
                  variant="body1"
                  style={{ fontWeight: "bold", fontSize: "14px" }}
                >
                  {contract.name}
                </Typography>
                <Typography
                  variant="body2"
                  style={{ color: "gray", fontSize: "13px" }}
                >
                  {contract.status} -{" "}
                  {new Intl.NumberFormat("vi-VN").format(contract.totalcost)}{" "}
                  VND
                </Typography>
                <Typography
                  variant="body2"
                  style={{ color: "gray", fontSize: "13px" }}
                >
                  Khách hàng: {contract.custname}
                </Typography>
              </div>
            ))}

            <Divider />

            {selectedContract && (
              <div style={{ marginTop: 20 }}>
                <Typography
                  variant="h6"
                  style={{
                    margin: "10px 10px",
                    fontWeight: "bold",
                    textAlign: "center",
                    fontSize: "14px",
                  }}
                >
                  Hợp đồng đã chọn
                </Typography>

                <Table>
                  <TableHead>
                    <TableRow style={{ backgroundColor: "#659feb" }}>
                      <TableCell
                        style={{
                          fontWeight: "bold",
                          color: "white",
                          fontSize: "13px",
                        }}
                      >
                        Thông tin
                      </TableCell>
                      <TableCell
                        style={{
                          fontWeight: "bold",
                          color: "white",
                          fontSize: "13px",
                        }}
                      >
                        Chi tiết
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow style={{ backgroundColor: "#f9f9f9" }}>
                      <TableCell style={{ fontSize: "12px" }}>
                        <strong>Tên hợp đồng:</strong>
                      </TableCell>
                      <TableCell style={{ fontSize: "12px" }}>
                        {selectedContract.name}
                      </TableCell>
                    </TableRow>
                    <TableRow style={{ backgroundColor: "#ffffff" }}>
                      <TableCell style={{ fontSize: "12px" }}>
                        <strong>Trạng thái:</strong>
                      </TableCell>
                      <TableCell style={{ fontSize: "12px" }}>
                        {selectedContract.status}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ fontSize: "12px" }}>
                        <strong>Tổng giá trị:</strong>
                      </TableCell>
                      <TableCell style={{ fontSize: "12px" }}>
                        {new Intl.NumberFormat("vi-VN").format(
                          selectedContract.totalcost
                        )}{" "}
                        VND
                      </TableCell>
                    </TableRow>
                    <TableRow style={{ backgroundColor: "#f9f9f9" }}>
                      <TableCell style={{ fontSize: "12px" }}>
                        <strong>Khách hàng:</strong>
                      </TableCell>
                      <TableCell style={{ fontSize: "12px" }}>
                        {selectedContract.custname}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        ) : (
          <Typography
            variant="body1"
            style={{
              color: "gray",
              margin: "10px 10px",
              textAlign: "center",
              fontSize: "15px",
            }}
          >
            Không có hợp đồng nào.
          </Typography>
        )}

        <Button
          onClick={handleCloseModal}
          variant="outlined"
          color="secondary"
          sx={{
            margin: "10px 10px",
            width: "200px",
            fontSize: "10px",
            fontWeight: "bold",
          }}
        >
          Đóng
        </Button>
      </Dialog>

      {/* Cột bên trái - Phần biểu đồ và dashboard */}
      <Grid item xs={9}>
        <Box
          sx={{
            padding: "20px",
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
          }}
        >
          <Typography
            variant="h4"
            sx={{ marginBottom: "16px", fontWeight: "bold", color: "#333" }}
          >
            THỐNG KÊ KẾT QUẢ HỢP ĐỒNG
          </Typography>

          <Grid container spacing={2}>
            {/* Thẻ tổng kết */}
            <Grid item md={4}>
              <Card
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  boxShadow: 1,
                }}
              >
                <CardContent
                  sx={{
                    backgroundColor: "#e3f2fd",
                    borderRadius: "8px",
                    padding: "16px",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Thêm đổ bóng
                  }}
                >
                  <Typography variant="h6" color="textSecondary">
                    Tổng doanh thu
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: "bold", color: "#1976d2" }}
                  >
                    {apiData?.activePaid?.total
                      ? apiData.activePaid.total.toLocaleString()
                      : "0"}{" "}
                    VND
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item md={4}>
              <Card
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  boxShadow: 1,
                }}
                onClick={() => handlePendingClick("Pending")}
              >
                <CardContent
                  sx={{
                    backgroundColor: "#fce4ec", // Màu hồng nhạt
                    borderRadius: "8px",
                    padding: "16px",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Thêm đổ bóng
                  }}
                >
                  <Typography variant="h6" color="textSecondary">
                    Hợp đồng đang chờ duyệt
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: "bold", color: "#1976d2" }}
                  >
                    {apiData?.pendingApproval?.count} hợp đồng
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item md={4}>
              <Card
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  boxShadow: 1,
                }}
                onClick={() => handlePendingClick("Cancelled")}
              >
                <CardContent
                  sx={{
                    backgroundColor: "#d1e7dd", // Màu xanh nhạt
                    borderRadius: "8px",
                    padding: "16px",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Thêm đổ bóng
                  }}
                >
                  <Typography variant="h6" color="textSecondary">
                    Hợp đồng đã hủy
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: "bold", color: "#d32f2f" }}
                  >
                    {apiData?.cancelled?.count} hợp đồng
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Biểu đồ doanh thu và các tab */}
          <Box
            sx={{
              marginTop: "20px",
              position: "relative",
              padding: "16px",
              backgroundColor: "#fff",
              borderRadius: "8px",
              boxShadow: 1,
            }}
          >
            <Typography
              variant="h5"
              sx={{ marginBottom: "10px", fontWeight: "bold" }}
            >
              Doanh thu theo ngày
            </Typography>

            {/* Lọc từ ngày bắt đầu đến ngày kết thúc */}
            <Box
              sx={{
                marginBottom: "20px",
                display: "flex",
                gap: "16px",
                position: "absolute",
                top: "6px",
                right: "250px",
                alignItems: "center",
              }}
            >
              <Grid container spacing={2} sx={{ alignItems: "center" }}>
                {/* Cột cho ngày bắt đầu */}
                <Grid item>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#1976d2",
                      fontWeight: "bold",
                      fontSize: "11px",
                    }}
                  >
                    Từ ngày
                  </Typography>
                  <DatePicker
                    showTime // Cho phép chọn giờ
                    format="YYYY-MM-DD HH:mm:ss" // Định dạng ngày và giờ
                    value={startDate ? dayjs(startDate) : null}
                    onChange={(date) => handleDateChange("start", date)}
                    style={{
                      width: 160, // Đảm bảo chiều rộng cố định
                      borderRadius: "5px",
                    }}
                  />
                </Grid>

                {/* Cột cho ngày kết thúc */}
                <Grid item>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#1976d2",
                      fontWeight: "bold",
                      fontSize: "11px",
                    }}
                  >
                    Đến ngày
                  </Typography>
                  <DatePicker
                    showTime // Cho phép chọn giờ
                    format="YYYY-MM-DD HH:mm:ss" // Định dạng ngày và giờ
                    value={endDate ? dayjs(endDate) : null}
                    onChange={(date) => handleDateChange("end", date)}
                    style={{
                      width: 160, // Đảm bảo chiều rộng cố định
                      borderRadius: "5px",
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Combobox chọn thời gian */}
            <FormControl
              variant="outlined"
              size="small"
              sx={{
                position: "absolute",
                top: "21px",
                right: "16px",
                minWidth: 150,
              }}
            >
              <Select
                value={selectedTimeRange}
                onChange={(event) => handleTimeRangeChange(event)}
                displayEmpty
                inputProps={{ "aria-label": "Chọn khoảng thời gian" }}
                sx={{ fontSize: "1.2rem" }}
              >
                <MenuItem value="today" sx={{ fontSize: "1.2rem" }}>
                  Hôm nay
                </MenuItem>
                <MenuItem value="yesterday" sx={{ fontSize: "1.2rem" }}>
                  Hôm qua
                </MenuItem>
                <MenuItem value="last7days" sx={{ fontSize: "1.2rem" }}>
                  7 ngày qua
                </MenuItem>
                <MenuItem value="thisMonth" sx={{ fontSize: "1.2rem" }}>
                  Tháng này
                </MenuItem>
                <MenuItem value="lastMonth" sx={{ fontSize: "1.2rem" }}>
                  Tháng trước
                </MenuItem>
              </Select>
            </FormControl>

            {/* Tabs cho từng khoảng thời gian */}
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              textColor="primary"
              indicatorColor="primary"
              variant="fullWidth"
              sx={{ marginBottom: "10px", marginTop: "19px" }}
            >
              <Tab
                label="Theo ngày"
                sx={{ fontSize: "1rem", fontWeight: "bold" }}
              />
              {/* <Tab label="Theo giờ" sx={{ fontSize: "1rem" }} />
              <Tab label="Theo thứ" sx={{ fontSize: "1rem" }} /> */}
            </Tabs>

            <Box sx={{ width: "100%", height: "350px" }}>
              <Bar
                data={chartData}
                options={{
                  maintainAspectRatio: false,
                  responsive: true,
                  onClick: (e, element) => {
                    if (element.length) {
                      const index = element[0].index; // Lấy chỉ số phần tử trong biểu đồ
                      const label = chartData.labels[index]; // Lấy nhãn của phần tử
                      const value =
                        chartData.datasets[0].data[index].toLocaleString(); // Lấy giá trị doanh thu và định dạng

                      // Hiển thị Modal với chi tiết doanh thu
                      Modal.info({
                        title: `Chi tiết doanh thu cho ngày ${label}`,
                        content: (
                          <div>
                            <p>
                              <strong>Doanh thu: </strong>
                              {value} VND
                            </p>
                          </div>
                        ),
                        onOk() {},
                      });
                    }
                  },
                  plugins: {
                    legend: { position: "top" },
                    tooltip: {
                      callbacks: {
                        label: (context) =>
                          `${
                            context.dataset.label
                          }: ${context.raw.toLocaleString()} VND`,
                      },
                    },
                  },
                  scales: {
                    x: {
                      grid: {
                        display: false, // Tắt đường kẻ dọc
                      },
                      ticks: {
                        color: "#333", // Màu của text trên trục X
                        font: {
                          size: 14,
                          weight: "bold", // Đặt font chữ đậm cho trục X
                        },
                      },
                      border: {
                        display: true,
                        color: "#333", // Màu đậm cho trục X
                        width: 1, // Độ dày của trục X
                      },
                    },
                    y: {
                      grid: {
                        color: "#e0e0e0", // Màu của đường kẻ ngang (nếu muốn tùy chỉnh)
                      },
                      ticks: {
                        color: "#333", // Màu của text trên trục Y
                        font: {
                          size: 14,
                          weight: "bold", // Đặt font chữ đậm cho trục Y
                        },
                      },
                      border: {
                        display: true,
                        color: "#333", // Màu đậm cho trục Y
                        width: 1, // Độ dày của trục Y
                      },
                    },
                  },
                }}
              />
            </Box>
          </Box>
        </Box>
      </Grid>

      {/* Cột bên phải - Phần thông báo */}
      <Grid item xs={3}>
        <Box
          sx={{
            padding: "20px",
            maxHeight: "90vh",
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            boxShadow: 1,
          }}
        >
          {/* Tiêu đề Thông báo */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              marginBottom: "16px",
              fontSize: "1.2rem",
            }}
          >
            THÔNG BÁO
          </Typography>

          {/* Thông báo đăng nhập bất thường */}
          <Box
            sx={{ display: "flex", alignItems: "center", marginBottom: "16px" }}
          >
            <WarningIcon
              sx={{ color: "#d32f2f", marginRight: "8px", fontSize: "1.5rem" }}
            />
            <Typography
              sx={{ fontWeight: "bold", color: "#d32f2f", fontSize: "1.25rem" }}
            >
              Có 11 hoạt động đăng nhập khác thường cần kiểm tra.
            </Typography>
          </Box>

          {/* Các hoạt động đăng nhập bất thường */}
          <Box sx={{ marginBottom: "16px" }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: "bold", fontSize: "1.25rem" }}
            >
              NGOCNGA đã đăng nhập trên Máy tính Windows vào 24/10/2024 08:49
            </Typography>
            <Button
              onClick={handleOpenModal}
              sx={{
                color: "#1976d2",
                textTransform: "none",
                fontSize: "1.25rem",
              }}
            >
              Kiểm tra
            </Button>

            <Typography
              variant="body2"
              sx={{ fontWeight: "bold", fontSize: "1.25rem" }}
            >
              HAIDANG đã đăng nhập trên SM-A217N vào 17/10/2024 16:53
            </Typography>
            <Button
              onClick={handleOpenModal}
              sx={{
                color: "#1976d2",
                textTransform: "none",
                fontSize: "1.25rem",
              }}
            >
              Kiểm tra
            </Button>
          </Box>
          <hr />
          <br />
          {/* Tiêu đề Hoạt động gần đây */}
          <Typography
            variant="h6"
            sx={{
              marginBottom: "10px",
              fontWeight: "bold",
              fontSize: "1.25rem",
            }}
          >
            CÁC HOẠT ĐỘNG GẦN ĐÂY
          </Typography>

          {/* Danh sách các hoạt động */}
          <Box
            sx={{
              borderLeft: "2px solid #e0e0e0",
              paddingLeft: "16px",
              position: "relative",
              maxHeight: "300px", // Đặt chiều cao tối đa cho danh sách
              overflowY: "auto", // Bật thanh cuộn dọc
            }}
          >
            {/* Hoạt động nhập hàng */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <IconButton
                sx={{
                  backgroundColor: "#e0f7fa",
                  color: "#009688",
                  marginRight: "8px",
                }}
              >
                <MoveToInboxIcon fontSize="large" />
              </IconButton>
              <Box>
                <Typography variant="body1" sx={{ fontSize: "1.25rem" }}>
                  <strong>Nguyễn Thị Thái Hòa</strong> vừa nhập hàng với giá trị{" "}
                  <strong>0</strong>
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "gray", fontSize: "1rem" }}
                >
                  14 phút trước
                </Typography>
              </Box>
            </Box>

            {/* Hoạt động bán hàng */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <IconButton
                sx={{
                  backgroundColor: "#e3f2fd",
                  color: "#1976d2",
                  marginRight: "8px",
                }}
              >
                <ShoppingCartIcon fontSize="large" />
              </IconButton>
              <Box>
                <Typography variant="body1" sx={{ fontSize: "1.25rem" }}>
                  <strong>Nguyễn Thị Thái Hòa</strong> vừa bán đơn hàng với giá
                  trị <strong>7.594.000</strong>
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "gray", fontSize: "1rem" }}
                >
                  14 phút trước
                </Typography>
              </Box>
            </Box>

            {/* Hoạt động nhập hàng */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <IconButton
                sx={{
                  backgroundColor: "#e0f7fa",
                  color: "#009688",
                  marginRight: "8px",
                }}
              >
                <MoveToInboxIcon fontSize="large" />
              </IconButton>
              <Box>
                <Typography variant="body1" sx={{ fontSize: "1.25rem" }}>
                  <strong>Nguyễn Văn A</strong> vừa nhập hàng với giá trị{" "}
                  <strong>10.000.000</strong>
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "gray", fontSize: "1rem" }}
                >
                  14 phút trước
                </Typography>
              </Box>
            </Box>

            {/* Hoạt động bán hàng */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <IconButton
                sx={{
                  backgroundColor: "#e3f2fd",
                  color: "#1976d2",
                  marginRight: "8px",
                }}
              >
                <ShoppingCartIcon fontSize="large" />
              </IconButton>
              <Box>
                <Typography variant="body1" sx={{ fontSize: "1.25rem" }}>
                  <strong>Nguyễn Văn A</strong> vừa bán đơn hàng với giá trị{" "}
                  <strong>7.594.000</strong>
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "gray", fontSize: "1rem" }}
                >
                  14 phút trước
                </Typography>
              </Box>
            </Box>

            {/* Hoạt động nhập hàng */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <IconButton
                sx={{
                  backgroundColor: "#e0f7fa",
                  color: "#009688",
                  marginRight: "8px",
                }}
              >
                <MoveToInboxIcon fontSize="large" />
              </IconButton>
              <Box>
                <Typography variant="body1" sx={{ fontSize: "1.25rem" }}>
                  <strong>Trần Văn C</strong> vừa nhập hàng với giá trị{" "}
                  <strong>5.000.000</strong>
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "gray", fontSize: "1rem" }}
                >
                  14 phút trước
                </Typography>
              </Box>
            </Box>

            {/* Hoạt động bán hàng */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <IconButton
                sx={{
                  backgroundColor: "#e3f2fd",
                  color: "#1976d2",
                  marginRight: "8px",
                }}
              >
                <ShoppingCartIcon fontSize="large" />
              </IconButton>
              <Box>
                <Typography variant="body1" sx={{ fontSize: "1.25rem" }}>
                  <strong>Trần Văn C</strong> vừa bán đơn hàng với giá trị{" "}
                  <strong>7.594.000</strong>
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "gray", fontSize: "1rem" }}
                >
                  14 phút trước
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
};

export default AdminAnalytics;