import React, { useState, useEffect } from "react";
import {
  Button,
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
  FormControl,
  TextField,
  Checkbox,
  Typography,
  TablePagination,
  Autocomplete,
  Popover,
} from "@mui/material";
import menudishApi from "../../api/menudishAdminApi";
import dishApi from "../../api/dishApi";
import eventApi from "../../api/eventApi";
import menuApi from "../../api/menuAdminApi";
import danhMucApi from "../../api/danhMucApi";
import toast, { Toaster } from "react-hot-toast";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import SnackBarNotification from "./SnackBarNotification";
import { FaFilter } from "react-icons/fa";
import useGetPermission from "hooks/useGetPermission";

const MenuManager = () => {
  const { hasPermission } = useGetPermission();

  const [menuData, setMenuData] = useState({
    name: "",
    description: "",
    totalcost: 0,
    ismanaged: true,
    listMenuDish: [],
    eventId: 0,
    menuId: null,
  });
  const [menus, setMenus] = useState([]),
    [dishes, setDishes] = useState([]),
    [events, setEvents] = useState([]),
    [selectedDishes, setSelectedDishes] = useState([]),
    [openDialog, setOpenDialog] = useState(false),
    [isEdit, setIsEdit] = useState(false),
    [pageCount, setPageCount] = useState(0),
    [page, setPage] = useState(0),
    [categories, setCategories] = useState([]),
    [searchTerm, setSearchTerm] = useState(""),
    [totalElements, setTotalElements] = useState(0),
    [rowsPerPage, setRowsPerPage] = useState(5),
    [openDetailDialog, setOpenDetailDialog] = useState(false),
    [selectedMenu, setSelectedMenu] = useState(null),
    [filteredDishes, setFilteredDishes] = useState([]),
    [selectedDishesByCategory, setSelectedDishesByCategory] = useState({}),
    [open, setOpen] = useState(false),
    [snackbarOpen, setSnackbarOpen] = useState(false),
    [snackbarMessage, setSnackbarMessage] = useState(""),
    [snackbarSeverity, setSnackbarSeverity] = useState("success"),
    [oldMenuDishes, setOldMenuDishes] = useState([]),
    [groupedDishes, setGroupedDishes] = useState({});
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState(null);

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
  const categoryTranslation = {
    Appetizers: "Món khai vị",
    "Main Courses": "Món chính",
    Desserts: "Món tráng miệng",
    Beverages: "Đồ uống",
    // Thêm các danh mục khác ở đây
  };
  const [filteredMenus, setFilteredMenus] = useState(menus); // Khởi tạo danh sách đã lọc với toàn bộ dữ liệu ban đầu
  useEffect(() => {
    setFilteredMenus(menus);
  }, [menus]);

  const handleCancelDelete = () => {
    setOpenConfirmDialog(false);
    setMenuToDelete(null);
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const handleEventChange = (event, newValue) =>
    setMenuData((prevState) => ({
      ...prevState,
      eventId: newValue?.eventId || 0,
    }));

  useEffect(() => {
    if (Array.isArray(dishes)) {
      const newFilteredDishes = dishes.filter(
        (dish) =>
          !menuData.listMenuDish.some(
            (selectedDish) => selectedDish.dishId === dish.dishId
          )
      );
      setFilteredDishes(newFilteredDishes);
    }
  }, [menuData.listMenuDish, dishes]);

  const handleDishChange = (event, selectedDishes) =>
    setMenuData((prev) => ({ ...prev, listMenuDish: selectedDishes }));

  const handleViewDetailsClick = (menu) => {
    setSelectedMenu(menu);
    setOpenDetailDialog(true);
  };

  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSelectedMenu(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const fetchMenusWithPagination = async (page) => {
    try {
      const menuRes = await menuApi.getPaginate(page, rowsPerPage);
      setMenus(menuRes.result?.content || []);
      setPageCount(menuRes.result?.totalPages);
      setTotalElements(menuRes.result?.totalElements);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách menu: ", error);
      toast.error("Không thể tải danh sách menu!");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await danhMucApi.getAll({});
      setCategories(response.result?.content || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách danh mục: ", error);
      console.log("Selected Dishes:", selectedDishes);
    }
  };

  const fetchData = async () => {
    try {
      const dishes = await dishApi.getAll({ page: 1, size: 1000 });
      setDishes(dishes.result?.content);
      const events = await eventApi.getAll({ page: 1, size: 1000 });
      setEvents(events.result?.content);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu: ", error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchData();
    fetchMenusWithPagination(page + 1, rowsPerPage);
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchData();
    console.log("Menu đã cập nhật:", menuData);
  }, [menuData]);

  const handleOpenAddDialog = () => {
    setMenuData({
      name: "",
      description: "",
      totalcost: 0,
      ismanaged: true,
      listMenuDish: [],
      eventId: 0,
    });
    setIsEdit(false);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setMenuData({
      name: "",
      description: "",
      totalcost: 0,
      ismanaged: true,
      listMenuDish: [],
      eventId: 0,
    });
    setOpenDialog(false);
  };

  const handleSaveMenu = async () => {
    isEdit ? await handleEditMenu() : await handleAddMenu();
  };

  const handleDeleteDish = (dishId) => {
    setMenuData((prevState) => ({
      ...prevState,
      listMenuDish: prevState.listMenuDish.filter(
        (dish) => dish.dishId !== dishId
      ),
    }));
    setDishes((prevDishes) =>
      prevDishes.filter((dish) => dish.dishId !== dishId)
    );
  };

  const handleEditClick = async (menu) => {
    try {
      const response = await menudishApi.getByMenu(menu.menuId);
      if (response.code !== 1000)
        throw new Error("Danh sách món ăn không hợp lệ.");

      // Cập nhật danh sách món ăn và sự kiện
      const updatedMenuDishes = response.result?.content || [];
      const eventData = menu.events || null;
      const eventId = eventData ? eventData.eventId : 0;

      // Cập nhật lại món ăn cho từng danh mục
      const newSelectedDishesByCategory = {};

      categories.forEach((category) => {
        // Lọc món ăn theo danh mục
        const dishesForCategory = updatedMenuDishes.filter((menuDish) =>
          Array.isArray(menuDish.dishes.categories)
            ? menuDish.dishes.categories.some(
                (cat) => cat.categoryId === category.categoryId
              )
            : menuDish.dishes.categories.categoryId === category.categoryId
        );

        // Lưu món ăn đã chọn cho từng danh mục
        newSelectedDishesByCategory[category.categoryId] =
          dishesForCategory.map((dish) => dish.dishes);
      });

      // Cập nhật trạng thái
      setSelectedDishesByCategory(newSelectedDishesByCategory);
      setMenuData((prevState) => ({
        ...prevState,
        name: menu.name || prevState.name,
        description: menu.description || prevState.description,
        totalcost: menu.totalcost || prevState.totalcost,
        ismanaged: menu.ismanaged || prevState.ismanaged,
        listMenuDish: updatedMenuDishes.map((menuDish) => ({
          dishId: menuDish.dishes.dishId,
          name: menuDish.dishes.name,
          price: menuDish.dishes.price,
          quantity: menuDish.quantity,
        })),
        eventId, // Cập nhật eventId
        events: eventData || null, // Cập nhật toàn bộ sự kiện nếu có
        menuId: menu.menuId || prevState.menuId,
      }));

      // Đánh dấu chế độ chỉnh sửa và mở dialog
      setIsEdit(true);
      setOpenDialog(true);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách món ăn:", error);
      toast.error("Không thể lấy danh sách món ăn! Vui lòng thử lại.");
    }
  };

  const fetchMenus = async () => {
    try {
      const response = await menuApi.getAll(); // Gọi API lấy tất cả menus
      const updatedMenus = response.result?.content || [];
      setMenus(updatedMenus); // Cập nhật state menus
    } catch (error) {
      console.error("Lỗi khi lấy danh sách menus:", error);
      toast.error("Không thể tải lại danh sách menus!");
    }
  };

  const handleEditMenu = async () => {
    try {
      const { name, description, eventId, listMenuDish, menuId } = menuData;

      if (
        !name ||
        eventId === 0 ||
        !Array.isArray(listMenuDish) ||
        listMenuDish.length === 0 ||
        !menuId
      ) {
        toast.error("Vui lòng nhập đầy đủ thông tin và danh sách món ăn!");
        return;
      }

      const totalCost = listMenuDish.reduce((total, dish) => {
        if (!dish.price || typeof dish.price !== "number") {
          toast.error("Dữ liệu món ăn không hợp lệ!");
          throw new Error("Món ăn không hợp lệ.");
        }
        return total + dish.price * (dish.quantity || 1);
      }, 0);

      const updatedMenuPayload = {
        name,
        description,
        totalcost: totalCost,
        eventId,
      };
      const menuRes = await menuApi.update(menuId, updatedMenuPayload);

      if (!menuRes || !menuRes.result) {
        toast.error("Không thể cập nhật menu! Vui lòng thử lại.");
        return;
      }

      await menudishApi.deleteAllDish(menuId);
      await menudishApi.saveAllDish(
        listMenuDish.map((dish) => ({
          dishesId: dish.dishId,
          menuId,
          quantity: dish.quantity || 1,
        }))
      );

      showSuccess("Cập nhật menu thành công!");
      setOpenDialog(false);
      handleClose();
      // Cập nhật bảng
      await fetchMenus(); // Gọi hàm làm mới danh sách menus
    } catch (error) {
      console.error(
        "Lỗi khi cập nhật menu:",
        error.response?.data || error.message
      );
      toast.error("Không thể cập nhật menu! Vui lòng thử lại.");
    }
  };

  // Thêm menu mới
  const handleAddMenu = async () => {
    try {
      const { name, description, ismanaged, eventId, listMenuDish } = menuData;
      const userId = "0903e5c7-44fa-4dfc-bbf1-f4a951e84bf2"; // Admin ID mặc định

      if (
        !name ||
        eventId === 0 ||
        !listMenuDish ||
        listMenuDish.length === 0
      ) {
        toast.error("Vui lòng nhập đầy đủ thông tin và chọn món ăn!");
        return;
      }

      const totalCost = listMenuDish.reduce((total, dish) => {
        const quantity = dish.quantity || 1;
        return total + dish.price * quantity;
      }, 0);

      const newMenuPayload = {
        name,
        description,
        totalcost: totalCost,
        userId,
        eventId,
      };

      const menuRes = await menuApi.add(newMenuPayload);
      const newMenuId = menuRes.result?.menuId;

      if (!newMenuId) {
        toast.error("Không thể thêm menu! Hãy thử lại.");
        return;
      }

      const menuDishPayload = listMenuDish.map((dish) => ({
        menuId: newMenuId,
        dishesId: dish.dishId,
        price: dish.price,
        quantity: dish.quantity || 1,
      }));

      await menudishApi.saveAllDish(menuDishPayload);

      showSuccess("Thêm menu thành công!");
      setOpenDialog(false);
      handleClose();
      // Cập nhật bảng bằng cách thêm menu mới vào đầu danh sách
      const newMenu = {
        ...menuData,
        menuId: newMenuId,
        totalcost: totalCost,
        eventId,
      };

      // Thêm menu mới vào đầu danh sách
      // setMenus((prevMenus) => [newMenu, ...prevMenus]);

      // Reset form
      setMenuData({
        name: "",
        description: "",
        totalcost: 0,
        ismanaged: true,
        listMenuDish: [],
        eventId: 0,
      });
    } catch (error) {
      console.error(
        "Lỗi khi thêm menu:",
        error.response?.data || error.message
      );
      toast.error("Không thể thêm menu! Vui lòng thử lại.");
    }
  };

  const handleDeleteMenu = (menuId) => {
    setMenuToDelete(menuId);
    setOpenConfirmDialog(true);
  };
  //Delete
  const handleConfirmDelete = async () => {
    const res = await menuApi.delete(menuToDelete);
    if (res.code === 1000) {
      fetchMenusWithPagination(page + 1);
      showSuccess("Menu đã được xóa thành công !");
    }
    setOpenConfirmDialog(false);
    setMenuToDelete(null);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const groupedOptions = categories.map((category) => ({
    label: category.name, // Tên danh mục
    categoryId: category.categoryId, // ID danh mục
    options: Array.isArray(dishes)
      ? dishes.filter((dish) =>
          // Kiểm tra categories của món ăn có phải là mảng không, nếu không thì tạo thành mảng chứa 1 phần tử
          Array.isArray(dish.categories)
            ? dish.categories.some(
                (cat) => cat.categoryId === category.categoryId
              )
            : [dish.categories].some(
                (cat) => cat.categoryId === category.categoryId
              )
        )
      : [],
  }));

  console.log(dishes); // Kiểm tra mảng món ăn
  console.log(categories); // Kiểm tra danh mục
  console.log(dishes[0]?.categories); // Kiểm tra categories của món ăn đầu tiên

  const filteredGroupedOptions = Object.keys(groupedOptions).map(
    (category) => ({
      label: category,
      options: groupedOptions[category],
    })
  );

  const handleRemoveDish = (categoryId, dishId) => {
    setSelectedDishesByCategory((prev) => ({
      ...prev,
      [categoryId]: (prev[categoryId] || []).filter(
        (dish) => dish.dishId !== dishId
      ),
    }));

    setMenuData((prev) => ({
      ...prev,
      listMenuDish: prev.listMenuDish.filter((dish) => dish.dishId !== dishId),
    }));
  };

  // Hàm handleDishChangeByCategory
  const handleDishUpdate = (categoryId, updatedDishes) => {
    setSelectedDishesByCategory((prev) => {
      const uniqueDishes = updatedDishes; // Trực tiếp cập nhật danh sách món mới
      return {
        ...prev,
        [categoryId]: uniqueDishes, // Cập nhật món ăn theo danh mục
      };
    });

    setMenuData((prev) => {
      // Danh sách món ăn hiện tại trong menu
      const existingDishes = new Set(
        prev.listMenuDish.map((dish) => dish.dishId)
      );

      // Lọc ra món ăn mới từ updatedDishes
      const newDishes = updatedDishes.filter(
        (newDish) => !existingDishes.has(newDish.dishId)
      );

      // Kết hợp món mới và món cũ
      return {
        ...prev,
        listMenuDish: [...prev.listMenuDish, ...newDishes], // Giữ lại các món cũ và thêm món mới
      };
    });
    showSuccess("Đã cập nhật danh sách món ăn vào menu!");
  };

  const handleAddToMenu = () => {
    Object.entries(selectedDishesByCategory).forEach(([categoryId, dishes]) => {
      handleDishUpdate(categoryId, dishes);
    });
    handleClose();
  };

  const handleDishSelection = (dishId) => {
    setMenuData((prev) => {
      // Kiểm tra xem món ăn đã có trong danh sách chưa
      const isAlreadySelected = prev.listMenuDish.some(
        (dish) => dish.dishId === dishId
      );

      // Nếu đã chọn, xóa món ăn khỏi danh sách; nếu chưa, thêm vào
      const updatedList = isAlreadySelected
        ? prev.listMenuDish.filter((dish) => dish.dishId !== dishId)
        : [...prev.listMenuDish, dishes.find((dish) => dish.dishId === dishId)];

      return {
        ...prev,
        listMenuDish: updatedList,
      };
    });
  };

  const handleSearch = (searchTerm) => {
    setSearchTerm(searchTerm); // Cập nhật giá trị tìm kiếm
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    const filteredResults = menus.filter((menu) => {
      // Duyệt qua từng trường dữ liệu của một menu
      return Object.values(menu).some((value) => {
        if (value == null) return false; // Bỏ qua các giá trị null hoặc undefined
        return value.toString().toLowerCase().includes(lowerCaseSearchTerm);
      });
    });

    setFilteredMenus(filteredResults); // Cập nhật danh sách sau khi tìm kiếm
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState("");

  const eventNames = [
    ...new Set(menus.map((menu) => menu.events?.name).filter(Boolean)),
  ];

  const handleOpenPopover = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Đóng Popover
  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const handleFilterEvent = (event, value) => {
    setSelectedEvent(value);
    setFilteredMenus(
      menus.filter((menu) => !value || menu.events?.name === value)
    );
    handleClosePopover(); // Đóng Popover sau khi chọn
  };

  const handleEventButtonClick = () => {
    // Ví dụ: Đặt lại bộ lọc sự kiện
    setSelectedEvent("");
    console.log("Đã reset bộ lọc sự kiện!");
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
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {hasPermission("CREATE_MENU") && (
          <Button
            sx={{ fontSize: "10px" }}
            variant="contained"
            color="primary"
            onClick={() => handleOpenAddDialog("add", null)}
          >
            <AddIcon
              sx={{
                marginRight: "5px",
                fontSize: "16px",
                verticalAlign: "middle",
              }}
            />
            Thêm thực đơn
          </Button>
        )}
      </div>

      {/* Danh sách menu */}
      <TableContainer component={Paper} className="table-container">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>STT</TableCell>
              <TableCell>Tên thực đơn</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell>Tổng chi phí</TableCell>
              <TableCell>
                <Box display="flex" alignItems="center">
                  <span>Sự kiện</span>
                  <Button
                    size="small"
                    color=""
                    style={{
                      marginLeft: "-8px", // Lệch sang trái một chút
                      marginTop: "1px", // Hạ xuống một chút
                      minWidth: "40px", // Tăng chiều rộng của nút để dễ dàng nhấn
                      height: "30px", // Tăng chiều cao để tạo khoảng trống cho vùng nhấn
                      padding: "8px", // Thêm padding để tăng kích thước vùng nhấn mà không thay đổi icon
                      display: "flex", // Sử dụng flex để đảm bảo icon được căn giữa trong nút
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onClick={handleOpenPopover}
                  >
                    <FaFilter className="text-gray-500 h-6 w-6" />
                  </Button>
                </Box>
                <Popover
                  open={Boolean(anchorEl)}
                  anchorEl={anchorEl}
                  onClose={handleClosePopover}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "center",
                  }}
                >
                  <Box p={2} width={300}>
                    <Autocomplete
                      options={eventNames}
                      getOptionLabel={(option) => option || "Tất cả"}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Lọc sự kiện"
                          variant="outlined"
                          size="small"
                        />
                      )}
                      value={selectedEvent}
                      onChange={handleFilterEvent}
                    />
                  </Box>
                </Popover>
              </TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMenus.map((menu, index) => (
              <TableRow key={menu.menuId}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{menu.name}</TableCell>
                <TableCell>{menu.description}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                    currencyDisplay: "code",
                  }).format(menu.totalcost)}
                </TableCell>
                <TableCell>{menu.events?.name}</TableCell>
                <TableCell>
                  {hasPermission("UPDATE_MENU") && (
                    <Button
                      variant="outlined"
                      color="primary"
                      sx={{ mr: 1 }}
                      onClick={() => handleEditClick(menu)}
                    >
                      <EditIcon />
                    </Button>
                  )}
                  {hasPermission("DELETE_MENU") && (
                    <Button
                      variant="outlined"
                      color="error"
                      style={{ marginLeft: "8px" }}
                      onClick={() => handleDeleteMenu(menu.menuId)}
                    >
                      <DeleteIcon />
                    </Button>
                  )}
                  {hasPermission("READ_MENU") && (
                    <Button
                      variant="outlined"
                      color="info"
                      style={{ marginLeft: "8px" }}
                      onClick={() => handleViewDetailsClick(menu)}
                    >
                      <ErrorOutlineIcon />
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

      {/* Dialog thêm/sửa menu */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm" // Giới hạn chiều rộng tối đa của dialog
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            boxShadow: "none",
            padding: "0",
            border: "none",
            width: "90%", // Đảm bảo chiều rộng không quá rộng, có thể điều chỉnh
            maxWidth: "600px", // Giới hạn chiều rộng tối đa
            margin: "auto", // Căn giữa dialog
          },
        }}
      >
        <DialogTitle
          sx={{
            padding: "16px 32px", // Tăng khoảng cách padding cho tiêu đề
            fontSize: "24px", // Tăng kích thước chữ để tiêu đề nổi bật hơn
            fontWeight: "bold", // Đậm chữ để làm tiêu đề nổi bật
            textAlign: "center", // Căn giữa tiêu đề
            color: "#3f51b5", // Màu sắc tiêu đề (có thể thay đổi theo ý muốn)
            marginBottom: "16px", // Khoảng cách dưới tiêu đề để tách khỏi các phần tử khác
          }}
        >
          {isEdit ? "Chỉnh sửa Menu" : "Thêm Menu Mới"}
        </DialogTitle>
        <DialogContent
          className="custom-input"
          dividers
          sx={{
            overflowY: "auto",
            maxHeight: "calc(100vh - 150px)",
            position: "relative",
          }}
        >
          {/* Nội dung của Dialog */}
          <Box sx={{ marginBottom: "16px" }}>
            <Typography
              sx={{
                marginBottom: "4px",
                fontSize: "14px",
                color: "#000", // Màu đen cho label
              }}
            >
              Tên menu
            </Typography>
            <TextField
              fullWidth
              value={menuData.name}
              onChange={(e) =>
                setMenuData({ ...menuData, name: e.target.value })
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "6px", // Bo góc
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#ddd", // Màu viền mặc định
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#000", // Màu viền khi hover
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#000", // Màu viền khi focus
                },
              }}
            />
          </Box>
          <Box sx={{ marginBottom: "16px" }}>
            <Typography
              sx={{
                marginBottom: "4px",
                fontSize: "14px",
                color: "#000", // Màu đen cho label
              }}
            >
              Sự kiện
            </Typography>
            <FormControl fullWidth>
              {/* Autocomplete cho Sự kiện */}
              <Autocomplete
                value={menuData.events || null} // Đảm bảo rằng menuData.events là đối tượng sự kiện
                options={events}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) =>
                  option.eventId === value?.eventId
                }
                onChange={(event, newValue) => {
                  setMenuData((prevState) => ({
                    ...prevState,
                    eventId: newValue?.eventId || 0, // Lưu lại eventId
                    events: newValue || null, // Lưu lại đối tượng sự kiện
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    // label="Chọn sự kiện"
                    variant="outlined"
                    sx={{
                      ".MuiOutlinedInput-root": {
                        padding: "6px", // Tăng khoảng cách bên trong của TextField
                      },
                    }}
                  />
                )}
                sx={{
                  "& .MuiAutocomplete-listbox": {
                    maxHeight: "300px",
                    overflowY: "auto",
                  },
                  "& .MuiAutocomplete-option": {
                    fontSize: "16px",
                    padding: "8px",
                    color: "#000",
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                    },
                  },
                  "& .MuiAutocomplete-clearIndicator": {
                    color: "#000",
                  },
                  "& .MuiAutocomplete-popupIndicator": {
                    color: "#000",
                  },
                  "& .MuiAutocomplete-loading": {
                    color: "#000",
                  },
                }}
              />
            </FormControl>
          </Box>
          <Box sx={{ width: "100%" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpen}
              sx={{
                marginTop: "12px",
                marginBottom: "12px", // Khoảng cách phía trên
                fontSize: "14px", // Kích thước font chữ vừa phải
                padding: "8px 16px", // Khoảng cách bên trong vừa đủ
                borderRadius: "6px", // Bo góc nhẹ nhàng
                fontWeight: "bold", // Chữ đậm hơn
                textTransform: "none", // Không in hoa toàn bộ chữ
                background: "linear-gradient(90deg, #3f51b5, #5a75f0)", // Hiệu ứng gradient
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.15)", // Bóng đổ nhẹ
                transition: "all 0.3s ease-in-out", // Hiệu ứng chuyển đổi mượt
                "&:hover": {
                  background: "linear-gradient(90deg, #2c387e, #4c5bd4)", // Màu gradient khi hover
                  boxShadow: "0px 6px 10px rgba(0, 0, 0, 0.2)", // Bóng đổ đậm hơn khi hover
                },
                "&:active": {
                  transform: "scale(0.98)", // Nhấn nhẹ nút xuống khi click
                },
              }}
            >
              Chọn món ăn
            </Button>
            {/* Modal */}
            <Dialog
              open={open}
              onClose={handleClose}
              maxWidth="md" // Thay maxWidth="lg" thành "md" để giảm chiều ngang
              fullWidth
              sx={{
                "& .MuiDialog-container": {
                  alignItems: "flex-start", // Đặt Dialog gần phía trên
                },
                "& .MuiDialog-paper": {
                  padding: "8px",
                  maxHeight: "95vh", // Giới hạn chiều cao
                  overflow: "hidden", // Ẩn thanh trượt
                },
              }}
            >
              <DialogTitle
                sx={{
                  padding: "8px 16px",
                  fontWeight: "bold",
                  fontSize: "18px",
                }}
              >
                Chọn món ăn
              </DialogTitle>
              <DialogContent
                sx={{
                  padding: "8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {/* Phần Autocomplete */}
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    justifyContent: "space-between",
                  }}
                >
                  {groupedOptions.map((group) => (
                    <Box
                      key={group.categoryId}
                      sx={{
                        width: "48%", // Mỗi nhóm chiếm 48% chiều rộng
                        boxSizing: "border-box",
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "bold",
                          color: "#3f51b5",
                          marginBottom: "8px",
                        }}
                      >
                        {categoryTranslation[group.label] || group.label}
                      </Typography>
                      <Autocomplete
                        multiple
                        options={group.options}
                        value={selectedDishesByCategory[group.categoryId] || []}
                        onChange={(event, updatedDishes) =>
                          handleDishUpdate(group.categoryId, updatedDishes)
                        }
                        getOptionLabel={(option) => option.name || ""}
                        isOptionEqualToValue={(option, value) =>
                          option.dishId === value.dishId
                        }
                        renderInput={(params) => (
                          <TextField {...params} variant="outlined" />
                        )}
                        sx={{
                          "& .MuiAutocomplete-listbox": {
                            maxHeight: "200px",
                          },
                        }}
                      />
                    </Box>
                  ))}
                </Box>

                {/* Phần Table */}
                <Table className="table-container">
                  <TableHead>
                    <TableRow>
                      <TableCell>Tên món ăn</TableCell>
                      <TableCell>Giá gốc</TableCell>
                      <TableCell>Danh mục</TableCell>
                      <TableCell>Hành động</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {groupedOptions.map((group) => (
                      <>
                        <TableRow key={group.categoryId}>
                          <TableCell
                            colSpan={4}
                            style={{
                              fontWeight: "bold",
                              backgroundColor: "#f0f0f0",
                            }}
                          >
                            {categoryTranslation[group.label] || group.label}
                          </TableCell>
                        </TableRow>
                        {(selectedDishesByCategory[group.categoryId] || []).map(
                          (dish) => (
                            <TableRow key={dish.dishId}>
                              <TableCell>{dish.name}</TableCell>
                              <TableCell>{dish.price}</TableCell>
                              <TableCell>
                                {categoryTranslation[group.label] ||
                                  group.label}
                              </TableCell>
                              <TableCell>
                                <Button
                                  color="error"
                                  onClick={() =>
                                    handleRemoveDish(
                                      group.categoryId,
                                      dish.dishId
                                    )
                                  }
                                >
                                  Xóa
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </DialogContent>
              <DialogActions sx={{ padding: "8px" }}>
                <Button
                  onClick={handleClose}
                  color="secondary"
                  sx={{ fontSize: "14px" }}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleAddToMenu}
                  color="primary"
                  sx={{ fontSize: "14px" }}
                >
                  Thêm vào menu
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
          <Box sx={{ marginBottom: "16px" }}>
            <Typography
              sx={{
                marginBottom: "4px",
                fontSize: "14px",
                color: "#000", // Màu đen cho label
              }}
            >
              Mô tả
            </Typography>
            <TextField
              fullWidth
              multiline // Cho phép nhập nhiều dòng
              rows={4} // Số dòng hiển thị mặc định
              value={menuData.description}
              onChange={(e) =>
                setMenuData({ ...menuData, description: e.target.value })
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "6px",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#ddd",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#000", // Màu viền khi hover
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#000", // Màu viền khi focus
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: "8px 16px" }}>
          <Button onClick={handleCloseDialog} color="primary">
            Hủy
          </Button>
          <Button onClick={handleSaveMenu} color="primary" variant="contained">
            {isEdit ? "Cập nhật" : "Thêm"}
          </Button>
        </DialogActions>
      </Dialog>

      <Toaster position="top-center" />

      <Dialog
        open={openDetailDialog}
        onClose={handleCloseDetailDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Chi tiết Menu: {selectedMenu?.name}</DialogTitle>
        <DialogContent>
          {/* Hiển thị thông tin chi tiết của Menu */}
          <Typography variant="h6">
            Mô tả: {selectedMenu?.description}
          </Typography>
          <Typography variant="h6">
            Tổng chi phí:
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
              currencyDisplay: "code",
            }).format(selectedMenu?.totalcost)}
          </Typography>
          <Typography variant="h6" sx={{ mt: 2 }}>
            Danh sách món ăn:
          </Typography>
          <Table className="table-container">
            <TableHead>
              <TableRow>
                <TableCell>Tên món ăn</TableCell>
                <TableCell>Giá</TableCell>
                {/* <TableCell>Hình ảnh</TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedMenu?.listMenuDish &&
              selectedMenu.listMenuDish.length > 0 ? (
                selectedMenu.listMenuDish.map((menuDish) => (
                  <TableRow key={menuDish.menudishId}>
                    <TableCell>{menuDish.dishes.name}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                        currencyDisplay: "code",
                      }).format(menuDish.dishes.price)}
                    </TableCell>
                    {/* <TableCell>
                      <img src={`${menuDish?.dishes?.image}`} alt={dishes.name} width="70" />
                    </TableCell> */}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    Không có món ăn nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailDialog} color="primary">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

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
          <p>Bạn có chắc chắn muốn xóa thực đơn này ?</p>
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
    </Box>
  );
};

export default MenuManager;
