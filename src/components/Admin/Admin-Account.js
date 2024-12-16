import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  IconButton,
  TablePagination,
  Divider,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import { toast } from "react-toastify";
import AddIcon from "@mui/icons-material/Add";
import userApi from "api/userApi";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Typography } from "antd";
import Swal from "sweetalert2";
import SnackBarNotification from "./SnackBarNotification";
import useGetPermission from "hooks/useGetPermission";

const AccountManager = () => {
  const [accounts, setAccounts] = useState([]);
  const { hasPermission } = useGetPermission();

  const [openDialog, setOpenDialog] = useState(false);
  const [currentAccount, setCurrentAccount] = useState({
    username: "",
    password: "",
    email: "",
  });
  const [dialogMode, setDialogMode] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [showPassword, setShowPassword] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [errors, setErrors] = useState({});

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

  const handleImageClick = (image) => {
    setSelectedImage(image); // Lưu URL ảnh
    setOpenImageDialog(true); // Mở dialog
  };

  const handleCloseImageDialog = () => {
    setOpenImageDialog(false); // Đóng dialog
    setSelectedImage(null); // Reset URL ảnh
  };

  const handleChange = async (e) => {
    const { type, name, files, value } = e.target;

    // Xử lý ảnh
    if (name === "image" && files && files.length > 0) {
      const file = files[0];

      // Tạo URL tạm thời cho ảnh (preview)
      const imagePreviewUrl = URL.createObjectURL(file);

      // Cập nhật ảnh vào state để hiển thị preview
      setCurrentAccount({
        ...currentAccount,
        image: imagePreviewUrl,
      });

      try {
        // Tạo FormData để gửi file
        const formData = new FormData();
        formData.append("file", file);

        // Gửi yêu cầu lên API để tải ảnh lên
        const response = await fetch(
          "https://62c6-2001-ee0-5722-4dc0-a8e7-eaeb-2e68-34e5.ngrok-free.app/obbm/upload/image",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
            body: formData, // Đưa formData vào body
          }
        );

        const data = await response.json();
        console.log("Response Data:", data);

        if (response.ok) {
          console.log("Upload thành công:", data);

          // Lấy URL từ API Cloudinary
          const imageUrl = data.result; // Kết quả trả về là URL của ảnh đã được upload

          // Cập nhật URL ảnh trả về từ server vào dishData
          setCurrentAccount({
            ...currentAccount,
            image: imageUrl, // Lấy URL ảnh từ trường fileUrl của API
          });

          // Xóa lỗi nếu ảnh được tải lên thành công
          setErrors((prevErrors) => ({
            ...prevErrors,
            image: undefined,
          }));
        } else {
          console.error("Lỗi tải ảnh:", data);
          setErrors((prevErrors) => ({
            ...prevErrors,
            image: "Không thể tải ảnh lên",
          }));
        }
      } catch (error) {
        console.error("Lỗi tải ảnh:", error);
        setErrors((prevErrors) => ({
          ...prevErrors,
          image: "Không thể tải ảnh lên",
        }));
      }
    } else {
      // Xử lý các trường khác
      setCurrentAccount({
        ...currentAccount,
        [name]: type === "number" ? Number(value) : value,
      });

      // Xóa lỗi nếu người dùng nhập đúng
      if (typeof value === "string" && value.trim() !== "") {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [name]: undefined,
        }));
      }
    }
  };

  const handleRemoveImage = () => {
    setCurrentAccount((prev) => ({ ...prev, image: "" }));
  };

  // Fetch users with empty roles
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await userApi.getAllUser();
        const filteredUsers = response.result?.filter((user) =>
          user.roles.some((role) => role.name === "USER")
        );
        setAccounts(filteredUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to fetch user data.");
      }
    };

    fetchUsers();
  }, []);

  const handleOpenDialog = (mode, account) => {
    setDialogMode(mode);
    setCurrentAccount(
      account || {
        username: "",
        password: "",
        email: "",
      }
    );
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setCurrentAccount({
      username: "",
      password: "",
      email: "",
    });
    setOpenDialog(false);
  };

  // Xử lý khi thay đổi giá trị trong form
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setCurrentAccount((prevAccount) => ({
      ...prevAccount,
      [name]: value,
    }));
  };

  const handleAddAccount = async () => {
    const newAccount = { ...currentAccount };

    try {
      const response = await fetch(
        "https://62c6-2001-ee0-5722-4dc0-a8e7-eaeb-2e68-34e5.ngrok-free.app/obbm/users/user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify(newAccount),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Thêm khách hàng thành công:", result);

      // Chuẩn hóa dữ liệu
      const normalizedAccount = {
        userId: result.result.userId || "",
        username: result.result.username || "N/A",
        fullname: result.result.fullname || "Chưa cập nhật",
        email: result.result.email || "Không có email",
        phone: result.result.phone || "Chưa cập nhật",
        image: result.result.image || "",
        noPassword: result.result.noPassword || false,
        isStatus: result.result.isStatus || false,
      };

      // Thêm tài khoản mới lên đầu danh sách
      setAccounts((prevAccounts) => [normalizedAccount, ...prevAccounts]);

      setOpenDialog(false);
      showSuccess("Thêm tài khoản thành công!");
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error("Thêm tài khoản thất bại!");
    }
  };

  useEffect(() => {
    console.log("Danh sách accounts:", accounts);
  }, [accounts]);

  const handleEditAccount = async () => {
    try {
      const updatedAccount = {
        fullname: currentAccount.fullname,
        gender: currentAccount.gender,
        residence: currentAccount.residence,
        email: currentAccount.email,
        phone: currentAccount.phone,
        image: currentAccount.image,
        citizenIdentity: currentAccount.citizenIdentity,
        dob: currentAccount.dob,
      };

      // Gọi trực tiếp API bằng fetch
      const response = await fetch(
        `https://62c6-2001-ee0-5722-4dc0-a8e7-eaeb-2e68-34e5.ngrok-free.app/obbm/users/user/${currentAccount.userId}`, // URL API
        {
          method: "PUT", // HTTP method
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`, // Thêm token nếu cần
          },
          body: JSON.stringify(updatedAccount), // Dữ liệu gửi đi
        }
      );

      // Xử lý phản hồi từ API
      if (response.ok) {
        const result = await response.json(); // Chuyển đổi kết quả thành JSON
        console.log("Thông tin cập nhật: ", result);

        // Cập nhật danh sách accounts
        const updatedAccounts = accounts.map((account) =>
          account.userId === currentAccount.userId
            ? { ...account, ...updatedAccount }
            : account
        );
        setAccounts(updatedAccounts);

        showSuccess("Thông tin tài khoản đã được cập nhật!");
        handleCloseDialog();
      } else {
        console.error("Cập nhật thông tin thất bại!");
        toast.error("Cập nhật thông tin thất bại!");
      }
    } catch (error) {
      console.error("Error editing account:", error);
      toast.error("Lỗi khi cập nhật thông tin.");
    }
  };

  const handleDeleteAccount = async (userId) => {
    // Hiển thị xác nhận xóa bằng SweetAlert2
    const confirm = await Swal.fire({
      title: "Bạn có chắc chắn muốn khóa tài khoản này?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Khóa",
      cancelButtonText: "Hủy",
    });

    if (confirm.isConfirmed) {
      try {
        const response = await fetch(
          `https://62c6-2001-ee0-5722-4dc0-a8e7-eaeb-2e68-34e5.ngrok-free.app/obbm/users/${userId}`, // URL API xóa tài khoản
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`, // Thêm token nếu cần
            },
          }
        );

        if (response.ok) {
          // Xóa tài khoản khỏi danh sách sau khi xóa thành công
          setAccounts((prevAccounts) =>
            prevAccounts.map((account) =>
              account.userId === userId
                ? { ...account, noPassword: true } // Đánh dấu là đã xóa
                : account
            )
          );
          showSuccess("Tài khoản đã được khóa!");
        } else {
          toast.error("Không thể xóa tài khoản. Vui lòng thử lại!");
        }
      } catch (error) {
        console.error("Lỗi khi xóa tài khoản:", error);
        toast.error("Có lỗi xảy ra khi xóa tài khoản.");
      }
    }
  };

  const handleRestoreAccount = async (userId) => {
    try {
      // Lấy thông tin hiện tại của người dùng từ API
      const response = await fetch(
        `https://62c6-2001-ee0-5722-4dc0-a8e7-eaeb-2e68-34e5.ngrok-free.app/obbm/users/user/${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (!response.ok) {
        toast.error("Không thể lấy thông tin người dùng. Vui lòng thử lại!");
        return;
      }

      const userData = await response.json();

      // Cập nhật trạng thái noPassword
      const updatedAccount = {
        fullname: userData.fullname || "Chưa cập nhật",
        gender: userData.gender || true,
        residence: userData.residence || "Chưa cập nhật",
        email: userData.email || "Chưa cập nhật",
        phone: userData.phone || "Chưa cập nhật",
        image: userData.image || "",
        citizenIdentity: userData.citizenIdentity || "Chưa cập nhật",
        dob: userData.dob || "2000-01-01",
        noPassword: false, // Thay đổi trạng thái
      };

      // Gửi yêu cầu cập nhật
      const updateResponse = await fetch(
        `https://62c6-2001-ee0-5722-4dc0-a8e7-eaeb-2e68-34e5.ngrok-free.app/obbm/users/user/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify(updatedAccount),
        }
      );

      if (updateResponse.ok) {
        // Cập nhật frontend
        setAccounts((prevAccounts) =>
          prevAccounts.map((account) =>
            account.userId === userId
              ? { ...account, noPassword: false }
              : account
          )
        );
        showSuccess("Khôi phục tài khoản thành công!");
      } else {
        toast.error("Không thể khôi phục tài khoản. Vui lòng thử lại!");
      }
    } catch (error) {
      console.error("Lỗi khi khôi phục tài khoản:", error);
      toast.error("Có lỗi xảy ra khi khôi phục tài khoản.");
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset về trang đầu tiên khi thay đổi số mục trên mỗi trang
  };

  // Hàm tìm kiếm: Lọc các dịch vụ dựa trên từ khóa tìm kiếm
  const filteredAccounts = accounts
    .filter(
      (accounts) =>
        searchTerm === "" || // Nếu không có từ khóa tìm kiếm
        Object.values(accounts).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
    )
    .filter((accounts) => !accounts.Status); // Loại bỏ các dịch vụ có trạng thái 'Status' là true

  return (
    <div>
      <SnackBarNotification
        open={snackBarOpen}
        handleClose={handleCloseSnackBar}
        message={snackBarMessage}
        snackType={snackType}
      />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 2,
          mb: 2,
        }}
      >
        {/* Ô tìm kiếm */}
        <div className="admin-group">
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
          />
        </div>
        {hasPermission("CREATE_USER") && (
          <Button
            sx={{ fontSize: "10px" }}
            variant="contained"
            color="primary"
            onClick={() => handleOpenDialog("add")}
          >
            <AddIcon
              sx={{
                marginRight: "5px",
                fontSize: "16px",
                verticalAlign: "middle",
              }}
            />
            Thêm tài khoản khách hàng
          </Button>
        )}
      </Box>
      <TableContainer
        component={Paper}
        sx={{ mt: 1 }}
        className="table-container"
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>STT</TableCell>
              <TableCell>Tên đăng nhập</TableCell>
              <TableCell>Họ tên</TableCell>
              <TableCell>Hình ảnh</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Số điện thoại</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accounts
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((account, index) => (
                <TableRow key={account.userId}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{account.username}</TableCell>
                  <TableCell>{account.fullname}</TableCell>
                  <TableCell>
                    {account.image ? (
                      <img
                        src={account.image}
                        alt={account.username}
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                          cursor: "pointer", // Con trỏ khi hover
                        }}
                        onClick={() => handleImageClick(account.image)} // Gọi hàm khi click
                      />
                    ) : (
                      "Không có hình ảnh"
                    )}
                  </TableCell>

                  {/* Dialog hiển thị ảnh phóng to */}
                  {openImageDialog && (
                    <Dialog
                      open={openImageDialog}
                      onClose={handleCloseImageDialog}
                      maxWidth="lg"
                      fullWidth
                    >
                      <DialogContent
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {selectedImage && (
                          <img
                            src={selectedImage}
                            alt="Phóng to"
                            style={{
                              maxWidth: "100%",
                              maxHeight: "80vh",
                              objectFit: "contain",
                            }}
                          />
                        )}
                      </DialogContent>
                    </Dialog>
                  )}

                  <TableCell>{account.email}</TableCell>
                  <TableCell>{account.phone}</TableCell>
                  <TableCell>
                    {/* Hiển thị trạng thái hoạt động */}
                    {account.noPassword ? (
                      <span
                        style={{
                          color: "red",
                          fontWeight: "bold",
                          backgroundColor: "#ffcccc",
                          padding: "4px 8px",
                          borderRadius: "8px",
                          display: "inline-block",
                        }}
                      >
                        Không hoạt động
                      </span>
                    ) : (
                      <span
                        style={{
                          color: "green",
                          fontWeight: "bold",
                          backgroundColor: "#ccffcc",
                          padding: "4px 8px",
                          borderRadius: "8px",
                          display: "inline-block",
                        }}
                      >
                        Đang hoạt động
                      </span>
                    )}
                  </TableCell>

                  <TableCell>
                    {hasPermission("UPDATE_USER") && (
                      <Button
                        variant="outlined"
                        size="small"
                        color="primary"
                        sx={{ mr: 1 }}
                        onClick={() => handleOpenDialog("edit", account)}
                      >
                        <Tooltip
                          title={
                            <span style={{ fontSize: "1.25rem" }}>
                              Sửa thông tin khách hàng
                            </span>
                          }
                          placement="top"
                        >
                          <EditIcon />
                        </Tooltip>
                      </Button>
                    )}
                    {hasPermission("DELETE_USER") && (
                      <Button
                        variant="outlined"
                        size="small"
                        color={account.noPassword ? "error" : "primary"}
                        onClick={() =>
                          account.noPassword
                            ? handleRestoreAccount(account.userId)
                            : handleDeleteAccount(account.userId)
                        }
                        sx={{ mr: 1 }}
                      >
                        <Tooltip
                          title={
                            <span style={{ fontSize: "1.25rem" }}>
                              {account.noPassword ? "Mở khóa" : "Khóa"}
                            </span>
                          }
                          placement="top"
                        >
                          {account.noPassword ? <LockIcon /> : <LockOpenIcon />}
                        </Tooltip>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredAccounts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            display: "flex",
            justifyContent: "center",
            fontSize: "1.2rem",
            padding: "16px",
            color: "#333", // Đổi màu chữ thành màu tối hơn
            backgroundColor: "#f9f9f9", // Thêm màu nền nhạt
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Thêm shadow để làm nổi bật
            borderRadius: "8px", // Thêm bo góc
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
              {
                fontSize: "1.2rem",
              },
            "& .MuiTablePagination-actions > button": {
              fontSize: "1.2rem",
              margin: "0 8px", // Thêm khoảng cách giữa các nút
              backgroundColor: "#1976d2", // Màu nền của các nút
              color: "#fff", // Màu chữ của các nút
              borderRadius: "50%", // Nút bấm hình tròn
              padding: "8px", // Tăng kích thước nút
              transition: "background-color 0.3s", // Hiệu ứng hover
              "&:hover": {
                backgroundColor: "#1565c0", // Đổi màu khi hover
              },
            },
          }}
        />
      </TableContainer>

      {/* Dialog thêm tài khoản  */}
      <Dialog
        open={openDialog && dialogMode === "add"}
        onClose={handleCloseDialog}
        fullWidth
      >
        <DialogTitle sx={{ fontSize: "1.7rem" }}>Thêm tài khoản</DialogTitle>

        <Divider />

        <DialogContent>
          <label
            style={{
              fontWeight: "bold",
              fontSize: "13px",
              display: "inline-flex", // Hiển thị nội dung theo chiều ngang
              alignItems: "center", // Canh giữa các phần tử theo trục dọc
            }}
          >
            Tên khách hàng
            <span
              style={{
                color: "red",
                marginLeft: "4px",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              *
            </span>
          </label>

          <TextField
            autoFocus
            margin="dense"
            name="username"
            type="text"
            fullWidth
            variant="outlined"
            value={currentAccount.username}
            onChange={handleInputChange}
            sx={{
              "& .MuiInputBase-input": {
                fontSize: "1.5rem", // Tăng kích thước chữ
              },
            }}
          />
          <label
            style={{
              fontWeight: "bold",
              fontSize: "13px",
              display: "inline-flex", // Hiển thị nội dung theo chiều ngang
              alignItems: "center", // Canh giữa các phần tử theo trục dọc
            }}
          >
            Mật khẩu
            <span
              style={{
                color: "red",
                marginLeft: "4px",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              *
            </span>
          </label>
          <TextField
            margin="dense"
            name="password"
            type={showPassword ? "text" : "password"} // Hiển thị hoặc ẩn mật khẩu
            fullWidth
            variant="outlined"
            value={currentAccount.password}
            onChange={handleInputChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)} // Đảo trạng thái hiển thị
                    onMouseDown={(e) => e.preventDefault()} // Ngăn mặc định khi nhấn nút chuột
                    edge="end"
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
              style: {
                fontSize: "1.5rem", // Tăng kích thước chữ
              },
            }}
          />
          <label
            style={{
              fontWeight: "bold",
              fontSize: "13px",
              display: "inline-flex", // Hiển thị nội dung theo chiều ngang
              alignItems: "center", // Canh giữa các phần tử theo trục dọc
            }}
          >
            Email
            <span
              style={{
                color: "red",
                marginLeft: "4px",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              *
            </span>
          </label>
          <TextField
            margin="dense"
            name="email"
            type="email"
            fullWidth
            variant="outlined"
            value={currentAccount.email}
            onChange={handleInputChange}
            sx={{
              "& .MuiInputBase-input": {
                fontSize: "1.5rem", // Tăng kích thước chữ
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{
              fontSize: "1.3rem",
              fontWeight: "bold",
              color: "red",
              borderColor: "red",
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleAddAccount}
            variant="outlined"
            color="primary"
            sx={{ fontSize: "1.3rem", fontWeight: "bold" }}
          >
            Thêm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog cập nhật tài khoản */}
      <Dialog
        open={openDialog && dialogMode === "edit"}
        onClose={handleCloseDialog}
        fullWidth
      >
        <DialogTitle sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>
          Cập nhật tài khoản
        </DialogTitle>

        <Divider />

        <DialogContent>
          <Box
            component="form"
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr", // Chia layout thành 2 cột
              gap: 2, // Khoảng cách giữa các cột
              alignItems: "center",
            }}
          >
            <Box>
              <label style={{ fontWeight: "bold", fontSize: "1.3rem" }}>
                Họ và tên:
              </label>
              <TextField
                name="fullname"
                type="text"
                fullWidth
                variant="outlined"
                value={currentAccount.fullname || ""}
                onChange={handleInputChange}
                disabled
                sx={{
                  mt: 1,
                  "& .MuiInputBase-input": {
                    fontSize: "1.2rem", // Tăng kích thước chữ
                  },
                }}
              />
            </Box>

            <Box>
              <label style={{ fontWeight: "bold", fontSize: "1.3rem" }}>
                Giới tính:
              </label>
              <TextField
                name="gender"
                type="text"
                fullWidth
                variant="outlined"
                value={currentAccount.gender || ""}
                onChange={handleInputChange}
                disabled
                sx={{
                  mt: 1,
                  "& .MuiInputBase-input": {
                    fontSize: "1.2rem", // Tăng kích thước chữ
                  },
                }}
              />
            </Box>

            <Box>
              <label style={{ fontWeight: "bold", fontSize: "1.3rem" }}>
                Quê quán:
              </label>
              <TextField
                name="residence"
                type="text"
                fullWidth
                variant="outlined"
                value={currentAccount.residence || ""}
                onChange={handleInputChange}
                disabled
                sx={{
                  mt: 1,
                  "& .MuiInputBase-input": {
                    fontSize: "1.2rem", // Tăng kích thước chữ
                  },
                }}
              />
            </Box>

            <Box>
              <label style={{ fontWeight: "bold", fontSize: "1.3rem" }}>
                Email:
              </label>
              <TextField
                name="email"
                type="email"
                fullWidth
                variant="outlined"
                value={currentAccount.email || ""}
                onChange={handleInputChange}
                sx={{
                  mt: 1,
                  "& .MuiInputBase-input": {
                    fontSize: "1.2rem", // Tăng kích thước chữ
                  },
                }}
              />
            </Box>

            <Box>
              <label style={{ fontWeight: "bold", fontSize: "1.3rem" }}>
                Số điện thoại:
              </label>
              <TextField
                name="phone"
                type="text"
                fullWidth
                variant="outlined"
                value={currentAccount.phone || ""}
                onChange={handleInputChange}
                sx={{
                  mt: 1,
                  "& .MuiInputBase-input": {
                    fontSize: "1.2rem", // Tăng kích thước chữ
                  },
                }}
              />
            </Box>

            <Box>
              <label style={{ fontWeight: "bold", fontSize: "1.3rem" }}>
                Số CCCD:
              </label>
              <TextField
                name="citizenIdentity"
                type="text"
                fullWidth
                variant="outlined"
                value={currentAccount.citizenIdentity || ""}
                onChange={handleInputChange}
                disabled
                sx={{
                  mt: 1,
                  "& .MuiInputBase-input": {
                    fontSize: "1.2rem", // Tăng kích thước chữ
                  },
                }}
              />
            </Box>

            <Box>
              <label style={{ fontWeight: "bold", fontSize: "1.3rem" }}>
                Ngày tháng năm sinh:
              </label>
              <TextField
                name="dob"
                type="date"
                fullWidth
                variant="outlined"
                value={currentAccount.dob || ""}
                onChange={handleInputChange}
                disabled
                sx={{
                  mt: 1,
                  "& .MuiInputBase-input": {
                    fontSize: "1.2rem", // Tăng kích thước chữ
                  },
                }}
              />
            </Box>

            {/* Hình ảnh */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                border: "2px dashed #ccc",
                borderRadius: "8px",
                padding: "1em",
                marginBottom: "1em",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                textAlign: "center",
              }}
              onClick={() => document.getElementById("file-upload").click()}
            >
              {currentAccount.image ? (
                <Box
                  component="img"
                  src={currentAccount.image}
                  sx={{
                    width: "100%",
                    height: "110px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
              ) : (
                <>
                  <AddAPhotoIcon sx={{ fontSize: 48, color: "#aaa", mb: 1 }} />
                  <Typography variant="body2" sx={{ color: "#aaa" }}>
                    Nhấn để chọn ảnh
                  </Typography>
                </>
              )}

              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                style={{ display: "none" }}
                id="file-upload"
              />
              {currentAccount.image && (
                <Button
                  variant="contained"
                  sx={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    backgroundColor: "#dc3545",
                    color: "#fff",
                    "&:hover": {
                      backgroundColor: "#c82333",
                    },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                >
                  Xóa ảnh
                </Button>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{
              fontSize: "1.3rem",
              fontWeight: "bold",
              color: "red",
              borderColor: "red",
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleEditAccount}
            variant="outlined"
            color="primary"
            sx={{ fontSize: "1.3rem", fontWeight: "bold" }}
          >
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AccountManager;
