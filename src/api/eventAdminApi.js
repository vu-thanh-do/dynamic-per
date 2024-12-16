import axiosClient from "../config/axiosClient";

const eventserviceApi = {
    getAll(params) {
        const url = "/eventservice";
        return axiosClient.get(url, { params });
    },

    get(id) {
        const url = `/eventservice/${id}`;
        return axiosClient.get(url);
    },

    add(data) {
        const url = `/eventservice`;
        return axiosClient.post(url, data);
    },

    update(data) {
        const url = `/eventservice/${data.id}`;
        return axiosClient.put(url, data);
    },

    delete(id) {
        const url = `/eventservice/${id}`;
        return axiosClient.delete(url);
    },

    getByEvent(eventId, page, size) {
        const url = `/eventservice/byEvent`;
        const params = { eventId, page, size };
        return axiosClient.get(url, { params });
    },

    getByService(serviceId, page, size) {
        const url = `/eventservice/byService`;
        const params = { serviceId, page, size };
        return axiosClient.get(url, { params });
    },

    saveAllEventServices(data) {
        const url = `/eventservice/saveEventServices`;
        return axiosClient.post(url, data);
    },
};

export default eventserviceApi;
