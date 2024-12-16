import React, { useState } from "react";
import {
  Box,
  Popover,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";

// Hàm dịch trạng thái
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

const ContractFilter = ({ filterType, onApplyFilter }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedValue, setSelectedValue] = useState("");

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleFilter = (value) => {
    setSelectedValue(value);
    onApplyFilter(value);  // Áp dụng ngay khi chọn item
    handleClose();  // Đóng popover ngay khi chọn item
  };

  const open = Boolean(anchorEl);
  const id = open ? "filter-popover" : undefined;

  // Các tùy chọn lọc cho hợp đồng và thanh toán
  const contractStatusOptions = [
    { label: translateStatus("Tất cả"), value: "" },
    { label: translateStatus("Pending"), value: "Pending" },
    { label: translateStatus("Completed"), value: "Completed" },
    { label: translateStatus("Approved"), value: "Approved" },
    { label: translateStatus("Actived"), value: "Actived" },
    { label: translateStatus("Cancelled"), value: "Cancelled" },
  ];

  const paymentStatusOptions = [
    { label: translateStatus("Tất cả"), value: "" },
    { label: translateStatus("Paid"), value: "Paid" },
    { label: translateStatus("Prepay 50%"), value: "Prepay 50%" },
    { label: translateStatus("Prepay 70%"), value: "Prepay 70%" },
    { label: translateStatus("Unpaid"), value: "Unpaid" },
  ];

  return (
    <div>
      <IconButton variant="contained" onClick={handleOpen} sx={{ textTransform: "none" }}>
        <FilterListIcon />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <Box
          sx={{
            p: 2,
            minWidth: 250,
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <FormControl fullWidth size="small">
            <InputLabel sx={{ fontSize: "1.1rem" }}>
              {filterType === "contract"
                ? "Trạng thái hợp đồng"
                : "Trạng thái thanh toán"}
            </InputLabel>
            <Select
              value={selectedValue}
              onChange={(e) => handleFilter(e.target.value)}  // Áp dụng lọc ngay
              sx={{ borderRadius: "6px", fontSize: "1.1rem" }}
            >
              {(filterType === "contract" ? contractStatusOptions : paymentStatusOptions).map(
                (option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                )
              )}
            </Select>
          </FormControl>
        </Box>
      </Popover>
    </div>
  );
};

export default ContractFilter;
