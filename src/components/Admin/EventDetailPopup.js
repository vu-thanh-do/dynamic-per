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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  CircularProgress,
  Autocomplete,
} from "@mui/material";
import toast from "react-hot-toast";
import { Divider } from "antd";
import eventserviceApi from "api/EventServiceApi";
import serviceApi from "api/serviceApi";
import SnackBarNotification from "./SnackBarNotification";


const EventDetailPopup = ({ open, handleClose, event }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [services, setServices] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);



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

  const eventId = event?.eventId;

  useEffect(() => {
    if (open && eventId) {
      fetchServices(eventId);
    }
  }, [open, eventId]);

  useEffect(() => {
    const fetchAllService = async () => {
      try {
        const response = await serviceApi.getPaginate(1, 20);
        if (!response?.result?.content) {
          throw new Error("Dữ liệu phản hồi không hợp lệ.");
        }
        const services = response.result.content.map((service) => ({
          ...service,
          selected: false,
        }));
        setAvailableServices(services);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách dịch vụ:", error);
        toast.error("Không thể tải danh sách dịch vụ.");
      }
    };
    fetchAllService();
  }, []);

  const fetchServices = async (menuId) => {
    try {
      setLoading(true);

      const response = await eventserviceApi.getServicesByEvent(1, 100, menuId);

      if (!response || !response.content) {
        throw new Error("API trả về lỗi hoặc không có dữ liệu.");
      }

      const content = response.content;

      // Kiểm tra trường eventserviceId trong mỗi dịch vụ
      content.forEach((item) => {
        if (!item.eventserviceId) {
          console.error("eventserviceId không có trong dịch vụ:", item);
        }
      });

      const validServices = content.filter((item) => !item.services?.deleted_at);

      const extractedServices = validServices.map((item) => ({
        eventserviceId: item.eventserviceId, // Đảm bảo rằng eventserviceId có giá trị
        serviceId: item.services?.serviceId || "unknown",
        name: item.services?.name || "Không xác định",
        price: item.services?.price || 0,
        quantity: item.quantity || 1,
        cost: item.cost || 0,
      }));

      setServices(extractedServices);
    } catch (error) {
      console.error("Lỗi khi tải danh sách dịch vụ:", error);
      toast.error("Không thể tải danh sách dịch vụ. Vui lòng thử lại sau!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const updatedAvailableServices = availableServices.filter(
      (service) => !services.some((selected) => selected.serviceId === service.serviceId)
    );
    setAvailableServices(updatedAvailableServices);
  }, [services]);

  const saveSelectedServices = async () => {
    try {
      // Tách biệt các dịch vụ cần thêm mới và các dịch vụ cần cập nhật
      const servicesToAdd = services.filter((service) => service.eventserviceId === undefined); // Dịch vụ chưa có eventserviceId
      const servicesToUpdate = services.filter((service) => service.eventserviceId !== undefined); // Dịch vụ đã có eventserviceId

      // Payload cho các dịch vụ cần thêm mới
      const payloadToAdd = servicesToAdd.map((service) => ({
        eventId: eventId,
        serviceId: service.serviceId,
        quantity: service.quantity,
        cost: service.cost,
      }));

      // Payload cho các dịch vụ cần cập nhật
      const payloadToUpdate = servicesToUpdate.map((service) => ({
        eventserviceId: service.eventserviceId,
        eventId: eventId,
        serviceId: service.serviceId,
        quantity: service.quantity,
        cost: service.cost,
      }));

      // Lưu các dịch vụ mới
      if (payloadToAdd.length > 0) {
        await eventserviceApi.saveAllMenuDish(payloadToAdd); // Gửi các dịch vụ mới
        showSuccess("Dịch vụ mới đã được thêm!");
        handleClose(); // Đóng popup
      }

      // Cập nhật các dịch vụ đã có
      // Cập nhật các dịch vụ đã có (nếu API hỗ trợ cập nhật hàng loạt)
      if (payloadToUpdate.length > 0) {
        const updatePromises = payloadToUpdate.map(async (service) => {
          try {
            console.log("Updating service:", service); // Xem chi tiết payload
            await eventserviceApi.updateEventService(service.eventserviceId, service);
            console.log(`Service ${service.eventserviceId} updated successfully!`);
            return { success: true, serviceId: service.eventserviceId };
          } catch (error) {
            //   console.error(`Failed to update service ${service.eventserviceId}:`, error.response?.data || error);
            return { success: false, serviceId: service.eventserviceId, error };
          }
        });

        const results = await Promise.all(updatePromises);
        results.forEach(result => {
          if (!result.success) {
            //  toast.error(`Lỗi cập nhật dịch vụ ${result.serviceId}.`);
          }
        });
      }

      // // Cập nhật lại danh sách dịch vụ
      fetchServices(eventId);
      handleClose(); // Đóng popup

    } catch (error) {
      console.error("Lỗi khi lưu dịch vụ:", error);
      toast.error("Không thể lưu dịch vụ.");
    }
  };


  const handleSelectService = (event, selectedServices) => {
    if (!selectedServices || !selectedServices.length) return;

    const newServices = selectedServices.filter(
      (selected) => !services.some((service) => service.serviceId === selected.serviceId)
    );

    setServices((prev) => [...prev, ...newServices]);
  };

  const removeService = async (eventserviceId) => {
    try {
      await eventserviceApi.delete(eventserviceId); // Gọi API xóa dịch vụ từ eventservice

      // Cập nhật lại bảng dịch vụ
      setServices((prev) => prev.filter((service) => service.eventserviceId !== eventserviceId));

      // Cập nhật lại autocomplete để dịch vụ bị xóa sẽ lại xuất hiện
      const removedService = services.find((service) => service.eventserviceId === eventserviceId);
      setAvailableServices((prev) => [...prev, removedService]); // Thêm lại vào danh sách dịch vụ sẵn có

      showSuccess("Dịch vụ đã được xóa!");
    } catch (error) {
      console.error("Error removing service:", error);
      toast.error("Không thể xóa dịch vụ.");
    }
  };



  const handleSave = () => {
    if (services.length > 0) {
      saveSelectedServices();
    } else {
      toast.warning("Không có dịch vụ nào để lưu!");
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (!event) return null;

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
          Chi tiết sự kiện
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
          <Tab label="Dịch vụ" />
        </Tabs>
        <DialogContent
          dividers
          sx={{
            padding: "20px",
            backgroundColor: "#fff",
          }}
        >
          {loading ? (
            <CircularProgress />
          ) : activeTab === 0 ? (
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
                {event?.name}
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
                    src={event?.image}
                    alt={event?.name}
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
                    <strong>Mã sự kiện:</strong> {event?.eventId || "Không xác định"}
                  </Typography>
                  <Typography sx={{ fontSize: "1.5rem" }}>
                    <strong>Tổng:</strong> {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(event?.totalcost)}
                  </Typography>
                  <Typography sx={{ fontSize: "1.5rem" }}>
                    <strong>Mô tả:</strong> {event?.description || "Không có mô tả"}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ) : (
            <Box>
              <Autocomplete
                multiple
                options={availableServices} // Dùng availableServices để hiển thị dịch vụ sẵn có (bao gồm dịch vụ đã bị xóa)
                getOptionLabel={(option) => option.name}
                value={services} // Hiển thị các dịch vụ đã chọn
                onChange={(event, selectedOptions) => {
                  // Lọc các dịch vụ mới được thêm
                  const newServices = selectedOptions.filter(
                    (selected) => !services.some((service) => service.serviceId === selected.serviceId)
                  );

                  // Chuẩn bị các dịch vụ mới với dữ liệu cần thiết
                  const mappedServices = newServices.map((service) => ({
                    //  eventserviceId: null, // Để null vì đây là dịch vụ mới, backend sẽ tự tăng giá trị này
                    serviceId: service.serviceId,
                    name: service.name,
                    price: service.price,
                    quantity: 1, // Giá trị mặc định
                    cost: service.price, // Giá trị mặc định
                  }));

                  // Cập nhật bảng và thêm dịch vụ mới vào danh sách dịch vụ đã chọn
                  setServices((prev) => [...prev, ...mappedServices]);
                }}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Chọn dịch vụ" variant="outlined" fullWidth />
                )}
                isOptionEqualToValue={(option, value) => option.serviceId === value.serviceId}
                sx={{ marginBottom: 2 }}
              />


              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>STT</TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>
                      Tên dịch vụ
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>
                      Chi phí
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>
                      Hành động
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {services.length > 0 ? (
                    services.map((service, index) => (
                      <TableRow key={service.eventserviceId}> {/* Sử dụng eventserviceId làm key */}
                        <TableCell sx={{ fontSize: "1.4rem" }}>{index + 1}</TableCell>
                        <TableCell sx={{ fontSize: "1.4rem" }}>{service.name}</TableCell>
                        <TableCell sx={{ fontSize: "1.4rem" }}>
                          {service.price.toLocaleString()} VND
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => removeService(service.eventserviceId)}
                          >
                            Xóa
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} style={{ textAlign: "center", fontSize: "1.3rem" }}>
                        Không có dịch vụ nào!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>

              </Table>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">Đóng</Button>
          <Button onClick={handleSave} color="primary" variant="contained">
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventDetailPopup;
