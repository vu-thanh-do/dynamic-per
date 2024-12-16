import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getToken, setToken } from "../services/localStorageService";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
const RegisterForm = ({ toggleForm }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const goToRegisterStep2 = () => {
    document.getElementById("registerStep1").style.display = "none";
    document.getElementById("registerStep2").style.display = "block";
  };
  const navigate = useNavigate();
  const [currentForm, setCurrentForm] = useState("login");
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  useEffect(() => {
    const accessToken = getToken();

    if (accessToken) {
      navigate("/account");
    }
  }, [navigate]);

  const handleRegister = (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp!");
      return;
    }
  
    const data = {
      username: username,
      password: password,
      email: email,
    };
  
    fetch("https://62c6-2001-ee0-5722-4dc0-a8e7-eaeb-2e68-34e5.ngrok-free.app/obbm/users/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.code === 1019) {
          // Xử lý lỗi tên đăng nhập đã tồn tại
          Swal.fire({
            title: "Lỗi đăng ký",
            text: "Tên đăng nhập đã tồn tại!",
            icon: "error",
          });
          return;
        }
  
        if (data.code !== 1000) throw new Error(data.message);
  
        // Đăng ký thành công - Hiển thị SweetAlert
        Swal.fire({
          title: "Đăng ký thành công!",
          text: "Bạn muốn làm gì tiếp theo?",
          icon: "success",
          showCancelButton: true,
          confirmButtonText: "Đăng nhập ngay",
          cancelButtonText: "Về trang chủ",
          reverseButtons: true,
        }).then((result) => {
          if (result.isConfirmed) {
            toggleForm("login");
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            navigate("/");
          }
        });
      })
      .catch((error) => {
        Swal.fire({
          title: "Đăng ký thất bại",
          text: error.message,
          icon: "error",
        });
      });
  };
  

  return (
    <div className="login-form" id="registerForm">
      <h1>Đăng ký</h1>
      <form id="registerForm" method="post" onSubmit={handleRegister}>
        <div id="registerStep1">
          <input
            type="text"
            placeholder="Tên đăng nhập"
            name="username"
            required
            style={{ height: "41.2px" }}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            name="email"
            required
            style={{ height: "41.2px" }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="button"
            value="Nhận mã xác thực"
            onClick={goToRegisterStep2}
          />
        </div>

        <div id="registerStep2" style={{ display: "none" }}>
          {/* <input
            type="text"
            placeholder="Verification Code"
            name="email-code"
            required
            maxLength="6"
            pattern="[0-9]{6}"
            title="Please enter a 6-digit code"
          /> */}
          <div style={{ position: "relative" }}>
            <input
              type={showPassword1 ? "text" : "password"}
              placeholder="Mật khẩu"
              name="password"
              required
              style={{ height: "41.2px", paddingRight: "40px" }}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
            />
            {/* Icon mắt */}
            <div
              onClick={() => setShowPassword1(!showPassword1)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#555",
              }}
            >
              {showPassword1 ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
            </div>
          </div>

          <div style={{ position: "relative" }}>
            <input
              type={showPassword2 ? "text" : "password"}
              placeholder="Xác nhận mật khẩu"
              name="confirm-password"
              required
              style={{ height: "41.2px", paddingRight: "40px" }}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError("");
              }}
            />
            {/* Icon mắt */}
            <div
              onClick={() => setShowPassword2(!showPassword2)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#555",
              }}
            >
              {showPassword2 ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
            </div>
          </div>
          {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}
          <input type="submit" value="Đăng ký" />
        </div>
      </form>
      {/* <div className="social-login">
        // <a href="#" className="google-login">Sign up with Google</a>
        <a href="#" className="facebook-login">Sign up with Facebook</a>
      </div> */}
      <div className="register-link" onClick={() => toggleForm("login")}>
        Về đăng nhập
      </div>
    </div>
  );
};

export default RegisterForm;
