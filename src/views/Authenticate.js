import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setToken } from "../services/localStorageService.js";
import { Box, CircularProgress, Typography } from "@mui/material";
import Swal from "sweetalert2";

const Authenticate = () => {
  const navigate = useNavigate();
  
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  useEffect(() => {
    console.log(window.location.href);

    const authCodeRegex = /code=([^&]+)/;
    const isMatch = window.location.href.match(authCodeRegex);

    if (isMatch) {
      const authCode = isMatch[1];
      fetch(
        `https://62c6-2001-ee0-5722-4dc0-a8e7-eaeb-2e68-34e5.ngrok-free.app/obbm/auth/outbound/authentication?code=${authCode}`,
        {
          method: "POST",
        }
      )
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          const refreshToken = data.result?.refreshToken;
          const accessToken = data.result?.accessToken;

          if (refreshToken && accessToken) {
            // Lưu refreshToken vào cookie và accessToken vào localStorage
            document.cookie = `refreshToken=${refreshToken}; path=/; max-age=${
              7 * 24 * 60 * 60
            }; secure`;
            setToken(accessToken);

            // Kiểm tra nếu có currentEventId và điều hướng đến menu/eventId
            const currentEventId = localStorage.getItem("currentEventId");
            if (currentEventId) {
              navigate(`/menu/${currentEventId}`);
            } else {
              navigate("/");  // Điều hướng về trang chủ nếu không có currentEventId
            }
          } else {
            Swal.fire({
              icon: "error",
              title: "Lỗi đăng nhập",
              text: "Không nhận được dữ liệu đăng nhập. Vui lòng thử lại.",
              showConfirmButton: true,
            });
          }
        })
        .catch((error) => {
          console.error("Error during authentication:", error);
          Swal.fire({
            icon: "error",
            title: "Lỗi",
            text: "Đã xảy ra lỗi trong quá trình xác thực. Vui lòng thử lại.",
            showConfirmButton: true,
          });
        });
    }
  }, []);

  return (
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
      <CircularProgress />
      <Typography>Authenticating...</Typography>
    </Box>
  );
};

export default Authenticate;
