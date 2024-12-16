import axiosClient from "../config/axiosClient";

const danhMucApi = {
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

  getPaginate(page, size) {
    const url = `/category?page=${page}&size=${size}`;
    return axiosClient.get(url);
  }

};

export default danhMucApi;