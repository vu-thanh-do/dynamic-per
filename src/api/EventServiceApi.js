import axiosClient from "../config/axiosClient";

const eventserviceApi = {
    getAll(params) {
        const url = "/eventservice";
        return axiosClient.get(url, { params });
    },

    async get(id) {
        const url = `/eventservice/${id}`;
        try {
            return await axiosClient.get(url);
        } catch (error) {
            console.error(`Error fetching eventservice with id ${id}:`, error);
            throw error;
        }
    },

    add(data) {
        const url = `/eventservice`;
        return axiosClient.post(url, data);
    },

    updateEventService(id, data) {
        const url = `/eventservice/${id}`;
        return axiosClient.put(url, data);
    },

    delete(id) {
        const url = `/eventservice/${id}`;
        return axiosClient.delete(url);
    },

    getPaginate(page = 1, size = 10) {
        const url = `/eventservice?page=${page}&size=${size}`;
        return axiosClient.get(url);
    },

    getEventServiceByService(page = 1, size = 10, dishId) {
        const params = new URLSearchParams();
        if (dishId) params.append("dishId", dishId);
        params.append("page", page);
        params.append("size", size);

        const url = `/eventservice/byService?${params.toString()}`;
        return axiosClient.get(url);
    },

    getServicesByEvent(page = 1, size = 10, menuId) {
        const params = new URLSearchParams();
        if (menuId) params.append("menuId", menuId);
        params.append("page", page);
        params.append("size", size);

        const url = `/eventservice/byEvent?${params.toString()}`;
        return axiosClient.get(url).then((response) => {
            if (response?.code !== 1000 || !response?.result?.content) {
                throw new Error("Invalid API response structure.");
            }
            return response.result;
        });
    },

    saveAllMenuDish(data) {
        const url = `/eventservice/saveAllMenuDish`;
        return axiosClient.post(url, data);
    },
};

export default eventserviceApi;
