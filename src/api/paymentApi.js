import axiosClient from "../config/axiosClient";

const paymentApi = {
  createPayOSUrl(data) {
    const url = "/payment/create";
    return axiosClient.post(url, data);
  },
  createVNPayUrl(data) {
    const url = "/payment/vn-pay";
    return axiosClient.post(url, data);
  },
  fetchPaymentHistory(contractId) {
    const url = "/paymentHistory";
    return axiosClient.get(url, {
      params: { contractId }, // Truyền contractId trong query string
    });
  },
};

export default paymentApi;
