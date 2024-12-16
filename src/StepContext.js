import React, { useState } from "react";
import GuestContract from "./views/Guest-Contract";
import guestContractApi from "./api/guestContractApi";
import axiosClient from "config/axiosClient";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import eventApi from "api/eventApi";
import guestEventServiceApi from "api/guestEventServicesApi";
import menudishApi from "api/menudishApi";
import ContractInfo from "components/GuestContract/GuestContractInfo";

export const multiStepContext = React.createContext();
const StepContext = () => {
  const [currentStep, setStep] = useState(1);
  var [contractData, setContractData] = useState([]);
  const [tempData, setTempData] = useState("");
  const [tempServicesData, setTempServicesData] = useState([]);

  var [userData, setUserData] = useState({});
  var [menuData, setMenuData] = useState({});
  var [menuDishesData, setMenuDishesData] = useState([]);
  var [eventData, setEventData] = useState([]);
  var [eventServicesData, setEventServicesData] = useState([]);

  const currentUserId = localStorage.getItem("userId"); // Parse chuỗi JSON thành đối tượng

  const [contractInfoUrl, setContractInfoUrl] = React.useState("");
  const navigate = useNavigate();

  React.useEffect(() => {
    if (contractInfoUrl) {
      navigate(contractInfoUrl);
    }
  }, [contractInfoUrl, navigate]);

  const submitData = async () => {
    try {
      // Bước 1: Thêm event
      const eventRespone = await eventApi.addAsUser(eventData);
      console.log("Event đã tạo thành công:", eventRespone.data);
      setEventData(null);
    } catch (error) {
      console.error("Lỗi khi tạo Event:", error);
      return; // Ngừng nếu có lỗi
    }

    let eventId;
    try {
      // Bước 2: Lấy eventId mới tạo
      const latestEventResponse = await axiosClient.get(
        `https://62c6-2001-ee0-5722-4dc0-a8e7-eaeb-2e68-34e5.ngrok-free.app/obbm/event/latestEvent/${currentUserId}`
      );
      eventId = latestEventResponse?.result?.eventId;
      console.log("Event Id lấy được: ", eventId);
      // Thêm độ trễ 1 giây
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Lỗi khi lấy event Id:", error);
      return; // Ngừng nếu có lỗi
    }
    const menuDataWithEventId = { ...menuData, eventId };
    const updatedEventServicesData = eventServicesData.map((service) => ({
      ...service,
      eventId,
    }));

    try {
      // Bước 3: Thêm eventServices
      const eventServicesResponse =
        await guestEventServiceApi.saveAllEventServices(
          updatedEventServicesData
        );
      console.log(
        "Event Services đã tạo thành công:",
        eventServicesResponse.data
      );
      setEventServicesData(null);
    } catch (error) {
      console.error("Lỗi khi tạo Event Services:", error);
      return; // Ngừng nếu có lỗi
    }

    try {
      // Bước 4: Thêm menu
      const menuResponse = await guestContractApi.addMenuAsUser(
        menuDataWithEventId
      );
      console.log("Menu đã tạo thành công:", menuResponse.data);
      setMenuData(null);
    } catch (error) {
      console.error("Lỗi khi tạo Menu:", error);
      return; // Ngừng nếu có lỗi
    }

    let menuId;
    try {
      // Bước 5: Lấy menuId mới tạo
      const latestMenuResponse = await axiosClient.get(
        `https://62c6-2001-ee0-5722-4dc0-a8e7-eaeb-2e68-34e5.ngrok-free.app/obbm/menu/latestMenu/${currentUserId}`
      );
      menuId = latestMenuResponse?.result?.menuId;
      console.log("Menu Id lấy được: ", menuId);

      // Thêm độ trễ 1 giây
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Lỗi khi lấy Menu Id:", error);
      return; // Ngừng nếu có lỗi
    }
    const contractDataWithMenuIdEventId = { ...contractData, menuId, eventId };
    const updatedMenuDishesData = menuDishesData.map((menuDishes) => ({
      ...menuDishes,
      menuId,
    }));

    try {
      // Bước 6: Thêm menuDishes
      const menuDishesResponse = await menudishApi.saveAllDish(
        updatedMenuDishesData
      );
      console.log("Menu Dishes đã tạo thành công:", menuDishesResponse.data);
      setMenuDishesData(null);
    } catch (error) {
      console.error("Lỗi khi tạo Menu Dishes:", error);
      return; // Ngừng nếu có lỗi
    }

    try {
      // Bước 7: Tạo một biến mới contractDataWithMenuId để chứa contractData đã cập nhật với menuId
      const contractResponse = await guestContractApi.add(
        contractDataWithMenuIdEventId
      );
      console.log("Hợp đồng đã tạo thành công:", contractResponse.data);

      // Thêm độ trễ 2 giây
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Lỗi khi tạo hợp đồng:", error);
      console.log("Hợp đồng gửi đi:", contractDataWithMenuIdEventId);
      return; // Ngừng nếu có lỗi
    }

    let contractId;
    try {
      // Bước 8: Lấy contractId
      const latestContractResponse = await axiosClient.get(
        `https://62c6-2001-ee0-5722-4dc0-a8e7-eaeb-2e68-34e5.ngrok-free.app/obbm/contract/latestContract/${currentUserId}`
      );
      contractId = latestContractResponse?.result?.contractId;

      if (!contractId) {
        console.error("Contract ID không tồn tại trong response.");
        return;
      }

      Swal.fire({
        icon: "success",
        title: "Thành công",
        text: "Tạo hợp đồng thành công! Vui lòng chú ý OBBM sẽ liên lạc với bạn trong vòng 12 tiếng",
        timer: 8000, // Tự động đóng sau 8 giây
        showConfirmButton: true,
      });

      console.log("Contract ID lấy được: ", contractId);
      setInfoUrl(contractId); // Chuyển hướng URL với contractId
    } catch (error) {
      console.error("Lỗi khi lấy Contract ID:", error);
    }
  };

  const setInfoUrl = (contractId) => {
    setContractInfoUrl(`info/${contractId}`);
  };

  return (
    <div>
      <multiStepContext.Provider
        value={{
          currentStep,
          setStep,
          contractData,
          setContractData,
          tempData,
          setTempData,
          userData,
          setUserData,
          menuData,
          setMenuData,
          menuDishesData,
          setMenuDishesData,
          submitData,
          eventServicesData,
          setEventServicesData,
          tempServicesData,
          setTempServicesData,
          eventData,
          setEventData,
        }}
      >
        <GuestContract />
      </multiStepContext.Provider>
    </div>
  );
};

export default StepContext;
