import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Tabs,
  Tab,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  TablePagination,
  Checkbox,
  TextField,
  Autocomplete,
} from "@mui/material";
import ingredientApi from "api/ingredientApi";
import dishingredientApi from "api/dishingredientApi";
import toast from "react-hot-toast";
import SnackBarNotification from "./SnackBarNotification";

const DishDetailPopup = ({ open, handleClose, dish }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalElements, setTotalElements] = useState(0);
  const [addIngredientOpen, setAddIngredientOpen] = useState(false); // Trạng thái mở popup
  const [selectedIngredients, setSelectedIngredients] = useState([]); // Danh sách nguyên liệu được chọn
  const [allIngredients, setAllIngredients] = useState([]); // Toàn bộ nguyên liệu
  const [isAddingDisabled, setIsAddingDisabled] = useState(false); // Trạng thái để ẩn nút thêm

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

  const handleSaveIngredients = async (dishId, selectedIngredients) => {
    try {
      // Loại bỏ các nguyên liệu đã tồn tại
      const existingIngredientIds = ingredients.map(
        (ingredient) => ingredient.ingredientId
      );

      const newIngredients = selectedIngredients.filter(
        (item) => !existingIngredientIds.includes(item.ingredientId)
      );

      // Kiểm tra nếu không có nguyên liệu mới
      if (newIngredients.length === 0) {
        toast.error("Nguyên liệu đã tồn tại trong danh sách!");
        return;
      }

      console.log("Danh sách nguyên liệu mới cần thêm:", newIngredients);

      console.log("Danh sách nguyên liệu đã chọn:", selectedIngredients);
      const payload = newIngredients.map((item) => ({
        dishId: dishId,
        ingredientId: item.ingredientId,
        quantity: item.quantity || "1",
        desc: item.desc || "Không có mô tả",
      }));

      console.log("Payload gửi lên:", payload);
      await dishingredientApi.saveAllDishIngredient(payload);
     showSuccess("Nguyên liệu đã được thêm thành công!");
      // Ẩn nút "Thêm nguyên liệu"
      setIsAddingDisabled(true);
      fetchIngredients(dishId, 0, rowsPerPage);
      setAddIngredientOpen(false);
      setSelectedIngredients([]); // Xóa danh sách chọn
    } catch (error) {
      console.error("Lỗi khi thêm nguyên liệu:", error);
      toast.error("Có lỗi xảy ra khi thêm nguyên liệu!");
    }
  };

  const handleSaveUpdatedIngredients = async () => {
    try {
      await Promise.all(
        ingredients.map((ingredient) =>
          dishingredientApi.updateIngredient(ingredient.dishingredientId, {
            quantity: ingredient.quantity,
            desc: ingredient.desc,
            dishId: ingredient.dishId,
            ingredientId: ingredient.ingredientId,
          })
        )
      );
      showSuccess("Cập nhật nguyên liệu thành công!");
      fetchIngredients(dish.dishId, 0, rowsPerPage); // Reload danh sách
    } catch (error) {
      console.error("Lỗi khi cập nhật nguyên liệu:", error);
      toast.error("Có lỗi xảy ra khi cập nhật nguyên liệu!");
    }
  };

  const handleUpdateIngredient = async (ingredient) => {
    try {
      // Kiểm tra và log dữ liệu để debug
      console.log("Dữ liệu nguyên liệu cần cập nhật:", ingredient);

      // Kiểm tra các trường cần thiết
      if (
        !ingredient.dishingredientId ||
        !ingredient.dishes?.dishId ||
        !ingredient.ingredients?.ingredientId
      ) {
        toast.error("Thiếu thông tin cần thiết để cập nhật!");
        return;
      }

      // Chuẩn bị payload
      const payload = {
        quantity: ingredient.quantity, // Số lượng
        desc: ingredient.desc || "Không có mô tả", // Mô tả (nếu không có, đặt mặc định)
        dishId: ingredient.dishes.dishId, // ID món ăn
        ingredientId: ingredient.ingredients.ingredientId, // ID nguyên liệu
      };

      console.log("Payload gửi lên API:", payload);

      // Gọi API cập nhật
      await dishingredientApi.updateIngredient(
        ingredient.dishingredientId,
        payload
      );

      // Thông báo và reload danh sách nguyên liệu
      showSuccess("Cập nhật nguyên liệu thành công!");
      fetchIngredients(ingredient.dishes.dishId, 0, rowsPerPage);
    } catch (error) {
      console.error("Lỗi khi cập nhật nguyên liệu:", error);
      toast.error("Có lỗi xảy ra khi cập nhật nguyên liệu!");
    }
  };

  const handleDeleteIngredient = async (dishingredientId) => {
    try {
      // Gọi API xóa nguyên liệu
      await dishingredientApi.delete(dishingredientId);
  
      // Cập nhật lại danh sách nguyên liệu đã chọn sau khi xóa
      const updatedSelectedIngredients = selectedIngredients.filter(
        (ingredient) => ingredient.dishingredientId !== dishingredientId
      );
      setSelectedIngredients(updatedSelectedIngredients);
  
      // Tải lại danh sách nguyên liệu sau khi xóa
      fetchIngredients(dish.dishId, 0, rowsPerPage); // Hoặc có thể gọi API khác để lấy lại danh sách nguyên liệu
  
      toast.success("Xóa nguyên liệu thành công!");
    } catch (error) {
      console.error("Lỗi khi xóa nguyên liệu:", error);
      toast.error("Có lỗi xảy ra khi xóa nguyên liệu!");
    }
  };
  
  

  useEffect(() => {
    const fetchAllIngredients = async (page, size) => {
      try {
        const response = await ingredientApi.getPaginate(1, 50);
        console.log("Dữ liệu API trả về:", response);
        setAllIngredients(response?.result?.content); // Đảm bảo lưu đúng state
      } catch (error) {
        console.error("Lỗi khi lấy nguyên liệu:", error);
      }
    };

    fetchAllIngredients();
  }, []);

  const fetchIngredients = async (dishId, page, size) => {
    try {
      const response = await dishingredientApi.getIngredientsByIngredient(
        page + 1,
        size,
        dishId
      );
      if (response?.code === 1000) {
        const result = response.result.content.map((item) => ({
          ...item,
          dishId: item.dishes.dishId,
          ingredientId: item.ingredients.ingredientId,
        }));
        setIngredients(result);
        setTotalElements(response.result.totalElements || 0);
      } else {
        throw new Error("Lỗi khi tải dữ liệu nguyên liệu.");
      }
    } catch (error) {
      console.error("Lỗi khi lấy nguyên liệu:", error);
    }
  };

  useEffect(() => {
    if (open && dish?.dishId) {
      fetchIngredients(dish.dishId, page, rowsPerPage);
    }
  }, [open, dish, page, rowsPerPage]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page
  };

  const updateSelectedIngredient = (id, field, value) => {
    setSelectedIngredients((prev) =>
      prev.map((item) =>
        item.ingredientId === id ? { ...item, [field]: value } : item
      )
    );
  };

  if (!dish) return null;

  return (
    <Box>
    <SnackBarNotification
    open={snackBarOpen}
    handleClose={handleCloseSnackBar}
    message={snackBarMessage}
    snackType={snackType}
  />
  <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          fontSize: "2rem",
          fontWeight: "bold",
          backgroundColor: "#f5f5f5",
          color: "#333",
          textAlign: "center",
        }}
      >
        Chi tiết món ăn
      </DialogTitle>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        sx={{
          backgroundColor: "#fafafa",
          borderBottom: "1px solid #ddd",
          ".MuiTab-root": {
            fontSize: "1.3rem",
            fontWeight: "bold",
          },
        }}
      >
        <Tab label="Thông tin" />
        <Tab label="Nguyên liệu" />
      </Tabs>
      <DialogContent
        dividers
        sx={{
          padding: "20px",
          backgroundColor: "#fff",
        }}
      >
        {activeTab === 0 && (
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                color: "#1976d2",
                marginBottom: "1rem",
                textAlign: "center",
              }}
            >
              {dish.name}
            </Typography>
            <Divider />
            <Box
              display="flex"
              flexDirection="row"
              gap={4}
              mt={2}
              sx={{
                fontSize: "1.2rem",
                color: "#555",
              }}
            >
              <Box flex={1}>
                <img
                  src={dish.image}
                  alt={dish.name}
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                  }}
                />
              </Box>
              <Box flex={2} display="flex" flexDirection="column" gap={3}>
                <Typography sx={{ fontSize: "1.5rem" }}>
                  <strong>Mã món ăn:</strong> {dish.dishId || "Không xác định"}
                </Typography>
                <Typography sx={{ fontSize: "1.5rem" }}>
                  <strong>Giá:</strong>{" "}
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(dish.price)}
                </Typography>
                <Typography sx={{ fontSize: "1.5rem" }}>
                  <strong>Trạng thái:</strong> {dish.existing}
                </Typography>
                <Typography sx={{ fontSize: "1.5rem" }}>
                  <strong>Danh mục:</strong>{" "}
                  {dish.categories?.name || "Không xác định"}
                </Typography>
                <Typography sx={{ fontSize: "1.5rem" }}>
                  <strong>Mô tả:</strong> {dish.description || "Không có mô tả"}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
        {activeTab === 1 && (
          <Box>
            {/* Autocomplete chọn nguyên liệu */}
            {/* //  {!isAddingDisabled && ( */}
            <Box sx={{ marginBottom: "16px" }}>
            <Autocomplete
  multiple
  options={allIngredients.filter(
    (ingredient) =>
      !selectedIngredients.some(
        (existingIngredient) =>
          existingIngredient.ingredientId === ingredient.ingredientId
      )
  )}
  value={selectedIngredients} // Đảm bảo value luôn là selectedIngredients
  onChange={async (event, newSelectedIngredients) => {
    setSelectedIngredients(newSelectedIngredients); // Cập nhật lại selectedIngredients

    // Gọi API ngay lập tức khi người dùng chọn nguyên liệu
    if (newSelectedIngredients.length > 0) {
      try {
        await handleSaveIngredients(dish.dishId, newSelectedIngredients);
      } catch (error) {
        console.error("Lỗi khi thêm nguyên liệu:", error);
        toast.error("Có lỗi xảy ra khi thêm nguyên liệu!");
      }
    }
  }}
  getOptionLabel={(option) => option.name || ""}
  isOptionEqualToValue={(option, value) => option.ingredientId === value.ingredientId}
  renderInput={(params) => (
    <TextField {...params} label="Chọn nguyên liệu" variant="outlined" />
  )}
/>

            </Box>
            {/* //  )} */}

            {/* {isAddingDisabled && (
      <Button
        variant="outlined"
        color="secondary"
        onClick={() => setIsAddingDisabled(false)}
        sx={{ marginBottom: "16px" }}
      >
        Thêm nguyên liệu
      </Button>
    )} */}

            {loading ? (
              <CircularProgress />
            ) : error ? (
              <Typography sx={{ color: "red" }}>{error}</Typography>
            ) : ingredients.length > 0 ? (
              <>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>STT</TableCell>
                      <TableCell sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>Tên nguyên liệu</TableCell>
                      <TableCell sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>Số lượng</TableCell>
                      <TableCell sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>Mô tả</TableCell>
                      <TableCell sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>Hành động</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ingredients.map((ingredient, index) => (
                      <TableRow key={ingredient.dishingredientId}>
                        <TableCell sx={{ fontSize: "1.4rem" }}>
                          {page * rowsPerPage + index + 1}
                        </TableCell>
                        <TableCell sx={{ fontSize: "1.4rem" }}>
                          {ingredient.ingredients.name} ({ingredient.ingredients.unit})
                        </TableCell>
                        <TableCell sx={{ fontSize: "1.4rem" }}>
                          <TextField
                            size="small"
                            type="number"
                            value={ingredient.quantity}
                            onChange={(e) => {
                              const value = e.target.value;
                              setIngredients((prev) =>
                                prev.map((item) =>
                                  item.dishingredientId === ingredient.dishingredientId
                                    ? { ...item, quantity: value }
                                    : item
                                )
                              );
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: "1.4rem" }}>
                          <TextField
                            size="small"
                            value={ingredient.desc || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              setIngredients((prev) =>
                                prev.map((item) =>
                                  item.dishingredientId === ingredient.dishingredientId
                                    ? { ...item, desc: value }
                                    : item
                                )
                              );
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            sx={{ fontSize: "1.1rem" }}
                            variant="contained"
                            color="primary"
                            onClick={() => handleUpdateIngredient(ingredient)} // Gọi hàm cập nhật
                          >
                            Lưu
                          </Button>
                        </TableCell>
                        <TableCell>
                          {/* Nút Xóa */}
                          <Button
                            sx={{ fontSize: "1.1rem" }}
                            variant="contained"
                            color="error"
                            onClick={() => {
                                handleDeleteIngredient(ingredient.dishingredientId);                        
                            }}
                          >
                            Xóa
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[2, 5, 10]}
                  component="div"
                  count={totalElements}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  sx={{
                    fontSize: "1.5rem",
                    display: "flex",
                    justifyContent: "center",
                    marginTop: 2,
                    ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
                      fontSize: "1.5rem",
                    },
                    ".MuiTablePagination-actions button": {
                      fontSize: "2.5rem",
                      padding: "10px",
                    },
                  }}
                />
              </>
            ) : (
              <Typography sx={{ fontSize: "1.3rem", textAlign: "center" }}>
                Không có nguyên liệu nào!
              </Typography>
            )}
          </Box>
        )}



        <Dialog
          open={addIngredientOpen}
          onClose={() => setAddIngredientOpen(false)}
          maxWidth="md" fullWidth
        >
          <DialogTitle variant="h4" gutterBottom>
            Thêm nguyên liệu món ăn
          </DialogTitle>
          <DialogContent dividers>
            <Box
              sx={{
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {allIngredients.map((ingredient) => (
                <Box
                  key={ingredient.id}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  mb={2}
                >
                  <Checkbox
                    value={ingredient.id}
                    disabled={ingredients.some(
                      (existing) => existing.ingredientId === ingredient.id
                    )}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      setSelectedIngredients((prev) => {
                        if (isChecked) {
                          // Thêm nguyên liệu mới vào danh sách chọn
                          return [
                            ...prev,
                            {
                              ingredientId: ingredient.ingredientId,
                              quantity: "",
                              desc: "",
                            },
                          ];
                        } else {
                          // Loại bỏ nguyên liệu khỏi danh sách chọn
                          return prev.filter(
                            (item) => item.ingredientId !== ingredient.id
                          );
                        }
                      });
                    }}
                  />

                  <Typography sx={{ flex: 1, ml: 2, fontSize: "1.3rem" }}>
                    {ingredient.name}
                  </Typography>
                  <TextField
                    label="Số lượng"
                    placeholder="Nhập số lượng"
                    type="number"
                    size="small"
                    sx={{ width: "100px", mx: 2, fontSize: "1.3rem" }}
                    onChange={(e) =>
                      updateSelectedIngredient(
                        ingredient.ingredientId || ingredient.id,
                        "quantity",
                        e.target.value
                      )
                    }
                  />
                  <TextField
                    label="Mô tả"
                    placeholder="Nhập mô tả"
                    type="text"
                    size="small"
                    sx={{ flex: 2, fontSize: "1.3rem" }}
                    onChange={(e) =>
                      updateSelectedIngredient(
                        ingredient.ingredientId || ingredient.id,
                        "desc",
                        e.target.value
                      )
                    }
                  />
                </Box>
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              sx={{ fontSize: "1.3rem" }}
              variant="outlined"
              color="secondary"
              onClick={() => setAddIngredientOpen(false)}
            >
              Hủy
            </Button>
            <Button
              sx={{ fontSize: "1.3rem" }}
              variant="contained"
              color="primary"
              onClick={() => {
                handleSaveIngredients(dish.dishId, selectedIngredients); // Lưu nguyên liệu
                setAddIngredientOpen(false);
              }}
            >
              Lưu
            </Button>
          </DialogActions>
        </Dialog>
      </DialogContent>
      <DialogActions
        sx={{
          backgroundColor: "#f5f5f5",
          padding: "16px",
        }}
      >
        <Button
          variant="contained"
          color="primary"
          sx={{ fontSize: "1.2rem" }}
          onClick={() => handleSaveUpdatedIngredients()}
        >
          Lưu tất cả
        </Button>
        <Button
          onClick={handleClose}
          variant="contained"
          color="secondary"
          sx={{ fontSize: "1.2rem" }}
        >
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
    </Box>  
  );
};

export default DishDetailPopup;
