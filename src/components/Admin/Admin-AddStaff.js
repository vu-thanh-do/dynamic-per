import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Box,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  MenuItem,
  FormControl,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Divider, Select } from "antd";
import toast, { Toaster } from "react-hot-toast";

// Modal style
const modalStyle = {
  width: "490px",
  margin: "auto",
  mt: "8%",
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const AddUserModal = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    roles: [], // Khởi tạo roles là một mảng rỗng
  });

  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState(""); // Vai trò hiện tại
  const [roles, setRoles] = useState([]); // Dữ liệu vai trò từ API

  useEffect(() => {
    fetchRoles();
  }, []);

  // Xử lý thay đổi form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Xử lý việc gửi biểu mẫu
  const handleSubmit = () => {
    onSubmit(formData);
    setFormData({ username: "", password: "", email: "", roles: [], });
    onClose();
  };

  const hienThiMatKhau = () => {
    setShowPassword(!showPassword);
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch("https://62c6-2001-ee0-5722-4dc0-a8e7-eaeb-2e68-34e5.ngrok-free.app/obbm/roles", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();

        // Lọc ADMIN và các vai trò liên quan đến STAFF
        const fillterRoles = data?.result?.filter((role) =>
          role.name.startsWith("STAFF")
        );

        console.log("List Roles: ", fillterRoles);

        setRoles(fillterRoles); // Lưu danh sách vai trò
      } else {
        console.error("Failed to fetch roles:", response.status);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  // Khi chọn vai trò
  const handleRoleSelect = (role) => {
    setSelectedRole(role); // Lưu vai trò đã chọn vào state
    setFormData({ ...formData, roles: [...formData.roles, role], }); // Lưu vai trò vào formData
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          Thêm người dùng mới
        </Typography>

        <Divider />

        {/* Tên đăng nhập */}
        <Box sx={{ mb: 2 }}>
          <Typography
            sx={{
              fontSize: "1.2rem",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              marginBottom: "5px",
            }}
          >
            Tên đăng nhập{" "}
            <span style={{ color: "red", marginLeft: "4px" }}>*</span>
          </Typography>
          <TextField
            sx={{
              height: "40px",
              "& .MuiOutlinedInput-root": {
                height: "40px",
                fontSize: "1.2rem",
              },
              "& .MuiInputLabel-root": {
                fontSize: "1.2rem",
              },
            }}
            fullWidth
            variant="outlined"
            name="username"
            placeholder="Nhập tên đăng nhập"
            value={formData.username}
            onChange={handleChange}
          />
        </Box>

        {/* Mật khẩu */}
        <Box sx={{ mb: 2 }}>
          <Typography
            sx={{
              fontSize: "1.2rem",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              marginBottom: "5px",
            }}
          >
            Mật khẩu <span style={{ color: "red", marginLeft: "4px" }}>*</span>
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            name="password"
            placeholder="Nhập mật khẩu"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={hienThiMatKhau}>
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              height: "40px",
              "& .MuiOutlinedInput-root": {
                height: "40px",
                fontSize: "1.2rem",
              },
              "& .MuiInputLabel-root": {
                fontSize: "1.2rem",
              },
            }}
          />
        </Box>

        {/* Email */}
        <Box sx={{ mb: 2 }}>
          <Typography
            sx={{
              fontSize: "1.2rem",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              marginBottom: "5px",
            }}
          >
            Email <span style={{ color: "red", marginLeft: "4px" }}>*</span>
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            name="email"
            placeholder="Nhập email"
            value={formData.email}
            onChange={handleChange}
            sx={{
              height: "40px",
              "& .MuiOutlinedInput-root": {
                height: "40px",
                fontSize: "1.2rem",
              },
              "& .MuiInputLabel-root": {
                fontSize: "1.2rem",
              },
            }}
          />
        </Box>

        {/* Vai trò - ComboBox */}
        <Box sx={{ mb: 2 }}>
          <FormControl size="small" variant="outlined" fullWidth>
            <Select
              value={selectedRole}
              onChange={handleRoleSelect} // Lưu giá trị vai trò đã chọn
              getPopupContainer={(trigger) => trigger.parentNode} // Điều này giúp Popup hiển thị bên ngoài Modal
            >
              <MenuItem value="">
                <span>--- Chọn vai trò ---</span>
              </MenuItem>
              {roles.map((role) => (
                <MenuItem key={role.name} value={role.name}>
                  {role.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Divider></Divider>

        {/* Buttons */}
        <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            sx={{
              textTransform: "none",
              fontWeight: "bold",
              fontSize: "1rem",
              padding: "10px 20px",
              borderRadius: "8px",
              boxShadow: 3,
              "&:hover": {
                backgroundColor: "#1565c0",
              },
            }}
          >
            Thêm
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={onClose}
            sx={{
              textTransform: "none",
              fontWeight: "bold",
              fontSize: "1rem",
              padding: "10px 20px",
              borderRadius: "8px",
              boxShadow: 3,
              "&:hover": {
                backgroundColor: "#d32f2f",
              },
            }}
          >
            Hủy
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

const AddUserStaff = ({ onUserAdded }) => {
  const [open, setOpen] = useState(false);

  // Handle modal open/close
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Handle API submission
  const handleAddUser = async (formData) => {
    try {
      console.log("Dữ liệu gửi đi:", formData); // Kiểm tra dữ liệu
      console.log("Dữ liệu gửi đi:", JSON.stringify(formData));
  
      const response = await fetch(
        `https://62c6-2001-ee0-5722-4dc0-a8e7-eaeb-2e68-34e5.ngrok-free.app/obbm/users/userForAdmin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify(formData),
        }
      );
  
      // Kiểm tra response status và body trả về
      console.log("Response Status:", response.status);
  
      // Nếu response không phải JSON, ta sẽ sử dụng response.text() để lấy nội dung thô
      const responseText = await response.text();
      console.log("Response Body:", responseText);
  
      // Kiểm tra mã trạng thái trả về từ API
      if (!response.ok) {
        // Trả về lỗi nếu response.status không phải 2xx
        const errorMessage = responseText || `Lỗi: ${response.status}`;
        console.error("Lỗi từ server:", errorMessage);
        toast.error(`Không thể thêm người dùng. Lỗi: ${errorMessage}`);
        return;
      }
  
      // Nếu có lỗi, phản hồi của server có thể là một JSON object
      const responseBody = JSON.parse(responseText); // Chuyển thành đối tượng JSON từ chuỗi thô
      console.log("User added successfully:", responseBody);
  
      onUserAdded(responseBody?.result); // Cập nhật danh sách người dùng
      toast.success("Người dùng mới đã được thêm thành công!");
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại.");
    }
  };
  
  return (
    <Box>
    <Toaster position="top-center" reverseOrder={false} />
      <Button
        variant="contained"
        color="primary"
        sx={{
          fontSize: "1.2rem",
          textTransform: "none",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
        }}
        onClick={handleOpen}
      >
        + Thêm người dùng
      </Button>
      <AddUserModal
        open={open}
        onClose={handleClose}
        onSubmit={handleAddUser}
      />
    </Box>
  );
};

export default AddUserStaff;
