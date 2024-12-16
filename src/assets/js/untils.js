
export const calculateItemClass = (itemCount) => {
  if (itemCount <= 2) {
    return 'max-items-2';
  } else if (itemCount <= 3) {
    return 'max-items-3';
  } else {
    // Nếu số lượng món lớn hơn 3, tính số hàng cần thiết
    const numRows = Math.ceil(itemCount / 3); // Làm tròn lên để đảm bảo đủ hàng
    return `max-rows-${numRows}`;
  }
};