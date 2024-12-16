import axiosClient from "../config/axiosClient";

const menudishApi = {
    getAll(params) {
        const url = "/menudish";
        return axiosClient.get(url, {params});
    },

    get(id) {
        const url = `/menudish/${id}`;
        return axiosClient.get(url);
    },

    add(data) {
        const url = `/menudish`;
        return axiosClient.post(url, data);
    },

    update(data) {
        const url = `/menudish/${data.id}`;
        return axiosClient.put(url, data);
    },

    delete(id) {
        const url = `/menudish/${id}`;
        return axiosClient.delete(url);
    },

    getByMenu(menuId, page, size) {
        const url = `/menudish/byMenu`;
        const params = { menuId, page, size };
        return axiosClient.get(url, { params });
    },

    getByDish(dishId, page, size) {
        const url = `/menudish/byDish`;
        const params = { dishId, page, size };
        return axiosClient.get(url, { params });
    },

    saveAllDish(data) {
        const url = `/menudish/saveAllMenuDish`;
        return axiosClient.post(url, data);
    },
};

export default menudishApi;