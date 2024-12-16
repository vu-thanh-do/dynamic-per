import React, { useState, useEffect } from "react";
import { IoIosClose } from "react-icons/io";
import Select from "react-select";
import axios from "axios";
import { Button, Card, Col, Row } from "react-bootstrap";
import guestLocationApi from "../../api/guestLocationApi";
import Swal from "sweetalert2";

function LocationForm({ onClose, onAddLocation }) {
  const [provinces, setProvinces] = useState([]);

  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [name, setName] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [cost, setCost] = useState(0);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    axios
      .get("https://provinces.open-api.vn/api/?depth=3")
      .then((response) => {
        const provincesData = response.data.map((province) => ({
          value: province.code,
          label: province.name,
          districts: province.districts,
        }));
        setProvinces(provincesData);

        // Đặt giá trị mặc định cho tỉnh với code = 92
        const defaultProvince = provincesData.find((prov) => prov.value === 92);
        setSelectedProvince(defaultProvince || null);
      })
      .catch((error) => console.error("Error fetching provinces:", error));
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      const selectedProvinceData = provinces.find(
        (prov) => prov.value === selectedProvince.value
      );
      const districtsData = selectedProvinceData?.districts.map((district) => ({
        value: district.code,
        label: district.name,
        wards: district.wards,
      }));
      console.log("Data quận: ", selectedProvinceData);
      setDistricts(districtsData || []);
      setSelectedDistrict(null);
      setSelectedWard(null);
      setWards([]);
    }
  }, [selectedProvince, provinces]);

  useEffect(() => {
    if (selectedDistrict) {
      const selectedDistrictData = districts.find(
        (dist) => dist.value === selectedDistrict.value
      );
      const wardsData = selectedDistrictData?.wards.map((ward) => ({
        value: ward.code,
        label: ward.name,
      }));
      if (selectedDistrictData?.value === 916) setCost(0); //Ninh Kiều
      if (selectedDistrictData?.value === 919) setCost(150000); //Cái Răng
      if (selectedDistrictData?.value === 918) setCost(300000); //Bình Thủy
      if (selectedDistrictData?.value === 926) setCost(500000); //Phong Điền
      if (selectedDistrictData?.value === 927) setCost(500000); //Thới Lai
      if (selectedDistrictData?.value === 917) setCost(1000000); //Ô Môn
      if (selectedDistrictData?.value === 925) setCost(1100000); //Cờ đỏ
      if (selectedDistrictData?.value === 923) setCost(1200000); //Thốt Nốt
      if (selectedDistrictData?.value === 924) setCost(1500000); //Vĩnh Thạnh
      setWards(wardsData || []);
      setSelectedWard(null);
    }
  }, [selectedDistrict, districts]);

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Tên địa điểm không được để trống";
    if (!selectedProvince) newErrors.province = "Chọn tỉnh/thành phố";
    if (!selectedDistrict) newErrors.district = "Chọn quận/huyện";
    if (!selectedWard) newErrors.ward = "Chọn phường/xã";
    if (!houseNumber.trim())
      newErrors.houseNumber = "Số nhà không được để trống";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddLocation = async () => {
    if (!validateForm()) return;

    const address = `${houseNumber}, ${selectedWard.label}, ${selectedDistrict.label}, ${selectedProvince.label}`;
    const userId = JSON.parse(sessionStorage.getItem("currentUserId"));
    const data = {
      name,
      type: "cá nhân",
      address,
      cost: cost,
      userId: userId,
    };

    try {
      await guestLocationApi.addAsUser(data);
      onAddLocation();
      Swal.fire({
        icon: "success",
        title: "Thành công",
        text: "Thêm mới địa điểm thành công!",
        timer: 2000, // Tự động đóng sau 2 giây
        showConfirmButton: false,
      });
      onClose(); // Đóng form sau khi thêm mới thành công
    } catch (error) {
      console.error("Error adding location:", error);
      Swal.fire({
        icon: "error",
        title: "Thất bại",
        text: "Thêm địa điểm thất bại!",
        timer: 2000, // Tự động đóng sau 2 giây
      });
    }
  };

  return (
    <Card className="my-3 px-5 pb-3">
      <IoIosClose
        style={{ position: "relative", left: "100%", top: "-1px" }}
        size={24}
        cursor="pointer"
        onClick={onClose}
      />
      <h2 className="text-center">Thêm địa điểm riêng mới</h2>
      <label style={{ display: "inline-flex", alignItems: "center" }}>
        Tên địa điểm<span className="text-danger ms-1">*</span>
      </label>{" "}
      <input
        type="text"
        className="form-control fs-4"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      {errors.name && <div className="text-danger">{errors.name}</div>}
      <Row>
        <Col xs={6}>
          <label>Tỉnh/Thành phố</label>
          <Select
            options={provinces}
            value={selectedProvince}
            isDisabled // Vô hiệu hóa để không cho thay đổi
            maxMenuHeight="50vh"
            menuPortalTarget={document.body}
            menuPosition="fixed"
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          />
          {errors.province && (
            <div className="text-danger">{errors.province}</div>
          )}
        </Col>
        <Col xs={6}>
          <label style={{ display: "inline-flex", alignItems: "center" }}>
            Quận/Huyện<span className="text-danger ms-1">*</span>
          </label>
          <Select
            options={districts}
            value={selectedDistrict}
            onChange={(option) => setSelectedDistrict(option)}
            isClearable
            isDisabled={!selectedProvince}
            maxMenuHeight={150}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          />
          {errors.district && (
            <div className="text-danger">{errors.district}</div>
          )}
        </Col>
        <Col xs={6}>
          <label style={{ display: "inline-flex", alignItems: "center" }}>
            Phường/Xã <span className="text-danger ms-1">*</span>
          </label>
          <Select
            options={wards}
            value={selectedWard}
            onChange={(option) => setSelectedWard(option)}
            isClearable
            isDisabled={!selectedDistrict || wards.length === 0}
            maxMenuHeight={150}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          />
          {errors.ward && <div className="text-danger">{errors.ward}</div>}
        </Col>
        <Col xs={6}>
          <label style={{ display: "inline-flex", alignItems: "center" }}>
            Số nhà/Đường<span className="text-danger ms-1">*</span>
          </label>
          <input
            type="text"
            className="form-control fs-4"
            value={houseNumber}
            onChange={(e) => setHouseNumber(e.target.value)}
            style={{ height: "38px" }}
          />
          {errors.houseNumber && (
            <div className="text-danger">{errors.houseNumber}</div>
          )}
        </Col>
      </Row>
      <Row className="align-items-center justify-content-center mt-3">
        <Button
          className="btn-sua btn-hover mt-3"
          style={{ width: "15%" }}
          onClick={handleAddLocation}
        >
          Thêm mới
        </Button>
      </Row>
      <h4>Miễn phí vận chuyển nội ô Ninh Kiều!</h4>
    </Card>
  );
}

export default LocationForm;
