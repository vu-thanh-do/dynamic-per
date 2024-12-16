import React, { useContext } from "react";
import { Stepper, StepLabel, Step, Box } from "@mui/material";
import { multiStepContext } from "../StepContext";

import FirstStep from "../components/GuestContract/ContractCreateStep1";
import SecondStep from "../components/GuestContract/ContractCreateStep2";
import ThirdStep from "../components/GuestContract/ContractCreateStep3";

const Contract = () => {
  React.useEffect(() => {
    // Dynamically import Bootstrap CSS
    import("bootstrap/dist/css/bootstrap.min.css");
    import("../assets/css/mainStyle.css");
    import("../assets/css/contractGuestStyle.css");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const steps = [
    "Bước 1: Cung cấp thông tin khách hàng",
    "Bước 2: Chọn nội dung hợp đồng",
    "Bước 3: Xác nhận hợp đồng",
  ];

  const { currentStep, finalData } = useContext(multiStepContext);

  function showStep(step) {
    console.log(step);
    switch (step) {
      case 1:
        return <FirstStep />;
      case 2:
        return <SecondStep />;
      case 3:
        return <ThirdStep />;
      default:
    }
  }

  return (
    <section
      className="section section-divider white account-section pt-5"
      id="blog"
    >
      <div className="container" style={{ marginTop: "120px" }}>
        <div className="fs-4">
          <p className="section-subtitle fs-1 pt-2 pb-4 mb-0 text-center fw-bold">
            Tạo hợp đồng
          </p>
          <div className="center-stepper">
            <Box sx={{ width: "100%" }}>
              <Stepper
                activeStep={currentStep - 1}
                alternativeLabel
                sx={{
                  // Thay đổi kích thước của các phần tử trong Stepper
                  "& .MuiStepLabel-label": {
                    fontSize: "1.6rem", // Kích thước font chữ của label
                    fontWeight: "bold",
                  },
                  "& .MuiStepConnector-line": {
                    height: "5px", // Độ dày của đường nối
                  },
                  "& .MuiStepIcon-root": {
                    fontSize: "4rem", // Kích thước của biểu tượng bước
                  },
                }}
              >
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
          </div>
        </div>

        {showStep(currentStep)}
      </div>
    </section>
  );
};

export default Contract;
