import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function useGetPermission() {
    const navigate = useNavigate();
    const permissions = useMemo(() => {
        const storedData = localStorage.getItem("roles");
        try {
            const parsedData = JSON.parse(storedData || "{}");
            return parsedData.permissions || [];
        } catch (error) {
            console.error("Invalid roles data in localStorage:", error);
            return [];
        }
    }, []);
    /**
     * Hàm kiểm tra quyền
     * @param {string} permissionName - Tên quyền cần kiểm tra (e.g., "DELETE_USER").
     * @returns {boolean} - True nếu user có quyền, False nếu không.
     */
    const hasPermission = (permissionName) => {
        if (!permissionName) {
            console.warn("Permission name is required for checking permissions.");
            return false;
        }
        return permissions.some((perm) => perm.name === permissionName);
    };
    return { hasPermission };
}
