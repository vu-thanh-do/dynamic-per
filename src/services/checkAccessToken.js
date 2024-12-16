import Cookies from "js-cookie";
import Swal from "sweetalert2";
import userApi from "api/userApi";

// Hàm sleep cho async
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Hàm kiểm tra token hết hạn
const isTokenExpired = (token) => {
  try {
    const [, payload] = token.split(".");
    const decoded = JSON.parse(atob(payload));
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (e) {
    console.error("Invalid token:", e);
    return true; // Nếu không decode được, coi như token hết hạn
  }
};

// Hàm kiểm tra và làm mới accessToken
const checkAccessToken = async (navigateFn) => {
  const accessToken = localStorage.getItem("accessToken");
  const refreshTokenValue = Cookies.get("refreshToken");

  if (!accessToken || isTokenExpired(accessToken)) {
    if (refreshTokenValue) {
      console.log("refreshToken gửi đi: ", refreshTokenValue);
      console.log("accessToken gửi đi: ", accessToken);
      const success = await userApi.refreshToken(refreshTokenValue);
      await sleep(5000); // Thời gian chờ xử lý
      console.log("trạng thái fetch refreshToken: ", success);

      if (success) {
        // Làm mới trang nếu thành công
        window.location.reload();
      } else {
        // Nếu refresh token thất bại => chuyển hướng đến trang đăng nhập
        Swal.fire({
          icon: "warning",
          title: "Hết phiên đăng nhập",
          text: "Vui lòng đăng nhập lại để tiếp tục sử dụng",
          timer: 3000, // Tự động đóng sau 3 giây
          showConfirmButton: true,
        });

        localStorage.removeItem("accessToken");
        Cookies.remove("refreshToken");

        if (navigateFn) {
          navigateFn("/login");
        }
      }
    } else {
      console.log("Không tìm thấy refreshToken", refreshTokenValue);

      if (navigateFn) {
        navigateFn("/login");
      }
    }
  }
};

export { isTokenExpired, checkAccessToken };
