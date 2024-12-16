import React, { useState, useEffect } from "react";

import danhMucApi from "api/danhMucApi";
import { FaPlus, FaEye, FaTimes } from "react-icons/fa";
import AudioRecorderWithAPI from "components/GuestContract/SpeechToTextInput";

const ListFood = ({ categoryId, show, closeListFood, onAddDish }) => {
  const [categories, setCategories] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);

  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = React.useState([]);

  useEffect(() => {
    const fetchDanhMuc = async () => {
      try {
        const response = await fetch(
          "https://62c6-2001-ee0-5722-4dc0-a8e7-eaeb-2e68-34e5.ngrok-free.app/obbm/category?page=1&size=5"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json(); // Chuyển đổi kết quả thành JSON
        setCategories(data.result.content); // Cập nhật state
      } catch (error) {
        console.error("Lỗi khi gọi API:", error); // Xử lý lỗi
      }
    };
    fetchDanhMuc();
    console.log("Cate đã lọc:", filteredCategories);
  }, []);

  const filteredCategories = categories.filter(
    (category) =>
      category.categoryId === categoryId || // Đổ dữ liệu theo categoryId hiện tại
      (categoryId === 1 && category.categoryId === 4) // Nếu categoryId là 1, thêm cả categoryId = 4
  );
  
  
  const handleSearch = (value) => {
    setIsSearching(true);
    if (!value.trim()) {
      setIsSearching(false); // Nếu chuỗi rỗng, quay về danh sách gốc
      return;
    }
    const listDishes = filteredCategories[0].listDish;
    const results = listDishes?.filter((list) =>
      list?.name?.toLowerCase().includes(value.toLowerCase())
    );
    setSearchResults(results);
    console.log("result mảng tìm kiếm:", results);
  };

  const categoriesToDisplay = isSearching ? searchResults : filteredCategories;

  const handleViewDetails = (dish) => {
    setSelectedDish(dish);
    setShowPopup(true);
  };

  return (
    <div
      className={`list-food-container ${
        show ? "list-food-enter" : "list-food-exit"
      }`}
    >
      <div className="listfood-header">
        <h1>Danh mục món ăn</h1>
        <div className="action-buttons">
          
          <AudioRecorderWithAPI
            onSearch={handleSearch}
            visibleSearchButton="none"
          />
          <button className="filter-button btn btn-save-form d-flex align-items-center me-5 mb-2 btn btn-hover" style={{width:"80px"}}>
            Lọc
          </button>
          <button className="sort-button btn btn-save-form d-flex align-items-center me-5 mb-2 btn btn-hover" style={{width:"130px"}}>
            Sắp xếp
          </button>
          {/* Nút đóng ListFood */}
          <button className="add-button" onClick={closeListFood} style={{marginLeft:"20px"}}>
          <FaTimes style={{color:"red"}} /> {/* X icon for "Remove" */}
          </button>
        </div>
      </div>

      {filteredCategories.map((category) => (
        <div
          key={category.categoryId}
          className="listfood-category"
          style={{ marginTop: "70px" }}
        >
          <h3>{category.description}</h3>
          <ul className="foodList">
            {isSearching === false ? (
              category.listDish.length > 0 ? (
                category.listDish.map((dish, index) => (
                  <li key={index} className="food-item">
                    <div className="food-details">
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className="food-image"
                      />
                      <span className="food-name">{dish.name}</span>
                      <span className="food-price">
                        {/* {dish.price.toLocaleString()} VND */}
                      </span>
                    </div>
                    <button
                      className="btn btn-save-form d-flex align-items-center me-5 mb-2 btn btn-hover create-menu listfood-button-add"
                      title="Thêm"
                      onClick={() => onAddDish(dish)}
                    >
                      <FaPlus /> {/* Plus icon for "Add" */}
                    </button>
                    <button
                      className="btn btn-save-form d-flex align-items-center me-5 mb-2 btn btn-hover create-menu listfood-button-view"
                      onClick={() => handleViewDetails(dish)}
                      title="Xem Chi Tiết"
                    >
                      <FaEye /> {/* Eye icon for "View Details" */}
                    </button>
                  </li>
                ))
              ) : (
                <p>Không có món ăn trong danh mục này.</p>
              )
            ) : searchResults.length > 0 ? (
              searchResults.map((dish, index) => (
                <li key={index} className="food-item">
                  <div className="food-details">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="food-image"
                    />
                    <span className="food-name">{dish.name}</span>
                    <span className="food-price">
                      {/* {dish.price.toLocaleString()} VND */}
                    </span>
                  </div>
                  <button
                    className="btn btn-save-form d-flex align-items-center me-5 mb-2 btn btn-hover create-menu listfood-button-add"
                    title="Thêm"
                    onClick={() => onAddDish(dish)}
                  >
                    <FaPlus /> {/* Plus icon for "Add" */}
                  </button>
                  <button
                    className="btn btn-save-form d-flex align-items-center me-5 mb-2 btn btn-hover create-menu listfood-button-view"
                    onClick={() => handleViewDetails(dish)}
                    title="Xem Chi Tiết"
                  >
                    <FaEye /> {/* Eye icon for "View Details" */}
                  </button>
                </li>
              ))
            ) : (
              <p>Không có món ăn trong danh mục này.</p>
            )}
          </ul>
        </div>
      ))}

      {showPopup && selectedDish && (
        <div className="modal" onClick={() => setShowPopup(false)}>
          <div
            className="modal-listfood-content"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="close" onClick={() => setShowPopup(false)}>
              <FaTimes style={{ color: "red" }} /> {/* X icon for "Remove" */}
            </span>
            <h2>{selectedDish.name}</h2>
            <img
              src={selectedDish.image}
              alt={selectedDish.name}
              className="food-image-large"
            />
            <p>Giá: {selectedDish.price.toLocaleString()} VND</p>
            <p>Mô tả: {selectedDish.description}</p>
            {/* Các thông tin chi tiết khác của món ăn */}
          </div>
        </div>
      )}
    </div>
  );
};

export default ListFood;
