import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

function PaymentCoordinatorPage() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Lấy trạng thái thanh toán và URL trước đó từ localStorage
    const status = searchParams.get("status");
    const previousPath = localStorage.getItem("previousPath");

    console.log("Previous Path: ", previousPath); // Kiểm tra xem previousPath có đúng không
    console.log("Payment Status: ", status); // Kiểm tra trạng thái thanh toán

    if (previousPath) {
      // Thêm tham số payment vào URL trước đó
      const url = new URL(previousPath);
      url.searchParams.set("payment", status);

      // Chuyển hướng về URL mới
      window.location.href = url.toString();
    }
  }, [searchParams]);

  return (
    <div>
      <h1>Đang chuyển hướng...</h1>
    </div>
  );
}

export default PaymentCoordinatorPage;
