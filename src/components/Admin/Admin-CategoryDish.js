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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import danhMucApi from "../../api/danhMucApi";
import { toast } from "react-hot-toast";
import { Typography } from "antd";
import SnackBarNotification from "./SnackBarNotification";
import Swal from "sweetalert2";
import useGetPermission from "hooks/useGetPermission";

const CategoryDish = () => {
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalElements, setTotalElements] = useState(0);
  const [nameError, setNameError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const { hasPermission } = useGetPermission();

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

  // const showError = (message) => {
  //   setSnackType('error');
  //   setSnackBarMessage(message);
  //   setSnackBarOpen(true);
  // };

  // const showInfo = (message) => {
  //   setSnackType('info');
  //   setSnackBarMessage(message);
  //   setSnackBarOpen(true);
  // };

  // Tìm và nạp Danh mục khi thành phần gắn liên kết
  useEffect(() => {
    fetchDanhMucWithPaginate(page + 1);
  }, [page, rowsPerPage]);

  // Hàm đổ dữ liệu & phân trang
  const fetchDanhMucWithPaginate = async (page) => {
    try {
      const res = await danhMucApi.getPaginate(page, rowsPerPage);
      setCategories(res.result?.content);
      setTotalElements(res.result?.totalElements);
      console.log("res.dt = ", res.result.content);
    } catch (error) {
      console.error("Không tìm nạp được danh mục: ", error);
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  // Đóng modal
  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setCurrentIndex(null);
    setCategoryName("");
    setCategoryDescription("");
  };


  const handleAddCategory = async () => {
    if (!categoryName) {
      setNameError("Tên danh mục không được để trống");
      return;
    } else {
      setNameError("");
    }

    try {
      const danhMucMoi = {
        name: categoryName,
        description: categoryDescription,
      };

      const response = await danhMucApi.add(danhMucMoi);

      // Update the categories list with the new category
      setCategories((prevCategories) => [response.result, ...prevCategories]);

      // Show success message
      showSuccess("Danh mục đã được thêm thành công!");

      handleClose();
    } catch (error) {
      console.error("Lỗi khi thêm danh mục:", error);

      if (error.response && error.response.data) {
        const { name, description } = error.response.data;
        setNameError(name || "Tên danh mục không hợp lệ");
        setDescriptionError(description || "Mô tả không hợp lệ");
      } else {
        toast.error("Đã xảy ra lỗi khi thêm danh mục");
      }
    }
  };

  // Hàm xử lý thay đổi cho trường tên danh mục
  const handleNameChange = (e) => {
    setCategoryName(e.target.value);
    if (e.target.value) {
      setNameError(""); // Đặt lại thông báo lỗi nếu trường hợp hợp lệ
    }
  };

  // Hàm xử lý thay đổi cho trường mô tả
  const handleDescriptionChange = (e) => {
    setCategoryDescription(e.target.value);
    if (e.target.value) {
      setDescriptionError(""); // Đặt lại thông báo lỗi nếu trường hợp hợp lệ
    }
  };

  // Xử lý fill danh mục món ăn để chỉnh sửa
  const handleEditCategory = (categoryId) => {
    const categoryToEdit = categories.find(
      (category) => category.categoryId === categoryId
    );

    if (categoryToEdit) {
      console.log("id: ", categoryToEdit);
      setEditMode(true);
      setCategoryName(categoryToEdit.name); // Lấy thông tin danh mục
      setCategoryDescription(categoryToEdit.description); // Lấy thông tin mô tả danh mục
      setCategoryId(categoryToEdit.categoryId);
      setOpen(true);
    }
  };

  // Cập nhật danh mục món ăn
  const handleUpdateCategory = async () => {
    if (categoryName && categoryDescription && categoryId !== null) {
      try {
        const updatedCategory = {
          name: categoryName,
          description: categoryDescription,
        };

        // Gọi API cập nhật danh mục
        const response = await danhMucApi.update(categoryId, updatedCategory);

        // Cập nhật danh mục trực tiếp trong danh sách hiện tại
        setCategories((prevCategories) =>
          prevCategories.map((category) =>
            category.categoryId === categoryId
              ? {
                  ...category,
                  name: response.data?.name || updatedCategory.name,
                  description:
                    response.data?.description || updatedCategory.description,
                }
              : category
          )
        );

        // Hiển thị thông báo thành công
        showSuccess("Danh mục đã được chỉnh sửa thành công!");

        handleClose(); // Đóng modal sau khi sửa xong
      } catch (error) {
        console.error("Lỗi khi cập nhật danh mục:", error);
      }
    } else {
      console.error("Vui lòng điền đầy đủ thông tin.");
    }
  };

  // Xóa danh mục món ăn
const handleDeleteCategory = async (categoryId) => {
  Swal.fire({
    title: "Bạn có chắc chắn muốn xóa danh mục này không?",
    text: "Danh mục này sẽ không thể khôi phục lại!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Xóa",
    cancelButtonText: "Hủy",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        // Gọi API xóa danh mục
        await danhMucApi.delete(categoryId);

        // Cập nhật danh sách danh mục sau khi xóa
        const updatedCategories = categories.filter(
          (category) => category.categoryId !== categoryId
        );
        setCategories(updatedCategories);

        // Hiển thị thông báo thành công
        Swal.fire("Đã xóa!", "Danh mục đã được xóa thành công.", "success");
      } catch (error) {
        console.error("Lỗi khi xóa danh mục:", error);

        // Hiển thị thông báo lỗi
        Swal.fire("Lỗi!", "Không thể xóa danh mục. Vui lòng thử lại.", "error");
      }
    }
  });
};


  // Hàm xử lý thay đổi giá trị input tìm kiếm
  const handleSearchChange = async (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    // Nếu ô tìm kiếm trống, tải lại dữ liệu phân trang gốc
    if (value.trim() === "") {
      try {
        fetchDanhMucWithPaginate(page);
      } catch (error) {
        console.error("Không tìm nạp được danh mục: ", error);
      }
    } else {
      // Lọc dữ liệu hiện tại trong categories dựa trên từ khóa
      const filtered = categories.filter(
        (category) =>
          category.name.toLowerCase().includes(value.toLowerCase()) ||
          category.description.toLowerCase().includes(value.toLowerCase())
      );
      setCategories(filtered); // Cập nhật bảng với dữ liệu đã lọc
    }
  };

  const handleChangePage = (event, newPage) => {
    console.log("check page: ", newPage);
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset về trang đầu tiên khi thay đổi số mục trên mỗi trang
  };

  return (
    <Box>
      <SnackBarNotification
        open={snackBarOpen}
        handleClose={handleCloseSnackBar}
        message={snackBarMessage}
        snackType={snackType}
      />

      <div className="admin-toolbar">
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
            onChange={handleSearchChange}
          />
        </div>

        {/* Nút Thêm */}
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
          onClick={handleClickOpen}
        >
          <AddIcon
            sx={{
              marginRight: "5px",
              fontSize: "16px",
              fontWeight: "400px",
              color: "rgb(255, 255, 255)",
            }}
          />
          Thêm danh mục
        </Button>
      </div>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            fontSize: "1.7rem",
            fontWeight: "bold",
            color: "#333",
          }}
        >
          {editMode ? "Sửa Danh Mục Món Ăn" : "Thêm Danh Mục Món Ăn"}
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
            <Typography>Tên danh mục</Typography>
          </div>
          <TextField
            size="small"
            autoFocus
            placeholder="Tên danh mục"
            margin="dense"
            type="text"
            fullWidth
            value={categoryName}
            onChange={handleNameChange}
            error={!!nameError}
            helperText={nameError}
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
              marginTop: "20px",
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
            size="small"
            margin="dense"
            placeholder="Mô tả"
            type="text"
            fullWidth
            multiline
            minRows={5}
            maxRows={10}
            value={categoryDescription}
            onChange={handleDescriptionChange}
            error={!!descriptionError}
            helperText={descriptionError}
            FormHelperTextProps={{
              style: {
                fontSize: "1.2rem",
                color: "red",
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={handleClose}
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
            Hủy
          </Button>
          <Button
            variant="outlined"
            onClick={editMode ? handleUpdateCategory : handleAddCategory}
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
            {editMode ? "Cập Nhật" : "Thêm"}
          </Button>
        </DialogActions>
      </Dialog>

      <TableContainer component={Paper} className="table-container">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>STT</TableCell>
              <TableCell>Tên danh mục</TableCell>
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
            {categories.map((category, index) => {
              return (
                <TableRow key={category.categoryId}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#f9f9f9",
                      position: "sticky",
                      right: 0,
                      zIndex: 1,
                    }}
                  >
                    <Button
                      variant="outlined"
                      onClick={() => handleEditCategory(category.categoryId)}
                      sx={{
                        color: "primary",
                        borderRadius: "8px",
                        transition: "all 0.3s ease-in-out",
                        marginRight: "8px",
                        "&:hover": {
                          background:
                            "linear-gradient(45deg, #87CEFA 30%, #66BB6A 90%)",
                        },
                      }}
                    >
                      <Tooltip
                        title={
                          <span style={{ fontSize: "1.25rem" }}>
                            Sửa thông tin
                          </span>
                        }
                        placement="top"
                      >
                        <EditIcon />
                      </Tooltip>
                    </Button>
                    <Button
                      variant="outlined"
                      sx={{
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
                      onClick={() =>
                        handleDeleteCategory(category.categoryId)
                      }
                    >
                      <Tooltip
                        title={
                          <span style={{ fontSize: "1.25rem" }}>
                            Xóa dữ liệu
                          </span>
                        }
                        placement="top"
                      >
                        <DeleteIcon />
                      </Tooltip>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
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
            "& .MuiTablePagination-displayedRows": {
              marginBottom: "0px",
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
    </Box>
  );
};

export default CategoryDish;
