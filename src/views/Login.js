import React, { useState, useEffect } from "react";
import "../assets/css/style.css";
import LoginForm from "./_login";
import RegisterForm from "./_register";
import ResetPasswordForm from "./_resetpassword";
import { useNavigate } from "react-router-dom";
import CreatePasswordForm from "./_createPassword";

const Login = () => {
  const [currentForm, setCurrentForm] = useState("login");
  const navigate = useNavigate();

  useEffect(() => {
    const loginImage = document.querySelector(".login-image");

    const handleClick = () => {
      if (currentForm !== "login") {
        toggleForm("login");
      }
    };

    // Add or remove click event listener based on form state
    if (currentForm !== "login" && currentForm !== "createPassword") {
      loginImage.addEventListener("click", handleClick);
    } else {
      loginImage.removeEventListener("click", handleClick);
    }

    // Update navigation based on the current form
    if (currentForm === "login") {
      navigate("/login");
    } else if (currentForm === "register") {
      navigate("/register");
    } else if (currentForm === "forgotPassword") {
      navigate("/resetpassword");
    } else if (currentForm === "createPassword") {
      navigate("/create-password");
    }

    return () => {
      loginImage.removeEventListener("click", handleClick);
    };
  }, [currentForm, navigate]);

  const toggleForm = (targetForm) => {
    setCurrentForm(targetForm); // Update the form displayed
  };

  // Check if access token exists, then show createPassword form
  React.useEffect(() => {
    const currentAccessToken = localStorage.getItem("accessToken");
    if (currentAccessToken) {
      
      toggleForm("createPassword");
    }
  }, []);

  return (
    <body className="body-login">
      <div className="login-container">
        <div
          className={`login-image ${
            currentForm === "login" || currentForm === "createPassword" ? "left" : "right"
          }`}
          style={{
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "cover",
            cursor: currentForm === "login" || currentForm === "createPassword" ? "pointer" : "default",
          }}
        ></div>

        {currentForm === "login" && <LoginForm toggleForm={toggleForm} />}
        {currentForm === "register" && <RegisterForm toggleForm={toggleForm} navigate={navigate} />}
        {currentForm === "forgotPassword" && <ResetPasswordForm toggleForm={toggleForm} />}
        {currentForm === "createPassword" && <CreatePasswordForm toggleForm={toggleForm} />}
      </div>
    </body>
  );
};

export default Login;
