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
  Tooltip,
  TablePagination,
  Autocomplete,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import AddIcon from "@mui/icons-material/Add";
import serviceApi from "../../api/serviceApi";
import { Typography } from "antd";
import SnackBarNotification from "./SnackBarNotification";
import Swal from "sweetalert2";
import useGetPermission from "hooks/useGetPermission";

const ServiceManager = () => {
  const [services, setServices] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentService, setCurrentService] = useState({
    serviceId: null,
    name: "",
    type: "",
    price: 0,
    image: "",
    description: "",
    status: true,
  });
  const [dialogMode, setDialogMode] = useState("add"); // 'add', 'edit'
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // Trạng thái tìm kiếm
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [errors, setErrors] = useState({});
  const [serviceTypes, setServiceTypes] = useState([]); // Danh sách loại dịch vụ

  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [snackType, setSnackType] = useState("success");
    const { hasPermission } = useGetPermission();

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

  const handleOpenDialog = (mode, event) => {
    setDialogMode(mode);
    setCurrentService(
      event || {
        serviceId: null,
        name: "",
        type: "",
        price: 0,
        image: "",
        description: "",
        status: true,
      }
    );
    setOpenDialog(true);
  };
  

  // Tìm và nạp Danh mục khi thành phần gắn liên kết
  useEffect(() => {
    fetchDichVuWithPaginate(page + 1);
    fetchDichVu(page + 1);
  }, [page, rowsPerPage]);

  // Hàm đổ dữ liệu & phân trang
  const fetchDichVuWithPaginate = async (page) => {
    try {
      const res = await serviceApi.getPaginate(page, rowsPerPage);
      setServices(res.result?.content);
      setTotalElements(res.result?.totalElements);
      console.log("res.dt = ", res.result.content);
    } catch (error) {
      console.error("Không tìm nạp được dịch vụ: ", error);
    }
  };

  // Hàm đổ dữ liệu & phân trang
  const fetchDichVu= async (page) => {
    try {
      const res = await serviceApi.getPaginate(page, 100);
      const content = res.result?.content || [];
      setServices(content);
      // Trích xuất danh sách loại dịch vụ (type) và loại bỏ trùng lặp
      const types = [...new Set(content.map((service) => service.type))];
      setServiceTypes(types);
      setServices(res.result?.content);
      console.log("data dịch vụ: ", res);
    } catch (error) {
      console.error("Không tìm nạp được dịch vụ: ", error);
    }
  };

  const handleRemoveImage = () => {
    setCurrentService((prev) => ({ ...prev, image: "" }));
  };

  // Đóng dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Xử lý thay đổi input
  const handleInputChange = async (e) => {
    const { type, name, value, files } = e.target;

    // Xử lý ảnh
    if (name === "image" && files && files.length > 0) {
      const file = files[0];

      // Tạo URL tạm thời cho ảnh (preview)
      const imagePreviewUrl = URL.createObjectURL(file);

      // Cập nhật ảnh vào state để hiển thị prview
      setCurrentService({
        ...currentService,
        image: imagePreviewUrl,
      });

      try {
        // Tạo FormData để gửi file
        const formData = new FormData();
        formData.append('file', file);

        // Gửi yêu cầu lên API để tải ảnh lên
        const response = await fetch('https://62c6-2001-ee0-5722-4dc0-a8e7-eaeb-2e68-34e5.ngrok-free.app/obbm/upload/image', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: formData, // Đưa formData vào body
        });

        const data = await response.json();
        console.log('Response Data:', data);

        if(response.ok) {
          console.log("Upload thành công: ", data);

          // Lấy URL từ API Cloudinary
          const imageUrl = data.result; // Kết quả trả về là URL của ảnh đã được upload

          // Cập nhật URL ảnh trả về từ server vào currentService
          setCurrentService({
            ...currentService,
            image: imageUrl, // Lấy URL ảnh từ trường fileUrl của API
          })

          // Xóa lỗi nếu người dùng chọn ảnh
        setErrors((prevErrors) => ({
          ...prevErrors,
          image: undefined,
        }));

        } else {
          console.error("Lỗi tải ảnh:", data);
          setErrors((prevErrors) => ({
            ...prevErrors,
            image: 'Không thể tải ảnh lên',
          }));
        }

      } catch (error) {
        console.error('Lỗi tải ảnh:', error);
        setErrors((prevErrors) => ({
          ...prevErrors,
          image: 'Không thể tải ảnh lên',
        }));
      } 
    } else {
      // Xử lý các trường khác
      setCurrentService({
        ...currentService,
        [name]: type === "number" ? Number(value) : value,
      });

      // Xóa lỗi nếu người dùng nhập đúng
      if (value.trim() !== "") {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [name]: undefined,
        }));
      }
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!currentService.name || currentService.name.trim() === "") {
      newErrors.name = "Tên dịch vụ không được để trống.";
    }

    if (!currentService.type || currentService.type.trim() === "") {
      newErrors.type = "Loại dịch vụ không được để trống.";
    }

    if (!currentService.price || currentService.price <= 0) {
      newErrors.price = "Giá phải lớn hơn 0.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    // Kiểm tra lỗi trước khi lưu
    if (!validate()) {
      return;
    }

    if (dialogMode === "add") {
      delete currentService.serviceId;
      const res = await serviceApi.add(currentService);
      if (res.code === 1000) {
        const newService = res.result; // Lấy dịch vụ vừa thêm từ server
        setServices((prevServices) => [newService, ...prevServices]); // Thêm vào đầu danh sách
        showSuccess("Thêm dịch vụ thành công !");
      }
    } else if (dialogMode === "edit") {
      const { name, type, price, image, description, status } = currentService;
      const res = await serviceApi.update(currentService.serviceId, {
        name,
        type,
        price,
        image,
        description,
        status,
      });
      if (res.code === 1000) {
        // Cập nhật dịch vụ trong danh sách
        setServices((prevServices) =>
          prevServices.map((service) =>
            service.serviceId === currentService.serviceId ? { ...currentService } : service
          )
        );
        showSuccess("Cập nhật dịch vụ thành công !");
      }
    }
    handleCloseDialog();
  };

  // Xử lý click "Delete" để cập nhật trạng thái "Status" và ẩn dịch vụ
  const handleDeleteClick = async (serviceId) => {
    Swal.fire({
      title: "Bạn chắc chắn muốn xóa dịch vụ này?",
      text: "Dịch vụ sẽ không thể khôi phục lại!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await serviceApi.delete(serviceId);
          if (res.code === 1000) {
            // Nếu xóa thành công, cập nhật danh sách dịch vụ
            setServices((prevServices) =>
              prevServices.filter((service) => service.serviceId !== serviceId)
            );
            Swal.fire("Đã xóa!", "Dịch vụ đã được xóa thành công.", "success");
          } else {
            Swal.fire("Lỗi!", "Xóa dịch vụ thất bại. Vui lòng thử lại.", "error");
          }
        } catch (error) {
          console.error("Lỗi khi xóa dịch vụ: ", error);
          Swal.fire("Lỗi!", "Đã xảy ra lỗi trong quá trình xóa.", "error");
        }
      }
    });
  };
  

  const handleConfirmDelete = async () => {
    const res = await serviceApi.delete(serviceToDelete);
    if (res.code === 1000) {
      fetchDichVuWithPaginate(page);
      showSuccess("Dịch vụ đã được xóa thành công !");
    }
    setOpenConfirmDialog(false);
    setServiceToDelete(null);
  };

  const handleCancelDelete = () => {
    setOpenConfirmDialog(false);
    setServiceToDelete(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredServices = services
    .filter((event) => !event.Status) // Loại bỏ các sự kiện có `Status` là true
    .filter((event) => {
      if (searchTerm === "") return true; // Nếu không có từ khóa tìm kiếm, hiển thị tất cả
      if (!isNaN(searchTerm)) {
        // Nếu nhập số, lọc theo serviceId
        return String(services.serviceId).includes(searchTerm);
      }
      // Nếu nhập ký tự, lọc theo các trường khác (ví dụ: name)
      return event.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

  return (
    <div>
      <SnackBarNotification
        open={snackBarOpen}
        handleClose={handleCloseSnackBar}
        message={snackBarMessage}
        snackType={snackType}
      />
      <Box>
        {/* Ô tìm kiếm */}
        <div className="admin-toolbar">
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

          {/* Nút Add New Service */}
       {hasPermission('CREATE_SERVICES') && <Button
            sx={{
              fontSize: "10px",
              display: "flex",
              alignItems: "center",
              padding: "6px 12px",
              lineHeight: "1.5",
            }}
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
            Thêm dịch vụ
          </Button> }  
        </div>
      </Box>

      <TableContainer component={Paper} className="table-container">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>STT</TableCell>
              <TableCell>Tên dịch vụ</TableCell>
              <TableCell>Loại dịch vụ</TableCell>
              <TableCell>Giá</TableCell>
              <TableCell>Hình ảnh</TableCell>
              <TableCell>Mô tả</TableCell>
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
          <TableBody>
            {filteredServices
              .filter((event) => !event.Status)
              .map((service, index) => (
                <TableRow key={service.serviceId}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{service.name}</TableCell>
                  <TableCell>{service.type}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                      currencyDisplay: "code",
                    }).format(service.price)}
                  </TableCell>
                  <TableCell>
                    <img
                      src={`${service.image}`}
                      alt={service.name}
                      width="70"
                    />
                  </TableCell>
                  <TableCell>{service.description}</TableCell>
                  <TableCell
                    sx={{
                      position: "sticky",
                      right: 0,
                      backgroundColor: "white",
                      zIndex: 1,
                    }}
                  >
                   {hasPermission('UPDATE_SERVICES') && <Button
                      size="large"
                      color="primary"
                      variant="outlined"
                      onClick={() => handleOpenDialog("edit", service)}
                      style={{ marginRight: "10px" }}
                    >
                      <Tooltip
                        title={<span style={{ fontSize: "1.25rem" }}>Sửa</span>}
                        placement="top"
                      >
                        <EditIcon />
                      </Tooltip>
                    </Button>} 
                  {hasPermission('DELETE_SERVICES') && <Button
                      size="large"
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteClick(service.serviceId)}
                    >
                      <Tooltip
                        title={<span style={{ fontSize: "1.25rem" }}>Xóa</span>}
                        placement="top"
                      >
                        <DeleteIcon />
                      </Tooltip>
                    </Button> }  
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalElements}
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

      {/* Dialog thêm sửa */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontSize: "1.7rem",
            fontWeight: "bold",
            color: "#333",
          }}
        >
          {dialogMode === "add" ? "Thêm dịch vụ" : "Chỉnh sửa dịch vụ"}
        </DialogTitle>
        <DialogContent className="custom-input" dividers>
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <Typography
              style={{
                color: "red",
                fontSize: "1.9rem",
                marginRight: "5px",
              }}
            >
              *
            </Typography>
            <Typography>Tên dịch vụ</Typography>
          </div>
          <TextField
            sx={{ marginBottom: "20px" }}
            autoFocus
            margin="dense"
            name="name"
            placeholder="Tên dịch vụ"
            type="text"
            fullWidth
            variant="outlined"
            value={currentService.name || ""}
            onChange={handleInputChange}
            error={!!errors.name}
            helperText={errors.name}
            size="small"
            FormHelperTextProps={{
              style: {
                fontSize: "1.2rem",
                color: "red",
              },
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <Typography
              style={{
                color: "red",
                fontSize: "1.9rem",
                marginRight: "5px",
              }}
            >
              *
            </Typography>
            <Typography>Loại dịch vụ</Typography>
          </div>
          <Autocomplete
        options={serviceTypes} // Mảng loại dịch vụ
        getOptionLabel={(option) => option} // Hiển thị trực tiếp giá trị `type`
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            size="small"
            placeholder="Chọn hoặc nhập loại dịch vụ"
            fullWidth
          />
        )}
        onChange={(event, newValue) => {
          setCurrentService((prev) => ({ ...prev, type: newValue }));
        }}
      />
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <Typography
              style={{
                color: "red",
                fontSize: "1.9rem",
                marginRight: "5px",
              }}
            >
              *
            </Typography>
            <Typography>Giá</Typography>
          </div>
          <TextField
            sx={{ marginBottom: "20px" }}
            margin="dense"
            name="price"
            placeholder="Giá"
            type="text" 
            fullWidth
            variant="outlined"
            value={new Intl.NumberFormat("vi-VN").format(currentService.price || 0)} // Định dạng giá trị hiển thị
            onChange={(e) => {
              const inputValue = e.target.value.replace(/\D/g, ""); // Loại bỏ các ký tự không phải số
              const numericValue = parseInt(inputValue, 10) || 0; // Chuyển đổi thành số
              setCurrentService((prev) => ({
                ...prev,
                price: numericValue, // Cập nhật giá trị số nguyên
              }));
              // Xóa lỗi nếu người dùng nhập hợp lệ
              if (numericValue > 0) {
                setErrors((prevErrors) => ({
                  ...prevErrors,
                  price: undefined,
                }));
              }
            }}
            error={!!errors.price}
            helperText={errors.price}
            size="small"
            FormHelperTextProps={{
              style: {
                fontSize: "1.2rem",
                color: "red",
              },
            }}
          />


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
            {currentService.image ? (
              <Box
                component="img"
                src={currentService.image} // Giá trị ảnh từ state
                alt="Dịch vụ"
                sx={{
                  width: "100%",
                  height: "250px",
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
              onChange={handleInputChange}
              style={{ display: "none" }}
              id="file-upload"
            />
            {currentService.image && (
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

          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <Typography
              style={{
                color: "red",
                fontSize: "1.9rem",
                marginRight: "5px",
              }}
            >
              *
            </Typography>
            <Typography>Mô tả</Typography>
          </div>
          <TextField
            margin="dense"
            name="description"
            placeholder="Mô tả"
            type="text"
            fullWidth
            multiline
            minRows={5}
            maxRows={10}
            variant="outlined"
            value={currentService.description || ""}
            onChange={handleInputChange}
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
            onClick={handleSave}
            variant="outlined"
            color="primary"
            sx={{ fontSize: "1.3rem", fontWeight: "bold" }}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={openConfirmDialog}
        onClose={handleCancelDelete}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontSize: "1.6rem",
            color: "#d32f2f",
            display: "flex",
            alignItems: "center",
          }}
        >
          <ErrorOutlineIcon sx={{ color: "error.main", mr: 1 }} />
          Xác nhận xóa dịch vụ
        </DialogTitle>
        <DialogContent>
          <p>Bạn chắc chắn muốn xóa dịch vụ này ?</p>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancelDelete}
            color="primary"
            variant="outlined"
            sx={{ fontSize: "1.3rem" }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="outlined"
            sx={{ fontSize: "1.3rem" }}
          >
            Đồng ý
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ServiceManager;
