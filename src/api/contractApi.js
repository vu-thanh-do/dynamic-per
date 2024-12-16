import axiosClient from "../config/axiosClient";

const contractApi = {
  getAll(params) {
    const url = `/contract`;
    return axiosClient.get(url, { params });
  },

  getPaginate(page, size) {
    const url = `/contract?page=${page}&size=${size}`;
    return axiosClient.get(url);
  },

  get(id) {
    const url = `/contract/${id}`;
    return axiosClient.get(url);
  },

  add(data) {
    const url = `/contract`;
    console.log("Gọi API URL:", url);
    console.log("Dữ liệu gửi lên:", data);
    return axiosClient.post(url, data);
  },

  update(id, data) {
    const url = `/contract/${id}`;
    return axiosClient.put(url, data);
  },

  delete(id) {
    const url = `/contract/${id}`;
    return axiosClient.delete(url);
  },
};

export default contractApi;
