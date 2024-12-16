import axiosClient from "../config/axiosClient";

const dishingredientApi = {
    getAll(params) {
        const url = "/dishingredient";
        return axiosClient.get(url, {params});
    },

    get(id) {
        const url = `/dishingredient/${id}`;
        return axiosClient.get(url);
    },

    add(data) {
        const url = `/dishingredient`;
        return axiosClient.post(url, data);
    },

    updateIngredient(id, data) {
        const url = `/dishingredient/${id}`;
        return axiosClient.put(url, data);
    },

    delete(id) {
        const url = `/dishingredient/${id}`;
        return axiosClient.delete(url);
    },

    getPaginate(page, size) {
        const url = `/dishingredient?page=${page}&size=${size}`;
        return axiosClient.get(url);
    },

    getIngredientsByDish(page, size, menuId) {
        const url = `/dishingredient/byDish?menuId=${menuId}&page=${page}&size=${size}`;
        return axiosClient.get(url);
    },

    getIngredientsByIngredient(page, size, dishId) {
        const url = `/dishingredient/byDish?menuId=${dishId}&page=${page}&size=${size}`;
        return axiosClient.get(url);
    },
    
    saveAllDishIngredient(data) {
        const url = `/dishingredient/saveAllDishIngredient`;
        return axiosClient.post(url, data);
    },

};

export default dishingredientApi;