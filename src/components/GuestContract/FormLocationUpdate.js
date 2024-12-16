import React, { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";
import { Button, Card, Col, Row } from "react-bootstrap";
import { IoIosClose } from "react-icons/io";
import guestLocationApi from "../../api/guestLocationApi";
import Swal from "sweetalert2";

function FormUpdateLocation({ onClose, locationData, onUpdateLocation }) {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [name, setName] = useState(locationData.name || "");
  const [houseNumber, setHouseNumber] = useState("");
  const [cost, setCost] = useState(0);
  const [errors, setErrors] = useState({});

  // Lấy dữ liệu tỉnh, quận, phường từ API
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
  }, [locationData]);

  // Khi province được chọn, lấy các quận tương ứng
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
      setDistricts(districtsData || []);
      setSelectedDistrict(
        districtsData?.find(
          (dist) => dist.value === locationData.districtCode
        ) || null
      );
    }
  }, [selectedProvince, locationData, provinces]);

  // Khi district được chọn, lấy các phường tương ứng
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
      setSelectedWard(
        wardsData?.find((ward) => ward.value === locationData.wardCode) || null
      );
    }
  }, [selectedDistrict, locationData, districts]);

  // Tách địa chỉ và điền vào các trường input
  useEffect(() => {
    if (locationData.address) {
      const addressParts = locationData.address.split(", ");
      if (addressParts.length >= 4) {
        setHouseNumber(addressParts[0]); // Số nhà/Đường
      }
    }
  }, [locationData]);

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

  const handleUpdateLocation = async () => {
    if (!validateForm()) return;

    const address = `${houseNumber}, ${selectedWard.label}, ${selectedDistrict.label}, ${selectedProvince.label}`;
    const id = locationData.locationId;
    const data = {
      name,
      type: locationData.type,
      address: address,
      capacity: 0,
      table: 0,
      cost: cost,
      description: 0,
      status: locationData.status,
    };
    // Thêm console.log để kiểm tra dữ liệu gửi đi
    console.log("Dữ liệu gửi đi:", data);
    try {
      await guestLocationApi.update(data, id); // Cập nhật API với ID và dữ liệu
      onUpdateLocation();
      Swal.fire({
        icon: "success",
        title: "Thành công",
        text: "Cập nhật địa điểm thành công!",
        timer: 2000,
        showConfirmButton: false,
      });
      onClose();
    } catch (error) {
      console.error("Error updating location:", error);
      Swal.fire({
        icon: "error",
        title: "Thất bại",
        text: "Cập nhật địa điểm thất bại!",
        timer: 2000,
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
      <h2 className="text-center">Cập nhật địa điểm</h2>
      <label>Tên địa điểm</label>
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
            onChange={(option) => setSelectedProvince(option)}
            isClearable
            isDisabled
            maxMenuHeight="50vh"
            menuPortalTarget={document.body}
            menuPosition="fixed"
            styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
          />
        </Col>
        <Col xs={6}>
          <label>Quận/Huyện</label>
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
        </Col>
        <Col xs={6}>
          <label>Phường/Xã</label>
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
        </Col>
        <Col xs={6}>
          <label>Số nhà/Đường</label>
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
      <div className="d-flex justify-content-center">
        <Button
          onClick={handleUpdateLocation}
          style={{ width: "12%" }}
          className="btn-sua btn-hover mt-4"
        >
          Cập nhật
        </Button>
      </div>
      <h4>Miễn phí vận chuyển nội ô Ninh Kiều!</h4>
    </Card>
  );
}

export default FormUpdateLocation;
