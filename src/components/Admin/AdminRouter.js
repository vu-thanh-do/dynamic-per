import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = ({ children, isAdmin }) => {
  if (!isAdmin) {
    return <div>Bạn không có quyền truy cập vào trang này.</div>;
  }
  return children;
};

export default AdminRoute;
