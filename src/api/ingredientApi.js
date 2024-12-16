import axiosClient from "../config/axiosClient";

const ingredientApi = {
    getAll(params) {
        const url = "/ingredient";
        return axiosClient.get(url, {params});
    },

    get(id) {
        const url = `/ingredient/${id}`;
        return axiosClient.get(url);
    },

    add(data) {
        const url = `/ingredient`;
        return axiosClient.post(url, data);
    },

    update(ingredientId, data) {
        const url = `/ingredient/${ingredientId}`;
        return axiosClient.put(url, data);
    },

    delete(id) {
        const url = `/ingredient/${id}`;
        return axiosClient.delete(url);
    },

    getPaginate(page, size) {
        const url = `/ingredient?page=${page}&size=${size}`;
        return axiosClient.get(url);
    },
    
};

export default ingredientApi;