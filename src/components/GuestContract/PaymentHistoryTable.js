import * as React from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { Card } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom"; // Import useNavigate
import { checkAccessToken } from "services/checkAccessToken";
import paymentApi from "api/paymentApi";
import { da } from "date-fns/locale";

const columns = [
  { id: "orderCode", label: "Mã Thanh Toán", minWidth: 170, align: "center" },
  {
    id: "paymentMethod",
    label: "Phương Thức Thanh Toán",
    minWidth: 200,
    align: "center",
  },
  {
    id: "createdAt",
    label: "Ngày Thanh Toán",
    minWidth: 170,
    align: "center",
  },
  {
    id: "contractTotalCost",
    label: "Giá Trị Hợp Đồng",
    minWidth: 170,
    align: "right",
    format: (value) => value.toLocaleString("vi-VN"),
  },
  {
    id: "amountPaid",
    label: "Số Tiền Thanh Toán",
    minWidth: 170,
    align: "right",
    format: (value) => value.toLocaleString("vi-VN"),
  },
  {
    id: "conLai",
    label: "Số Tiền Còn Lại",
    minWidth: 170,
    align: "right",
    format: (value) => value.toLocaleString("vi-VN"),
  },
];

const PaymentHistoryTable = () => {
  const { id } = useParams();
  const [rows, setRows] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const navigate = useNavigate();

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const createData = (
    orderCode,
    paymentMethod,
    createdAt,
    contractTotalCost,
    amountPaid,
    conLai
  ) => {
    return {
      orderCode,
      paymentMethod,
      createdAt,
      contractTotalCost,
      amountPaid,
      conLai,
    };
  };

  React.useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        console.log("Id hứng được: ", id);
        const response = await paymentApi.fetchPaymentHistory(id);
        let daTra = 0;
        if (response?.code === 1000 && response?.result.length > 0) {
          const newRows = response.result.reverse().map((item) => {
            daTra += item.amountPaid;
            return {
              orderCode: item.orderCode,
              paymentMethod: item.paymentMethod,
              createdAt: item.createdAt,
              contractTotalCost: item.contract.totalcost,
              amountPaid: item.amountPaid,
              conLai: item.contract.totalcost - daTra,
            };
          });
          setRows(newRows.reverse());
          console.log("Rows đã có dữ liệu:", newRows);
        } else {
          console.log("Fetch lỗi hoặc response không có dữ liệu", response);
        }
      } catch (error) {
        console.error("Lỗi khi fetch dữ liệu:", error);
        checkAccessToken(navigate);
      }
    };

    fetchPaymentHistory();
  }, [id, navigate]);

  return (
    <Card className="p-5" style={{ opacity: 0.9, borderTopLeftRadius: 0 }}>
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 440 }} className="table-paymentHis">
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length > 0 ? (
                rows
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <TableRow
                      hover
                      role="checkbox"
                      tabIndex={-1}
                      key={row.orderCode}
                    >
                      {columns.map((column) => {
                        const value = row[column.id];
                        return (
                          <TableCell
                            key={column.id}
                            align={column.align}
                            style={{
                              fontWeight:
                                column.id === "contractTotalCost" ||
                                column.id === "amountPaid" ||
                                column.id === "conLai"
                                  ? "bold"
                                  : "normal", // Tô đậm cho các cột yêu cầu
                              color:
                                column.id === "contractTotalCost" ||
                                column.id === "amountPaid" ||
                                column.id === "conLai"
                                  ? "green"
                                  : "inherit", // Đổi màu chữ xanh lá
                            }}
                          >
                            {column.format && typeof value === "number"
                              ? column.format(value)
                              : value}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center">
                    Bạn chưa thanh toán hợp đồng lần nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            display: "flex",
            justifyContent: "center",
            fontSize: "1.2rem",
            padding: "16px",
            color: "#333",
            backgroundColor: "#f9f9f9",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
              {
                fontSize: "1.2rem",
                marginBottom: "0px",
              },
            "& .MuiTablePagination-displayedRows": {
              marginBottom: "0px",
            },
            "& .MuiTablePagination-actions > button": {
              fontSize: "1.2rem",
              margin: "0 8px",
              backgroundColor: "var(--deep-saffron)",
              color: "#fff",
              borderRadius: "50%",
              padding: "8px",
              transition: "background-color 0.3s",
              "&:hover": {
                backgroundColor: "var(--dark-orange)",
              },
            },
          }}
        />
      </Paper>
    </Card>
  );
};

export default PaymentHistoryTable;
