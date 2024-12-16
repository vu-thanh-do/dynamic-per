import axios from "axios";
import Cookies from "js-cookie";
import { getToken, setToken } from "../services/localStorageService";

const apiClient = axios.create({
  baseURL: "https://62c6-2001-ee0-5722-4dc0-a8e7-eaeb-2e68-34e5.ngrok-free.app/obbm", // Base URL của API
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor để xử lý lỗi 401
apiClient.interceptors.response.use(
  (response) => response, // Trả về response nếu thành công
  async (error) => {
    if (error.response?.status === 401) {
      try {
        // Làm mới accessToken bằng refreshToken
        const refreshToken = Cookies.get("refreshToken");
        if (!refreshToken) {
          throw new Error("Refresh token không tồn tại. Vui lòng đăng nhập lại.");
        }

        const { data } = await axios.post(
          "https://62c6-2001-ee0-5722-4dc0-a8e7-eaeb-2e68-34e5.ngrok-free.app/obbm/auth/refresh",
          { refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (data.code !== 1000) {
          throw new Error(data.message || "Không thể làm mới accessToken.");
        }

        const newAccessToken = data.result.accessToken;
        setToken(newAccessToken); // Lưu accessToken mới vào localStorage

        // Thay thế accessToken cũ trong request gốc
        error.config.headers.Authorization = `Bearer ${newAccessToken}`;
        return axios(error.config); // Gửi lại request gốc với accessToken mới
      } catch (refreshError) {
        console.error("Làm mới accessToken thất bại:", refreshError.message);
        return Promise.reject(refreshError); // Nếu làm mới thất bại, trả lỗi
      }
    }

    return Promise.reject(error); // Nếu không phải lỗi 401, trả lỗi
  }
);

export default apiClient;
