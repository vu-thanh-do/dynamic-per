import axiosClient from "../config/axiosClient";

const eventsApi = {
  getAll(params) {
    const url = "/event";
    return axiosClient.get(url, { params });
  },

  get(id) {
    const url = `/event/${id}`;
    return axiosClient.get(url);
  },

  add(data) {
    const url = `/event/admin`;
    return axiosClient.post(url, data);
  },

  update(eventId, data) {
    const url = `/event/${eventId}`;
    return axiosClient.put(url, data);
  },

  delete(id) {
    const url = `/event/${id}`;
    return axiosClient.delete(url);
  },

  getPaginate(page, size) {
    const url = `/event?page=${page}&size=${size}`;
    return axiosClient.get(url);
  }

};

export default eventsApi;