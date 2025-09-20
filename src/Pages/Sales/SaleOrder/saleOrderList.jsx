import { useState, useEffect, useMemo } from "react";
import {
  Button,
  Dialog,
  Tooltip,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import {
  Addition,
  getSessionFiltersByPageId,
  ISOString,
  NumberFormat,
  setSessionFilters,
  toNumber,
} from "../../../Components/functions";
import InvoiceBillTemplate from "../SalesReportComponent/newInvoiceTemplate";
import { Add, Edit, FilterAlt, Search, Visibility } from "@mui/icons-material";
import { convertedStatus } from "../convertedStatus";
import { fetchLink } from "../../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import { useNavigate } from "react-router-dom";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import DirectSaleInvoiceFromPos from "../SalesInvoice/directSaleInvoiceFromPos";
import { isGraterNumber,isEqualNumber } from "../../../Components/functions";

const SaleOrderList = ({ loadingOn, loadingOff, AddRights, EditRights, pageID }) => {
  const sessionValue = sessionStorage.getItem("filterValues");
  const defaultFilters = {
    Fromdate: ISOString(),
    Todate: ISOString(),
    Retailer: { value: "", label: "ALL" },
    CreatedBy: { value: "", label: "ALL" },
    SalesPerson: { value: "", label: "ALL" },
    VoucherType: { value: "", label: "ALL" },
    Cancel_status: 0,
    OrderStatus: { value: "", label: "ALL" },
  };

  const storage = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const [saleOrders, setSaleOrders] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [salesPerson, setSalePerson] = useState([]);
  const [users, setUsers] = useState([]);
  const [voucher, setVoucher] = useState([]);
  const [viewOrder, setViewOrder] = useState({});
  const [loading, setLoading] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);

  const [dialog, setDialog] = useState({
    filters: false,
    orderDetails: false,
  });

  useEffect(() => {
    const otherSessionFiler = getSessionFiltersByPageId(pageID);
    const {
      Fromdate,
      Todate,
      Retailer = defaultFilters.Retailer,
      CreatedBy = defaultFilters.CreatedBy,
      SalesPerson = defaultFilters.SalesPerson,
      VoucherType = defaultFilters.VoucherType,
      Cancel_status = defaultFilters.Cancel_status,
      OrderStatus = defaultFilters.OrderStatus,
    } = otherSessionFiler;

    setFilters((pre) => ({
      ...pre,
      Fromdate,
      Todate,
      Retailer,
      CreatedBy,
      SalesPerson,
      VoucherType,
      Cancel_status,
      OrderStatus,
    }));
  }, [sessionValue, pageID]);


//  const buildSaleOrderPayload = (data) => {

//     const extractWeightFromName = (name) => {
//       const match = name?.match(/(\d+)\s?kg/i);
//       return match ? parseInt(match[1]) : 1;
//     };

//     const validProducts = Array.isArray(data.ProductList)
//       ? data.ProductList.filter((p) => Number(p?.Bill_Qty) > 0).map((p) => {
//           const weight = extractWeightFromName(p?.Product_Name);
//           return {
//             ...p,
//             Pre_Id: data?.Pre_Id,
//             Bill_Qty: (Number(p?.Bill_Qty) || 0) * (Number(p?.PackValue) || 1),
//             Act_Qty: Number(p?.Total_Qty) || 0,
//             Total_Qty: Number(p?.Bill_Qty) || 0,
//           };
//         })
//       : [];

//     const transformStaffData = (orderData) => {
//       const staffs = [];
//       if (orderData.Broker_Id && orderData.Broker_Id !== 0) {
//         staffs.push({
//           Id: "",
//           So_Id: "",
//           Emp_Id: orderData.Broker_Id,
//           Emp_Type_Id: orderData.Broker_Type || 0,
//         });
//       }
//       if (orderData.Transporter_Id && orderData.Transporter_Id !== 0) {
//         staffs.push({
//           Id: "",
//           Do_Id: "",
//           Emp_Id: orderData.Transporter_Id,
//           Emp_Type_Id: orderData.TrasnportType || 0,
//         });
//       }
//       return staffs.filter((s) => s.Emp_Type_Id !== 0);
//     };

//     return {
//       ...data,
//       Product_Array: validProducts,
//       Retailer_Id: Number(data?.Retailer_Id) || 0, 
//       Retailer_Name: data?.Retailer_Name || "",
//       Staffs_Array: transformStaffData(data),
//     };
//   };


const buildSaleOrderPayload = (data) => {
  const extractWeightFromName = (name) => {
    const match = name?.match(/(\d+)\s?kg/i);
    return match ? parseInt(match[1]) : 1;
  };

  // Only include products with Bill_Qty > 0
  const validProducts = Array.isArray(data.ProductList)
    ? data.ProductList
        .filter((p) => Number(p?.Bill_Qty) > 0) // Remove products with Bill_Qty 0
        .map((p) => {
          const weight = extractWeightFromName(p?.Product_Name);
          return {
            ...p,
            Pre_Id: data?.Pre_Id,
            Bill_Qty: (Number(p?.Bill_Qty) || 0) * (Number(p?.PackValue) || 1),
            Act_Qty: Number(p?.Total_Qty) || 0,
            Total_Qty: Number(p?.Bill_Qty) || 0,
          };
        })
    : [];

  const transformStaffData = (orderData) => {
    const staffs = [];
    if (orderData.Broker_Id && orderData.Broker_Id !== 0) {
      staffs.push({
        Id: "",
        So_Id: "",
        Emp_Id: orderData.Broker_Id,
        Emp_Type_Id: orderData.Broker_Type || 0,
      });
    }
    if (orderData.Transporter_Id && orderData.Transporter_Id !== 0) {
      staffs.push({
        Id: "",
        Do_Id: "",
        Emp_Id: orderData.Transporter_Id,
        Emp_Type_Id: orderData.TrasnportType || 0,
      });
    }
    return staffs.filter((s) => s.Emp_Type_Id !== 0);
  };

  return {
    ...data,
    Product_Array: validProducts, // Only products with Bill_Qty > 0
    Retailer_Id: Number(data?.Retailer_Id) || 0,
    Retailer_Name: data?.Retailer_Name || "",
    Staffs_Array: transformStaffData(data),
  };
};


  const handleOpenModal = (row) => {
    const payload = buildSaleOrderPayload(row);

    const productChanges = (row?.ProductList || row?.Products_List || []).map(
      (item) => {
        const orderedQty = Number(item.Bill_Qty) || 0;
        const totalQty = Number(item?.Total_Qty) || 0;

        const deliveredQty = (row?.ConvertedInvoice || [])
          .flatMap((inv) => inv?.InvoicedProducts || [])
          .filter((p) => p.Item_Id === item.Item_Id)
          .reduce((sum, p) => sum + (Number(p?.Bill_Qty) || 0), 0);

        const remainingQty = Math.max(orderedQty - deliveredQty, 0);

        return {
          ...item,
          Ordered_Qty: orderedQty,
          Delivered_Qty: deliveredQty,
          Act_Qty: totalQty,
          Bill_Qty: remainingQty, 
          Amount: remainingQty * (Number(item.Item_Rate) || 0),
        };
      }
    );

    const updatedRow = {
      ...row,
      Do_Date:row?.So_Date,
      ProductList: productChanges,
      Staffs_Array:
        row?.Staff_Involved_List?.map((item) => ({
          Staff_Id: item.Involved_Emp_Id,
          Cost_Cat_Id: item.Cost_Center_Type_Id,
          Cost_Cat_Name: item.Cost_Center_Type,
        })) || [],
      Retailer_Id: Number(row?.Retailer_Id) || 0, 
      Retailer_Name: row?.Retailer_Name || "",
    };

  

    setSelectedOrder({
      row: updatedRow,
      payload,
    });

    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedOrder(null);
  };
  useEffect(() => {
    fetchLink({
      address: `sales/saleOrder/retailers`,
    })
      .then((data) => {
        if (data.success) {
          setRetailers(data.data);
        }
      })
      .catch((e) => console.error(e));

    fetchLink({
      address: `masters/users/salesPerson/dropDown?Company_id=${storage?.Company_id}`,
    })
      .then((data) => {
        if (data.success) {
          setSalePerson(data.data);
        }
      })
      .catch((e) => console.error(e));

    fetchLink({
      address: `masters/user/dropDown?Company_id=${storage?.Company_id}`,
    })
      .then((data) => {
        if (data.success) {
          setUsers(data.data);
        }
      })
      .catch((e) => console.error(e));

    fetchLink({
      address: `masters/voucher`,
    })
      .then((data) => {
        if (data.success) {
          setVoucher(data.data);
        }
      })
      .catch((e) => console.error(e));
  }, []);

  // useEffect(() => {
  //   const otherSessionFiler = getSessionFiltersByPageId(pageID);
  //   const {
  //     Fromdate,
  //     Todate,
  //     Retailer = defaultFilters.Retailer,
  //     CreatedBy = defaultFilters.CreatedBy,
  //     SalesPerson = defaultFilters.SalesPerson,
  //     VoucherType = defaultFilters.VoucherType,
  //     Cancel_status = defaultFilters.Cancel_status,
  //   } = otherSessionFiler;

  //   fetchLink({
  //     address: `sales/saleOrder?
  //           Fromdate=${Fromdate}&
  //           Todate=${Todate}&
  //           Retailer_Id=${Retailer?.value}&
  //           Sales_Person_Id=${SalesPerson?.value}&
  //           Created_by=${CreatedBy?.value}&
  //           VoucherType=${VoucherType?.value}&
  //           Cancel_status=${Cancel_status}&
  //           OrderStatus=${filters?.OrderStatus?.value || ""}`,
  //     loadingOn,
  //     loadingOff,
  //   })
  //     .then((data) => {
  //       if (data.success) {
  //         setSaleOrders(data?.data);
  //       }
  //     })
  //     .catch((e) => console.error(e));
  // }, [sessionValue, pageID]);


const fetchSaleOrders = () => {
  const otherSessionFiler = getSessionFiltersByPageId(pageID);
  const {
    Fromdate,
    Todate,
    Retailer = defaultFilters.Retailer,
    CreatedBy = defaultFilters.CreatedBy,
    SalesPerson = defaultFilters.SalesPerson,
    VoucherType = defaultFilters.VoucherType,
    Cancel_status = defaultFilters.Cancel_status,
  } = otherSessionFiler;

  fetchLink({
    address: `sales/saleOrder?
      Fromdate=${Fromdate}&
      Todate=${Todate}&
      Retailer_Id=${Retailer?.value}&
      Sales_Person_Id=${SalesPerson?.value}&
      Created_by=${CreatedBy?.value}&
      VoucherType=${VoucherType?.value}&
      Cancel_status=${Cancel_status}&
      OrderStatus=${filters?.OrderStatus?.value || ""}`,
    loadingOn,
    loadingOff,
  })
    .then((data) => {
      if (data.success) {
        setSaleOrders(data?.data);
      }
    })
    .catch((e) => console.error(e));
};

useEffect(() => {
  fetchSaleOrders();
}, [sessionValue, pageID]);




  const ExpendableComponent = ({ row, handleOpenModal }) => {
    const getDeliveredQty = (product) => {
      let deliveredQty = 0;

      if (row.ConvertedInvoice?.length > 0) {
        row.ConvertedInvoice.forEach((invoice) => {
          if (invoice.InvoicedProducts?.length > 0) {
            invoice.InvoicedProducts.forEach((ip) => {
              if (Number(ip.Item_Id) === Number(product.Item_Id)) {
                deliveredQty += Number(ip.Bill_Qty || 0);
              }
            });
          }
        });
      }
      return deliveredQty;
    };

    const hasPending = row.Products_List?.some((product) => {
      const deliveredQty = getDeliveredQty(product);
      return Number(product.Bill_Qty) - deliveredQty > 0;
    });

    return (
      <>
          <table className="table">
                    <tbody>
                        <tr>
                            <td className="border p-2 bg-light">Branch</td>
                            <td className="border p-2">{row.Branch_Name}</td>
                            <td className="border p-2 bg-light">Sales Person</td>
                            <td className="border p-2">{row.Sales_Person_Name}</td>
                            <td className="border p-2 bg-light">Round off</td>
                            <td className="border p-2">{row.Round_off}</td>
                        </tr>
                        <tr>
                            <td className="border p-2 bg-light">Invoice Type</td>
                            <td className="border p-2">
                                {isEqualNumber(row.GST_Inclusive, 1) && 'Inclusive'}
                                {isEqualNumber(row.GST_Inclusive, 0) && 'Exclusive'}
                            </td>
                            <td className="border p-2 bg-light">Tax Type</td>
                            <td className="border p-2">
                                {isEqualNumber(row.IS_IGST, 1) && 'IGST'}
                                {isEqualNumber(row.IS_IGST, 0) && 'GST'}
                            </td>
                            <td className="border p-2 bg-light">Sales Person</td>
                            <td className="border p-2">{row.Sales_Person_Name}</td>
                        </tr>
                        <tr>
                            <td className="border p-2 bg-light">Narration</td>
                            <td className="border p-2" colSpan={5}>{row.Narration}</td>
                        </tr>
                    </tbody>
                </table>
        <table className="table table-bordered">
          <thead className="bg-light">
           
            <tr>
              <th className="p-2">Product</th>
              <th className="p-2">Ordered Qty</th>
              <th className="p-2">Delivered Qty</th>
              <th className="p-2">
                Pending Qty
                {hasPending && (
                  <IconButton size="small" onClick={() => handleOpenModal(row)}>
                    <ArrowOutwardIcon className="text-blue-600" />
                  </IconButton>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {row.Products_List?.map((product, index) => {
              const deliveredQty = getDeliveredQty(product);
              const pendingQty = Number(product.Bill_Qty) - deliveredQty;

              return (
                <tr key={index}>
                  <td className="p-2">{product.Product_Name}</td>
                  <td className="p-2">{product.Bill_Qty}</td>
                  <td className="p-2">{deliveredQty}</td>
                  <td
                    className={`p-2 font-bold ${
                      pendingQty === 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {pendingQty}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </>
    );
  };

  const closeDialog = () => {
    setDialog({
      ...dialog,
      filters: false,
      orderDetails: false,
    });
  };

  const Total_Invoice_value = useMemo(
    () =>
      saleOrders.reduce(
        (acc, orders) => Addition(acc, orders?.Total_Invoice_value),
        0
      ),
    [saleOrders]
  );

  return (
    <>
      <FilterableTable
        title="Sale Orders"
        dataArray={saleOrders}
        EnableSerialNumber
        columns={[
          createCol("So_Date", "date", "Date"),
          createCol("So_Inv_No", "string", "ID"),
          createCol("Retailer_Name", "string", "Customer"),
          createCol("VoucherTypeGet", "string", "Voucher"),
          createCol("Total_Before_Tax", "number", "Before Tax"),
          createCol("Total_Tax", "number", "Tax"),
          createCol("Total_Invoice_value", "number", "Invoice Value"),
          // {
          //   ColumnHeader: "Status",
          //   isVisible: 1,
          //   align: "center",
          //   isCustomCell: true,
          //   Cell: ({ row }) => {
          //     const convert = convertedStatus.find(
          //       (status) => status.id === Number(row?.isConverted)
          //     );
          //     return (
          //       <span
          //         className={
          //           "py-0 fw-bold px-2 rounded-4 fa-12 " +
          //           (convert?.color ?? "bg-secondary text-white")
          //         }
          //       >
          //         {convert?.label ?? "Undefined"}
          //       </span>
          //     );
          //   },
          // },
          {
  ColumnHeader: "Status",
  isVisible: 1,
  align: "center",
  isCustomCell: true,
  Cell: ({ row }) => {
    // Calculate ordered qty
    const orderedQty = row?.Products_List?.reduce(
      (sum, p) => sum + (Number(p?.Bill_Qty) || 0),
      0
    );

    // Calculate delivered qty
    const deliveredQty = row?.ConvertedInvoice?.reduce((sum, d) => {
      const items = d?.InvoicedProducts || [];
      return (
        sum +
        items.reduce((sub, prod) => sub + (Number(prod?.Bill_Qty) || 0), 0)
      );
    }, 0);

   
    const pendingQty = orderedQty - deliveredQty;

   
    const isCompleted = pendingQty <= 0;
    const status = isCompleted ? "Completed" : "Pending";
    const statusColor = isCompleted ? "bg-success text-white" : "bg-warning text-dark";

    return (
      <span
        className={
          "py-0 fw-bold px-2 rounded-4 fa-12 " + statusColor
        }
      >
        {status}
      </span>
    );
  },
},

          {
            Field_Name: "Action",
            isVisible: 1,
            isCustomCell: true,
            Cell: ({ row }) => {
              return (
                <>
                  <Tooltip title="View Order">
                    <IconButton
                      onClick={() => {
                        setViewOrder({
                          orderDetails: row,
                          orderProducts: row?.Products_List
                            ? row?.Products_List
                            : [],
                        });
                      }}
                      color="primary"
                      size="small"
                    >
                      <Visibility className="fa-16" />
                    </IconButton>
                  </Tooltip>

                  {EditRights && (
                    <Tooltip title="Edit">
                      <IconButton
                        onClick={() =>
                          navigate("create", {
                            state: {
                              ...row,
                              isEdit: true,
                            },
                          })
                        }
                        size="small"
                      >
                        <Edit className="fa-16" />
                      </IconButton>
                    </Tooltip>
                  )}
                </>
              );
            },
          },
        ]}
        ButtonArea={
          <>
            {AddRights && (
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => navigate("create")}
              >
                {"New"}
              </Button>
            )}
            <Tooltip title="Filters">
              <IconButton
                size="small"
                onClick={() => setDialog({ ...dialog, filters: true })}
              >
                <FilterAlt />
              </IconButton>
            </Tooltip>
            <span className="bg-light text-light fa-11 px-1 shadow-sm py-1 rounded-3 mx-1">
              {toNumber(Total_Invoice_value) > 0 && (
                <h6 className="m-0 text-end text-muted px-3">
                  Total: {NumberFormat(Total_Invoice_value)}
                </h6>
              )}
            </span>
          </>
        }
        isExpendable={true}
        tableMaxHeight={550}
        expandableComp={(props) => (
          <ExpendableComponent {...props} handleOpenModal={handleOpenModal} />
        )}
      />

      {Object.keys(viewOrder).length > 0 && (
        <InvoiceBillTemplate
          orderDetails={viewOrder?.orderDetails}
          orderProducts={viewOrder?.orderProducts}
          download={true}
          actionOpen={true}
          clearDetails={() => setViewOrder({})}
          TitleText={"Sale Order"}
        />
      )}

      <Dialog open={dialog.filters} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>Filters</DialogTitle>
        <DialogContent>
          <div className="table-responsive pb-4">
            <table className="table">
              <tbody>
                <tr>
                  <td style={{ verticalAlign: "middle" }}>From</td>
                  <td>
                    <input
                      type="date"
                      value={filters.Fromdate}
                      onChange={(e) =>
                        setFilters({ ...filters, Fromdate: e.target.value })
                      }
                      className="cus-inpt"
                    />
                  </td>
                </tr>

                <tr>
                  <td style={{ verticalAlign: "middle" }}>To</td>
                  <td>
                    <input
                      type="date"
                      value={filters.Todate}
                      onChange={(e) =>
                        setFilters({ ...filters, Todate: e.target.value })
                      }
                      className="cus-inpt"
                    />
                  </td>
                </tr>

                <tr>
                  <td style={{ verticalAlign: "middle" }}>Retailer</td>
                  <td>
                    <Select
                      value={filters?.Retailer}
                      onChange={(e) => setFilters({ ...filters, Retailer: e })}
                      options={[
                        { value: "", label: "ALL" },
                        ...retailers.map((obj) => ({
                          value: obj?.Retailer_Id,
                          label:
                            obj?.Retailer_Name +
                            "- ₹" +
                            NumberFormat(toNumber(obj?.TotalSales)) +
                            ` (${toNumber(obj?.OrderCount)})`,
                        })),
                      ]}
                      styles={customSelectStyles}
                      isSearchable={true}
                      placeholder={"Retailer Name"}
                    />
                  </td>
                </tr>

                <tr>
                  <td style={{ verticalAlign: "middle" }}>Salse Person</td>
                  <td>
                    <Select
                      value={filters?.SalesPerson}
                      onChange={(e) =>
                        setFilters((pre) => ({ ...pre, SalesPerson: e }))
                      }
                      options={[
                        { value: "", label: "ALL" },
                        ...salesPerson.map((obj) => ({
                          value: obj?.UserId,
                          label: obj?.Name,
                        })),
                      ]}
                      styles={customSelectStyles}
                      isSearchable={true}
                      placeholder={"Sales Person Name"}
                    />
                  </td>
                </tr>

                <tr>
                  <td style={{ verticalAlign: "middle" }}>Created By</td>
                  <td>
                    <Select
                      value={filters?.CreatedBy}
                      onChange={(e) =>
                        setFilters((pre) => ({ ...pre, CreatedBy: e }))
                      }
                      options={[
                        { value: "", label: "ALL" },
                        ...users.map((obj) => ({
                          value: obj?.UserId,
                          label: obj?.Name,
                        })),
                      ]}
                      styles={customSelectStyles}
                      isSearchable={true}
                      placeholder={"Sales Person Name"}
                    />
                  </td>
                </tr>

                <tr>
                  <td style={{ verticalAlign: "middle" }}>Voucher </td>
                  <td>
                    <Select
                      value={filters?.VoucherType}
                      onChange={(e) => setFilters({ ...filters, VoucherType: e })}
                      options={[
                        { value: "", label: "ALL" },
                        ...voucher
                          .filter((obj) => obj.Type === "SALES")
                          .map((obj) => ({
                            value: obj?.Vocher_Type_Id,
                            label: obj?.Voucher_Type,
                          })),
                      ]}
                      styles={customSelectStyles}
                      menuPortalTarget={document.body}
                      isSearchable={true}
                      placeholder={"Voucher Name"}
                    />
                  </td>
                </tr>

                <tr>
                  <td style={{ verticalAlign: "middle" }}>Canceled Order</td>
                  <td>
                    <select
                      value={filters.Cancel_status}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          Cancel_status: Number(e.target.value),
                        })
                      }
                      className="cus-inpt"
                    >
                      <option value={1}>Show</option>
                      <option value={0}>Hide</option>
                    </select>
                  </td>
                </tr>

                <tr>
                  <td style={{ verticalAlign: "middle" }}>Order Status</td>
                  <td>
                    <Select
                      value={filters?.OrderStatus}
                      onChange={(e) => setFilters({ ...filters, OrderStatus: e })}
                      options={[
                        { value: "", label: "ALL" },
                        { value: "pending", label: "Pending" },
                        { value: "completed", label: "Completed" },
                      ]}
                      styles={customSelectStyles}
                      isSearchable={false}
                      placeholder={"Order Status"}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>close</Button>
          <Button
            onClick={() => {
              closeDialog();
              setSessionFilters({
                Fromdate: filters?.Fromdate,
                Todate: filters.Todate,
                pageID,
                Retailer: filters.Retailer,
                CreatedBy: filters.CreatedBy,
                SalesPerson: filters.SalesPerson,
                VoucherType: filters.VoucherType,
                Cancel_status: filters.Cancel_status,
                OrderStatus: filters.OrderStatus,
              });
            }}
            startIcon={<Search />}
            variant="outlined"
          >
            Search
          </Button>
        </DialogActions>
      </Dialog>

      <DirectSaleInvoiceFromPos
        open={modalOpen}
        onClose={handleCloseModal}
        editValues={selectedOrder?.row} 
        defaultValues={selectedOrder?.payload} 
        loadingOn={loadingOn}
        loadingOff={loadingOff}
        transactionType="invoice" 
         onSuccess={() => {
    fetchSaleOrders();  
    handleCloseModal(); 
  }}
      />
    </>
  );
};

export default SaleOrderList;