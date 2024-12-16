import userApi from "api/userApi";
import React from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const CreatePasswordForm = ({ toggleForm }) => {
  const [password, setPassword] = React.useState("");
  const [repeatPassword, setRepeatPassword] = React.useState("");
  const [error, setError] = React.useState("");

  const navigate = useNavigate();

  const handleCreatePassword = async () => {
    // Kiểm tra các điều kiện
    if (!password || !repeatPassword) {
      setError("Mật khẩu và nhập lại mật khẩu không được để trống.");
      return; // Dừng lại nếu có lỗi
    }
    if (password !== repeatPassword) {
      setError("Mật khẩu nhập lại không khớp.");
      return; // Dừng lại nếu mật khẩu nhập lại không khớp
    }
    if (password.length < 5) {
      setError("Mật khẩu phải có ít nhất 5 ký tự.");
      return; // Kiểm tra độ dài mật khẩu
    }

    try {
      const response = await userApi.createPassword(password);
      console.log("Response nè:", response);
      if (response?.code === 9999) {
        setError("Mật khẩu phải có ít nhất 1 ký tự");
      }
      if (response?.code === 1000) {
        Swal.fire({
          icon: "success",
          title: "Thành công",
          text: response.message,
          timer: 3000, // Tự động đóng sau 3 giây
          showConfirmButton: true,
        });
        navigate("/");
      }
    } catch (e) {
      setError("Mật khẩu phải có ít nhất 1 ký tự không phải số");
    }
  };

  return (
    <div className="login-form" id="loginForm">
      <h1>Tạo mật khẩu mới</h1>
      <input
        type="password"
        placeholder="Mật khẩu"
        name="password"
        style={{ height: "41.2px" }}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="Nhập lại mật khẩu"
        name="repeatPassword"
        style={{ height: "41.2px" }}
        value={repeatPassword}
        onChange={(e) => setRepeatPassword(e.target.value)}
      />
      {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}

      <input
        type="submit"
        value="Tạo mật khẩu"
        onClick={handleCreatePassword}
      />
    </div>
  );
};

export default CreatePasswordForm;
