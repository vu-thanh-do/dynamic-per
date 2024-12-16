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
  TablePagination,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { toast, Toaster } from "react-hot-toast";
import eventsApi from "../../api/eventsApi";
import { message, Typography } from "antd";
import EventDetailPopup from "./EventDetailPopup";
import serviceApi from "api/serviceApi";
import SnackBarNotification from "./SnackBarNotification";
import useGetPermission from "hooks/useGetPermission";
const EventManager = () => {
  const [events, setEvents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
      const { hasPermission } = useGetPermission();
  
  const [currentEvent, setCurrentEvent] = useState({
    name: "",
    totalcost: 0,
    description: "",
    image: "",
    userId: "",
  });
  const [dialogMode, setDialogMode] = useState("add"); // 'add', 'edit'
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // Trạng thái tìm kiếm
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5); // Bạn có thể thay đổi số mục trên mỗi trang
  const [totalElements, setTotalElements] = useState(0);
  const [errors, setErrors] = useState({});
  const [userId, setUserId] = useState(null);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [detailPopupOpen, setDetailPopupOpen] = useState(false);
  const [allService, setAlllServices] = useState([]);

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

  const handleOpenServicePopup = (event) => {
    setSelectedEvent(event);
    setDetailPopupOpen(true);
  };

  const handleCloseDetailPopup = () => {
    setDetailPopupOpen(false);
    setSelectedEvent(null);
  };

  // Tìm và nạp Danh mục khi thành phần gắn liên kết
  useEffect(() => {
    fetchEventsWithPaginate(page + 1);
    fetchUserData();
    fetchServiceEvent();
  }, [page, rowsPerPage]);

  const fetchEventsWithPaginate = async (page) => {
    try {
      const res = await eventsApi.getPaginate(page, rowsPerPage);
      setEvents(res.result?.content);
      setTotalElements(res.result?.totalElements);
      console.log("res.dt = ", res.result.content);
    } catch (error) {
      console.error("Không tìm nạp được danh mục: ", error);
    }
  };

  // Hàm lấy danh sách service
  const fetchServiceEvent = async () => {
    try {
      const response = await serviceApi.getAll();
      console.log("Data serivce: ", response);
      if (response?.result?.content) {
        setAlllServices(response?.result?.content);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách dịch vụ:", error);
    }
  };

  // Fetch thông tin người dùng từ API
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Token không tìm thấy trong localStorage.");
      }

      const response = await fetch("https://62c6-2001-ee0-5722-4dc0-a8e7-eaeb-2e68-34e5.ngrok-free.app/obbm/users/myInfo", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Dữ liệu nè: ", data);

      // Lưu userId vào state
      setUserId(data?.result?.userId);
    } catch (error) {
      message.error("Không tải được dữ liệu.");
    }
  };

  // Mở dialog thêm/sửa sự kiện
  const handleOpenDialog = (mode, event) => {
    setDialogMode(mode);
    // khi event có giá trị ==> api cập nhật cần thuộc tính image, mà api lấy danh sách events ko có nên phải set thêm vào
    if (event) event.image = "";
    setCurrentEvent(
      event || {
        eventId: null,
        name: "",
        totalcost: 0,
        description: "",
        image: "",
      }
    );
    setOpenDialog(true);
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

      // Cập nhật ảnh vào state để hiển thị preview
      setCurrentEvent({
        ...currentEvent,
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
          setCurrentEvent({
            ...currentEvent,
            image: imageUrl,
          });
          // Xóa lỗi nếu người dùng chọn ảnh
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
      setCurrentEvent({
        ...currentEvent,
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

    if (!currentEvent.name || currentEvent.name.trim() === "") {
      newErrors.name = "Tên sự kiện không được bỏ trống.";
    }

    if (!currentEvent.description || currentEvent.description.trim() === "") {
      newErrors.description = "Mô tả không được bỏ trống.";
    }

    // if (!currentEvent.totalcost || currentEvent.totalcost <= 0) {
    //   newErrors.totalcost = "Tổng chi phí phải lớn hơn 0.";
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Lưu sự kiện mới hoặc chỉnh sửa sự kiện
  const handleSave = async () => {
    // Kiểm tra dữ liệu nhập vào có hợp lệ không
    if (!validate()) return;
  
    // Kiểm tra `userId` trước khi thực hiện hành động
    if (!userId) {
      console.error("userId chưa được khởi tạo:", userId);
      toast.error("Không thể lưu sự kiện. Vui lòng đăng nhập lại!");
      return;
    }
  
    try {
      // Kiểm tra dữ liệu sự kiện và lấy danh sách dịch vụ
      if (!currentEvent || !currentEvent.listEventServices) {
        toast.error("Không có dịch vụ nào trong sự kiện!");
        return;
      }
  
      // Tính tổng chi phí từ các dịch vụ của sự kiện
      const totalCost = currentEvent.listEventServices.reduce((total, eventService) => {
        // Lấy giá và số lượng dịch vụ
        const serviceCost = eventService.cost || 0; // Giá dịch vụ (có thể là 0 nếu không có)
        const quantity = eventService.quantity || 0; // Số lượng dịch vụ (có thể là 0 nếu không có)
  
        // Cộng dồn chi phí
        return total + (serviceCost * quantity);
      }, 0);
  
      console.log("Tổng chi phí của sự kiện:", totalCost); // Hiển thị tổng chi phí
  
      // Cập nhật lại totalcost trong payload sự kiện
      const eventPayload = {
        name: currentEvent.name,
        totalcost: totalCost, // Tổng chi phí tính được
        description: currentEvent.description,
        image: currentEvent.image,
        userId: userId, // Đảm bảo `userId` được gửi cho cả thêm và sửa
      };
  
      console.log("Payload gửi đi:", eventPayload);
  
      let res; // Kết quả phản hồi từ API
      if (dialogMode === "add") {
        // Nếu là thêm mới sự kiện
        res = await eventsApi.add(eventPayload);
  
        if (res.code === 1000) {
          fetchEventsWithPaginate(page + 1); // Load lại danh sách sự kiện
          showSuccess("Thêm sự kiện thành công!");
        } else {
          toast.error("Lỗi thêm sự kiện: " + res.message);
        }
      } else if (dialogMode === "edit") {
        // Nếu là sửa sự kiện
        const updatedPayload = { ...eventPayload }; // Payload cập nhật
        delete updatedPayload.userId; // Bỏ `userId` nếu backend không yêu cầu khi sửa
        res = await eventsApi.update(currentEvent.eventId, updatedPayload);
  
        if (res.code === 1000) {
          fetchEventsWithPaginate(page + 1); // Load lại danh sách sự kiện
          showSuccess("Sự kiện đã được cập nhật thành công!");
        } else {
          toast.error("Lỗi cập nhật sự kiện: " + res.message);
        }
      }
    } catch (error) {
      console.error("Lỗi khi lưu sự kiện:", error);
      toast.error("Đã xảy ra lỗi khi lưu sự kiện. Vui lòng thử lại!");
    } finally {
      handleCloseDialog(); // Đóng dialog sau khi thực hiện xong
    }
  };
  
  
  

  // Xử lý click "Delete" để cập nhật trạng thái "Status" và ẩn sự kiện
  const handleDeleteClick = (eventId) => {
    setEventToDelete(eventId);
    setOpenConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    const res = await eventsApi.delete(eventToDelete);
    if (res.code === 1000) {
      fetchEventsWithPaginate(page + 1);
      showSuccess("Sự kiện đã được xóa thành công !");
    }
    setOpenConfirmDialog(false);
    setEventToDelete(null);
  };

  const handleCancelDelete = () => {
    setOpenConfirmDialog(false);
    setEventToDelete(null);
  };

  const handleChangePage = (event, newPage) => {
    console.log("check page: ", newPage);
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset về trang đầu tiên khi thay đổi số mục trên mỗi trang
  };

  const filteredEvents = events
    .filter((event) => !event.Status) // Loại bỏ các sự kiện có `Status` là true
    .filter((event) => {
      if (searchTerm === "") return true; // Nếu không có từ khóa tìm kiếm, hiển thị tất cả
      if (!isNaN(searchTerm)) {
        // Nếu nhập số, lọc theo eventId
        return String(event.eventId).includes(searchTerm);
      }
      // Nếu nhập ký tự, lọc theo các trường khác (ví dụ: name)
      return event.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

  const handleRemoveImage = () => {
    setCurrentEvent((prev) => ({ ...prev, image: "" }));
  };

  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
      <Box>
      <SnackBarNotification
      open={snackBarOpen}
      handleClose={handleCloseSnackBar}
      message={snackBarMessage}
      snackType={snackType}
    />
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

        {hasPermission('CREATE_EVENT') && <Button
            sx={{ fontSize: "10px" }}
            variant="contained"
            color="primary"
            onClick={() => handleOpenDialog("add", null)}
          >
            <AddIcon
              sx={{
                marginRight: "5px",
                fontSize: "16px",
                verticalAlign: "middle",
              }}
            />
            Thêm sự kiện
          </Button> }  
        </div>
      </Box>
      <TableContainer component={Paper} className="table-container">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>STT</TableCell>
              <TableCell>Tên sự kiện</TableCell>
              <TableCell>Mô tả</TableCell>
              {/* <TableCell>Tổng chi phí</TableCell> */}
              <TableCell>Hình ảnh</TableCell>
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
            {filteredEvents
              .filter((event) => !event.Status) // Chỉ hiển thị sự kiện không bị xóa tạm thời
              .map((event, index) => (
                <TableRow key={event.eventId}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{event.name}</TableCell>
                  <TableCell>{event.description}</TableCell>
                  {/* <TableCell>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                      currencyDisplay: "code",
                    }).format(event.totalcost)}
                  </TableCell> */}
                  <TableCell>
                    <img src={`${event.image}`} alt={event.name} width="70" />
                  </TableCell>
                  <TableCell
                    sx={{
                      position: "sticky",
                      right: 0,
                      backgroundColor: "white",
                      zIndex: 1,
                    }}
                  >
                  {hasPermission('UPDATE_EVENT') && <Button
                      variant="outlined"
                      onClick={() => handleOpenDialog("edit", event)}
                      sx={{ mr: 1 }}
                      color="primary"
                    >
                      <Tooltip
                        title={
                          <span style={{ fontSize: "1.25rem" }}>
                            Sửa sự kiện
                          </span>
                        }
                        placement="top"
                      >
                        <EditIcon />
                      </Tooltip>
                    </Button>}  
                  {hasPermission('DELETE_EVENT') &&  <Tooltip
                      title={
                        <span style={{ fontSize: "1.25rem" }}>Xóa sự kiện</span>
                      }
                      placement="top"
                    >
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleDeleteClick(event.eventId)}
                      >
                        <DeleteIcon />
                      </Button>
                    </Tooltip>} 

                  {hasPermission('READ_EVENT') &&<Button
                      variant="outlined"
                      onClick={() => handleOpenServicePopup(event)}
                      color="info"
                      style={{ marginLeft: "8px" }}
                    >
                      <Tooltip
                        title={
                          <span style={{ fontSize: "1.25rem" }}>
                            Xem chi tiết
                          </span>
                        }
                        placement="top"
                      >
                        <ErrorOutlineIcon />
                      </Tooltip>
                    </Button>}  
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

      {/* Dialog thêm/sửa sự kiện */}
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
          {dialogMode === "add" ? "Thêm sự kiện" : "Sửa sự kiện"}
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
            <Typography>Tên sự kiện</Typography>
          </div>
          <TextField
            size="small"
            autoFocus
            margin="dense"
            name="name"
            placeholder="Tên sự kiện"
            type="text"
            fullWidth
            variant="outlined"
            value={currentEvent.name || ""}
            onChange={handleInputChange}
            error={!!errors.name}
            helperText={errors.name}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: "3px",
            }}
          >
            <Typography>Mô tả</Typography>
          </div>
          <TextField
            size="small"
            margin="dense"
            name="description"
            placeholder="Mô tả"
            type="text"
            minRows={5}
            maxRows={10}
            fullWidth
            multiline
            variant="outlined"
            value={currentEvent.description || ""}
            onChange={handleInputChange}
            error={!!errors.description}
            helperText={errors.description}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            {/* <Typography
              style={{
                color: "red",
                fontSize: "1.9rem",
                marginRight: "5px",
              }}
            >
              *
            </Typography>
            <Typography>Tổng chi phí</Typography> */}
          </div>

          {/* <TextField
            size="small"
            margin="dense"
            name="totalcost"
            placeholder="Tổng chi phí"
            type="number"
            fullWidth
            variant="outlined"
            value={currentEvent.totalcost || 0}
            onChange={handleInputChange}
            error={!!errors.totalcost}
            helperText={errors.totalcost}
          /> */}
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
            {currentEvent.image ? (
              <Box
                component="img"
                src={currentEvent.image}
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
            {currentEvent.image && (
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
      <Dialog open={openConfirmDialog} onClose={handleCancelDelete}>
        <DialogTitle
          sx={{
            fontSize: "1.6rem",
            color: "#d32f2f",
            display: "flex",
            alignItems: "center",
          }}
        >
          <ErrorOutlineIcon sx={{ color: "error.main", mr: 1 }} />
          Xác nhận xóa
        </DialogTitle>
        <DialogContent>
          <p>Bạn có chắc chắn muốn xóa sự kiện này ?</p>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancelDelete}
            color="primary"
            sx={{ fontSize: "1.3rem" }}
          >
            Đóng
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="secondary"
            sx={{ fontSize: "1.3rem" }}
          >
            Đồng ý
          </Button>
        </DialogActions>
      </Dialog>
      <EventDetailPopup
        open={detailPopupOpen}
        handleClose={handleCloseDetailPopup}
        event={selectedEvent}
        allService={allService}
      />
    </div>
  );
};

export default EventManager;
