import axiosClient from "../config/axiosClient";

const menudishApi = {
    // Lấy tất cả món ăn trong menu (hỗ trợ phân trang)
    getAll(params) {
        const url = "/menudish";
        return axiosClient.get(url, { params });
    },

    // Lấy chi tiết món ăn theo ID
    get(id) {
        const url = `/menudish/${id}`;
        return axiosClient.get(url);
    },

    // Thêm mới món ăn
    add(data) {
        const url = "/menudish";
        return axiosClient.post(url, data);
    },

    // Cập nhật món ăn trong menu
    update: async (id, data) => {
        if (!id) {
            console.error("menuDishId không được xác định!");
            throw new Error("menuDishId không được xác định!");
        }
        console.log("Đang gọi API cập nhật món ăn với menuDishId:", id);
        const url = `/menudish/${id}`;
        return axiosClient.put(url, data);
    },


    // Xóa món ăn trong menu
    delete(id) {
        const url = `/menudish/${id}`;
        return axiosClient.delete(url);
    },

    // Lấy món ăn theo menuId (với phân trang)
    getByMenu(menuId, page, size) {
        const url = "/menudish/byMenu";
        const params = { menuId, page, size };
        return axiosClient.get(url, { params });
    },

    // Lấy món ăn theo dishId (với phân trang)
    getByDish(dishId, page, size) {
        const url = "/menudish/byDish";
        const params = { dishId, page, size };
        return axiosClient.get(url, { params });
    },

    // Lưu tất cả món ăn cho menu
    saveAllDish(data) {
        const url = "/menudish/saveAllMenuDish";
        console.log("Payload gửi đến API:", data);
        return axiosClient.post(url, data);
    },

    deleteAllDish(menuId) {
        const url = `/menudish/menu/${menuId}`; // Endpoint của API xóa tất cả món ăn theo menuId
        return axiosClient.delete(url);
    }
    
};

export default menudishApi;
