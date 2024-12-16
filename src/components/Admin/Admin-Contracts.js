import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  TablePagination,
  TextField,
  Autocomplete,
  Grid,
  IconButton,
  MenuItem,
  Menu,
  FormControl,
} from "@mui/material";
import axios from "axios";
import InfoIcon from "@mui/icons-material/Info";
import html2pdf from "html2pdf.js";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import { toast, Toaster } from "react-hot-toast";
import { format, parse } from "date-fns";
import contractApi from "../../api/contractApi";
import ContractFilter from "./ContractFilter";
import { DatePicker, Divider, message, Select, Typography } from "antd";
import SnackBarNotification from "./SnackBarNotification";
import VisibilityIcon from "@mui/icons-material/Visibility";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Link, useSearchParams } from "react-router-dom"; // Import để lấy tham số URL
import dayjs from "dayjs";
import useGetPermission from "hooks/useGetPermission";

const ManageContracts = () => {
  const [contracts, setContracts] = useState([]); // Dữ liệu hợp đồng
  const [showModal, setShowModal] = useState(false); // Hiển thị modal
  const [searchTerm, setSearchTerm] = useState(""); // Trạng thái tìm kiếm
  const [showModalPDF, setShowModalPDF] = useState(false);
  const { hasPermission } = useGetPermission();

  const [selecterContract, setSelecterContract] = useState({
    name: "",
    type: "",
    status: "",
    paymentstatus: "",
    guest: 0,
    table: 0,
    totalcost: 0,
    organizdate: "",
    custname: "",
    custphone: "",
    description: "",
  });
  const [selectedTimeRange, setSelectedTimeRange] = useState("thisMonth");

  //select button
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Hàm mở menu
  const handleClick = (event, contract) => {
    setAnchorEl(event.currentTarget);
    setSelectedContract(contract);
  };

  // Hàm đóng menu
  const handleClose = () => {
    setAnchorEl(null);
    setSelectedContract(null);
  };

  const [searchParams] = useSearchParams(); // Lấy tham số URL
  const status = searchParams.get("status");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const [rowsPerPage, setRowsPerPage] = useState(endDate ? 100 : 5); // Bạn có thể thay đổi số mục trên mỗi trang
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedContractStatus, setSelectedContractStatus] = useState("");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("");
  const [filteredContracts, setFilteredContracts] = useState(contracts);

  const [contractTypes, setContractTypes] = useState([]);
  const [contractStatuses, setContractStatuses] = useState([]);
  const [paymentStatuses, setPaymentStatuses] = useState([]);

  const [stockRequests, setStockRequests] = useState([]);
  const [newContract, setNewContract] = useState([]);

  const [selectedContract, setSelectedContract] = useState(null);
  const [showStockRequestsDialog, setShowStockRequestsDialog] = useState(false);

  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [snackType, setSnackType] = useState("success");

  const handleCloseSnackBar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackBarOpen(false);
  };

  const showSuccess = (message) => {
    setSnackType("success");
    setSnackBarMessage(message);
    setSnackBarOpen(true);
  };

  // Fetch xem chi tiết nguyên liệu hợp đồng
  const handleViewStockRequests = async (contractId) => {
    try {
      const accessToken = localStorage.getItem("accessToken");

      const url = `https://62c6-2001-ee0-5722-4dc0-a8e7-eaeb-2e68-34e5.ngrok-free.app/obbm/contract/${contractId}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Dữ liệu API trả về:", data);

      const contractData = data?.result;

      if (!contractData) {
        toast.error("Không tìm thấy hợp đồng!");
        return;
      }

      const stockRequests = Array.isArray(contractData.listStockrequests)
        ? contractData.listStockrequests
        : [];

      setStockRequests(stockRequests);
      setSelectedContract(contractData);
      setShowStockRequestsDialog(true); // Hiển thị dialog
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      toast.error("Không thể lấy danh sách nguyên liệu!");
    }
  };

  const formatDateForInput = (date) => {
    if (!date) return "";

    // Kiểm tra nếu giá trị đã có định dạng yyyy-MM-ddTHH:mm
    const isoFormatPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
    if (isoFormatPattern.test(date)) {
      return date; // Nếu có đúng định dạng, giữ nguyên
    }

    // Chuyển từ dd/MM/yyyy HH:mm sang yyyy-MM-ddTHH:mm
    const [day, month, year, hour, minute] = date.split(/[\s/:]+/);
    return `${year}-${month}-${day}T${hour}:${minute}`;
  };

  // Hàm chuyển từ tiếng Việt sang tiếng Anh
  const mapStatusToEnglish = (status) => {
    const statusMapReverse = {
      "Chờ duyệt": "Pending",
      "Đã duyệt": "Approved",
      "Đang hoạt động": "Actived",
      "Đã hoàn thành": "Completed",
      "Chưa thanh toán": "Unpaid",
      "Trả trước 50%": "Prepay 50%",
      "Trả trước 70%": "Prepay 70%",
      "Đã thanh toán": "Paid",
      "Đã hủy": "Cancelled",
    };
    return statusMapReverse[status] || status;
  };

  // Hàm gọi API để lấy dữ liệu hợp đồng
  const fetchContracts = async (page) => {
    try {
      const res = await contractApi.getPaginate(page, 100); // Giả sử API lấy tất cả hợp đồng
      if (res.code === 1000) {
        // Lọc giá trị các trường type, status, và paymentstatus
        const types = Array.isArray(res?.result?.content)
          ? res?.result?.content.map((contract) => contract?.type)
          : [];

        // Gán cứng các giá trị trạng thái hợp đồng và trạng thái thanh toán
        const statuses = [
          "Chờ duyệt",
          "Đã duyệt",
          "Đang hoạt động",
          "Đã hoàn thành",
        ];
        const paymentStatuses = [
          "Chưa thanh toán",
          "Trả trước 50%",
          "Trả trước 70%",
          "Đã thanh toán",
        ];

        setContractTypes(types);
        setContractStatuses(statuses);
        setPaymentStatuses(paymentStatuses);
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu hợp đồng:", error);
    }
  };

  useEffect(() => {
    fetchContracts(page + 1); // Gọi API khi component được mount
  }, [page]);

  useEffect(() => {
    if (!endDate) {
      fetchContractWithPaginate(page + 1, rowsPerPage);
    }
  }, [page, rowsPerPage, endDate]);

  useEffect(() => {
    filterContracts(); // Gọi hàm lọc mỗi khi giá trị lọc hoặc từ khóa tìm kiếm thay đổi
  }, [contracts, selectedContractStatus, selectedPaymentStatus, searchTerm]);

  // Hàm lấy tất cả listContract
  const fetchContractWithPaginate = async (page, rowsPerPage) => {
    try {
      const res = await contractApi.getPaginate(page, rowsPerPage);
      const newContracts = res.result?.content;
      setTotalElements(res.result?.totalElements);

      // Cập nhật danh sách hợp đồng cục bộ
      setContracts((prevContracts) => {
        const updatedContracts = [...newContracts]; // Dữ liệu mới từ API
        const existingIds = new Set(
          prevContracts.map((contract) => contract.id)
        );

        // Thêm hợp đồng cũ chưa có trong danh sách mới
        prevContracts.forEach((contract) => {
          if (!existingIds.has(contract.id)) {
            updatedContracts.unshift(contract); // Thêm vào đầu
          }
        });

        // Sắp xếp danh sách để hợp đồng mới luôn ở trên
        return updatedContracts.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      });

      // Cập nhật danh sách phân trang hiển thị
      setFilteredContracts((prevContracts) => {
        const allContracts = [...newContracts, ...prevContracts]; // Kết hợp dữ liệu mới và cũ
        const sortedContracts = allContracts.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        ); // Sắp xếp theo thời gian
        return sortedContracts.slice(
          (page - 1) * rowsPerPage,
          page * rowsPerPage
        ); // Phân trang
      });

      console.log(newContracts);
      setNewContract(newContracts);
    } catch (error) {
      console.error("Không tìm nạp được danh mục: ", error);
    }
  };

  const translateStatus = (status) => {
    switch (status) {
      case "Pending":
        return "Chờ duyệt";
      case "Approved":
        return "Đã duyệt";
      case "Actived":
        return "Đang hoạt động";
      case "Completed":
        return "Đã hoàn thành";
      case "Unpaid":
        return "Chưa thanh toán";
      case "Prepay 50%":
        return "Trả trước 50%";
      case "Prepay 70%":
        return "Trả trước 70%";
      case "Paid":
        return "Đã thanh toán";
      case "Cancelled":
        return "Đã hủy";
      default:
        return status; // Nếu không có giá trị hợp lệ, trả lại trạng thái gốc
    }
  };

  // Hàm xử lý xác nhận hợp đồng
  const handleConfirmContract = async (contract) => {
    // Kiểm tra trạng thái hợp đồng "Chờ duyệt" và "Chưa thanh toán"
    if (contract.status === "Pending" && contract.paymentstatus === "Unpaid") {
      contract.status = "Approved";
      showSuccess("Hợp đồng đã được phê duyệt thành công.");
    }

    // Kiểm tra trạng thái "Đã duyệt" với thanh toán trước một phần (50% hoặc 70%)
    if (
      contract.status === "Approved" &&
      (contract.paymentstatus === "Prepay 50%" ||
        contract.paymentstatus === "Prepay 70%")
    ) {
      contract.status = "Actived"; // Đổi trạng thái thành "Đang hoạt động"
      showSuccess(
        `Hợp đồng đã được kích hoạt với phần trăm thanh toán: ${translateStatus(
          contract.paymentstatus
        )}`
      );
    }

    // Trường hợp hợp đồng "Đã duyệt" và "Đã thanh toán"
    if (contract.status === "Actived" && contract.paymentstatus === "Paid") {
      contract.status = "Completed"; // Đổi trạng thái thành "Đã hoàn thành"
      showSuccess("Hợp đồng đã được hoàn thành và đã thanh toán!");
    }

    // Chuẩn bị dữ liệu gửi lên API để cập nhật
    const data = {
      name: contract.name,
      type: contract.type,
      guest: contract.guest,
      table: contract.table,
      totalcost: contract.totalcost,
      status: contract.status,
      paymentstatus: contract.paymentstatus,
      organizdate: contract.organizdate, // Định dạng ISO 8601
      custname: contract.custname,
      custphone: contract.custphone,
      description: contract.description,
      userId: contract.users.userId,
      locationId: contract.locations.locationId,
      eventId: contract.events.eventId,
      menuId: contract.menus.menuId,
    };

    console.log("Dữ liệu gửi lên API:", data);

    try {
      // Gọi API PUT để cập nhật hợp đồng
      const res = await contractApi.update(contract.contractId, data);
      console.log("Phản hồi từ API:", res);

      // Kiểm tra mã trạng thái trả về từ server
      if (res.code === 1000) {
        // Cập nhật lại dữ liệu hợp đồng trong state để không cần tải lại trang
        setContracts((prevContracts) =>
          prevContracts.map((contractItem) =>
            contractItem.contractId === contract.contractId
              ? {
                  ...contractItem,
                  status: contract.status,
                  paymentstatus: contract.paymentstatus,
                }
              : contractItem
          )
        );
      } else {
        toast.error("Cập nhật hợp đồng không thành công. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi khi xác nhận hợp đồng:", error);
      if (error.response) {
        console.error("Phản hồi lỗi từ server:", error.response.data);
      }
      toast.error("Không thể xác nhận hợp đồng. Vui lòng thử lại sau!");
    }
  };

  // Hàm hủy hợp đồng
  const handleCancelContract = async (contract) => {
    try {
      const updateData = {
        name: contract.name,
        type: contract.type,
        guest: contract.guest,
        table: contract.table,
        totalcost: contract.totalcost,
        status: "Cancelled",
        paymentstatus: contract.paymentstatus,
        organizdate: contract.organizdate, // Định dạng ISO 8601
        custname: contract.custname,
        custphone: contract.custphone,
        description: contract.description,
        userId: contract.users.userId,
        locationId: contract.locations.locationId,
        eventId: contract.events.eventId,
        menuId: contract.menus.menuId,
      };

      // Gọi API POST để hủy hợp đồng
      const res = await contractApi.update(contract.contractId, updateData);
      if (res.code === 1000) {
        fetchContractWithPaginate(page, rowsPerPage);
        toast.success("Hợp đồng đã được hủy thành công!");
      }
    } catch (error) {
      console.error("Lỗi khi hủy hợp đồng:", error);
      toast.error("Không thể hủy hợp đồng. Vui lòng thử lại sau!");
    }
  };

  // Hàm chuyển ngày sang định dạng "dd/MM/yyyy HH:mm"
  const formatDateForAPI = (date) => {
    console.log("check date: ", date);

    // Kiểm tra nếu ngày đã có định dạng yyyy-MM-ddTHH:mm
    const isoFormatPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

    // Nếu ngày đã có định dạng yyyy-MM-ddTHH:mm, chuyển thành dd/MM/yyyy HH:mm
    if (isoFormatPattern.test(date)) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate)) {
        console.error("Invalid date format");
        return ""; // Hoặc trả về một giá trị mặc định như ""
      }
      return format(parsedDate, "dd/MM/yyyy HH:mm");
    }

    // Nếu ngày không có định dạng yyyy-MM-ddTHH:mm, trả lại như cũ
    return date;
  };

  // Hàm chỉnh sửa hợp đồng
  const handleSaveContract = async (contract) => {
    const formattedDate = formatDateForAPI(selecterContract.organizdate);

    // Chuẩn bị dữ liệu gửi lên API để cập nhật
    const data = {
      name: selecterContract.name,
      type: selecterContract.type,
      guest: selecterContract.guest,
      table: selecterContract.table,
      totalcost: selecterContract.totalcost,
      status: mapStatusToEnglish(selecterContract.status),
      paymentstatus: mapStatusToEnglish(selecterContract.paymentstatus),
      organizdate: formattedDate,
      custname: selecterContract.custname,
      custphone: selecterContract.custphone,
      description: selecterContract.description,
      userId: selecterContract.users.userId, // Vẫn có thể dùng để gửi API
      locationId: selecterContract.locations.locationId,
      eventId: selecterContract.events.eventId,
      menuId: selecterContract.menus.menuId,
    };

    try {
      // Gọi API PUT để cập nhật hợp đồng
      const res = await contractApi.update(selecterContract.contractId, data);
      console.log("Phản hồi từ API:", res);

      showSuccess("Cập nhật hợp đồng thành công!");

      // Kiểm tra mã trạng thái trả về từ server
      if (res.code === 1000) {
        const emailData = {
          emailTo: selecterContract.custmail,
          subject: "Cập nhật chi phí hợp đồng",
          message: `Kính gửi ${
            selecterContract.custname
          }, tổng chi phí hợp đồng của bạn đã được cập nhật thành ${new Intl.NumberFormat(
            "vi-VN",
            {
              style: "currency",
              currency: "VND",
            }
          ).format(
            selecterContract.totalcost
          )}. Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi.`,
          template: `<p>Kính gửi <strong>${
            selecterContract.custname
          }</strong>,</p>
                   <p>Tổng chi phí hợp đồng của bạn đã được cập nhật thành: <strong>${new Intl.NumberFormat(
                     "vi-VN",
                     {
                       style: "currency",
                       currency: "VND",
                     }
                   ).format(selecterContract.totalcost)}</strong>.</p>
                   <p>Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi. Hotline: 01234567789 Công ty TNHH L&P</p>`,
        };

        try {
          await axios.post(
            "http://emailserivce.somee.com/Email/sendMail",
            emailData
          );
          showSuccess(
            "Email thông báo cập nhật tổng chi phí được gửi thành công!"
          );
        } catch (emailError) {
          console.error("Lỗi khi gửi email:", emailError);

          // Kiểm tra xem phản hồi lỗi có chi tiết từ server không
          if (emailError.response && emailError.response.data) {
            toast.error(
              `Gửi email thất bại: ${
                emailError.response.data.message || "Lỗi không xác định"
              }`
            );
          } else {
            toast.error("Gửi email thất bại. Vui lòng thử lại sau.");
          }
        }

        // Cập nhật hợp đồng trong state sau khi sửa thành công
        setContracts((prevContracts) => {
          return prevContracts.map((contractItem) =>
            contractItem.contractId === selecterContract.contractId
              ? { ...contractItem, ...selecterContract } // Cập nhật hợp đồng đã sửa
              : contractItem
          );
        });

        // Cập nhật lại filteredContracts nếu có bộ lọc
        setFilteredContracts((prevContracts) => {
          return prevContracts.map((contractItem) =>
            contractItem.contractId === selecterContract.contractId
              ? { ...contractItem, ...selecterContract } // Cập nhật hợp đồng đã sửa
              : contractItem
          );
        });

        setShowModal(false);
      } else {
        toast.error("Cập nhật hợp đồng không thành công. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi khi xác nhận hợp đồng:", error);
      if (error.response) {
        console.error("Phản hồi lỗi từ server:", error.response.data);
      }
      toast.error("Không thể xác nhận hợp đồng. Vui lòng thử lại sau!");
    }
  };

  // Hàm tìm kiếm và lọc hợp đồng
  const filterContracts = () => {
    const filtered = contracts.filter((contract) => {
      const matchesSearchTerm = searchTerm
        ? contract.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contract.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contract.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contract.paymentstatus
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        : true;

      const matchesContractStatus = selectedContractStatus
        ? contract.status.toLowerCase() === selectedContractStatus.toLowerCase()
        : true;

      const matchesPaymentStatus = selectedPaymentStatus
        ? contract.paymentstatus.toLowerCase() ===
          selectedPaymentStatus.toLowerCase()
        : true;

      // Kết hợp tất cả các điều kiện lọc
      return matchesSearchTerm && matchesContractStatus && matchesPaymentStatus;
    });

    setFilteredContracts(filtered);
  };

  // Cập nhật trạng thái hợp đồng khi chọn trong ContractFilter
  const handleContractStatusFilter = (status) => {
    setSelectedContractStatus(status);
    filterContracts(); // Gọi lại hàm lọc khi thay đổi trạng thái hợp đồng
  };

  // Cập nhật trạng thái thanh toán khi chọn trong ContractFilter
  const handlePaymentStatusFilter = (paymentStatus) => {
    setSelectedPaymentStatus(paymentStatus);
    filterContracts(); // Gọi lại hàm lọc khi thay đổi trạng thái thanh toán
  };

  // Cập nhật từ khóa tìm kiếm
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    filterContracts(); // Gọi lại hàm lọc khi thay đổi từ khóa
  };

  // Hàm mở modal và set contract đã chọn
  const handleEditContract = (contract) => {
    setSelecterContract(contract);
    setShowModal(true);
  };

  const handleChangePage = (event, newPage) => {
    console.log("check page: ", newPage);
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleModalPDF = (contract) => {
    console.log(contract);
    setSelecterContract(contract);
    setShowModalPDF(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setShowModalPDF(false);
  };

  const handleSavePDF = () => {
    const contractContent = document.getElementById("contract-content");
    html2pdf().from(contractContent).save();
  };

  const handleSendMail = () => {
    const emailTo = selecterContract?.custmail;

    // Lấy nội dung HTML của hợp đồng
    const contractHtml = document.getElementById("contract-content").innerHTML;

    // apiUrl chứa địa chỉ API gửi request POST đến để gửi email
    const apiUrl = "http://emailserivce.somee.com/Email/sendMail";

    const data = {
      emailTo: emailTo,
      template: contractHtml,
    };

    axios
      .post(apiUrl, data)
      .then((response) => {
        toast.success("Email đã được gửi thành công!");
      })
      .catch((error) => {
        toast.error("Gửi email thất bại. Vui lòng thử lại.");
      });
  };

  const organizDate = selecterContract?.organizdate
    ? parse(selecterContract.organizdate, "dd/MM/yyyy HH:mm", new Date())
    : null;

  // Khai báo mảng thông điệp tooltip
  const tooltipMessage = [
    "Xác nhận duyệt hợp đồng", // 0 - Tương ứng với trạng thái "Pending"
    "Đang hoạt động", // 1 - Tương ứng với trạng thái "Approved"
    "Đã hoàn thành", // 2 - Tương ứng với trạng thái "Active"
  ];

  // Hàm ánh xạ trạng thái chỉ mục của mảng
  const getTooltipIndex = (status) => {
    switch (status) {
      case "Pending":
        return 0;
      case "Approved":
        return 1;
      case "Actived":
        return 2;
      default:
        return -1; // Trạng thái không hợp lệ hoặc không cần tooltip
    }
  };
  useEffect(() => {
    if (status && startDate && endDate) {
      fetchContractsByStatus(
        status,
        new Date(startDate),
        new Date(endDate),
        page + 1,
        rowsPerPage
      );
    }
  }, [searchParams, page, rowsPerPage, endDate, startDate, status]);

  const fetchContractsByStatus = async (
    status,
    startDate,
    endDate,
    page,
    rowsPerPage
  ) => {
    try {
      const startDateFormatted = startDate
        ? new Date(startDate).toISOString()
        : "";
      const endDateFormatted = endDate ? new Date(endDate).toISOString() : "";

      const url = `https://62c6-2001-ee0-5722-4dc0-a8e7-eaeb-2e68-34e5.ngrok-free.app/obbm/contract/byStatusAndDateRange?status=${status}&startDate=${startDateFormatted}&endDate=${endDateFormatted}&page=${page}&size=${rowsPerPage}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch contracts");

      const data = await response.json();

      console.log("Hợp đồng chờ duyệt: ", data);

      if (data.code === 1000) {
        setContracts(data?.result.content);
        setTotalElements(data?.result.totalElements);
        setFilteredContracts(data?.result.content);
      } else {
        console.error("API Error:", data.message);
      }
    } catch (error) {
      console.error("Error fetching contracts:", error);
    }
  };
  const handleTimeRangeChange = (selectedValue) => {
    console.log("Selected value:", selectedValue);

    if (!selectedValue) {
      console.error("Không thể đọc giá trị");
      return;
    }

    setSelectedTimeRange(selectedValue);

    // setEndDate(null);
    // setStartDate(null);

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
    // fetchDataByDateRange(startDate, endDate);
    fetchContractsByStatus(
      status,
      new Date(startDate),
      new Date(endDate),
      page + 1,
      rowsPerPage
    );
  };
  const handleDateChange = (field, value) => {
    if (field === "start") {
      // setStartDate(value);
      if (endDate && value > endDate) {
        message.error("Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.");
        return;
      }
    } else if (field === "end") {
      // setEndDate(value);
      if (startDate && value < startDate) {
        message.error("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.");
        return;
      }
    }

    // Gọi API khi cả startDate và endDate đều tồn tại và hợp lệ
    const updatedStartDate = field === "start" ? value : startDate;
    const updatedEndDate = field === "end" ? value : endDate;

    if (updatedStartDate && updatedEndDate) {
      // fetchDataByDateRange(updatedStartDate, updatedEndDate);
      fetchContractsByStatus(
        status,
        new Date(updatedStartDate),
        new Date(updatedEndDate),
        page + 1,
        rowsPerPage
      );
    }
  };
  const today = new Date();
  const isValidDate = (date) => !isNaN(new Date(date).getTime());
  const [defaultStartDate, setDefS] = useState(null);
  const [defaultEndDate, setDefE] = useState(null);

  useEffect(() => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // Đầu tháng hiện tại
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Ngày cuối cùng của tháng hiện tại

    setDefS(startOfMonth);
    setDefE(endOfMonth);
  }, []);
  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
      <SnackBarNotification
        open={snackBarOpen}
        handleClose={handleCloseSnackBar}
        message={snackBarMessage}
        snackType={snackType}
      />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between", // Chia đều các phần tử
          alignItems: "center", // Căn giữa theo chiều dọc
          mb: 2,
          gap: 2, // Tạo khoảng cách giữa các thành phần
        }}
      >
        {/* Tìm kiếm */}
        <div className="admin-group" style={{ flex: 1, marginTop: "20px" }}>
          <svg
            className="admin-icon-search"
            aria-hidden="true"
            viewBox="0 0 24 24"
          >
            <g>
              <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"></path>
            </g>
          </svg>
          <input
            placeholder="Tìm kiếm"
            type="search"
            className="admin-input-search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
            }}
          />
        </div>

        {/* Lọc ngày và chọn thời gian */}
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          {/* Ngày bắt đầu */}
          <Box>
            <Typography
              variant="caption"
              sx={{ color: "#1976d2", fontWeight: "bold", fontSize: "11px" }}
            >
              Từ ngày
            </Typography>
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              value={startDate ? dayjs(startDate) : null}
              onChange={(date) => handleDateChange("start", date)}
              style={{ width: 160, borderRadius: "5px" }}
            />
          </Box>

          {/* Ngày kết thúc */}
          <Box>
            <Typography
              variant="caption"
              sx={{ color: "#1976d2", fontWeight: "bold", fontSize: "11px" }}
            >
              Đến ngày
            </Typography>
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              value={endDate && isValidDate(endDate) ? dayjs(endDate) : null}
              onChange={(date) => handleDateChange("end", date)}
              style={{ width: 160, borderRadius: "5px" }}
            />
          </Box>

          {/* Combobox chọn thời gian */}
          <FormControl
            variant="outlined"
            size="small"
            sx={{ minWidth: 150, marginTop: "20px" }}
          >
            <Select
              value={selectedTimeRange}
              onChange={(event) => handleTimeRangeChange(event)}
              displayEmpty
              inputProps={{ "aria-label": "Chọn khoảng thời gian" }}
              sx={{ fontSize: "1rem" }}
            >
              <MenuItem value="today">Hôm nay</MenuItem>
              <MenuItem value="yesterday">Hôm qua</MenuItem>
              <MenuItem value="last7days">7 ngày qua</MenuItem>
              <MenuItem value="thisMonth">Tháng này</MenuItem>
              <MenuItem value="lastMonth">Tháng trước</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Nút xem tất cả */}
        <Box sx={{ textAlign: "right", marginTop: "20px" }}>
          <Link to={"http://localhost:3000/admin/ManageContracts"}>
            <Button variant="contained" color="primary">
              Xem tất cả
            </Button>
          </Link>
        </Box>
      </Box>
      <TableContainer
        component={Paper}
        className="table-container"
        style={{ marginTop: "50px" }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>STT</TableCell>
              <TableCell>Tên hợp đồng</TableCell>
              <TableCell>Tổng chi phí</TableCell>
              <TableCell>
                <Box display="flex" alignItems="center">
                  Trạng thái hợp đồng
                  <ContractFilter
                    filterType="contract"
                    onApplyFilter={handleContractStatusFilter}
                    onClearFilter={() => {
                      setSelectedContractStatus(""); // Xóa bộ lọc trạng thái hợp đồng
                      filterContracts(); // Lọc lại sau khi xóa
                    }}
                  />
                </Box>
              </TableCell>
              <TableCell>
                <Box display="flex" alignItems="center">
                  Trạng thái thanh toán
                  <ContractFilter
                    filterType="payment"
                    onApplyFilter={handlePaymentStatusFilter}
                    onClearFilter={() => {
                      setSelectedPaymentStatus(""); // Xóa bộ lọc trạng thái thanh toán
                      filterContracts(); // Lọc lại sau khi xóa
                    }}
                  />
                </Box>
              </TableCell>
              <TableCell>Ngày tổ chức</TableCell>
              <TableCell
                sx={{
                  position: "sticky",
                  right: 0,
                  backgroundColor: "white",
                  zIndex: 1,
                }}
              >
                Hành động
              </TableCell>
            </TableRow>
          </TableHead>
          {/* Nội dung contracts */}
          <TableBody>
            {filteredContracts
              ?.filter((itc) => {
                if (endDate) {
                  return itc.status?.toLowerCase() == status?.toLowerCase();
                }
                return itc;
              })
              .map((contract, index) => (
                <TableRow key={contract.contractId}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{contract.name}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(contract.totalcost)}
                  </TableCell>
                  <TableCell>
                    <span
                      style={{
                        color:
                          contract.status === "Completed"
                            ? "#28a745"
                            : contract.status === "Pending"
                            ? "#ffc107"
                            : contract.status === "Actived"
                            ? "#17a2b8"
                            : contract.status === "Approved"
                            ? "#0066cc" // Màu xanh dương đậm cho "Đã duyệt"
                            : "#dc3545",
                        fontWeight: "bold",
                        backgroundColor:
                          contract.status === "Completed"
                            ? "#28a7451a" // Màu xanh nhẹ cho "Đã hoàn thành"
                            : contract.status === "Pending"
                            ? "#ffc1071a" // Màu vàng nhẹ cho "Chờ duyệt"
                            : contract.status === "Actived"
                            ? "#17a2b81a" // Màu xanh dương nhẹ cho "Đang hoạt động"
                            : contract.status === "Approved"
                            ? "#28a7451a" // Màu xanh dương đậm cho "Đã duyệt"
                            : "#dc35451a", // Màu đỏ nhẹ cho "Đã hủy"
                        padding: "3px 8px", // Thêm padding cho các thẻ trạng thái
                        borderRadius: "5px", // Bo tròn các góc để mềm mại
                        display: "inline-block",
                      }}
                    >
                      {translateStatus(contract.status)}{" "}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span
                      style={{
                        color:
                          contract.paymentstatus === "Paid"
                            ? "#28a745"
                            : contract.paymentstatus === "Prepay 50%"
                            ? "#ffc107"
                            : contract.paymentstatus === "Prepay 70%"
                            ? "#ff851b"
                            : "#dc3545",
                        fontWeight: "bold",
                        backgroundColor:
                          contract.paymentstatus === "Paid"
                            ? "#28a7451a" // Màu xanh nhẹ cho "Đã thanh toán"
                            : contract.paymentstatus === "Prepay 50%"
                            ? "#ffc1071a" // Màu vàng nhẹ cho "Trả trước 50%"
                            : contract.paymentstatus === "Prepay 70%"
                            ? "#ff851b1a" // Màu cam nhẹ cho "Trả trước 70%"
                            : "#dc35451a", // Màu đỏ nhẹ cho "Chưa thanh toán"
                        padding: "3px 8px", // Thêm padding cho các thẻ thanh toán
                        borderRadius: "5px", // Bo tròn các góc
                        display: "inline-block",
                      }}
                    >
                      {translateStatus(contract.paymentstatus)}{" "}
                    </span>
                  </TableCell>

                  <TableCell>
                    {contract.organizdate
                      ? formatDateForAPI(contract.organizdate)
                      : "Không có ngày tổ chức"}
                  </TableCell>

                  <TableCell
                    sx={{
                      display: "flex",
                      right: 0,
                      backgroundColor: "white",
                      zIndex: 1,
                    }}
                  >
                    <span>
                      <Button
                        variant="outlined"
                        onClick={() => handleConfirmContract(contract)}
                        disabled={
                          contract.status === "Completed" ||
                          contract.status === "Cancelled"
                        } // Disable if status is "Completed" or "Cancelled"
                        sx={{
                          fontSize: "1.3rem",
                          fontWeight: "bold",
                          color:
                            contract.status === "Completed"
                              ? "#28a745" // Màu xanh cho "Đã hoàn thành"
                              : contract.status === "Pending"
                              ? "#0066cc" // Màu vàng cho "Chờ duyệt" "#0066cc"
                              : contract.status === "Actived"
                              ? "#17a2b8" // Màu xanh dương cho "Đang hoạt động"
                              : contract.status === "Approved"
                              ? "#17a2b8" // Màu xanh dương đậm cho "Đã duyệt" "#17a2b8"
                              : "#dc3545", // Màu đỏ cho "Đã hủy"
                          borderRadius: "8px",
                          transition: "all 0.3s ease-in-out",
                          marginRight: "8px",
                          "&:hover": {
                            background:
                              contract.status === "Completed"
                                ? "linear-gradient(45deg, #28a7451a 30%, #28a745 90%)"
                                : contract.status === "Pending"
                                ? "linear-gradient(45deg, #ffc1071a 30%, #ffc107 90%)"
                                : contract.status === "Actived"
                                ? "linear-gradient(45deg, #17a2b81a 30%, #17a2b8 90%)"
                                : contract.status === "Approved"
                                ? "linear-gradient(45deg, #0066cc1a 30%, #0066cc 90%)" // Hiệu ứng hover cho "Đã duyệt"
                                : "linear-gradient(45deg, #dc35451a 30%, #dc3545 90%)", // Hiệu ứng hover theo trạng thái
                          },
                          opacity:
                            contract.status === "Completed" ||
                            contract.status === "Cancelled"
                              ? 0.5
                              : 1, // Mờ nút khi vô hiệu hóa
                        }}
                      >
                        <Tooltip
                          title={
                            <span style={{ fontSize: "1.25rem" }}>
                              {tooltipMessage[
                                getTooltipIndex(contract.status)
                              ] || "Không hợp lệ"}
                            </span>
                          }
                          placement="top"
                        >
                          <CheckCircleIcon />
                        </Tooltip>
                      </Button>
                      {/* Nút mở menu */}
                      <Button
                        variant="outlined"
                        sx={{
                          fontSize: "1.3rem",
                          fontWeight: "bold",
                          color: "#fff", // Màu chữ nút
                          borderRadius: "8px",
                          padding: "8px 10px", // Điều chỉnh kích thước nút
                          transition: "all 0.3s ease-in-out",
                          "&:hover": {
                            background:
                              "linear-gradient(45deg, #FFFFFF 30%, #66CCFF 90%)",
                          },
                        }}
                        onClick={(event) => handleClick(event, contract)}
                      >
                        <MoreVertIcon
                          style={{ fontSize: "1.5rem", color: "#1976d2" }}
                        />{" "}
                        {/* Giữ màu cho biểu tượng */}
                      </Button>

                      {/* Menu chứa các hành động */}
                      <Menu
                        id="contract-action-menu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        MenuListProps={{
                          "aria-labelledby": "basic-button",
                        }}
                      >
                        {/* Nút sửa hợp đồng */}

                        {hasPermission("UPDATE_CONTRACT") && (
                          <MenuItem
                            onClick={() => {
                              handleEditContract(contract);
                              handleClose();
                            }}
                            disabled={
                              contract.status === "Completed" ||
                              contract.status === "Cancelled"
                            }
                          >
                            <Button
                              variant="outlined"
                              sx={{
                                fontSize: "1.3rem",
                                fontWeight: "bold",
                                borderColor: "#4caf50",
                                color: "#4caf50",
                                borderRadius: "8px",
                                transition: "all 0.3s ease-in-out",
                                "&:hover": {
                                  backgroundColor: "#a3f0b4",
                                  borderColor: "#4ec267",
                                },
                              }}
                            >
                              <Tooltip
                                title={
                                  <span style={{ fontSize: "1.25rem" }}>
                                    Sửa hợp đồng
                                  </span>
                                }
                                placement="top"
                              >
                                <EditIcon />
                              </Tooltip>
                            </Button>
                          </MenuItem>
                        )}

                        {/* Nút hủy hợp đồng */}

                        {hasPermission("DELETE_CONTRACT") && (
                          <MenuItem
                            onClick={() => {
                              handleCancelContract(contract);
                              handleClose();
                            }}
                            disabled={
                              contract.status === "Completed" ||
                              contract.status === "Cancelled"
                            }
                          >
                            <Button
                              variant="outlined"
                              sx={{
                                fontSize: "1.3rem",
                                fontWeight: "bold",
                                borderColor: "#f44336",
                                color: "#f44336",
                                borderRadius: "8px",
                                transition: "all 0.3s ease-in-out",
                                "&:hover": {
                                  backgroundColor: "#fdecea",
                                  borderColor: "#d32f2f",
                                },
                              }}
                            >
                              <Tooltip
                                title={
                                  <span style={{ fontSize: "1.25rem" }}>
                                    Hủy hợp đồng
                                  </span>
                                }
                                placement="top"
                              >
                                <CancelIcon />
                              </Tooltip>
                            </Button>
                          </MenuItem>
                        )}

                        {/* Nút xem thông tin */}

                        {hasPermission("READ_CONTRACT") && (
                          <MenuItem
                            onClick={() => {
                              handleModalPDF(contract);
                              handleClose();
                            }}
                          >
                            <Button
                              variant="outlined"
                              sx={{
                                fontSize: "1.3rem",
                                fontWeight: "bold",
                                color: "primary",
                                borderRadius: "8px",
                                transition: "all 0.3s ease-in-out",
                                "&:hover": {
                                  background:
                                    "linear-gradient(45deg, #FFFFFF 30%, #66CCFF 90%)",
                                },
                              }}
                            >
                              <Tooltip
                                title={
                                  <span style={{ fontSize: "1.25rem" }}>
                                    Xem thông tin
                                  </span>
                                }
                                placement="top"
                              >
                                <InfoIcon />
                              </Tooltip>
                            </Button>
                          </MenuItem>
                        )}

                        {/* Nút xem nguyên liệu */}

                        {hasPermission("READ_CONTRACT") && (
                          <MenuItem
                            onClick={() => {
                              handleViewStockRequests(contract.contractId);
                              handleClose();
                            }}
                          >
                            <Button
                              variant="outlined"
                              sx={{
                                fontSize: "1.3rem",
                                fontWeight: "bold",
                                color: "primary",
                                borderRadius: "8px",
                                transition: "all 0.3s ease-in-out",
                                "&:hover": {
                                  background:
                                    "linear-gradient(45deg, #FFFFFF 30%, #66CCFF 90%)",
                                },
                              }}
                            >
                              <IconButton
                                color="primary"
                                title="Xem nguyên liệu"
                                sx={{
                                  padding: 0, // Để icon không bị lấn ra ngoài
                                }}
                              >
                                <VisibilityIcon
                                  style={{ fontSize: "1.5rem" }}
                                />
                              </IconButton>
                            </Button>
                          </MenuItem>
                        )}
                      </Menu>
                    </span>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        {/* Phân trang */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalElements}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số dòng mỗi trang:" // Đổi chữ ở đây
          sx={{
            display: "flex",
            justifyContent: "center",
            fontSize: "1.2rem",
            padding: "16px",
            color: "#333",
            backgroundColor: "#f9f9f9",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
              {
                fontSize: "1.2rem",
              },
            "& .MuiTablePagination-actions > button": {
              fontSize: "1.2rem",
              margin: "0 8px",
              backgroundColor: "#1976d2",
              color: "#fff",
              borderRadius: "50%",
              padding: "8px",
              transition: "background-color 0.3s",
              "&:hover": {
                backgroundColor: "#1565c0",
              },
            },
          }}
        />
      </TableContainer>
      {/* Modal chỉnh sửa hợp đồng */}
      <Dialog
        open={showModal}
        onClose={handleCloseModal}
        aria-labelledby="contract-modal-title"
        aria-describedby="contract-modal-description"
      >
        <div
          style={{
            padding: 20,
            backgroundColor: "white",
            borderRadius: 8,
            maxWidth: 1000, // Chiều rộng của modal
            margin: "auto",
          }}
        >
          <Typography
            id="contract-modal-title"
            variant="h6"
            component="h2"
            style={{
              marginBottom: 10,
              textAlign: "center",
              fontSize: "1.9rem", // Tăng cỡ chữ tiêu đề
            }}
          >
            Chỉnh sửa hợp đồng
          </Typography>
          <Divider />

          {/* Form chỉnh sửa hợp đồng */}
          <Grid container spacing={3}>
            {/* Nhóm thông tin cơ bản */}
            <Grid item xs={6}>
              <label
                style={{
                  fontWeight: "bold",
                  display: "block",
                  fontSize: "13px",
                }}
              >
                Tên hợp đồng
              </label>
              <TextField
                value={selecterContract?.name || ""}
                onChange={(e) =>
                  setSelecterContract({
                    ...selecterContract,
                    name: e.target.value,
                  })
                }
                fullWidth
                sx={{
                  "& .MuiInputBase-root": {
                    height: "36px", // Chiều cao tổng thể của ô input
                  },
                  "& .MuiInputBase-input": {
                    fontSize: "1.2rem", // Tăng cỡ chữ phần nội dung nhập vào
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "1.2rem", // Tăng cỡ chữ của label
                  },
                }}
                disabled
              />
            </Grid>
            <Grid item xs={6}>
              <label
                style={{
                  fontWeight: "bold",
                  display: "block",
                  fontSize: "13px",
                }}
              >
                Loại hợp đồng
              </label>
              <Autocomplete
                value={selecterContract.type || ""}
                onChange={(event, newValue) =>
                  setSelecterContract({ ...selecterContract, type: newValue })
                }
                options={contractTypes || []}
                getOptionLabel={(option) => option || ""}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    sx={{
                      "& .MuiInputBase-root": {
                        height: "36px", // Chiều cao tổng thể của ô input
                      },
                      "& .MuiInputBase-input": {
                        fontSize: "1.2rem", // Tăng cỡ chữ phần nội dung nhập vào
                      },
                      "& .MuiInputLabel-root": {
                        fontSize: "1.2rem", // Tăng cỡ chữ của label
                      },
                    }}
                  />
                )}
                disabled
              />
            </Grid>

            {/* <Grid item xs={6}>
        <label style={{ fontWeight: "bold", display: "block", fontSize:"13px" }}>
          Số khách
        </label>
        <TextField
          type="number"
          value={selecterContract?.guest || 0}
          onChange={(e) => {
            setSelecterContract({ ...selecterContract, guest: e.target.value })
            }
          }
          fullWidth
          sx={{
            "& .MuiInputBase-root": {
              height: "36px", // Chiều cao tổng thể của ô input
            },
            "& .MuiInputBase-input": {
              fontSize: "1.2rem", // Tăng cỡ chữ phần nội dung nhập vào
            },
            "& .MuiInputLabel-root": {
              fontSize: "1.2rem", // Tăng cỡ chữ của label
            },
          }}
        />
      </Grid>
      <Grid item xs={6}>
      <label style={{ fontWeight: "bold", display: "block", fontSize:"13px" }}>
          Số bàn
        </label>
        <TextField
          type="number"
          value={selecterContract?.table || 0}
          onChange={(e) =>
            setSelecterContract({ ...selecterContract, table: e.target.value })
          }
          fullWidth
          sx={{
            "& .MuiInputBase-root": {
              height: "36px", // Chiều cao tổng thể của ô input
            },
            "& .MuiInputBase-input": {
              fontSize: "1.2rem", // Tăng cỡ chữ phần nội dung nhập vào
            },
            "& .MuiInputLabel-root": {
              fontSize: "1.2rem", // Tăng cỡ chữ của label
            },
          }}
        />
      </Grid> */}

            <Grid item xs={6}>
              <label
                style={{
                  fontWeight: "bold",
                  display: "block",
                  fontSize: "13px",
                }}
              >
                Tổng chi phí
              </label>
              <TextField
                type="text" // Đổi type sang text để cho phép hiển thị dấu chấm
                value={new Intl.NumberFormat("vi-VN").format(
                  selecterContract?.totalcost || 0
                )}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/\./g, ""); // Loại bỏ dấu chấm khi nhập
                  if (!isNaN(rawValue)) {
                    setSelecterContract({
                      ...selecterContract,
                      totalcost: parseInt(rawValue, 10) || 0, // Lưu giá trị gốc không format
                    });
                  }
                }}
                fullWidth
                sx={{
                  "& .MuiInputBase-root": {
                    height: "36px", // Chiều cao tổng thể của ô input
                  },
                  "& .MuiInputBase-input": {
                    fontSize: "1.2rem", // Tăng cỡ chữ phần nội dung nhập vào
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "1.2rem", // Tăng cỡ chữ của label
                  },
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <label
                style={{
                  fontWeight: "bold",
                  display: "block",
                  fontSize: "13px",
                }}
              >
                Trạng thái hợp đồng
              </label>
              <Autocomplete
                value={selecterContract.status || ""}
                onChange={(event, newValue) => {
                  const statusInEnglish = mapStatusToEnglish(newValue);
                  setSelecterContract({
                    ...selecterContract,
                    status: statusInEnglish,
                  });
                }}
                options={contractStatuses || []}
                getOptionLabel={(option) => option || ""}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    sx={{
                      "& .MuiInputBase-root": {
                        height: "36px", // Chiều cao tổng thể của ô input
                      },
                      "& .MuiInputBase-input": {
                        fontSize: "1.2rem", // Tăng cỡ chữ phần nội dung nhập vào
                      },
                      "& .MuiInputLabel-root": {
                        fontSize: "1.2rem", // Tăng cỡ chữ của label
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={6}>
              <label
                style={{
                  fontWeight: "bold",
                  display: "block",
                  fontSize: "13px",
                }}
              >
                Trạng thái thanh toán
              </label>
              <Autocomplete
                value={selecterContract.paymentstatus || ""}
                onChange={(event, newValue) =>
                  setSelecterContract({
                    ...selecterContract,
                    paymentstatus: newValue,
                  })
                }
                options={
                  paymentStatuses.map((status) => translateStatus(status)) || []
                }
                getOptionLabel={(option) => option || ""}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    sx={{
                      "& .MuiInputBase-root": {
                        height: "36px", // Chiều cao tổng thể của ô input
                      },
                      "& .MuiInputBase-input": {
                        fontSize: "1.2rem", // Tăng cỡ chữ phần nội dung nhập vào
                      },
                      "& .MuiInputLabel-root": {
                        fontSize: "1.2rem", // Tăng cỡ chữ của label
                      },
                    }}
                  />
                )}
                disabled
              />
            </Grid>
            <Grid item xs={6}>
              <label
                style={{
                  fontWeight: "bold",
                  display: "block",
                  fontSize: "13px",
                }}
              >
                Ngày tổ chức
              </label>
              <TextField
                type="datetime-local"
                value={formatDateForInput(selecterContract?.organizdate) || ""}
                onChange={(e) =>
                  setSelecterContract({
                    ...selecterContract,
                    organizdate: e.target.value,
                  })
                }
                fullWidth
                sx={{
                  "& .MuiInputBase-root": {
                    height: "36px", // Chiều cao tổng thể của ô input
                  },
                  "& .MuiInputBase-input": {
                    fontSize: "1.2rem", // Tăng cỡ chữ phần nội dung nhập vào
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "1.2rem", // Tăng cỡ chữ của label
                  },
                }}
              />
            </Grid>

            {/* Thông tin khách hàng */}
            <Grid item xs={6}>
              <label
                style={{
                  fontWeight: "bold",
                  display: "block",
                  fontSize: "13px",
                }}
              >
                Tên khách hàng
              </label>
              <TextField
                value={selecterContract?.custname || ""}
                onChange={(e) =>
                  setSelecterContract({
                    ...selecterContract,
                    custname: e.target.value,
                  })
                }
                fullWidth
                sx={{
                  "& .MuiInputBase-root": {
                    height: "36px", // Chiều cao tổng thể của ô input
                  },
                  "& .MuiInputBase-input": {
                    fontSize: "1.2rem", // Tăng cỡ chữ phần nội dung nhập vào
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "1.2rem", // Tăng cỡ chữ của label
                  },
                }}
                disabled
              />
            </Grid>
            <Grid item xs={6}>
              <label
                style={{
                  fontWeight: "bold",
                  display: "block",
                  fontSize: "13px",
                }}
              >
                Số điện thoại
              </label>
              <TextField
                value={selecterContract?.custphone || ""}
                onChange={(e) =>
                  setSelecterContract({
                    ...selecterContract,
                    custphone: e.target.value,
                  })
                }
                fullWidth
                sx={{
                  "& .MuiInputBase-root": {
                    height: "36px", // Chiều cao tổng thể của ô input
                  },
                  "& .MuiInputBase-input": {
                    fontSize: "1.2rem", // Tăng cỡ chữ phần nội dung nhập vào
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "1.2rem", // Tăng cỡ chữ của label
                  },
                }}
                disabled
              />
            </Grid>

            {/* Mô tả */}
            <Grid item xs={12}>
              <label
                style={{
                  fontWeight: "bold",
                  display: "block",
                  fontSize: "13px",
                }}
              >
                Mô tả
              </label>
              <TextField
                value={selecterContract?.description || ""}
                onChange={(e) =>
                  setSelecterContract({
                    ...selecterContract,
                    description: e.target.value,
                  })
                }
                fullWidth
                multiline
                rows={3}
                sx={{
                  "& .MuiInputBase-input": {
                    fontSize: "1.2rem", // Tăng cỡ chữ phần nội dung nhập vào
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "1.2rem", // Tăng cỡ chữ của label
                  },
                }}
              />
            </Grid>
          </Grid>
          {/* Nút Lưu và Hủy */}
          <Box
            display="flex"
            justifyContent="right"
            marginTop={3}
            gap={2} // Khoảng cách giữa hai nút
          >
            <Button
              onClick={handleSaveContract}
              variant="outlined"
              color="primary"
              sx={{ fontSize: "1rem" }}
            >
              Cập nhật
            </Button>
            <Button
              onClick={handleCloseModal}
              variant="outlined"
              color="secondary"
            >
              Hủy
            </Button>
          </Box>
        </div>
      </Dialog>
      {/* Hiển thị dialog hợp đồng */}
      <Dialog open={showModalPDF} onClose={handleCloseModal}>
        <DialogTitle sx={{ fontSize: "1.6rem", fontWeight: "bold" }}>
          Hợp Đồng Dịch Vụ
        </DialogTitle>

        <DialogContent
          className="custom-input"
          dividers
          sx={{ width: "600px" }}
        >
          <div
            id="contract-content"
            style={{
              padding: "20px",
              fontFamily: "Arial, sans-serif",
              lineHeight: 1.6,
            }}
          >
            <h2 style={{ textAlign: "center", textTransform: "uppercase" }}>
              Cộng Hòa Xã Hội Chủ Nghĩa Việt Nam
            </h2>
            <p style={{ textAlign: "center", fontWeight: "bold" }}>
              Độc lập - Tự do - Hạnh phúc
            </p>
            <h3 style={{ textAlign: "center", marginTop: "20px" }}>
              Hợp Đồng Dịch Vụ
            </h3>

            <p style={{ textAlign: "right" }}>
              Số hợp đồng:{" "}
              <strong>{selecterContract?.contractId || "..."}</strong>
            </p>

            <p style={{ marginTop: "20px" }}>
              Căn cứ Bộ luật Dân sự 2015 số 91/2015/QH13 và các văn bản hướng
              dẫn thi hành;
            </p>
            <p>
              Căn cứ nhu cầu và thỏa thuận giữa các bên, hôm nay, vào ngày{" "}
              <strong>{organizDate ? organizDate.getDate() : "..."}</strong>{" "}
              tháng{" "}
              <strong>
                {organizDate ? organizDate.getMonth() + 1 : "..."}
              </strong>{" "}
              năm{" "}
              <strong>{organizDate ? organizDate.getFullYear() : "..."}</strong>
              , tại trụ sở Công ty TNHH một thành viên L&P
            </p>

            <h3>
              Bên A:{" "}
              <strong>{selecterContract?.custname || "(Bên Thuê)"}</strong>
            </h3>
            <p>
              <strong>Địa chỉ trụ sở:</strong>{" "}
              {selecterContract?.Address ||
                "Số 4 Hai Bà Trưng, Tân An, Ninh Kiều, CT"}
            </p>
            <p>
              <strong>Mã số thuế:</strong>{" "}
              {selecterContract?.TaxCode || "888863453"}
            </p>
            <p>
              <strong>Đại diện là Ông/Bà:</strong>{" "}
              {selecterContract?.custname || "..."}
            </p>
            <p>
              <strong>Chức vụ:</strong>{" "}
              {selecterContract?.Position || "Giám đốc"}
            </p>
            <p>
              <strong>Số điện thoại:</strong>{" "}
              {selecterContract?.custphone || "0123456789"}
            </p>
            <p>
              <strong>Email:</strong>{" "}
              {selecterContract?.custmail || "example@example.com"}
            </p>
            <p>
              <strong>Số tài khoản ngân hàng:</strong>{" "}
              {selecterContract?.BankAccount || "123456789"} tại Ngân hàng:{" "}
              {selecterContract?.BankName || "TPBANK"}
            </p>
            <h3>
              Bên B: <strong>CÔNG TY TNHH 1 THÀNH VIÊN L&P</strong>
            </h3>
            <p>
              <strong>Số CMND/CCCD:</strong>{" "}
              {selecterContract?.IDCard || "123456789"}, cấp ngày 11 tại Cần Thơ
            </p>
            <p>
              <strong>Sinh ngày:</strong>{" "}
              {selecterContract?.dob || "01/01/1990"}
            </p>
            <p>
              <strong>Địa chỉ thường trú:</strong>{" "}
              {selecterContract?.Address ||
                "Hẻm 3, Trần Vĩnh Kiết, An Bình, CT"}
            </p>
            <p>
              <strong>Địa chỉ liên hệ:</strong>{" "}
              {selecterContract?.ContactAddress ||
                "Số 6, Hai Bà Trưng, Tân An, Ninh Kiều, Cần Thơ"}
            </p>

            <h3>Điều 1: Nội dung hợp đồng</h3>
            <p>
              Bên A <strong>{selecterContract?.custname}</strong> đồng ý thuê
              Bên B <strong>CÔNG TY TNHH 1 THÀNH VIÊN L&P</strong> cung cấp dịch
              vụ {selecterContract?.type || "dịch vụ"} tại địa điểm số{" "}
              <strong>
                {selecterContract?.locations?.locationId || "..."}
              </strong>{" "}
              vào ngày{" "}
              <strong>{organizDate ? organizDate.getDate() : "..."}</strong>
              {""}.
            </p>
            <p>Dịch vụ bao gồm: {selecterContract?.description || "..."}</p>

            <h3>Điều 2: Trách nhiệm và quyền lợi của các bên</h3>
            <p>
              - Bên A có trách nhiệm thanh toán đầy đủ cho Bên B theo tổng số
              tiền đã thoả thuận là{" "}
              <strong>{selecterContract?.totalcost || "..."}</strong>, và số
              tiền đã được thanh toán.
            </p>
            <p>
              - Bên B có trách nhiệm cung cấp dịch vụ theo yêu cầu của Bên A.
              Nếu có bất kỳ vấn đề phát sinh nào, các bên sẽ thương lượng để tìm
              cách giải quyết.
            </p>

            <h3>Điều 3: Điều khoản chung</h3>
            <p>
              Hợp đồng có hiệu lực kể từ ngày ký và sẽ kết thúc sau khi dịch vụ
              hoàn thành.
            </p>
            <p>
              Các tranh chấp phát sinh sẽ được giải quyết theo pháp luật Việt
              Nam.
            </p>

            <h3>Chữ ký của các bên</h3>
            <p>
              <strong>Bên A:</strong> _______________________
            </p>
            <p>
              <strong>Bên B:</strong> _______________________
            </p>
          </div>
        </DialogContent>

        <DialogActions>
          <Button
            variant="outlined"
            onClick={handleCloseModal}
            color="secondary"
            sx={{ fontSize: "1.3rem", fontWeight: "bold" }}
          >
            Đóng
          </Button>
          <Button
            variant="outlined"
            onClick={handleSavePDF}
            color="primary"
            sx={{ fontSize: "1.3rem", fontWeight: "bold" }}
          >
            Xuất PDF
          </Button>
          <Button
            variant="outlined"
            onClick={handleSendMail}
            color="success"
            sx={{ fontSize: "1.3rem", fontWeight: "bold" }}
          >
            Gửi Email
          </Button>
        </DialogActions>
      </Dialog>{" "}
      <Dialog
        open={showStockRequestsDialog}
        onClose={() => setShowStockRequestsDialog(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: "16px", // Bo góc cho dialog
            padding: "16px", // Thêm padding
            backgroundColor: "#f5f5f5", // Nền xám nhạt
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "#031b4a",
            textAlign: "center",
          }}
        >
          Danh sách chi tiết nguyên liệu -{" "}
          {selectedContract?.name || "Chưa xác định"}
        </DialogTitle>
        <DialogContent
          sx={{
            backgroundColor: "#ffffff", // Nền trắng cho nội dung
            borderRadius: "8px", // Bo góc nội dung
            padding: "16px",
            marginTop: "8px",
          }}
        >
          {Array.isArray(stockRequests) && stockRequests.length > 0 ? (
            <Table
              sx={{
                "& .MuiTableCell-root": {
                  fontSize: "1.2rem", // Tăng cỡ chữ
                  padding: "12px", // Thêm khoảng cách
                },
                "& .MuiTableHead-root": {
                  backgroundColor: "#f0f0f0", // Màu nền cho tiêu đề
                },
                "& .MuiTableRow-root:nth-of-type(odd)": {
                  backgroundColor: "#fafafa", // Màu nền cho hàng lẻ
                },
                "& .MuiTableRow-root:nth-of-type(even)": {
                  backgroundColor: "#eaeaea", // Màu nền cho hàng chẵn
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.6rem" }}>
                    STT
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    Tên nguyên liệu
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.6rem" }}>
                    Số lượng
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.6rem" }}>
                    Đơn vị
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1.6rem" }}>
                    Trạng thái
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stockRequests.map((request, index) => (
                  <TableRow key={request.stockrequestId}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      {request.ingredients?.name || "Không rõ"}
                    </TableCell>
                    <TableCell>{request.quantity || 0}</TableCell>
                    <TableCell>
                      {request.ingredients?.unit || "Không rõ"}
                    </TableCell>
                    <TableCell>{request.status || "Không rõ"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "16px",
              }}
            >
              <Typography variant="h6" color="textSecondary">
                Không có dữ liệu nguyên liệu
              </Typography>
              <Box
                component="img"
                src="https://via.placeholder.com/150"
                alt="No Data"
                sx={{
                  width: "150px",
                  height: "150px",
                  marginTop: "16px",
                  opacity: 0.7,
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            display: "flex",
            justifyContent: "center",
            padding: "8px 16px",
          }}
        >
          <Button
            onClick={() => setShowStockRequestsDialog(false)}
            color="primary"
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              padding: "8px 24px",
              fontSize: "1.3rem",
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ManageContracts;
