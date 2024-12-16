import axiosClient from "../config/axiosClient";

const serviceApi = {
  getAll(params) {
    const url = "/service";
    return axiosClient.get(url, { params });
  },

  get(id) {
    const url = `/service/${id}`;
    return axiosClient.get(url);
  },

  add(data) {
    const url = `/service`;
    return axiosClient.post(url, data);
  },

  update(serviceId, data) {
    const url = `/service/${serviceId}`;
    return axiosClient.put(url, data);
  },

  delete(id) {
    const url = `/service/${id}`;
    return axiosClient.delete(url);
  },

  getPaginate(page, size) {
    const url = `/service?page=${page}&size=${size}`;
    return axiosClient.get(url);
  }

};

export default serviceApi;