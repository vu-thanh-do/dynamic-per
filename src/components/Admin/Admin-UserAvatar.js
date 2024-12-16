import React, { useState, useEffect, useRef } from "react";
import {
  Avatar,
  Dropdown,
  Modal,
  Button,
  Input,
  message,
  Divider,
  Row,
  Col,
  Select,
  DatePicker,
} from "antd";
import {
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  PhoneOutlined,
  UserSwitchOutlined,
  EditOutlined,
  SolutionOutlined,
} from "@ant-design/icons";
import { EmailOutlined } from "@mui/icons-material";
import dayjs from "dayjs";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const AdminUserAvatar = () => {
  const navigate = useNavigate(); // Khởi tạo useNavigate

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    userId: "",
    username: "",
    fullname: "",
    gender: null,
    residence: "",
    dob: "",
    email: "",
    phone: "",
    image: "",
    noPassword: false,
    citizenIdentity: "",
    roles: [],
  });
  const [editData, setEditData] = useState({});
  const fileInputRef = useRef(null);

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

      // Cập nhật thông tin userData
      if (data.code === 1000) {
        const result = data.result;
        setUserData({
          userId: result.userId,
          username: result.username,
          fullname: result.fullname,
          dob: result.dob,
          email: result.email,
          phone: result.phone,
          image: result.image,
          password: result.noPassword,
          citizenIdentity: result.citizenIdentity,
          gender: result.gender,
          residence: result.residence,
          roles: result.roles || [],
        });
      } else {
        message.error("Không tải được dữ liệu.");
      }
    } catch (error) {
      message.error("Không tải được dữ liệu.");
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleEditClick = () => {
    setEditData({
      fullname: userData.fullname,
      phone: userData.phone,
      dob: userData.dob,
      email: userData.email,
      gender: userData.gender,
      residence: userData.residence,
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({}); //Reset data
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const userId = userData.userId;

      if (!token) {
        throw new Error("Token không tồn tại trong sessionStorage.");
      }

      const formattedDob = new Date(editData.dob || userData.dob)
        .toISOString()
        .split("T")[0];

      // Chuẩn bị request body
      const requestBody = {
        fullname: editData.fullname || userData.fullname,
        gender: editData.gender === true ? 1 : 0, // Chuyển true => 1 (Nam), false => 0 (Nữ)
        residence: editData.residence || userData.residence,
        email: editData.email || userData.email,
        phone: editData.phone || userData.phone,
        image: editData.image || userData.image,
        citizenIdentity: userData.citizenIdentity,
        dob: formattedDob,
      };

      console.log("Request Body:", requestBody);

      const response = await fetch(
        `https://62c6-2001-ee0-5722-4dc0-a8e7-eaeb-2e68-34e5.ngrok-free.app/obbm/users/user/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Phản hồi API:", data);

      if (response.ok) {
        message.success("Cập nhật thông tin thành công.");
        setUserData((prev) => ({
          ...prev,
          fullname: requestBody.fullname,
          dob: requestBody.dob,
          gender: requestBody.gender === 1, // Convert từ 1 thành true (Nam), 0 thành false (Nữ)
          residence: requestBody.residence,
          email: requestBody.email,
          image: requestBody.image,
          citizenIdentity: requestBody.citizenIdentity,
          phone: requestBody.phone,
        }));
        setIsEditing(false);
      } else {
        message.error("Không thể cập nhật thông tin.");
      }
    } catch (error) {
      message.error("Không thể cập nhật thông tin.");
    }
  };

  const handleInputChange = (e, field) => {
    setEditData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleAvatarClick = () => {
    // Kích hoạt input file khi nhấn vào Avatar
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0]; // Lấy file từ input
    if (file) {
      // Tạo URL tạm thời để hiển thị ảnh ngay lập tức
      const previewUrl = URL.createObjectURL(file);
      setEditData((prev) => ({
        ...prev,
        image: previewUrl, // Hiển thị tạm thời
      }));

      try {
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

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Lấy URL từ API Cloudinary
        const imageUrl = data.result;

        // Cập nhật dữ liệu ảnh trong state
        setEditData((prev) => ({
          ...prev,
          image: imageUrl,
        }));
      } catch (error) {
        console.error("Lỗi upload ảnh:", error);
        message.error("Upload ảnh thất bại!");
      }
    }
  };

  const handleLogout = async () => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = Cookies.get("refreshToken");
    console.log("Access token: " + accessToken);
    console.log("Refresh token: " + refreshToken);

    try {
      // Gửi yêu cầu POST đến API logout
      const response = await fetch("https://62c6-2001-ee0-5722-4dc0-a8e7-eaeb-2e68-34e5.ngrok-free.app/obbm/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_token: accessToken, // Truyền access_token
          refresh_token: refreshToken, // Truyền refresh_token
        }),
      });

      if (response.ok) {
        // Xóa thông tin đăng nhập sau khi logout thành công
        localStorage.removeItem("accessToken");
        localStorage.removeItem("isAdmin");
        localStorage.removeItem("userId");
        Cookies.remove("refreshToken");
        navigate("/login");
      } else {
        console.error("Logout failed:", response.status);
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <>
      <Dropdown
        menu={{
          items: [
            {
              key: "settings",
              icon: <UserOutlined />,
              label: "Hồ sơ cá nhân",
            },
            { key: "logout", icon: <LogoutOutlined />, label: "Đăng xuất" },
          ],
          onClick: (e) => {
            if (e.key === "settings") {
              setIsSettingsOpen(true);
            } else if (e.key === "logout") {
              handleLogout(); // Thêm dấu ngoặc đơn để gọi hàm
            }
          },
        }}
        trigger={["click"]}
      >
        <Avatar
          size="default"
          src={userData?.image}
          alt="User Avatar"
          style={{
            cursor: "pointer",
            width: "50px",
            height: "50px",
          }}
        />
      </Dropdown>

      {/* Modal Account Settings */}
      <Modal
        title="Cài đặt tài khoản"
        open={isSettingsOpen}
        onCancel={() => setIsSettingsOpen(false)}
        footer={null}
        width={1000} // Tăng độ rộng modal
      >
        <Divider />

        <div
          style={{ display: "flex", alignItems: "center", marginBottom: 20 }}
        >
          <Avatar
            size={64}
            src={editData.image || userData?.image}
            icon={!userData.image && <UserOutlined />}
            style={{
              marginRight: 16,
              cursor: "pointer",
              width: "100px",
              height: "100px",
            }}
            onClick={handleAvatarClick} // Gọi khi nhấn vào Avatar
          />
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }} // Ẩn input file
            accept="image/*" // Chỉ nhận file ảnh
            onChange={handleFileChange} // Xử lý khi chọn file
          />
          <div>
            <h1>{userData.fullname}</h1>
            <p style={{ color: "gray" }}>Thông tin tài khoản</p>
          </div>
        </div>

        {/* Form chỉnh sửa thông tin người dùng */}
        <div style={{ marginBottom: 20 }}>
          <Row gutter={16}>
            <Col span={12}>
              <div style={{ marginBottom: 10 }}>
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: "15px",
                    color: "#333",
                  }}
                >
                  <UserSwitchOutlined /> Họ và tên:
                </span>
                {isEditing ? (
                  <Input
                    value={editData.fullname}
                    onChange={(e) => handleInputChange(e, "fullname")}
                    style={{ marginTop: 5 }}
                  />
                ) : (
                  <span style={{ marginLeft: 10 }}>{userData.fullname}</span>
                )}
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 10 }}>
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: "15px",
                    color: "#333",
                  }}
                >
                  <PhoneOutlined /> Số điện thoại:
                </span>
                {isEditing ? (
                  <Input
                    value={editData.phone}
                    onChange={(e) => handleInputChange(e, "phone")}
                    style={{ marginTop: 5 }}
                  />
                ) : (
                  <span style={{ marginLeft: 10 }}>{userData.phone}</span>
                )}
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 10 }}>
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: "15px",
                    color: "#333",
                  }}
                >
                  <SolutionOutlined /> Ngày tháng năm sinh:
                </span>
                {isEditing ? (
                  <DatePicker
                    value={
                      editData.dob ? dayjs(editData.dob, "YYYY-MM-DD") : null
                    }
                    onChange={(date, dateString) =>
                      handleInputChange(
                        { target: { value: dateString } },
                        "dob"
                      )
                    }
                    format="YYYY-MM-DD" // Định dạng ngày tháng
                    style={{ marginTop: 5, width: "100%" }} // Giao diện phù hợp
                  />
                ) : (
                  <span style={{ marginLeft: 10 }}>{userData.dob}</span>
                )}
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 10 }}>
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: "15px",
                    color: "#333",
                  }}
                >
                  <EmailOutlined /> Email:
                </span>
                {isEditing ? (
                  <Input
                    value={editData.email}
                    onChange={(e) => handleInputChange(e, "email")}
                    style={{ marginTop: 5 }}
                  />
                ) : (
                  <span style={{ marginLeft: 10 }}>{userData.email}</span>
                )}
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 10 }}>
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: "15px",
                    color: "#333",
                  }}
                >
                  <UserOutlined /> Giới tính:
                </span>
                {isEditing ? (
                  <Select
                    value={editData.gender}
                    onChange={(value) =>
                      handleInputChange({ target: { value } }, "gender")
                    }
                    style={{ marginTop: 5 }}
                  >
                    <Select.Option value={true}>Nam</Select.Option>
                    <Select.Option value={false}>Nữ</Select.Option>
                  </Select>
                ) : (
                  <span style={{ marginLeft: 10 }}>
                    {userData.gender === true ? "Nam" : "Nữ"}
                  </span>
                )}
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: 10 }}>
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: "15px",
                    color: "#333",
                  }}
                >
                  <SolutionOutlined /> Nơi cư trú:
                </span>
                {isEditing ? (
                  <Input
                    value={editData.residence}
                    onChange={(e) => handleInputChange(e, "residence")}
                    style={{ marginTop: 5 }}
                  />
                ) : (
                  <span style={{ marginLeft: 10 }}>{userData.residence}</span>
                )}
              </div>
            </Col>
          </Row>
        </div>

        {isEditing ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "10px",
              marginTop: 20,
            }}
          >
            <Button onClick={handleCancelEdit}>Hủy</Button>
            <Button type="primary" onClick={handleSaveEdit}>
              Lưu
            </Button>
          </div>
        ) : (
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={handleEditClick}
            style={{ display: "block", margin: "0 auto" }}
          >
            Chỉnh sửa thông tin
          </Button>
        )}
      </Modal>
    </>
  );
};

export default AdminUserAvatar;
