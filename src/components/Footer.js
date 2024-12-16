import { useEffect, useState } from "react";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaPinterest,
} from "react-icons/fa"; // Import các icon từ react-icons

import { useNavigate } from "react-router-dom";
import "../assets/css/mainStyle.css";
import "../assets/css/customStyle.css";
import Cookies from "js-cookie";
import BackToTopButton from "./Back-to-top-btn";

import { getToken, setToken } from "../services/localStorageService";
import axios from "axios";
import userApi from "api/userApi";

const Footer = () => {
  // const navigate = useNavigate();
  // useEffect(() => {
  //   const accessToken = getToken();
  //   refreshAccessToken();
  //   if (accessToken) {
  //     navigate("/account");
  //   }
  // }, [navigate]);
  // const refreshAccessToken = async () => {
  //   const refreshToken = Cookies.get("refreshToken"); // Lấy refreshToken từ cookies

  //   if (!refreshToken) {
  //     throw new Error("Không có refreshToken.");
  //   }

  //   try {
  //     const refreshToken = Cookies.get("refreshToken");
  //     console.log("refreshToken",refreshToken); // Lấy refreshToken từ cookies
  //     // Gửi yêu cầu đến API /refresh để lấy accessToken mới
  //     try {
  //       const response = await userApi.refreshToken(refreshToken);
  //       console.log("response", response);

  //             // Nếu API trả về accessToken mới, lưu nó vào localStorage
  //     if (response.code === 1000 && response.result?.accessToken) {
  //       const newAccessToken = response.result.accessToken;

  //       setToken(newAccessToken); // Lưu accessToken mới vào localStorage
  //       console.log("Mới nhận accessToken:", newAccessToken); // Log accessToken mới
  //       return newAccessToken; // Trả về accessToken mới
  //     }
  //     } catch (e){
  //       console.error("Lỗi khi gửi yêu cầu đến API /refresh:", e);
  //     }

  //   } catch (error) {
  //     console.error("Lỗi khi làm mới accessToken:", error);    }
  // };
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container">
          <div className="footer-brand">
            <a href="" className="logo">
              OBBM<span className="span">.</span>
            </a>

            <p className="footer-text">
              Chào mừng bạn đến với OBBM – nền tảng đặt tiệc trực tuyến hàng
              đầu!
            </p>

            <ul className="social-list">
              <li>
                <a href="#" className="social-link">
                  <FaFacebook /> {/* Icon Facebook */}
                </a>
              </li>

              <li>
                <a href="#" className="social-link">
                  <FaTwitter /> {/* Icon Twitter */}
                </a>
              </li>

              <li>
                <a href="#" className="social-link">
                  <FaInstagram /> {/* Icon Instagram */}
                </a>
              </li>

              <li>
                <a href="#" className="social-link">
                  <FaPinterest /> {/* Icon Pinterest */}
                </a>
              </li>
            </ul>
          </div>

          <ul className="footer-list">
            <li>
              <p className="footer-list-title">Thông tin liên lạc</p>
            </li>

            <li>
              <p className="footer-list-item">+84 888 787 499</p>
            </li>

            <li>
              <p className="footer-list-item">obbm6368@gmail.com</p>
            </li>

            <li>
              <address className="footer-list-item">
                1368/2B24 Lê Hồng Nhi, Lê Bình, Cái Răng, Cần Thơ
              </address>
            </li>
          </ul>

          <ul className="footer-list">
            <li>
              <p className="footer-list-title">Thời gian mở cửa</p>
            </li>

            <li>
              <p className="footer-list-item">Thứ 2-Thứ 7: 08:00-22:00</p>
            </li>

            <li>
              <p className="footer-list-item">Thứ 3 4PM: Đến 0AM</p>
            </li>

            <li>
              <p className="footer-list-item">Thứ 7: 10:00-16:00</p>
            </li>
          </ul>

          {/* <form action="" className="footer-form">
            <p className="footer-list-title">Đặt tiệc</p>

            <div className="input-wrapper">
              <input
                type="text"
                name="full_name"
                required
                placeholder=""
                aria-label="Your Name"
                className="input-field"
              />

              <input
                type="email"
                name="email_address"
                required
                placeholder=""
                aria-label="Email"
                className="input-field"
              />
            </div>

            <div className="input-wrapper">
              <select
                name="total_person"
                aria-label="Total person"
                className="input-field"
              >
                <option value="person">Người</option>
                <option value="2 person">2 Person</option>
                <option value="3 person">3 Person</option>
                <option value="4 person">4 Person</option>
                <option value="5 person">5 Person</option>
              </select>

              <input
                type="date"
                name="booking_date"
                aria-label="Reservation date"
                className="input-field"
              />
            </div>

            <textarea
              name="message"
              required
              placeholder="Message"
              aria-label="Message"
              className="input-field"
            ></textarea>

            <button
              type="submit"
              className="btn"
              onClick={() => {
                window.location.href = "/login";
              }}
            >
              Đặt tiệc
            </button>
          </form> */}
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p className="copyright-text">
            &copy; 2024 Powered By 
            <a href="#" className="copyright-link ms-2">
              L&P Team
            </a>{" "}
          </p>
        </div>
      </div>

      <BackToTopButton />
    </footer>
  );
};

export default Footer;
