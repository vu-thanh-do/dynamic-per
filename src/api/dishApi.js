import axiosClient from "../config/axiosClient";

const dishApi = {
    getAll(params) {
        const url = "/dish";
        return axiosClient.get(url, {params});
    },

    get(id) {
        const url = `/dish/${id}`;
        return axiosClient.get(url);
    },

    add(data) {
        const url = `/dish`;
        return axiosClient.post(url, data);
    },

    update(dishId, data) {
        const url = `/dish/${dishId}`;
        return axiosClient.put(url, data);
    },

    delete(id) {
        const url = `/dish/${id}`;
        return axiosClient.delete(url);
    },

    getPaginate(page, size) {
        const url = `/dish?page=${page}&size=${size}`;
        return axiosClient.get(url);
    },
    
    getIngredientsByDish(page, size, menuId) {
        const url = `/dishingredient/byDish?menuId=${menuId}&page=${page}&size=${size}`;
        return axiosClient.get(url);
    }
};

export default dishApi;