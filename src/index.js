import React from "react";
import ReactDOM from "react-dom/client"; // Thay đổi từ 'react-dom' sang 'react-dom/client'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import StepContext from "./StepContext";
import GuestContractList from "./components/GuestContract/GuestContractList";
import GuestContractInfo from "./components/GuestContract/GuestContractInfo";
import Home from "./views/Home";
import Login from "./views/Login";
import Menu from "./views/Menu";
import Account from "./views/Account.js";
import DashboardPage from "./views/Admin-DashboardPage";
import ManageContracts from "./components/Admin/Admin-Contracts";
import ServiceManager from "./components/Admin/Admin-Services";
import EventManager from "./components/Admin/Admin-Events";
import LocationManager from "./components/Admin/Admin-Location";
import AccountManager from "./components/Admin/Admin-Account";
import AdminAnalytics from "./components/Admin/Admin-Analytics";
import AccessControl from "./components/Admin/Admin-AccessControl";
import DishManager from "./components/Admin/Admin-Dish";
import CategoryDish from "./components/Admin/Admin-CategoryDish";
import IngredientManager from "./components/Admin/Admin-Ingredient";
import MenuManagement from "./components/Admin/Admin-Menu";
import Authenticate from "./views/Authenticate";
import PaymentCoordinatorPage from "views/PaymentCoordinator";
import AdminRoute from "components/Admin/AdminRouter";
import CreatePasswordForm from "views/_createPassword";
import userApi from "api/userApi";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import TabContractInfo from "components/GuestContract/TabContractInfo";


const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = JSON.parse(localStorage.getItem("isAdmin"));
  const shouldShowHeaderFooter =
    !location.pathname.startsWith("/admin") &&
    location.pathname !== "/login" &&
    location.pathname !== "/register" &&
    location.pathname !== "/resetpassword" &&
    location.pathname !== "/create-password";

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const checkAccessToken = async () => {
    if (location.pathname === "/" || location.pathname.startsWith("/menu"))
      return; // Loại trừ trang chủ
    const accessToken = localStorage.getItem("accessToken");
    const refreshTokenValue = Cookies.get("refreshToken");

    // Kiểm tra accessToken
    if (!accessToken || isTokenExpired(accessToken)) {
      if (refreshTokenValue) {
        const success = await userApi.refreshToken(refreshTokenValue);
        sleep(5000);
        console.log("trạng thái fetch refreshToken: ", success);
        if (success) {
          // Làm mới trang nếu thành công
          window.location.reload();
        } else {
          // Nếu refresh token thất bại => chuyển hướng đến trang đăng nhập
          if (refreshTokenValue) {
            Swal.fire({
              icon: "warning",
              title: "Hết phiên đăng nhập",
              text: "Vui lòng đăng nhập lại để tiếp tục sử dụng",
              timer: 3000, // Tự động đóng sau 8 giây
              showConfirmButton: true,
            });
          }

          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          Cookies.remove("refreshToken");

          navigate("/login");
        }
      } else {
        navigate("/login");
      }
    }
  };

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

  React.useEffect(() => {
    checkAccessToken();
  }, [location.pathname]); // Chạy lại mỗi khi đường dẫn thay đổi

  return (
    <>
      {shouldShowHeaderFooter && <Header />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contract" element={<StepContext />} />
        <Route path="/user/contract-list" element={<GuestContractList />} />
        <Route path="/contract/info/:id" element={<TabContractInfo />} />
        <Route path="/payment/cancel" element={<PaymentCoordinatorPage />} />
        <Route path="/payment/cancle" element={<PaymentCoordinatorPage />} />
        <Route path="/payment/success" element={<PaymentCoordinatorPage />} />
        <Route path="/menu/:id" element={<Menu />} />
        <Route path="/menu/" element={<Menu />} />
        <Route path="/account" element={<Account />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Login />} />
        <Route path="/resetpassword" element={<Login />} />
        <Route path="/create-password" element={<Login />} />
        <Route path="/authenticate" element={<Authenticate />} />
        <Route
          path="/admin/*"
          element={
            <AdminRoute isAdmin={isAdmin}>
              <DashboardPage />
            </AdminRoute>
          }
        >
          <Route path="ManageContracts" element={<ManageContracts />} />
          <Route path="ManageCategoryDish" element={<CategoryDish />} />
          <Route path="ManageDish" element={<DishManager />} />
          <Route path="ManagerIngredient" element={<IngredientManager />} />
          <Route path="ManageServices" element={<ServiceManager />} />
          <Route path="ManageEvents" element={<EventManager />} />
          <Route path="ManageLocation" element={<LocationManager />} />
          <Route path="ManageAccounts" element={<AccountManager />} />
          <Route path="MenuManagement" element={<MenuManagement />} />
          <Route path="" element={<AdminAnalytics />} />
          <Route path="AccessControl" element={<AccessControl />} />
          <Route path="login" element={<Login />} />
        </Route>
      </Routes>

      {shouldShowHeaderFooter && <Footer />}
    </>
  );
};

const RootApp = () => (
  <Router>
    <App />
  </Router>
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <RootApp />
);
