import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Box,
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
  TablePagination,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ingredientApi from "api/ingredientApi";
import toast, { Toaster } from "react-hot-toast";
import useGetPermission from "hooks/useGetPermission";

const formatDate = (dateString) => {
  if (!dateString) return "";
  const [day, month, year] = dateString.split("/");
  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
};

const removeAccents = (str) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

const IngredientManager = () => {
  const [ingredients, setIngredients] = useState([]);
  const [currentIngredient, setCurrentIngredient] = useState(null);
  const [currentPage, setCurrentPage] = useState(0); // Current page
  const [totalPages, setTotalPages] = useState(0); // Total pages
  const [rowsPerPage, setRowsPerPage] = useState(5); // Items per page
  const [searchTerm, setSearchTerm] = useState(""); // Search term
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const { hasPermission } = useGetPermission();

  // Fetch ingredients with optional search term
  const fetchIngredients = async (page = 0, size = rowsPerPage) => {
    try {
      const response = await ingredientApi.getPaginate(page + 1, size);
      const { content, totalPages } = response.result;
      setIngredients(content); // Cập nhật danh sách nguyên liệu
      setTotalPages(totalPages); // Tổng số trang
    } catch (error) {
      console.error("Error fetching ingredients:", error);
      toast.error("Không thể tải danh sách nguyên liệu.");
    }
  };

  useEffect(() => {
    fetchIngredients(currentPage, rowsPerPage);
  }, [currentPage, rowsPerPage]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value); // Cập nhật giá trị tìm kiếm trực tiếp
  };

  useEffect(() => {
    if (!searchTerm) {
      fetchIngredients(currentPage, rowsPerPage);
      return;
    }

    const normalizedSearchTerm = removeAccents(searchTerm.trim());

    const isNumber = /^\d+$/.test(normalizedSearchTerm);

    const filtered = ingredients.filter((ingredient) => {
      if (isNumber) {
        return ingredient.ingredientId
          .toString()
          .includes(normalizedSearchTerm);
      }
      const normalizedName = removeAccents(ingredient.name);
      return normalizedName.includes(normalizedSearchTerm);
    });

    setIngredients(filtered);
    setCurrentPage(0);
  }, [searchTerm]);

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage); // Update the current page
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0); // Reset to the first page
  };

  const openIngredientDialog = (ingredient = null) => {
    setCurrentIngredient(ingredient);
    setOpenDialog(true);
  };

  const closeIngredientDialog = () => {
    setOpenDialog(false);
    setCurrentIngredient(null);
  };

  const handleDeleteIngredient = async () => {
    if (!currentIngredient?.ingredientId) {
      toast.error("Không tìm thấy nguyên liệu để xóa!");
      return;
    }

    try {
      const response = await ingredientApi.delete(
        currentIngredient.ingredientId
      );

      if (response.code === 1000) {
        toast.success("Xóa nguyên liệu thành công!");
        fetchIngredients(currentPage, rowsPerPage, searchTerm); // Tải lại danh sách nguyên liệu
        closeDeleteDialog(); // Đóng popup xóa
      } else {
        toast.error("Xóa nguyên liệu thất bại!");
      }
    } catch (error) {
      console.error("Error deleting ingredient:", error);
      toast.error("Có lỗi xảy ra khi xóa nguyên liệu!");
    }
  };

  const closeDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setCurrentIngredient(null);
  };

  const handleSaveIngredient = async () => {
    if (!currentIngredient?.name || !currentIngredient?.unit) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      if (currentIngredient.ingredientId) {
        // Cập nhật nguyên liệu
        const response = await ingredientApi.update(
          currentIngredient.ingredientId,
          {
            name: currentIngredient.name,
            unit: currentIngredient.unit,
            desc: currentIngredient.desc || "",
          }
        );

        if (response.code === 1000) {
          toast.success("Cập nhật nguyên liệu thành công!");
          fetchIngredients(currentPage, rowsPerPage, searchTerm); // Tải lại danh sách nguyên liệu
          closeIngredientDialog(); // Đóng popup
        } else {
          toast.error("Cập nhật nguyên liệu thất bại!");
        }
      } else {
        // Thêm mới nguyên liệu
        const response = await ingredientApi.add({
          name: currentIngredient.name,
          unit: currentIngredient.unit,
          desc: currentIngredient.desc || "",
        });

        if (response.code === 1000) {
          toast.success("Thêm nguyên liệu thành công!");
          fetchIngredients(currentPage, rowsPerPage, searchTerm); // Tải lại danh sách nguyên liệu
          closeIngredientDialog(); // Đóng popup
        } else {
          toast.error("Thêm nguyên liệu thất bại!");
        }
      }
    } catch (error) {
      console.error("Error saving ingredient:", error);
      toast.error("Có lỗi xảy ra khi lưu nguyên liệu!");
    }
  };

  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 2,
          mb: 2,
        }}
      >
        <TextField
          variant="outlined"
          placeholder="Tìm kiếm nguyên liệu (ID hoặc Tên)..."
          sx={{ mx: 1, width: "300px" }}
          value={searchTerm}
          onChange={handleSearchChange}
        />

        {hasPermission("CREATE_INGREDIENT") && (
          <Button
            sx={{
              fontSize: "10px",
              display: "flex",
              alignItems: "center",
              padding: "6px 12px",
            }}
            variant="contained"
            color="primary"
            onClick={() => openIngredientDialog()}
          >
            <AddIcon sx={{ marginRight: "5px", fontSize: "16px" }} />
            Thêm Nguyên Liệu
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
              <TableCell>Tên nguyên liệu</TableCell>
              <TableCell>Đơn vị</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ingredients.length > 0 ? (
              ingredients.map((ingredient) => (
                <TableRow key={ingredient.ingredientId}>
                  <TableCell>{ingredient.ingredientId}</TableCell>
                  <TableCell>{ingredient.name}</TableCell>
                  <TableCell>{ingredient.unit}</TableCell>
                  <TableCell>{formatDate(ingredient.createdAt)}</TableCell>
                  <TableCell>{ingredient.desc}</TableCell>
                  <TableCell>
                    {hasPermission("UPDATE_INGREDIENT") && (
                      <Button
                        onClick={() => openIngredientDialog(ingredient)}
                        variant="outlined"
                        size="small"
                        sx={{ marginRight: "5px" }}
                      >
                        <EditIcon fontSize="small" />
                      </Button>
                    )}
                    {hasPermission("DELETE_INGREDIENT") && (
                      <Button
                        onClick={() => {
                          setCurrentIngredient(ingredient);
                          setOpenDeleteDialog(true);
                        }}
                        variant="outlined"
                        color="error"
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Không tìm thấy kết quả phù hợp
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalPages * rowsPerPage} // Total items = pages * items per page
        rowsPerPage={rowsPerPage}
        page={currentPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
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

      {/* Dialog Thêm/Sửa Nguyên Liệu */}
      <Dialog open={openDialog} onClose={closeIngredientDialog}>
        <DialogTitle>
          {currentIngredient ? "Sửa nguyên liệu" : "Thêm nguyên liệu"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Tên nguyên liệu"
            type="text"
            fullWidth
            variant="outlined"
            value={currentIngredient?.name || ""}
            onChange={(e) =>
              setCurrentIngredient({
                ...currentIngredient,
                name: e.target.value,
              })
            }
          />
          <TextField
            margin="dense"
            name="unit"
            label="Đơn vị"
            type="text"
            fullWidth
            variant="outlined"
            value={currentIngredient?.unit || ""}
            onChange={(e) =>
              setCurrentIngredient({
                ...currentIngredient,
                unit: e.target.value,
              })
            }
          />
          <TextField
            margin="dense"
            name="desc"
            label="Mô tả"
            type="text"
            fullWidth
            variant="outlined"
            value={currentIngredient?.desc || ""}
            onChange={(e) =>
              setCurrentIngredient({
                ...currentIngredient,
                desc: e.target.value,
              })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeIngredientDialog} color="secondary">
            Hủy
          </Button>
          <Button onClick={handleSaveIngredient} color="primary">
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Xóa Nguyên Liệu */}
      <Dialog open={openDeleteDialog} onClose={closeDeleteDialog}>
        <DialogTitle>Xác nhận xóa nguyên liệu</DialogTitle>
        <DialogContent>
          Bạn có chắc chắn muốn xóa nguyên liệu "{currentIngredient?.name}"
          không?
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="secondary">
            Hủy
          </Button>
          <Button onClick={handleDeleteIngredient} color="error">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default IngredientManager;
