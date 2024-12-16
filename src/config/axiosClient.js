import axios from "axios";

const axiosClient = axios.create({
  // baseURL: "https://62c6-2001-ee0-5722-4dc0-a8e7-eaeb-2e68-34e5.ngrok-free.app/obbm",
  baseURL: "https://62c6-2001-ee0-5722-4dc0-a8e7-eaeb-2e68-34e5.ngrok-free.app/obbm",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor
axiosClient.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    const token = localStorage.getItem("accessToken"); // Hoặc sessionStorage.getItem("token");

    // Nếu có token thì thêm vào header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosClient.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response.data;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
  }
);

export default axiosClient;
