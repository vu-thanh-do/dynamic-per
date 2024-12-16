import { useEffect, useState } from "react";
import jsQR from "jsqr";
import "../assets/css/customStyle.css";
import "../assets/css/mainStyle.css";
import "../assets/css/account.css";
import { FaEdit, FaSave } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import avatar from "../assets/images/gif_avatar.gif";
import { getToken, setToken } from "../services/localStorageService";
import { logOut } from "../services/authenticationService";
import Swal from "sweetalert2";
import Cookies from "js-cookie";
const AccountSection = () => {
  const navigate = useNavigate();
  const [imageSrc, setImageSrc] = useState(null);
  const [userDetails, setUserDetails] = useState({
    fullname: "",
    dob: "",
    gender: null, // ban đầu chưa có giới tính
    address: "",
    citizenIdentity: "",
  });
  const [originalData, setOriginalData] = useState(userDetails);
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState("");
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState("");
  const [snackType, setSnackType] = useState("error");
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    fullname: userDetails?.fullname || "",
    gender: userDetails?.gender ? "Male" : "Female",
    residence: userDetails?.residence || "",
    email: userDetails?.email || "",
    phone: userDetails?.phone || "",
    citizenIdentity: userDetails?.citizenIdentity || "",
    dob: userDetails?.dob || "",
  });
  const [imageFile, setImageFile] = useState(null);
  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };
  const [newErrors, setNewErrors] = useState({
    phone: '', // Lỗi số điện thoại
  });

  // Biểu thức chính quy kiểm tra số điện thoại
  const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;

  // Hàm xử lý thay đổi số điện thoại
  const handlePhoneChange = (e) => {
    const phoneValue = e.target.value;

    // Chỉ cho phép nhập tối đa 10 ký tự và kiểm tra xem liệu số điện thoại có hợp lệ không
    if (/^\d{0,10}$/.test(phoneValue)) {
      setUserDetails({ ...userDetails, phone: phoneValue });

      // Kiểm tra số điện thoại
      if (!phoneValue || !phoneRegex.test(phoneValue)) {
        setNewErrors({
          ...newErrors,
          phone: 'Số điện thoại phải có đúng 10 số và hợp lệ ở Việt Nam.',
        });
      } else {
        setNewErrors({ ...newErrors, phone: '' }); // Xóa lỗi nếu hợp lệ
      }
    }
  };
  useEffect(() => {
    // Cập nhật dữ liệu gốc và dữ liệu form khi nhận được userDetails mới
    setUserDetails(userDetails);
    setOriginalData(userDetails);
  }, [userDetails]);

  const handleCancel = () => {
    setUserDetails(originalData); // Khôi phục dữ liệu gốc
    setIsEditing(false); // Tắt chế độ chỉnh sửa
  };
  const handleCloseSnackBar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackBarOpen(false);
  };

  const showError = (message) => {
    setSnackType("error");
    setSnackBarMessage(message);
    setSnackBarOpen(true);
  };

  const showSuccess = (message) => {
    setSnackType("success");
    setSnackBarMessage(message);
    setSnackBarOpen(true);
  };

  const getUserDetails = async (accessToken) => {
    const response = await fetch(`https://62c6-2001-ee0-5722-4dc0-a8e7-eaeb-2e68-34e5.ngrok-free.app/obbm/users/myInfo`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    console.log(data);

    setUserDetails(data.result);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Tạo URL cho ảnh để hiển thị trước
      setImageSrc(URL.createObjectURL(file));

      // Quét ảnh CCCD (nếu có API quét ảnh, gọi ở đây)
      scanIdCard(file);

      // Lưu ảnh lên server
      uploadImage(file);
    }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("https://62c6-2001-ee0-5722-4dc0-a8e7-eaeb-2e68-34e5.ngrok-free.app/obbm/upload/image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const imageUrl = data.result; // Giả sử API trả về URL của ảnh
        console.log("Ảnh tải lên thành công:", imageUrl);

        // Lưu URL ảnh vào state tạm thời
        setImageSrc(imageUrl); // imageSrc là state
      } else {
        console.error("Lỗi tải ảnh lên:", response.statusText);
      }
    } catch (error) {
      console.error("Có lỗi khi tải ảnh lên:", error);
    }
  };

  useEffect(() => {
    const accessToken = getToken();

    if (accessToken) {
      navigate("/account");
    }
  }, [navigate]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear().toString().slice(-4); // Lấy 2 chữ số cuối của năm
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Tháng có thể là 1 chữ số, thêm 0 ở đầu nếu cần
    const day = date.getDate().toString().padStart(2, "0"); // Ngày có thể là 1 chữ số, thêm 0 ở đầu nếu cần
    return `${year}-${month}-${day}`; // Trả về chuỗi ngày theo định dạng YY-MM-DD
  };
  const scanIdCard = (file) => {
    const formData = new FormData();
    formData.append("image", file);

    fetch("https://api.fpt.ai/vision/idr/vnm", {
      method: "POST",
      headers: {
        "api-key": "vgK0or7LveLhfyy9y1A9N7dOw17CfXb9", // API key của bạn
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.errorCode === 0) {
          const info = data.data[0]; // Dữ liệu trả về từ API
          const genderValue =
            info.sex === "NAM" ? true : info.sex === "NỮ" ? false : null;
          const formattedDob = formatDate(info.dob);
          // Cập nhật thông tin vào form
          setUserDetails({
            fullname: info.name,
            dob: formattedDob,
            gender: genderValue,
            residence: info.address,
            citizenIdentity: info.id,
          });
        } else {
          setError("Lỗi khi quét ảnh CCCD.");
        }
      })
      .catch((err) => {
        setError("Lỗi kết nối API: " + err.message);
      });
  };

  useEffect(() => {
    const accessToken = getToken();
    if (!accessToken) {
      navigate("/login");
    }

    getUserDetails(accessToken);
  }, [navigate]);

  const handleUpdate = async (event) => {
    let isValid = true;

    if (!userDetails.phone || !phoneRegex.test(userDetails.phone)) {
      setNewErrors({
        ...newErrors,
        phone: 'Số điện thoại phải có đúng 10 số và hợp lệ ở Việt Nam.',
      });
      isValid = false;
    }

    if (isValid) {
      // Gửi dữ liệu hoặc thực hiện hành động khi tất cả hợp lệ
      console.log('Dữ liệu hợp lệ:', userDetails);
    }
    const userId = localStorage.getItem("userId");

    // Lấy dữ liệu từ form
    const updatedData = {
      fullname: document.getElementById("fullname").value.trim(),
      email: document.getElementById("email_address").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      residence: document.getElementById("address").value.trim(),
      dob: document.getElementById("dob").value.trim(),
      gender: document.getElementById("gender").value.trim(),
      citizenIdentity: document.getElementById("IdCard").value.trim(),
      image: imageSrc || userDetails.image, // Giữ ảnh hiện tại nếu không upload ảnh mới
    };
    // Lấy danh sách các trường bị thiếu
    const missingFields = validateForm(updatedData);

    if (missingFields.length > 0) {
      Swal.fire({
        icon: "info",
        title: "Vui lòng nhập đầy đủ thông tin!",
        html: `Các thông tin bị thiếu gồm: <br><br><ul>${missingFields
          .map((field) => `<li>${field}</li>`)
          .join("")}</ul><br>`,
        showConfirmButton: true,
      });
      return;
    }

    // Kiểm tra nếu không có thay đổi nào
    const isUnchanged =
      updatedData.fullname === userDetails.fullname &&
      updatedData.email === userDetails.email &&
      updatedData.phone === userDetails.phone &&
      updatedData.residence === userDetails.residence &&
      updatedData.dob === userDetails.dob &&
      updatedData.gender === userDetails.gender &&
      updatedData.citizenIdentity === userDetails.citizenIdentity &&
      updatedData.image === userDetails.image;

    if (isUnchanged) {
      // Hiển thị thông báo nếu không có thay đổi
      Swal.fire({
        icon: "info",
        title: "Không có thay đổi",
        text: "Bạn chưa chỉnh sửa bất kỳ thông tin nào.",
        showConfirmButton: true,
      });
      return; // Dừng hàm nếu không có thay đổi
    }

    // Tiến hành gửi request nếu có thay đổi
    try {
      const response = await fetch(
        `https://62c6-2001-ee0-5722-4dc0-a8e7-eaeb-2e68-34e5.ngrok-free.app/obbm/users/user/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Hiển thị thông báo cập nhật thành công
        Swal.fire({
          icon: "success",
          title: "Thành công",
          text: "Cập nhật thông tin thành công",
          showCancelButton: true,
          confirmButtonText: "Tiếp tục với menu",
          cancelButtonText: "Hủy",
          reverseButtons: true,
        }).then((result) => {
          if (result.isConfirmed) {
            // Lấy eventId từ localStorage
            const eventId = localStorage.getItem("currentEventId"); // Đảm bảo rằng bạn đã lưu eventId vào localStorage trước đó

            if (eventId) {
              // Điều hướng đến menu với eventId
              window.location.href = `/menu/${eventId}`;
            } else {
              window.location.href = "/menu";
            }
          }
        });

        setIsEditing(false);
      } else {
        Swal.fire({
          icon: "error",
          title: "Thất bại",
          text: "Có lỗi xảy ra, vui lòng thử lại sau.",
          showConfirmButton: true,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Thất bại",
        text: "Lỗi không rõ, vui lòng thử lại sau.",
        showConfirmButton: true,
      });
    }
  };

  // Hàm kiểm tra dữ liệu
  const validateForm = (data) => {
    const missingFields = [];

    // Mapping các trường thành tên dễ hiểu
    const fieldLabels = {
      fullname: "Họ và tên",
      email: "Email",
      phone: "Số điện thoại",
      residence: "Địa chỉ",
      dob: "Ngày sinh",
      gender: "Giới tính",
      citizenIdentity: "Căn cước công dân",
    };

    for (const key in data) {
      if (key !== "image" && !data[key]) {
        missingFields.push(fieldLabels[key] || key);
      }
    }

    return missingFields;
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userId = localStorage.getItem("userId");
      try {
        const response = await fetch(
          `https://62c6-2001-ee0-5722-4dc0-a8e7-eaeb-2e68-34e5.ngrok-free.app/obbm/users/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${getToken()}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setUserDetails(data); // Cập nhật thông tin người dùng
          if (!data.image) {
            setImageSrc(""); // Nếu không có ảnh trong CSDL, dùng ảnh từ `imageSrc`
          }
        } else {
          console.error("Lỗi khi lấy thông tin người dùng");
        }
      } catch (error) {
        console.error("Lỗi:", error);
      }
    };

    fetchUserDetails();
  }, []);

  return (
    <main style={{ marginTop: "50px" }}>
      {userDetails ? (
        <section
          className="section section-divider white account-section"
          id="blog"
          style={{ paddingTop: "40px", paddingBottom: "60px" }}
        >
          <div className="container pt-4">
            <div className="profile-container">
              <div className="profile-photo">
                <img
                  src={avatar}
                  alt="Avatar"
                  style={{ maxWidth: "100%", maxHeight: "100%" }}
                />
              </div>
            </div>

            <div className="container w-75">
              <div className="" style={{ display: "block" }}>
                <p className="footer-list-title account-form-title">
                  Thông tin cá nhân
                </p>
              </div>
              <form
                id="userInfoForm"
                className="footer-form form-account d-flex"
              >
                {/* Left Column */}
                <div
                  className="left-column"
                  style={{ flex: "1", marginRight: "20px" }}
                >
                  <div className="input-wrapper">
                    <label htmlFor="fullname">Họ và tên</label>
                    <input
                      type="text"
                      name="fullname"
                      id="fullname"
                      placeholder="Họ và tên"
                      className={`input-field ${isEditing ? "highlight" : ""}`}
                      value={userDetails.fullname}
                      disabled={!isEditing}
                      onChange={(e) => {
                        const fullnameValue = e.target.value;
                        setUserDetails({
                          ...userDetails,
                          fullname: fullnameValue,
                        });
                      }}
                    />
                    <label htmlFor="phone">Số điện thoại</label>
                    <input
                      type="text"
                      id="phone"
                      value={userDetails.phone || ""}
                      
                      className={`input-field ${isEditing ? "highlight" : ""}`}
                      onChange={handlePhoneChange}
                      placeholder="Số điện thoại"
                      required
                      maxLength={10}
                    />
                    {newErrors.phone && <p style={{ color: 'red' }}>{newErrors.phone}</p>}
                    <label htmlFor="username">Tên đăng nhập</label>
                    <input
                      type="text"
                      name="user_name"
                      id="user_name"
                      required
                      placeholder="UserName"
                      aria-label="UserName"
                      className="input-field"
                      value={userDetails.username}
                      disabled
                    />
                    <label htmlFor="idCard">Căn cước công dân</label>
                    <input
                      type="text"
                      id="IdCard"
                      name="IdCard"
                      placeholder="Căn cước công dân"
                      aria-label="IdCard"
                      className="input-field"
                      value={userDetails.citizenIdentity || ""}
                      disabled
                    />
                    <label htmlFor="address">Địa chỉ</label>
                    <input
                      style={{ height: "40px" }}
                      type="text"
                      id="address"
                      name="address"
                      placeholder="Địa chỉ"
                      className="input-field"
                      value={userDetails.residence}
                      disabled
                    />
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      name="email_address"
                      id="email_address"
                      required
                      placeholder="Email"
                      aria-label="Email"
                      className="input-field"
                      value={userDetails.email}
                      disabled
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="right-column" style={{ flex: "1" }}>
                  <div className="input-wrapper">
                    <div className="input-wrapper">
                      <label
                        style={{
                          paddingTop: "10px",
                          paddingBottom: "10px",
                          borderRadius: "3px",
                          display: "none", // Ẩn label
                        }}
                        htmlFor="avatar-upload"
                        className="custom-file-upload btn btn-secondary"
                      >
                        Căn cước công dân
                      </label>

                      <div
                        style={{
                          maxWidth: "350px",
                          maxHeight: "300px",
                          height: "220px",
                          marginBottom: "15px",
                          border: "2px solid hsl(32, 100%, 59%)",
                          borderRadius: "5px",
                          padding: "5px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: isEditing ? "#f9f9f9" : "#e0e0e0", // Đổi màu nền khi không được chỉnh sửa
                          cursor: isEditing ? "pointer" : "not-allowed", // Đổi kiểu con trỏ
                        }}
                        onClick={() => {
                          if (isEditing) {
                            // Chỉ kích hoạt nếu isEditing là true
                            document.getElementById("avatar-upload").click();
                          }
                        }}
                      >
                        {userDetails.image ? ( // Ưu tiên hiển thị ảnh từ CSDL
                          <img
                            src={userDetails.image}
                            alt="User Avatar"
                            style={{ maxWidth: "100%", maxHeight: "100%" }}
                          />
                        ) : imageSrc ? ( // Nếu không có ảnh từ CSDL, kiểm tra ảnh từ imageSrc
                          <img
                            src={imageSrc}
                            alt="Selected"
                            style={{ maxWidth: "100%", maxHeight: "100%" }}
                          />
                        ) : (
                          <span style={{ color: "#888" }}>
                            Ảnh căn cước công dân
                          </span> // Nếu không có cả hai, hiển thị placeholder
                        )}
                      </div>

                      {/* Input file */}
                      <input
                        type="file"
                        id="avatar-upload"
                        style={{ display: "none" }}
                        accept="image/*"
                        disabled={!isEditing} // Vô hiệu hóa input nếu không chỉnh sửa
                        onChange={handleImageUpload} // Hàm xử lý khi upload ảnh
                      />
                    </div>

                    <label htmlFor="dob">Ngày sinh</label>
                    <input
                      type="text"
                      name="dob"
                      id="dob"
                      placeholder="Ngày sinh"
                      className="input-field"
                      value={userDetails.dob}
                      disabled
                    />
                    <label htmlFor="gender">Giới tính</label>
                    <select
                      name="gender"
                      aria-label="Total person"
                      id="gender"
                      style={{
                        height: "40px",
                        color: "hsl(0deg 0% 24.88%)",
                        appearance: "none",
                        MozAppearance: "none",
                        WebkitAppearance: "none",
                      }}
                      className="input-field"
                      value={userDetails.gender}
                      disabled
                    >
                      <option value="" disabled={false}>
                        -- Chọn giới tính --
                      </option>
                      <option value="true">Nam</option>
                      <option value="false">Nữ</option>
                      <option value="null">Khác</option>
                    </select>

                    <input
                      type="file"
                      accept="image/*"
                      id="avatar-upload"
                      onChange={handleImageUpload}
                      style={{ display: "none" }}
                    />

                    <input
                      type="file"
                      accept="image/*"
                      id="avatar-upload" // Đảm bảo ID trùng khớp với label's htmlFor
                      onChange={handleImageUpload}
                      style={{ display: "none" }} // Ẩn input file
                    />
                  </div>
                </div>
                {/* Nút Lưu và Nút Chỉnh sửa */}
                <div style={{ textAlign: "center" }}>
                  {isEditing && (
                    <button
                      type="submit"
                      className="update-btn btn btn-save-form d-flex align-items-center me-5 mb-2 btn btn-hover"
                      style={{
                        position: "absolute",
                        // top: "370px",
                        bottom: "80px",
                        right: "320px",
                        cursor: "pointer",
                        color: "hsl(32, 100%, 59%)",
                      }}
                      onClick={handleUpdate}
                    >
                      Lưu
                    </button>
                  )}

                  <button
                    type="button"
                    className="edit-icon-btn btn btn-save-form d-flex align-items-center me-5 mb-2 btn btn-hover"
                    onClick={() => {
                      if (isEditing) {
                        handleCancel(); // Khi đang chỉnh sửa và nhấn "Hủy"
                      } else {
                        setIsEditing(true); // Bật chế độ chỉnh sửa
                      }
                    }}
                    style={{
                      position: "absolute",
                      bottom: "80px",
                      right: "230px",
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    {isEditing ? "Hủy" : "Chỉnh sửa"}
                  </button>
                </div>
                {userDetails.noPassword && (
                  <div
                    style={{
                      textAlign: "left",
                      position: "absolute",
                      bottom: "75px",
                      left: "230px",
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    <p style={{ display: "inline", marginRight: "4px" }}>
                      Chú ý: Tài khoản bạn chưa có mật khẩu,
                    </p>
                    <button
                      onClick={() => {
                        navigate("/create-password");
                      }}
                      style={{
                        display: "inline",
                        background: "none",
                        border: "none",
                        color: "var(--dark-orange)",
                        textDecoration: "underline",
                        cursor: "pointer",
                      }}
                    >
                      Tạo mật khẩu
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </section>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "30px",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <CircularProgress></CircularProgress>
          <Typography>Loading ...</Typography>
        </Box>
      )}
    </main>
  );
};

export default AccountSection;
