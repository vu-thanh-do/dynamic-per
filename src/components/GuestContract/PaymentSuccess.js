import * as React from "react";
import axios from "axios";
import { Card } from "react-bootstrap";

const ContractPayment = () => {
  // Biến lưu URL trả về từ API
  const [vnPayUrl, setVnPayUrl] = React.useState("");

  React.useEffect(() => {
    const fetchPaymentUrl = async () => {
      try {
        // Gọi API từ backend
        const response = await axios.get("https://62c6-2001-ee0-5722-4dc0-a8e7-eaeb-2e68-34e5.ngrok-free.app/pay");
        if (response.data) {
          setVnPayUrl(response.data); // Gán URL nhận được từ API vào biến state
        } else {
          console.error("API trả về rỗng");
        }
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
      }
    };

    fetchPaymentUrl();
  }, []);

  return (
    <div>
      <Card className="card p-5 w-100 mt-5">
        <div className="text-center mb-5">
          <h1>Step 4: Choose Your Payment </h1>
        </div>
        <div className="container">
          <a
            href={vnPayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-vnp mx-3"
            style={{ marginTop: "1rem" }}
          >
            VNPay
          </a>
          <button
            type="button"
            className="btn btn-save-form mx-3"
            style={{ marginTop: "1rem" }}
          >
            COD
          </button>
        </div>
      </Card>
    </div>
  );
};

export default ContractPayment;
