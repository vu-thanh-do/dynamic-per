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
  MenuItem,
  Select,
  FormControl,
  Box,
  Tooltip,
  TablePagination,
  Grid,
} from "@mui/material";

import dishApi from "../../api/dishApi";
import danhMucApi from "../../api/danhMucApi";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import toast from "react-hot-toast";
import DishDetailPopup from "./DishDetailPopup";
import { Typography } from "antd";
import ingredientApi from "api/ingredientApi";
import SnackBarNotification from "./SnackBarNotification";
import Swal from "sweetalert2";
import useGetPermission from "hooks/useGetPermission";

const DishManager = () => {
  const [categories, setCategories] = useState([]); // State cho danh mục
  const [dishes, setDishes] = useState([]); // State cho danh sách món ăn
  const [open, setOpen] = useState(false); // State để điều khiển Dialog
  const [editMode, setEditMode] = useState(false); // State cho chế độ sửa món ăn
  const { hasPermission } = useGetPermission();

  const [dishData, setDishData] = useState({
    name: "",
    price: "",
    image: "",
    description: "",
    categoryId: "",
    existing: "Còn món ăn",
  });
  const [dishId, setDishId] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dishToDelete, setDishToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5); // Bạn có thể thay đổi số mục trên mỗi trang
  const [totalElements, setTotalElements] = useState(0);
  const [errors, setErrors] = useState({
    name: "",
    price: "",
  });

  const [detailPopupOpen, setDetailPopupOpen] = useState(false); // State mở/đóng popup
  const [selectedDish, setSelectedDish] = useState(null); // Lưu món ăn được chọn
  const [allIngredients, setAllIngredients] = useState([]);

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

  const handleViewDetails = (dish) => {
    setSelectedDish(dish); // Gán món ăn được chọn
    setDetailPopupOpen(true); // Mở popup
  };

  const handleCloseDetailPopup = () => {
    setDetailPopupOpen(false); // Đóng popup
    setSelectedDish(null); // Reset món ăn
  };

  const validateForm = () => {
    let tempErrors = { name: "", price: "", categoryId: "" };
    let isValid = true;

    if (!dishData.name.trim()) {
      tempErrors.name = "Tên món ăn không được để trống";
      isValid = false;
    }

    if (
      !dishData.price ||
      isNaN(dishData.price) ||
      Number(dishData.price) <= 0
    ) {
      tempErrors.price = "Giá món ăn phải là số và lớn hơn 0";
      isValid = false;
    }

    if (!dishData.categoryId) {
      tempErrors.categoryId = "Vui lòng chọn danh mục";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  // Hàm tìm kiếm
  const filteredDishes = dishes.filter((dish) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      dish.name.toLowerCase().includes(searchTerm) ||
      dish.price.toString().includes(searchTermLower) ||
      dish.description.toLowerCase().includes(searchTermLower) ||
      dish.existing.toLowerCase().includes(searchTermLower) ||
      (dish.categoryId && dish.categoryId.toString().includes(searchTermLower))
    );
  });

  // Hàm để tải toàn bộ danh mục
  const fetchAllCategories = async () => {
    try {
      const response = await danhMucApi.getAll();
      setCategories(response.result.content || []);
      console.log("Toàn bộ danh mục:", response.result.content);
    } catch (error) {
      console.error("Không tải được danh mục: ", error);
    }
  };

  // Nạp danh sách danh mục một lần khi component được mount
  useEffect(() => {
    fetchAllCategories();
    fetchIngredients();
  }, []);

  // Hàm để nạp món ăn theo trang
  const fetchDishesWithPaginate = async (page) => {
    try {
      const res = await dishApi.getPaginate(page, rowsPerPage);
      setDishes(res.result.content || []);
      setTotalElements(res.result?.totalElements);
      console.log("Món ăn:", res.result.content);
    } catch (error) {
      console.error("Không tìm nạp được món ăn: ", error);
    }
  };

  // Nạp danh sách danh mục và món ăn khi component được mount
  useEffect(() => {
    fetchDishesWithPaginate(page + 1);
  }, [page, rowsPerPage]);

  // Hàm lấy danh sách nguyên liệu
  const fetchIngredients = async () => {
    try {
      const response = await ingredientApi.getAll();
      if (response?.result?.content) {
        setAllIngredients(response.result.content);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách nguyên liệu:", error);
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false); // Tắt chế độ sửa khi đóng dialog
    setDishData({
      name: "",
      price: "",
      image: "",
      description: "",
      existing: "",
      categoryId: "", // Reset lại id danh mục
    });
    setDishId(null); // Clear dish id sau khi sửa hoặc thêm
  };

  const handleChange = async (e) => {
    const { type, name, files, value } = e.target;

    // Xử lý ảnh
    if (name === "image" && files && files.length > 0) {
      const file = files[0];

      // Tạo URL tạm thời cho ảnh (preview)
      const imagePreviewUrl = URL.createObjectURL(file);

      // Cập nhật ảnh vào state để hiển thị preview
      setDishData({
        ...dishData,
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
          setDishData({
            ...dishData,
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
      setDishData({
        ...dishData,
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

    // Xóa lỗi khi người dùng nhập dữ liệu hợp lệ
    setErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };

      if (name === "name" && value.trim()) {
        updatedErrors.name = "";
      }

      if (name === "price" && value && Number(value) > 0) {
        updatedErrors.price = "";
      }

      if (name === "categoryId" && value) {
        updatedErrors.categoryId = "";
      }

      return updatedErrors;
    });
  };

  const handleAddDish = async () => {
    try {
      if (!dishData.name || !dishData.price || !dishData.categoryId) {
        toast.error("Vui lòng điền đầy đủ thông tin món ăn!");
        return;
      }

      const response = await dishApi.add(dishData);

      showSuccess("Món ăn đã được thêm thành công!");

      console.log("Món ăn mới thêm:", response.result);

      // Directly update the dish list with the new dish at the top
      setDishes((prevDishes) => [response.result, ...prevDishes]);
    } catch (error) {
      console.error("Lỗi khi thêm món ăn: ", error);
      toast.error("Có lỗi xảy ra khi thêm món ăn!");
    }
  };

  // Xử lý fill thông tin món ăn để chỉnh sửa
  const handleEditDish = async (page, rowsPerPage, dishId) => {
    const dishToEdit = dishes.find((dish) => dish.dishId === dishId);

    if (dishToEdit) {
      setEditMode(true);
      setDishData({
        name: dishToEdit.name,
        price: dishToEdit.price,
        image: dishToEdit.image,
        description: dishToEdit.description,
        existing: dishToEdit.existing,
        categoryId: dishToEdit.categoryId,
      });
      setDishId(dishToEdit.dishId);
      setOpen(true);
    }
  };

  // Hàm chuyển đổi blob thành base64
  const convertBlobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      // Kiểm tra xem dữ liệu có phải là Blob không
      if (blob && blob instanceof Blob) {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result); // Trả về base64
        reader.onerror = reject;
        reader.readAsDataURL(blob); // Đọc blob dưới dạng base64
      } else {
        reject("Không phải Blob");
      }
    });
  };

  const handleUpdateDish = async () => {
    if (!setDishId) {
      toast.error("Không tìm thấy ID của món ăn!");
      return;
    }

    // Kiểm tra các trường cần thiết
    if (!dishData.name || !dishData.price || !dishData.categoryId) {
      toast.error("Vui lòng điền đầy đủ thông tin món ăn!");
      return;
    }

    try {
      // Kiểm tra nếu image là Blob và chuyển đổi nó thành base64
      let base64Image = dishData.image;
      if (dishData.image instanceof Blob) {
        base64Image = await convertBlobToBase64(dishData.image);
      }

      // Cập nhật dữ liệu mà không cần thêm lại id (vì id đã có trong URL)
      const updatedDishData = {
        name: dishData.name,
        price: dishData.price ? Number(dishData.price) : 0,
        description: dishData.description,
        existing: dishData.existing,
        categoryId: dishData.categoryId,
        image: base64Image, // Gán ảnh base64 vào data
      };

      console.log(updatedDishData); // Kiểm tra lại dữ liệu gửi đi

      // Gửi yêu cầu PUT để cập nhật món ăn
      const response = await dishApi.update(dishId, updatedDishData);

      showSuccess("Món ăn đã được cập nhật thành công!");

      // Cập nhật món ăn trực tiếp trong danh sách
      setDishes((prevDishes) =>
        prevDishes.map((dish) =>
          dish.dishId === dishId ? { ...dish, ...response.result } : dish
        )
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật món ăn:", error);
      if (error.response) {
        console.log("Response error data:", error.response.data);
      }
      toast.error("Có lỗi xảy ra khi cập nhật món ăn!");
    }

    // Đóng dialog sau khi cập nhật
    handleClose();
  };

  const handleSaveDish = async () => {
    if (!validateForm()) {
      return; // Nếu có lỗi, không tiếp tục thêm hoặc cập nhật
    }

    if (editMode && setDishId) {
      await handleUpdateDish(); // Gọi hàm cập nhật
    } else {
      await handleAddDish(); // Gọi hàm thêm mới
    }
    handleClose();
  };

  const handleDeleteDish = async (dishId) => {
    const dish = dishes.find((dish) => dish.dishId === dishId);

    // Hiển thị hộp thoại xác nhận xóa với SweetAlert2
    const confirm = await Swal.fire({
      title: "Bạn có chắc chắn muốn xóa món ăn này?",
      text: `Món ăn: "${dish?.name}" sẽ bị xóa vĩnh viễn!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (confirm.isConfirmed) {
      try {
        // Gửi yêu cầu xóa món ăn
        await dishApi.delete(dishId);

        // Hiển thị thông báo thành công
        Swal.fire("Đã xóa!", "Món ăn đã được xóa thành công.", "success");

        // Làm mới danh sách món ăn
        fetchDishesWithPaginate(page);
      } catch (error) {
        console.error("Lỗi khi xóa món ăn: ", error);
        Swal.fire("Thất bại", "Có lỗi xảy ra khi xóa món ăn.", "error");
      }
    }
  };

  const confirmDeleteDish = async () => {
    try {
      // Xóa món ăn khi người dùng xác nhận
      await dishApi.delete(dishToDelete.dishId);

      // Hiển thị thông báo thành công
      showSuccess("Món ăn đã được xóa thành công!");

      fetchDishesWithPaginate(page);
    } catch (error) {
      console.error("Lỗi khi xóa món ăn: ", error);
      toast.error("Có lỗi xảy ra khi xóa món ăn.");
    }

    // Đóng hộp thoại xác nhận
    setDeleteDialogOpen(false);
  };

  const handleChangePage = (event, newPage) => {
    console.log("check page: ", newPage);
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset về trang đầu tiên khi thay đổi số mục trên mỗi trang
  };

  const handleRemoveImage = () => {
    setDishData((prev) => ({ ...prev, image: "" }));
  };

  return (
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

        {/* Nút thêm món ăn */}
        {hasPermission("CREATE_DISH") && (
          <Button
            sx={{
              fontSize: "10px",
              display: "flex",
              alignItems: "center",
              padding: "6px 12px", // Adjust padding if needed
              lineHeight: "1.5", // Ensures proper vertical alignment
            }}
            variant="contained"
            color="primary"
            onClick={handleOpen}
          >
            <AddIcon
              sx={{
                marginRight: "5px",
                fontSize: "16px",
                verticalAlign: "middle",
              }}
            />
            Thêm Món Ăn
          </Button>
        )}
      </div>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle
          id="confirm-delete-title"
          sx={{
            fontSize: "1.6rem",
            color: "#d32f2f",
            display: "flex",
            alignItems: "center",
          }}
        >
          {" "}
          <ErrorOutlineIcon sx={{ color: "error.main", mr: 1 }} /> Xác nhận xóa
          món ăn
        </DialogTitle>
        <DialogContent>
          <p>Bạn có chắc chắn muốn xóa món ăn "{dishToDelete?.name}" không?</p>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            color="primary"
            sx={{ fontSize: "1.3rem" }}
          >
            Hủy
          </Button>
          <Button
            onClick={confirmDeleteDish}
            color="secondary"
            sx={{ fontSize: "1.3rem" }}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: "1.7rem" }}>
          {editMode ? "Cập nhật món ăn" : "Thêm món ăn mới"}
        </DialogTitle>

        <DialogContent className="custom-input" dividers>
          <Grid container spacing={2}>
            {/* Hàng 1: Tên món ăn | Danh mục */}
            <Grid item xs={6}>
              <Typography sx={{ fontWeight: "bold", fontSize: "1.2rem" }}>
                Tên món ăn
              </Typography>
              <TextField
                size="small"
                margin="dense"
                name="name"
                type="text"
                placeholder="Tên món ăn"
                fullWidth
                value={dishData.name}
                onChange={handleChange}
                error={Boolean(errors.name)}
                helperText={errors.name}
              />
            </Grid>
            <Grid item xs={6}>
              <Typography sx={{ fontWeight: "bold", fontSize: "1.2rem" }}>
                Danh mục
              </Typography>
              <FormControl
                fullWidth
                margin="dense"
                size="small"
                error={Boolean(errors.categoryId)}
              >
                <Select
                  labelId="category-label"
                  name="categoryId"
                  value={dishData.categoryId || ""}
                  onChange={handleChange}
                >
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <MenuItem
                        key={category.categoryId}
                        value={category.categoryId}
                      >
                        {category.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="">Không có danh mục</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>

            {/* Hàng 2: Giá | Trạng thái */}
            <Grid item xs={6}>
              <Typography sx={{ fontWeight: "bold", fontSize: "1.2rem" }}>
                Giá
              </Typography>
              <TextField
                size="small"
                margin="dense"
                name="price"
                type="text"
                placeholder="Giá"
                fullWidth
                value={new Intl.NumberFormat("vi-VN").format(
                  dishData.price || 0
                )}
                onChange={(e) => {
                  const rawValue = e.target.value.replace(/\D/g, "");
                  if (!isNaN(rawValue)) {
                    setDishData((prev) => ({
                      ...prev,
                      price: rawValue !== "" ? parseInt(rawValue, 10) : 0, // Cập nhật giá trị không định dạng
                    }));
                  }
                }}
                error={Boolean(errors.price)}
                helperText={errors.price}
              />
            </Grid>
            <Grid item xs={6}>
              <Typography sx={{ fontWeight: "bold", fontSize: "1.2rem" }}>
                Trạng thái
              </Typography>
              <FormControl fullWidth margin="dense">
                <Select
                  labelId="dish-existing-label"
                  name="existing"
                  value={dishData.existing}
                  onChange={handleChange}
                  size="small"
                >
                  <MenuItem value={"Còn món ăn"}>Còn món ăn</MenuItem>
                  <MenuItem value={"Hết món ăn"}>Hết món ăn</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Hàng 3: Hình ảnh */}
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: "bold", fontSize: "1.2rem" }}>
                Hình ảnh
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px dashed #ccc",
                  borderRadius: "8px",
                  padding: "1em",
                  cursor: "pointer",
                  textAlign: "center",
                }}
                onClick={() => document.getElementById("file-upload").click()}
              >
                {dishData.image ? (
                  <Box
                    component="img"
                    src={dishData.image}
                    alt="Món ăn"
                    sx={{
                      width: "100%",
                      height: "150px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                ) : (
                  <>
                    <AddAPhotoIcon
                      sx={{ fontSize: 48, color: "#aaa", mb: 1 }}
                    />
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
              </Box>
            </Grid>

            {/* Hàng 4: Mô tả */}
            <Grid item xs={12}>
              <Typography sx={{ fontWeight: "bold", fontSize: "1.2rem" }}>
                Mô tả
              </Typography>
              <TextField
                margin="dense"
                name="description"
                placeholder="Mô tả"
                type="text"
                fullWidth
                multiline
                minRows={3}
                maxRows={5}
                value={dishData.description}
                onChange={handleChange}
                error={Boolean(errors.description)}
                helperText={errors.description}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleClose}
            variant="outlined"
            sx={{
              fontSize: "1.3rem",
              fontWeight: "bold",
              borderColor: "#f44336",
              color: "#f44336",
              borderRadius: "8px",
              transition: "all 0.3s ease-in-out",
              marginRight: "8px",
              "&:hover": {
                backgroundColor: "#fdecea",
                borderColor: "#d32f2f",
              },
            }}
          >
            HỦY
          </Button>
          <Button
            onClick={handleSaveDish}
            variant="outlined"
            sx={{
              fontSize: "1.3rem",
              fontWeight: "bold",
              color: "primary",
              borderRadius: "8px",
              transition: "all 0.3s ease-in-out",
              marginRight: "8px",
              "&:hover": {
                background: "linear-gradient(45deg, #87CEFA 30%, #66BB6A 90%)",
              },
            }}
          >
            {editMode ? "Cập nhật" : "Thêm"}
          </Button>
        </DialogActions>
      </Dialog>

      <TableContainer component={Paper}>
        <Table className="table-container">
          <TableHead>
            <TableRow>
              <TableCell>STT</TableCell>
              <TableCell>Tên món ăn</TableCell>
              <TableCell>Giá</TableCell>
              <TableCell>Hình ảnh</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell>Trạng thái</TableCell>
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
            {filteredDishes.map((dish, index) => (
              <TableRow key={dish.dishId}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{dish.name}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(dish.price)}
                </TableCell>
                <TableCell>
                  <img src={`${dish.image}`} alt={dish.name} width="70" />
                </TableCell>
                <TableCell>{dish.description}</TableCell>
                <TableCell>{dish.existing}</TableCell>
                <TableCell>
                  {hasPermission("UPDATE_DISH") && (
                    <Button
                      variant="outlined"
                      onClick={() =>
                        handleEditDish(page + 1, rowsPerPage, dish.dishId)
                      }
                      color="primary"
                      style={{ marginRight: "8px" }}
                    >
                      <Tooltip
                        title={
                          <span style={{ fontSize: "1.25rem" }}>
                            Sửa món ăn
                          </span>
                        }
                        placement="top"
                      >
                        <EditIcon />
                      </Tooltip>
                    </Button>
                  )}
                  {hasPermission("READ_DISH") && (
                    <Button
                      variant="outlined"
                      onClick={() => handleViewDetails(dish)} // Gọi hàm mở popup
                      color="info"
                      style={{ marginRight: "8px" }}
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
                    </Button>
                  )}
                  {hasPermission("DELETE_DISH") && (
                    <Button
                      variant="outlined"
                      onClick={() => handleDeleteDish(dish.dishId)}
                      color="secondary"
                      sx={{
                        fontSize: "1.5rem",
                        color: "#d32f2f",
                        "&:hover": {
                          color: "#f44336",
                          transform: "scale(1.1)",
                        },
                      }}
                    >
                      <Tooltip
                        title={
                          <span style={{ fontSize: "1.25rem" }}>
                            Xóa món ăn
                          </span>
                        }
                        placement="top"
                      >
                        <DeleteIcon />
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
      <DishDetailPopup
        open={detailPopupOpen}
        handleClose={handleCloseDetailPopup}
        dish={selectedDish}
        allIngredients={allIngredients}
      />
    </Box>
  );
};

export default DishManager;
