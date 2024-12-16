import axios from "axios";
import axiosClient from "../config/axiosClient";

const userApi = {
  getAll(params) {
    const url = "/users";
    return axiosClient.get(url, { params });
  },
  getById(userId) {
    const url = `/users/${userId}`;
    return axiosClient.get(url);
  },
  getAllUser() {
    const url = `/users`;
    return axiosClient.get(url);
  },

  async refreshToken(refreshToken) {
    try {
      const response = await axios.post(
        `https://62c6-2001-ee0-5722-4dc0-a8e7-eaeb-2e68-34e5.ngrok-free.app/obbm/auth/refresh`,
        { refreshToken: refreshToken }, // Sửa lại tên trường cho đúng với tên ở backend
        {
          headers: {
            "Content-Type": "application/json", // Đảm bảo gửi dữ liệu dạng JSON
          },
        }
      );

      // In ra dữ liệu khi response đã nhận
      console.log("Response data: ", response.data);

      if (response.data.code === 1000) {
        const { accessToken } = response.data.result;
        localStorage.setItem("accessToken", accessToken);
        return true; // Đã làm mới token thành công
      } else {
        console.error("Failed to refresh token:", response.data);
        return false; // Làm mới token thất bại
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      return false; // Nếu có lỗi khi gọi API
    }
  },

  createPassword(password) {
    const url = `/users/create-password`;
    return axiosClient.post(url, password);
  },
};
export default userApi;
