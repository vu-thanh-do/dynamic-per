import axiosClient from "../config/axiosClient";

const guestLocationApi = {
  getAll(params) {
    try {
      const url = `/location`;
      return axiosClient.get(url, { params });
    } catch (error) {
      console.log("Lỗi khi fetch", error);
    }
  },

  getPage(page, size, params) {
    try {
      const url = `/location?page=${page}&size=${size}`;
      const data = axiosClient.get(url, { params });
      console.log("Danh sách fetch được:", data);
      return data;
    } catch (error) {
      console.log("Lỗi khi fetch", error);
    }
  },

  get(id) {
    const url = `/location/${id}`;
    return axiosClient.get(url);
  },

  addAsUser(data) {
    const url = `/location/user`;
    return axiosClient.post(url, data);
  },

  update(data, id) {
    const url = `/location/${id}`;
    return axiosClient.put(url, data);
  },

  delete(id) {
    const url = `/location/${id}`;
    return axiosClient.delete(url);
  },
};

export default guestLocationApi;
