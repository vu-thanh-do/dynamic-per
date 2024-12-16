import axiosClient from "../config/axiosClient";

const adminMenuApi = {
    // Lấy danh sách menu (hỗ trợ phân trang)
    getAll(params) {
        const url = "/menu"; // Endpoint tương ứng trong backend
        return axiosClient.get(url, { params });
    },

    // Lấy chi tiết menu theo ID
    get(id) {
        const url = `/menu/${id}`; // Backend dùng /menu/{menuId} để lấy chi tiết
        return axiosClient.get(url);
    },

    // Thêm mới menu
    add(data) {
        const url = `/menu/admin`; // Endpoint tương ứng cho việc tạo menu của admin
        return axiosClient.post(url, data);
    },

    // Cập nhật menu
    update: async (menuId, payload) => {
        if (!menuId) {
            throw new Error("menuId không được xác định!");
        }
        console.log("Payload gửi đi:", payload);
        return axiosClient.put(`/menu/${menuId}`, payload);
    },
    
    

    // Xóa menu
    delete(id) {
        const url = `/menu/${id}`; // Backend dùng DELETE /menu/{menuId} để xóa
        return axiosClient.delete(url);
    },

    // Lấy danh sách menu với phân trang
    getPaginate(page, size) {
        const url = `/menu?page=${page}&size=${size}`; // Endpoint tương ứng với phân trang admin
        return axiosClient.get(url);
    },
};

export default adminMenuApi;
