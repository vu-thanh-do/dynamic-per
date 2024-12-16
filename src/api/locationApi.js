import axiosClient from "../config/axiosClient";

const locationApi = {
  getAll(params) {
    const url = "/location";
    return axiosClient.get(url, { params });
  },

  get(id) {
    const url = `/location/${id}`;
    return axiosClient.get(url);
  },

  add(data) {
    const url = `/location/admin`;
    return axiosClient.post(url, data);
  },

  update(locationId, data) {
    const url = `/location/${locationId}`;
    return axiosClient.put(url, data);
  },

  delete(id) {
    const url = `/location/${id}`;
    return axiosClient.delete(url);
  },

  getPaginate(page, size) {
    const url = `/location?page=${page}&size=${size}`;
    return axiosClient.get(url);
  }

};

export default locationApi;