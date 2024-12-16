import React from "react";
import PacmanLoader from "react-spinners/ClipLoader";
import "../assets/css/loadingPage.css"; // Import CSS cho hiệu ứng loading

const LoadingPage = () => {
  return (
    <div className="loading-overlay">
      <PacmanLoader className="spinner" color="var(--dark-orange)" size={60} />
    </div>
  );
};

export default LoadingPage;