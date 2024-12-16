import axiosClient from "../config/axiosClient";

const guestEventServiceApi = {
  getAll(params) {
    const url = "/category";
    return axiosClient.get(url, { params });
  },

  get(id) {
    const url = `/category/${id}`;
    return axiosClient.get(url);
  },

  add(data) {
    const url = `/category`;
    return axiosClient.post(url, data);
  },

  update(categoryId, data) {
    const url = `/category/${categoryId}`;
    return axiosClient.put(url, data);
  },

  delete(id) {
    const url = `/category/${id}`;
    return axiosClient.delete(url);
  },

  getByEventId(id, page, size) {
    const url = `/eventservice/byEvent?menuId=${id}&page=${page}&size=${size}`;
    return axiosClient.get(url);
  },

  saveAllEventServices(data) {
    const url = `/eventservice/saveAllMenuDish`;
    return axiosClient.post(url, data);
  }

};

export default guestEventServiceApi;