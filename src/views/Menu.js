import React, { useState, useEffect, useRef } from "react";
import "../assets/css/menu.css";
import "../assets/css/listFood.css";
import "../assets/css/swipermenu.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ListFood from "../components/Menu/listfood";
import menuApi from "../api/menuApi.js";
import axios from "axios";
import eventApi from "../api/eventApi.js";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Modal, Button } from "react-bootstrap";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { EffectCoverflow, Pagination, Navigation } from "swiper/modules";
import { FaMinus, FaPlus, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import AddButton from "../assets/images/add.png";

const Menu = ({ accessToken }) => {
  const scrollableRefs = useRef([]);
  const listRef = useRef(null);
  const [showListFood, setShowListFood] = useState(false); // Kiểm soát hiển thị ListFood
  const categoriesOrder = ["Appetizers", "Main_Courses", "Desserts"];
  const [menuDishesDetails, setMenuDishesDetails] = useState([]);
  const [latestMenuId, setLatestMenuId] = useState(0);
  const [selectedId, setSelectedId] = useState(null); // Lưu sectionId
  const [menuList, setMenuList] = useState([]);
  const [selectedDishes, setSelectedDishes] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [selectedMenuDishes, setSelectedMenuDishes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [Events, setEvents] = useState([]);
  const navigate = useNavigate();
  const [EventToMenuUrl, setEventToMenuUrl] = React.useState("");
  const location = useLocation();
  const [isModalEventsOpen, setIsModalEventsOpen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [userDetails, setUserDetails] = useState({});
  const [isStatus, setIsStatus] = useState(true);
  const getUserDetails = async (accessToken) => {
    try {
      const response = await fetch(`https://62c6-2001-ee0-5722-4dc0-a8e7-eaeb-2e68-34e5.ngrok-free.app/obbm/users/myInfo`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      console.log("myInfo", data); // Kiểm tra dữ liệu trả về

      if (data && data.result) {
        setUserDetails(data.result);

        // Kiểm tra trạng thái isStatus, nếu là false thì hiển thị cảnh báo
        const isStatusActive = data.result.isStatus;

        if (isStatusActive === false) {
          setShowWarning(true); // Hiển thị cảnh báo nếu isStatus là false
        } else {
          setShowWarning(false); // Ẩn cảnh báo nếu isStatus là true
        }
        setIsStatus(isStatusActive);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập từ localStorage
    const userId = localStorage.getItem("userId");
    const accessToken = localStorage.getItem("accessToken"); // Lấy token từ localStorage

    if (accessToken) {
      getUserDetails(accessToken); // Lấy thông tin người dùng
    }
  }, []);
  // Gọi API khi component được render lần đầu

  const handleOpenModalEvents = () => {
    setIsModalEventsOpen(true);
  };
  const handleCloseModalEvents = () => {
    setIsModalEventsOpen(false);
  };
  const setMenuIdUrl = (eventId) => {
    setEventToMenuUrl(`menu/${eventId}`);
    // Lưu eventId vào localStorage
    localStorage.setItem("currentEventId", eventId);
  };
  const pushEventIdtoMenu = (newEventId) => {
    // Lưu eventId vào localStorage
    localStorage.setItem("currentEventId", newEventId);

    // Điều hướng đến trang menu mới với eventId
    navigate(`/menu/${newEventId}`);
  };

  const fetchEvent = async () => {
    try {
      const response = await fetch(
        "https://62c6-2001-ee0-5722-4dc0-a8e7-eaeb-2e68-34e5.ngrok-free.app/obbm/event?page=1&size=100"
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json(); // Chuyển đổi kết quả thành JSON
      setEvents(data.result.content); // Cập nhật state
    } catch (error) {
      console.error("Lỗi khi gọi API:", error); // Xử lý lỗi
    }
  };

  React.useEffect(() => {
    if (EventToMenuUrl) {
      navigate(EventToMenuUrl);
    }
  }, [EventToMenuUrl, navigate]);
  const { id } = useParams();
  const [menu, setMenu] = useState([]);

  const handleShowMenuPopup = (menu) => {

    setShowModal(true); // Hiển thị modal
  };
  const handleCloseModal = () => setShowModal(false);

  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(null);

  const handleSelectMenu = (menu) => {
    const userId = localStorage.getItem("userId");


    if (!isStatus) {
      Swal.fire({
        icon: "warning",
        title: "Cập nhật đầy đủ thông tin",
        text: "Bạn cần Cập nhật đầy đủ thông tin để có thể chọn thực đơn.",
        showCancelButton: true,
        confirmButtonText: "Cập nhật ngay",
        cancelButtonText: "Hủy",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "/account";
        }
      });
      return;
    }
    // Nếu không tìm thấy userId trong local, hiển thị cảnh báo
    if (!userId) {
      Swal.fire({
        icon: "warning",
        title: "Chưa đăng nhập",
        text: "Bạn cần đăng nhập để chọn tạo thực đơn.",
        showCancelButton: true,
        confirmButtonText: "Đăng nhập ngay",
        cancelButtonText: "Hủy",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "/login";
        }
      });
      return; // Dừng hàm nếu không có userId
    }

    // Nếu có userId, tiếp tục thực hiện hành động
    setSelectedMenu(menu);
    const latestMenuId =
      menuList && menuList.length > 0
        ? Math.max(...menuList.map((menu) => menu.menuId), 0)
        : 0;

    const menuDishesList = menu.listMenuDish.map((menuDishes) => {
      return {
        dishesId: menuDishes?.dishes?.dishId,
        quantity: 1,
        price: menuDishes.dishes?.price,
        menuId: null,
      };
    });

    console.log("dữ liệu menu", menu);
    setSelectedMenuDishes(menuDishesList);
  };

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch(
          "https://62c6-2001-ee0-5722-4dc0-a8e7-eaeb-2e68-34e5.ngrok-free.app/obbm/menu/getAllMenuAdmin?page=1&size=10000000"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json(); // Chuyển đổi kết quả thành JSON
        const menuData = data.result.content; // Lấy dữ liệu menu từ API

        // console.log("Menu Data from API:", menuData);

        if (id) {
          const filteredMenuData = menuData.filter(
            (menu) => menu.events.eventId === parseInt(id, 10)
          );

          // console.log("Filtered Menu Data:", filteredMenuData);
          setMenu(filteredMenuData); // Cập nhật state với menu đã lọc
        }

        if (!id && location.pathname === "/menu") {
          handleOpenModalEvents(); // Mở modal nếu không có id và đang ở trang "/menu"
        }
      } catch (error) {
        console.error("Lỗi khi gọi API:", error); // Xử lý lỗi
      }
    };

    fetchEvent();
    fetchMenu();

    const latestMenuId =
      menuList && menuList.length > 0
        ? Math.max(...menuList.map((menu) => menu.menuId), 0)
        : 0;

    // console.log("selectedMenu Menu Data:", selectedMenu);
  }, [id, location]);

  useEffect(() => {
    // console.log("Current Path:", location.pathname);
    // console.log("ID:", id);
    if (!id && location.pathname === "/menu") {
      handleOpenModalEvents();
    }
  }, [id, location]);

  const groupedMenu = menu.reduce((acc, category) => {
    const groupedDishes = category.listMenuDish.reduce((dishAcc, menuDish) => {
      const categoryName = menuDish.dishes.categories.name;

      // Bỏ qua món ăn nếu deletedAt không phải null
      if (menuDish.dishes.deletedAt !== null) {
        return dishAcc;
      }

      if (!dishAcc[categoryName]) {
        dishAcc[categoryName] = [];
      }

      dishAcc[categoryName].push(menuDish.dishes);

      return dishAcc;
    }, {});
    
    acc[category.menuId] = {
      ...category,
      groupedDishes,
    };

    return acc;
  }, {});

  const groupedMenuArray = Object.values(groupedMenu);

  const handleCreateMenu = async () => {
    try {
      const userId = localStorage.getItem("userId");

      // Kiểm tra trạng thái isStatus
      if (userDetails && userDetails.isStatus === false) {
        Swal.fire({
          icon: "error",
          title: "Không thể tạo thực đơn",
          text: "Tài khoản của bạn chưa được kích hoạt. Vui lòng liên hệ hỗ trợ.",
        });
        return; // Dừng quá trình tạo menu
      }

      const profitMargin = 0.2;
      const totalCost = Object.values(selectedMenu.groupedDishes)
        .flat()
        .reduce((total, dish) => {
          const sellingPrice = dish.price / (1 - profitMargin);
          return total + (sellingPrice || 0);
        }, 0);

      const uniqueDishes = selectedMenuDishes.reduce((acc, currentDish) => {
        if (!acc.some((dish) => dish.dishesId === currentDish.dishesId)) {
          acc.push(currentDish);
        }
        return acc;
      }, []);

      if (uniqueDishes.length === 0) {
        Swal.fire({
          icon: "error",
          title: "Thất bại!",
          text: "Thực đơn phải có ít nhất 1 món ăn.",
        });
        return;
      }
      const currentEventId = localStorage.getItem("currentEventId"); // Lấy giá trị eventId từ localStorage
      const dataToSave = {
        name: selectedMenu.name,
        totalcost: totalCost,
        description: selectedMenu.description,
        userId: userId || "guest",
        eventId: currentEventId || selectedMenu.events.eventId, // Nếu không có currentEventId trong session, dùng eventId từ selectedMenu
      };

      // Lưu dữ liệu vào localStorage
      localStorage.setItem("createdMenu", JSON.stringify(dataToSave));
      localStorage.setItem("createdMenuDishes", JSON.stringify(uniqueDishes));
      localStorage.setItem(
        "MenuDishesDetail",
        JSON.stringify(selectedMenu.groupedDishes)
      );

      if (!userId) {
        Swal.fire({
          icon: "warning",
          title: "Chưa đăng nhập",
          text: "Bạn cần đăng nhập để hoàn tất tạo thực đơn.",
          showCancelButton: true,
          confirmButtonText: "Đăng nhập ngay",
          cancelButtonText: "Hủy",
          reverseButtons: true,
        }).then((result) => {
          if (result.isConfirmed) {
            localStorage.setItem("createdMenu", JSON.stringify(dataToSave));
            window.location.href = "/login";
          }
        });
      } else {
        Swal.fire({
          icon: "success",
          title: "Thành công!",
          text: "Thực đơn và món ăn đã được tạo thành công!",
        });
        navigate("/contract");
      }
    } catch (error) {
      console.error("Lỗi khi tạo thực đơn hoặc món ăn:", error);
      Swal.fire({
        icon: "error",
        title: "Thất bại!",
        text: "Không thể tạo thực đơn hoặc món ăn. Vui lòng thử lại.",
      });
    }
  };

  const toggleListFood = (id) => {
    setSelectedId(id);
    setShowListFood(true);
  };

  const closeListFood = () => {
    setShowListFood(false);
  };

  const handleAddDish = (dish) => {
    // Kiểm tra xem món ăn đã tồn tại trong selectedMenuDishes hay chưa
    const isDishExists = selectedMenuDishes.some(
      (existingDish) => existingDish.dishesId === dish.dishId
    );

    if (isDishExists) {
      // Hiển thị thông báo món ăn đã tồn tại
      Swal.fire({
        icon: "info",
        title: "Món ăn đã tồn tại",
        text: `Món "${dish.name}" đã có trong danh sách!`,
      });
      return; // Kết thúc hàm nếu món ăn đã tồn tại
    }

    // Nếu chưa tồn tại, tiến hành thêm món
    setSelectedMenu((prevMenu) => {
      const categoryName = dish.categories.name; // Lấy tên category từ dish
      const updatedGroupedDishes = { ...prevMenu.groupedDishes };

      // Nếu category chưa tồn tại, tạo mảng mới
      if (!updatedGroupedDishes[categoryName]) {
        updatedGroupedDishes[categoryName] = [];
      }

      // Thêm món ăn vào category
      updatedGroupedDishes[categoryName] = [
        ...updatedGroupedDishes[categoryName],
        dish,
      ];

      // Cập nhật selectedMenuDishes với món ăn mới
      setSelectedMenuDishes((prevDishes) => [
        ...prevDishes,
        {
          dishesId: dish.dishId,
          quantity: 1, // Hoặc lấy giá trị quantity từ đâu đó nếu cần
          price: dish.price,
          menuId: null,
        },
      ]);
      setMenuDishesDetails((prevDetails) => {
        const updatedDetails = [
          ...prevDetails,
          {
            dishes: {
              ...dish, // Lưu tất cả thông tin chi tiết của món ăn
              categories: dish.categories, // Lưu thông tin categories của món ăn
              existing: "Còn hàng", // Thêm trạng thái của món ăn
            },
            menudishId: Date.now(), // Hoặc ID thực đơn nếu cần
          },
        ];

        return updatedDetails;
      });
      console.log(menuDishesDetails);
      return {
        ...prevMenu,
        groupedDishes: updatedGroupedDishes,
      };
    });

    setSelectedMenuDishes((prevDishes) => {
      // Thêm món mới vào danh sách
      const updatedDishesList = [
        ...prevDishes,
        {
          dishesId: dish.dishId,
          quantity: 1,
          price: dish.price,
          menuId: null,
        },
      ];

      // Loại bỏ các món trùng lặp dựa trên dishId
      const uniqueDishes = updatedDishesList.reduce((acc, currentDish) => {
        if (!acc.some((dish) => dish.dishesId === currentDish.dishesId)) {
          acc.push(currentDish);
        }
        return acc;
      }, []);

      return uniqueDishes; // Cập nhật lại danh sách không trùng lặp
    });
  };

  const handleRefreshMenu = () => {
    setSelectedMenu(null); // Reset the menu
  };

  const handleRemoveDish = (categoryName, dishId) => {
    setSelectedMenu((prevMenu) => {
      const updatedGroupedDishes = { ...prevMenu.groupedDishes };

      // Lọc bỏ món ăn với dishId tương ứng
      updatedGroupedDishes[categoryName] = updatedGroupedDishes[
        categoryName
      ].filter((dish) => dish.dishId !== dishId);

      // Cập nhật selectedMenuDishes để xóa món ăn khỏi danh sách
      setSelectedMenuDishes((prevDishes) => {
        // Lọc bỏ món ăn từ danh sách selectedMenuDishes theo dishId
        const updatedDishesList = prevDishes.filter(
          (dish) => dish.dishesId !== dishId
        );
        return updatedDishesList; // Trả về danh sách đã cập nhật
      });

      return {
        ...prevMenu,
        groupedDishes: updatedGroupedDishes,
      };
    });
  };
  // Scroll function for left and right buttons
  const handleScroll = (direction, categoryName) => {
    // Cập nhật lại selector của .promo-list
    const listContainer = document.querySelector(`.promo-list.${categoryName}`);

    // Kiểm tra xem listContainer có tồn tại không
    if (!listContainer) return;

    // Lấy tất cả các mục li trong listContainer
    const listItems = listContainer.querySelectorAll("li");

    // Kiểm tra nếu không có mục nào, trả về luôn
    if (listItems.length === 0) return;

    // Lấy chiều rộng của listContainer (ul)
    const listWidth = listContainer.offsetWidth;
    const itemWidth = listItems[0]?.offsetWidth || 0; // Chiều rộng mỗi item

    const scrollAmount = listWidth / 3; // Cuộn theo 33% chiều rộng của ul

    // Kiểm tra chiều rộng của listItems để đảm bảo cuộn hoạt động
    if (itemWidth === 0) return;

    // Cuộn theo hướng trái hoặc phải
    if (direction === "left") {
      listContainer.scrollLeft -= scrollAmount; // Cuộn sang trái
    } else if (direction === "right") {
      listContainer.scrollLeft += scrollAmount; // Cuộn sang phải
    }
    // Thêm điều kiện để dừng khi đạt đến đầu/cuối của danh sách
    if (listContainer.scrollLeft <= 0 && direction === "left") {
      return; // Dừng nếu đang ở đầu
    }

    if (
      listContainer.scrollLeft + listWidth >= listContainer.scrollWidth &&
      direction === "right"
    ) {
      return; // Dừng nếu đang ở cuối
    }
  };

  let swiperRef = null;

  groupedMenuArray.filter(
    (category) => Object.values(category.groupedDishes).flat().length >= 9
  );

  return (
    <div className="Menu">
      <div className="menu-container">
        <div className="menu-left">
          <div className="tabs">
            {/* <button
            className={`tab btn-save-form ${
              activeTab === "tab1" ? "active" : ""
            }`}
            onClick={() => setActiveTab("tab1")}>
            Top menu
          </button> */}
            {/* <button
            className={`tab btn-save-form ${
              activeTab === "tab2" ? "active" : ""
            }`}
            onClick={() => setActiveTab("tab2")}>
            Chat Suggestion
          </button> */}
          </div>
          <div className="tab-content">
            <div>
              <div className="container">
                <h3
                  className="heading"
                  style={{ fontSize: "25px", color: "#191919" }}
                >
                  Thực đơn gợi ý
                </h3>
                <Swiper
                  effect={"coverflow"}
                  grabCursor={true}
                  centeredSlides={true}
                  loop={groupedMenuArray.length > 1}
                  slidesPerView={"auto"}
                  coverflowEffect={{
                    rotate: 0,
                    stretch: 0,
                    depth: 100,
                    modifier: 2.5,
                  }}
                  pagination={{ el: ".swiper-pagination", clickable: true }}
                  navigation={{
                    nextEl: ".swiper-button-next",
                    prevEl: ".swiper-button-prev",
                  }}
                  modules={[EffectCoverflow, Pagination, Navigation]}
                  className="swiper-container"
                >
                  {groupedMenuArray
                    .filter(
                      (category) =>
                        Object.values(category.groupedDishes).flat().length >= 9 // Chỉ lấy các menu có >= 9 món
                    )
                    .map((category, index) => (
                      <SwiperSlide
                        key={index}
                        onClick={() => handleSelectMenu(category)}
                      >
                        <div className="food-category">
                          <h4 style={{ textAlign: "center" }}>
                            {category.name}
                          </h4>

                          {/* Sắp xếp lại các món ăn theo thứ tự trong categoriesOrder */}
                          {categoriesOrder.map(
                            (categoryName) =>
                              category.groupedDishes[categoryName] && (
                                <div
                                  key={categoryName}
                                  className="menu-category"
                                >
                                  <h6>
                                    {categoryName === "Appetizers"
                                      ? "Khai vị và thức uống"
                                      : categoryName === "Main_Courses"
                                      ? "Món chính"
                                      : categoryName === "Desserts"
                                      ? "Tráng miệng"
                                      : categoryName}
                                  </h6>

                                  <div className="menu-category-dish">
                                    <ul
                                      className="promo-list has-scrollbar"
                                      style={{ paddingTop: "10px" }}
                                    >
                                      {category.groupedDishes[categoryName].map(
                                        (dish, index) => (
                                          <li
                                            key={index}
                                            style={{ width: "77px" }}
                                          >
                                            <img
                                              src={dish.image}
                                              alt={dish.name}
                                              style={{
                                                width: "63px",
                                                height: "50px",
                                                marginLeft: "7px",
                                              }}
                                            />
                                            <p
                                              style={{
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                                textAlign: "center",
                                                fontWeight: "bold",
                                                marginTop: "5px",
                                              }}
                                            >
                                              {dish.name}
                                            </p>
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                </div>
                              )
                          )}

                          <div
                            style={{
                              textAlign: "center",
                              fontWeight: "bold",
                              paddingTop: "10px",
                            }}
                          >
                            <p style={{ color: "rgb(66 66 66)" }}>
                              Giá tiền:{" "}
                              {Object.values(category.groupedDishes)
                                .flat()
                                .reduce((total, dish) => {
                                  const profitMargin = 0.2;
                                  const sellingPrice =
                                    dish.price / (1 - profitMargin);
                                  return total + (sellingPrice || 0);
                                }, 0)
                                .toLocaleString()}{" "}
                              VND/người
                            </p>
                          </div>
                        </div>
                      </SwiperSlide>
                    ))}

                  <div className="slider-controler">
                    <div className="swiper-button-prev slider-arrow">
                      <ion-icon name="arrow-back-outline"></ion-icon>
                    </div>
                    <div className="swiper-button-next slider-arrow">
                      <ion-icon name="arrow-forward-outline"></ion-icon>
                    </div>
                  </div>
                </Swiper>

                <div
                  className="choose-button-container"
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <p style={{ marginLeft: "5px",marginTop:"25px", fontWeight:"600px", color:"black" }}><span style={{color:"red", display:"inline"}}>* </span> Lưu ý: Lưu ý!</p>
                  <button
                    className="btn btn-save-form d-flex align-items-center me-5 mb-2 btn btn-hover create-menu"
                    onClick={handleOpenModalEvents}
                    style={{
                      marginRight: "0px",
                      marginTop: "0px",
                      marginBottom: "20px",
                    }}
                  >
                    <p>Đổi sự kiện</p>
                  </button>
                </div>
              </div>

              <Modal
                show={isModalEventsOpen}
                onHide={handleCloseModalEvents}
                className="Modal-events"
                style={{ maxH: "75%" }}
              >
                <section
                  className="section section-divider white promo"
                  id="events"
                  style={{
                    paddingTop: "20px",
                    paddingBottom: "30px",
                    marginTop: "50px",
                    width: "100%",
                  }}
                >
                  <button
                    className="add-button"
                    onClick={handleCloseModalEvents}
                    style={{ color: "hsl(32, 100%, 59%)" }}
                  >
                    x
                  </button>
                  <h2 style={{ textAlign: "center" }}>Sự kiện</h2>

                  <div
                    className=""
                    style={{ marginLeft: "30px", marginRight: "30px" }}
                  >
                    <ul className="promo-list has-scrollbar">
                      {Events.reverse().map((event) => (
                        <li
                          key={event.eventId}
                          className="promo-item"
                          style={{ width: "285px", height: "443px" }}
                        >
                          <button
                            onClick={() => {
                              pushEventIdtoMenu(event.eventId); // Gọi hàm để lưu eventId vào URL
                              handleCloseModalEvents(); // Đóng modal ngay sau khi chọn sự kiện
                            }}
                          >
                            <div
                              className="promo-card"
                              style={{ width: "285px", height: "443px" }}
                            >
                              <div className="card-icon">
                                {/* Add any specific icons or elements here if needed */}
                              </div>

                              <h3 className="h3 card-title">{event.name}</h3>

                              <p
                                className="card-text"
                                style={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  textAlign: "center",
                                }}
                              >
                                {event.description}
                              </p>

                              <img
                                src={event.image}
                                width="300"
                                height="300"
                                loading="lazy"
                                alt={event.name}
                                className="w-100 card-banner"
                              />
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              </Modal>
            </div>
          </div>
        </div>

        {setSelectedId && (
          <ListFood
            onAddDish={handleAddDish}
            categoryId={selectedId}
            show={showListFood}
            closeListFood={() => setShowListFood(false)}
          />
        )}

        {/* Menu Right */}

        <div className="menu-right">
          <h2 style={{ marginBottom: "0px" }}>Thực đơn</h2>
          {selectedMenu ? (
            <div>
              {/* Sắp xếp các category theo thứ tự trong categoriesOrder */}
              {Object.keys(selectedMenu.groupedDishes)
                .sort(
                  (a, b) =>
                    categoriesOrder.indexOf(a) - categoriesOrder.indexOf(b)
                ) // Sắp xếp
                .map((categoryName, index) => (
                  <div key={categoryName} className="menu-category-dish">
                    <h4
                      style={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {index === 0
                        ? "Khai vị và thức uống"
                        : index === 1
                        ? "Món chính"
                        : index === 2
                        ? "Tráng miệng"
                        : "Đồ uống"}
                      <span
                        style={{
                          // backgroundColor: "hsl(213, 100%, 67%)",
                          color: "red",
                          // borderRadius: "50%",
                          padding: "3px 6px", // Điều chỉnh padding để tạo khoảng cách xung quanh số
                          fontSize: "12px",
                          fontWeight: "bold",
                          display: "inline-block", // Đảm bảo span không bị ép co dãn
                          textAlign: "center", // Căn giữa nội dung
                          marginBottom: "10px",
                        }}
                      >
                        {`${
                          selectedMenu.groupedDishes[categoryName]?.length || 0
                        } món`}
                      </span>

                      <button
                        onClick={() => toggleListFood(index + 1)}
                        className="add-button"
                        style={{ color: "#02AF55", marginLeft: "auto" }} // Đẩy nút sang bên phải nếu cần
                      >
                        {/* <FaPlus style={{ width: "14px" }} /> */}
                        <img
                          src={AddButton}
                          alt="Thêm món ăn"
                          className="add-button-image"
                          style={{ width: "25px" }}
                        />
                      </button>
                    </h4>

                    <div
                      className="promo-list-container"
                      style={{ position: "relative" }}
                    >
                      <button
                        className="scroll-button left"
                        onClick={() => handleScroll("left", categoryName)} // Pass categoryName here
                        style={{
                          position: "absolute",
                          left: "0",
                          top: "50%",
                          transform: "translateY(-90%)",
                          zIndex: 10,
                          display:
                            selectedMenu.groupedDishes[categoryName].length >= 4
                              ? "block"
                              : "none", // Show only when there are 4 or more items
                        }}
                      >
                        &lt;
                      </button>

                      <ul
                        className={`promo-list ${categoryName} has-scrollbar`}
                        style={{
                          paddingBottom: "10px",
                          overflowX:
                            selectedMenu.groupedDishes[categoryName].length >= 4
                              ? "auto"
                              : "hidden", // Hiển thị thanh cuộn khi có đủ 4 món
                          display: "flex",
                          alignItems: "center",
                          width: "100%", // Đảm bảo chiều rộng đầy đủ
                        }}
                      >
                        {selectedMenu.groupedDishes[categoryName].map(
                          (dish, index) => (
                            <li
                              key={index}
                              style={{
                                width: "119px",
                                display: "inline-block",
                              }}
                            >
                              <button
                                onClick={() =>
                                  handleRemoveDish(categoryName, dish.dishId)
                                }
                                style={{
                                  color: "red",
                                  marginLeft: "90px",
                                  width: "10px",
                                }}
                                title="Xóa món ăn"
                              >
                                <FaMinus style={{ width: "10px" }} />
                              </button>
                              <img
                                src={dish.image}
                                alt={dish.name}
                                style={{
                                  width: "63px",
                                  height: "60px",
                                  marginLeft: "25px",
                                  borderRadius: "2rem",
                                }}
                              />
                              <p
                                style={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  textAlign: "center",
                                  fontWeight: "bold",
                                  marginTop: "5px",
                                  fontSize: "10px",
                                  color: "#1e1e1e",
                                }}
                              >
                                {dish.name}
                              </p>
                              <p
                                style={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  textAlign: "center",
                                  fontSize: "10px",
                                  color: "#1e1e1e",
                                }}
                              >
                                {/* {dish.price.toLocaleString()} VND */}
                              </p>
                            </li>
                          )
                        )}
                      </ul>

                      <button
                        className="scroll-button right"
                        onClick={() => handleScroll("right", categoryName)} // Pass categoryName here
                        style={{
                          position: "absolute",
                          right: "0",
                          top: "50%",
                          transform: "translateY(-90%)",
                          zIndex: 10,
                          display:
                            selectedMenu.groupedDishes[categoryName].length >= 4
                              ? "block"
                              : "none", // Show only when there are 4 or more items
                        }}
                      >
                        &gt;
                      </button>
                    </div>
                  </div>
                ))}
              <div style={{ textAlign: "right", fontWeight: "bold" }}>
                Giá tiền:{" "}
                {Object.values(selectedMenu.groupedDishes)
                  .flat()
                  .reduce((total, dish) => {
                    // Giả sử `dish.cost` là giá cost và `profitMargin` là tỷ lệ lợi nhuận mong muốn (ví dụ 0.2 cho 20%)
                    const profitMargin = 0.2; // Thay đổi theo tỷ lệ lợi nhuận mong muốn
                    const sellingPrice = dish.price / (1 - profitMargin); // Tính giá bán theo công thức
                    return total + (sellingPrice || 0); // Cộng dồn tổng tiền
                  }, 0)
                  .toLocaleString()}{" "}
                VND/người
              </div>
            </div>
          ) : (
            <p>Chọn một thực đơn để hiển thị chi tiết.</p>
          )}
          <div>
            {selectedMenu && (
              <div
                className="button-container d-flex"
                style={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <button
                  className="btn btn-save-form d-flex align-items-center me-5 mb-2 btn btn-hover view-menu"
                  onClick={handleShowMenuPopup}
                  style={{ width: "100%", height: "35px" }}
                >
                  <a style={{ fontSize: "10px" }}>Xem thực đơn</a>
                </button>
                <button
                  className="btn btn-save-form d-flex align-items-center me-5 mb-2 btn btn-hover create-menu"
                  onClick={handleCreateMenu}
                  style={{ width: "100%", height: "35px" }}
                >
                  <a style={{ fontSize: "10px" }}>Tạo thực đơn</a>
                </button>
                <button
                  className="btn btn-refresh-form d-flex align-items-center me-5 mb-2 btn btn-hover view-menu"
                  onClick={handleRefreshMenu}
                  style={{ width: "100%", height: "35px" }}
                >
                  <a style={{ fontSize: "10px" }}>Làm mới thực đơn</a>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal hiển thị thông tin thực đơn */}
        <Modal show={showModal} onHide={handleCloseModal}>
          {selectedMenu ? (
            <div style={{ width: "420px", margin: "0 auto" }}>
              <button
                className="add-button"
                onClick={handleCloseModal}
                style={{ color: "hsl(32, 100%, 59%)" }}
              >
                <FaTimes
                  style={{ color: "#341c0e", width: "12px", marginTop: "12px" }}
                />{" "}
                +{/* <img src={AddButton} alt="Thêm món ăn" /> */}
              </button>
              <div className="chiTietThucDon">
                <div className="menu-view-control">
                  {Object.keys(selectedMenu.groupedDishes).map(
                    (categoryName, index) => (
                      <div key={categoryName} style={{ marginBottom: "8px" }}>
                        <h3>
                          {index === 0
                            ? "Khai vị"
                            : index === 1
                            ? "Món chính"
                            : index === 2
                            ? "Tráng miệng"
                            : "Đồ uống"}
                        </h3>
                        <ul>
                          {selectedMenu.groupedDishes[categoryName].map(
                            (dish, index) => (
                              <li key={index}>
                                <strong>{dish.name}</strong>{" "}
                                {/* {dish.price.toLocaleString()} VND */}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p>Không có thông tin thực đơn để hiển thị.</p>
          )}
        </Modal>
      </div>
      {showWarning && (
        <div
          style={{
            color: "red",
            fontWeight: "bold",
            marginTop: "10px",
            marginLeft: "10px",
            backgroundColor: "black",
            borderRadius: "2px",
            textAlign: "center",
          }}
        >
          * Bạn cần cập nhật đầy đủ thông tin của tài khoản để có thể tạo hợp
          đồng.{" "}
          <a href="/account" style={{ display: "inline" }}>
            Cập nhật ngay!
          </a>
        </div>
      )}
    </div>
  );
};

export default Menu;