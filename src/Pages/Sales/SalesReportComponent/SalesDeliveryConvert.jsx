import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Button,
  Dialog,
  Tooltip,
  TextField,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
} from "@mui/material";
import "../../common.css";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import {
  getPreviousDate,
  isEqualNumber,
  ISOString,
  isValidObject,
} from "../../../Components/functions";
// import NewDeliveryOrder from "../SalesReportComponent/newInvoiceTemplate";
import { FilterAlt, Visibility } from "@mui/icons-material";
import { convertedStatus } from "../convertedStatus";
import { fetchLink } from "../../../Components/fetchComponent";
import FilterableTable from "../../../Components/filterableTable2";
import NewDeliveryOrder from "../SalesReportComponent/NewDeliveryOrder";
import InvoiceBillTemplate from "./newInvoiceTemplate";

// import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import DeliveryDetailsList from "./DeliveryDetailsList";
import { toast } from "react-toastify";

const SalesDeliveryConvert = ({ loadingOn, loadingOff }) => {
  const [selectedRows, setSelectedRows] = useState([]);
  const storage = JSON.parse(localStorage.getItem("user"));
  const [saleOrders, setSaleOrders] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [salesPerson, setSalePerson] = useState([]);
  const [users, setUsers] = useState([]);
  const [screen, setScreen] = useState(true);
  const [orderInfo, setOrderInfo] = useState({});
  const [viewOrder, setViewOrder] = useState({});
  const [reload, setReload] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [area, setArea] = useState([]);
  const [isDeliveryDetailsVisible, setIsDeliveryDetailsVisible] =
    useState(false);
  const [godDown, setGodDown] = useState([]);
  const [ledger, setLedger] = useState([]);
  const checked = useState(true);
  // const [Product_Array, setProductArray] = useState([]);

  const Created_by = storage?.UserId;
  const Branch_Id = storage?.BranchId;
  // const Cost_Center_Type_Id = storage?.UserTypeId
  const [deliveryDialogBox, setDeliveryDialogBox] = useState(false);

  const handleCloseDialog = () => setDeliveryDialogBox(false);

  // const [deliveryPerson, setDeliveryPerson] = useState(null);
  // const [deliveryPersonList, setDeliveryPersonList] = useState([]);
  const [DeliveryList, setDeliveryList] = useState([]);

  const initialValue = {
    Fromdate: getPreviousDate(7),
    Todate: ISOString(),
    Retailer_Id: "",
    RetailerGet: "ALL",
    Created_by: "",
    CreatedByGet: "ALL",
    Sales_Person_Id: "",
    SalsePersonGet: "ALL",
    Cancel_status: 1,
    Route_Id: "",
    RoutesGet: "ALL",
    Area_Id: "",
    AreaGet: "ALL",
  };

  const [filters, setFilters] = useState(initialValue);
  const [voucher, setVoucher] = useState([]);
const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState({
    Do_Date: ISOString(),
    Vehicle_No: "",
    Trip_No: "",
    Trip_Date: ISOString(),
    StartTime: "",
    Created_by: "",
    Delivery_Person_Id: "",
    Delivery_Location: "",
    Delivery_Time: "",
    Payment_Ref_No: "",
    Payment_Mode: "",
    Payment_Status: "",
    Narration: "",
    Alter_Id: "",
    Delivery_Status: "",
    GoDown_Id: "",
    GodDown_Name: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDeliveryDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [dialog, setDialog] = useState({
    filters: false,
    orderDetails: false,
  });

  const triggerReload = () => {
    setReload((prev) => !prev);
  };

  useEffect(() => {
    fetchLink({
      address: `sales/saleDelivery?Fromdate=${filters?.Fromdate}&Todate=${filters?.Todate}&Retailer_Id=${filters?.Retailer_Id}&Sales_Person_Id=${filters?.Sales_Person_Id}&Created_by=${filters?.Created_by}&Cancel_status=${filters?.Cancel_status}&Route_Id=${filters?.Route_Id}&Area_Id=${filters?.Area_Id}`,
    })
      .then((data) => {
        if (data.success) {
          setSaleOrders(data?.data);
        }
      })
      .catch((e) => console.error(e));
  }, [
    filters.Fromdate,
    filters?.Todate,
    filters?.Retailer_Id,
    filters?.Sales_Person_Id,
    filters?.Created_by,
    filters?.Cancel_status,
    filters?.Route_Id,
    filters?.Area_Id,
    reload
  ]);

  const handleSubmit = async () => {
    // const EmployeesInvolved = {
    //     Trip_ST_KM: deliveryDetails.Trip_ST_KM || "",
    //     Branch_Id: deliveryDetails.Branch_Id || "",
    //     Vehicle_No: deliveryDetails.Vehicle_No || "",
    //     Trip_No: deliveryDetails.Trip_No || "",
    //     StartTime: deliveryDetails.StartTime || "",
    //     Delivery_Person_Id: deliveryPerson?.UserId || "",
    //     Delivery_Location: deliveryDetails.Delivery_Location || "",
    //     Alter_Id: deliveryDetails.Alter_Id || "",
    //     Delivery_Status: deliveryDetails.Delivery_Status || "",
    //     Cost_Center_Type_Id: Cost_Center_Type_Id,

    // };
      if (isSubmitting) return; // Prevent multiple clicks
setIsSubmitting(true);
    const tripData = {
      ...deliveryDetails,
      DeliveryList,

      Branch_Id: Branch_Id,
      Created_by: Created_by,
    };

    try {
      const response = await fetchLink({
        address: `delivery/multipleDelivery`,
        method: "POST",
        bodyData: tripData,
      });

      if (!response.success) {
        toast.error(response.message);
        // handleCloseDialog(true);
        return false;
      }
      toast.success(response.message);
      setFilters(initialValue);
      setReload((prev) => !prev);
      handleCloseDialog(true);
      setSelectedRows([]);
    } catch (error) {
      handleCloseDialog(true);
    } finally {
      setIsSubmitting(false); 
    }
  };

  useEffect(() => {
    fetchLink({
      address: `masters/voucher`,
    })
      .then((data) => {
        if (data.success) {
      
            let FilterData=data.data.filter(e=>e.Type==='SALES')
          setVoucher(FilterData);
        }
      })
      .catch((e) => console.error(e));

    fetchLink({
      address: `masters/retailers/dropDown?Company_Id=${storage?.Company_id}`,
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
      address: `purchase/stockItemLedgerName?type=SALES`,
    })
      .then((data) => {
        if (data.success) {
          setLedger(data.data);
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
      address: `/dataEntry/godownLocationMaster`,
    })
      .then((data) => {
        if (data.success) {
          setGodDown(data.data);
        }
      })
      .catch((e) => console.error(e));

    // fetchLink({
    //     address: `masters/users/salesPerson/dropDown?Company_id=${storage?.Company_id}`
    // }).then(data => {
    //     if (data.success) {
    //         setDeliveryPersonList(data.data);
    //     }
    // }).catch(e => console.error(e));

    fetchLink({
      address: `masters/routes/dropdown?Company_id=${storage?.Company_id}`,
    })
      .then((data) => {
        if (data.success) {
          setRoutes(data.data);
        }
      })
      .catch((e) => console.error(e));

    fetchLink({
      address: `masters/areas/dropdown?Company_id=${storage?.Company_id}`,
    })
      .then((data) => {
        if (data.success) {
          setArea(data.data);
        }
      })
      .catch((e) => console.error(e));
  }, []);

  const handleCheckboxChange = (row) => {
    const isSelected = selectedRows.some(
      (selectedRow) => selectedRow.So_Id === row.So_Id
    );

    if (isSelected) {
      setSelectedRows(
        selectedRows.filter((selectedRow) => selectedRow.So_Id !== row.So_Id)
      );
    } else {
      setSelectedRows([...selectedRows, row]);
    }
  };

  const saleOrderColumn = [
    {
      Field_Name: "checkbox",
      ColumnHeader: "",
      isVisible: 1,
      pointer: true,
      isCustomCell: true,
      Cell: ({ row }) => {
        const isSelected = selectedRows.some(
          (selectedRow) => selectedRow.So_Id === row.So_Id
        );

        return (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => handleCheckboxChange(row)}
            disabled={row?.isConverted !== 0}
            onFocus={(e) => {
              e.target.blur();
            }}
            style={{
              cursor: "pointer",
              transform: "scale(1.5)",
              width: "14px",
              height: "20px",
            }}
          />
        );
      },
    },
    {
      Field_Name: "So_Id",
      ColumnHeader: "Order ID",
      Fied_Data: "string",
      isVisible: 1,
    },
    {
      Field_Name: "Retailer_Name",
      ColumnHeader: "Customer",
      Fied_Data: "string",
      isVisible: 1,
    },
    {
      Field_Name: "So_Date",
      ColumnHeader: "Sale Order Date",
      Fied_Data: "date",
      isVisible: 1,
      align: "center",
    },
    {
      Field_Name: "So_Inv_No",
      ColumnHeader: "So_Inv_No",
      Fied_Data: "string",
      isVisible: 1,
      align: "center",
    },
    // {
    //     Field_Name: 'Products',
    //     ColumnHeader: 'Products / Quantity',
    //     isVisible: 1,
    //     align: 'center',
    //     isCustomCell: true,
    //     Cell: ({ row }) => (
    //         <>
    //             <span>{row?.Products_List?.length ?? 0}</span> /&nbsp;
    //             <span>{row?.Products_List?.reduce((sum, item) => sum += item?.Bill_Qty ?? 0, 0) ?? 0}</span>
    //         </>
    //     )
    // },
    {
      Field_Name: "Total_Before_Tax",
      ColumnHeader: "Before Tax",
      Fied_Data: "number",
      isVisible: 1,
      align: "center",
    },
    {
      Field_Name: "Total_Tax",
      ColumnHeader: "Tax",
      Fied_Data: "number",
      isVisible: 1,
      align: "center",
    },
    {
      Field_Name: "Total_Invoice_value",
      ColumnHeader: "Invoice Value",
      Fied_Data: "number",
      isVisible: 1,
      align: "center",
    },
    {
      ColumnHeader: "Status",
      isVisible: 1,
      align: "center",
      isCustomCell: true,
      Cell: ({ row }) => {
        const convert = convertedStatus.find(
          (status) => status.id === Number(row?.isConverted)
        );
        return (
          <span
            className={
              "py-0 fw-bold px-2 rounded-4 fa-12 " + convert?.color ??
              "bg-secondary text-white"
            }
          >
            {convert?.label ?? "Undefined"}
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
                    orderProducts: row?.Products_List ? row?.Products_List : [],
                  });
                }}
                color="primary"
                size="small"
              >
                <Visibility className="fa-16" />
              </IconButton>
            </Tooltip>

            {/* <Tooltip title="Sales Delivery">
                            <IconButton
                                onClick={() => {
                                    switchScreen();
                                    setOrderInfo({ ...row });
                                }}
                                size="small"
                            >
                                <TwoWheelerIcon className="fa-16" />
                            </IconButton>
                        </Tooltip> */}
          </>
        );
      },
    },
  ];

  const setTripDetails = (data) => {
    if (!Array.isArray(data)) {
      console.error("Invalid data format. Expected an array.");
      return;
    }

    setDeliveryDialogBox(true);

    const DeliveryList = [];
    const Product_Array = [];

    data.forEach((item) => {
      if (item) {
        DeliveryList.push(item);

        if (item.Products_List && Array.isArray(item.Products_List)) {
          Product_Array.push(...item.Products_List);
        }
      }
    });

    setDeliveryList(DeliveryList);

    setDeliveryDetails({
      DeliveryList,
      Product_Array,
    });
  };

  const ExpendableComponent = ({ row }) => {
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
                {isEqualNumber(row.GST_Inclusive, 1) && "Inclusive"}
                {isEqualNumber(row.GST_Inclusive, 0) && "Exclusive"}
              </td>
              <td className="border p-2 bg-light">Tax Type</td>
              <td className="border p-2">
                {isEqualNumber(row.IS_IGST, 1) && "IGST"}
                {isEqualNumber(row.IS_IGST, 0) && "GST"}
              </td>
              <td className="border p-2 bg-light">Sales Person</td>
              <td className="border p-2">{row.Sales_Person_Name}</td>
            </tr>
            <tr>
              <td className="border p-2 bg-light">Narration</td>
              <td className="border p-2" colSpan={5}>
                {row.Narration}
              </td>
            </tr>
          </tbody>
        </table>
      </>
    );
  };

//   const switchScreen = () => {
//     setScreen(!screen);
//     setOrderInfo({});
//   };

  const closeDialog = () => {
    setDialog({
      ...dialog,
      filters: false,
      orderDetails: false,
    });
    setOrderInfo({});
  };
  const handleToggle = () => {
    setScreen((prev) => !prev);
    setIsDeliveryDetailsVisible((prev) => !prev);
  };
  return (
    <>
      <Card>
        <div className="p-3 py-2 d-flex align-items-center justify-content-between">
          <h6 className="fa-18 m-0 p-0">
            {screen ? "Sale Orders" : isValidObject(orderInfo)}
          </h6>

          <div className="d-flex align-items-center gap-2">
            {selectedRows.length > 0 && (
              <h6 className="m-0 text-muted">
                Selected Rows: {selectedRows.length}
              </h6>
            )}
            {screen && (
              <Tooltip title="Filters">
                <IconButton
                  size="small"
                  onClick={() => setDialog({ ...dialog, filters: true })}
                >
                  <FilterAlt />
                </IconButton>
              </Tooltip>
            )}

            {selectedRows.length > 0 && screen && (
              <Button
                variant="outlined"
                onClick={() => setTripDetails(selectedRows)}
              >
                Convert To Delivery
              </Button>
            )}

            {screen && (
              <Switch
                checked={checked}
                onChange={() => {
                  //  setChecked(true);
                  setScreen(false);
                  setIsDeliveryDetailsVisible(true);
                }}
                inputProps={{ "aria-label": "controlled" }}
              />
            )}
          </div>
        </div>

        <CardContent className="p-0">
          {screen ? (
            <FilterableTable
              dataArray={saleOrders}
              columns={saleOrderColumn}
              // EnableSerialNumber={true}
              isExpendable={true}
              tableMaxHeight={550}
              expandableComp={ExpendableComponent}
            />
          ) : isDeliveryDetailsVisible ? (
            <DeliveryDetailsList
              editValues={orderInfo}
              loadingOn={loadingOn}
              loadingOff={loadingOff}
              reload={() => {
                setReload((prev) => !prev);
                setScreen((pre) => !pre);
              }}
              switchScreen={() => setScreen(true)}
              onToggle={handleToggle}
              triggerReload={triggerReload} 
            />
          ) : (
            <NewDeliveryOrder
              editValues={orderInfo}
              loadingOn={loadingOn}
              loadingOff={loadingOff}
              reload={() => {
                setReload((prev) => !prev);
                setScreen((prev) => !prev);
              }}
              switchScreen={() => setScreen(true)}
              editOn={true}
            />
            // reload={() => {
            //     setReload(pre => !pre);
            //     setScreen(pre => !pre)
            // }}
            // switchScreen={switchScreen}
          )}
        </CardContent>
      </Card>

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
      <Dialog
        open={deliveryDialogBox}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Delivery Details</DialogTitle>
        <DialogContent>
          <form>
            <td style={{ verticalAlign: "middle" }}>
              Delivery Date <span style={{ color: "red" }}>*</span>
            </td>

            <TextField
              fullWidth
              type="date"
              name="Do_Date"
              value={deliveryDetails.Do_Date}
              onChange={handleInputChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <div>
              <div style={{ verticalAlign: "middle" }}>
                Godown <span style={{ color: "red" }}>*</span>
              </div>
              <div>
                <Select
                  value={
                    deliveryDetails?.GoDown_Id
                      ? {
                          value: deliveryDetails?.GoDown_Id,
                          label: deliveryDetails?.GodDown_Name,
                        }
                      : { value: "", label: "select", isDisabled: true }
                  }
                  onChange={(e) =>
                    setDeliveryDetails({
                      ...deliveryDetails,
                      GoDown_Id: e.value,
                      GodDown_Name: e.label,
                    })
                  }
                  options={[
                    { value: "", label: "select", isDisabled: true },
                    ...godDown.map((obj) => ({
                      value: obj?.Godown_Id,
                      label: obj?.Godown_Name,
                    })),
                  ]}
                  styles={customSelectStyles}
                  isSearchable={true}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  menuPlacement="auto"
                />
              </div>
              <div>
                <div style={{ verticalAlign: "middle" }}>
                  Ledger Name <span style={{ color: "red" }}>*</span>
                </div>

                <Select
                  value={
                    deliveryDetails?.Stock_Item_Ledger_Name
                      ? {
                          value: deliveryDetails?.Stock_Item_Ledger_Id,
                          label: deliveryDetails?.Stock_Item_Ledger_Name,
                        }
                      : { value: "", label: "select", isDisabled: true }
                  }
                  onChange={(e) =>
                    setDeliveryDetails({
                      ...deliveryDetails,
                      Stock_Item_Ledger_Id: e.value,
                      Stock_Item_Ledger_Name: e.label,
                    })
                  }
                  options={[
                    { value: "", label: "select", isDisabled: true },
                    ...(Array.isArray(ledger) ? ledger : []).map((obj) => ({
                      value: obj?.Stock_Item_Ledger_Id,
                      label: obj?.Stock_Item_Ledger_Name,
                    })),
                  ]}
                  styles={customSelectStyles}
                  isSearchable={true}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  menuPlacement="auto"
                />
              </div>
        <div>
  <div style={{ verticalAlign: "middle" }}>
    Voucher Name <span style={{ color: "red" }}>*</span>
  </div>

  <Select
    value={
      deliveryDetails?.Voucher_Type_Id !== undefined
        ? {
            value: String(deliveryDetails.Voucher_Type_Id),
            label: deliveryDetails.Voucher_Type || "Select"
          }
        : { value: "", label: "Select", isDisabled: true }
    }
    onChange={(e) => {
      setDeliveryDetails({
        ...deliveryDetails,
        Voucher_Type_Id: Number(e.value),
        Voucher_Type: e.label,
      });
    }}
    options={[
      { value: 0, label: "Select", isDisabled: true },
      ...(voucher || []).map((obj) => ({
        value: String(obj.Vocher_Type_Id), 
        label: obj.Voucher_Type,
      })),
    ]}
    styles={customSelectStyles}
    isSearchable={true}
    menuPortalTarget={document.body}
    menuPosition="fixed"
    menuPlacement="auto"
    key={deliveryDetails?.Voucher_Type_Id ?? "reset-key"} 
  />
</div>
            </div>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
      onClick={handleSubmit}
      disabled={isSubmitting}
      style={{
        cursor: isSubmitting ? 'not-allowed' : 'pointer',
        opacity: isSubmitting ? 0.3 : 1,
      }}
    >
      {isSubmitting ? (
        <>
          Submitting...
        </>
      ) : (
        'Submit'
      )}
    </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={dialog.filters}
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Filters</DialogTitle>
        <DialogContent>
          <div className="table-responsive pb-4">
            <table className="table">
              <tbody>
                <tr>
                  <td style={{ verticalAlign: "middle" }}>Retailer</td>
                  <td>
                    <Select
                      value={{
                        value: filters?.Retailer_Id,
                        label: filters?.RetailerGet,
                      }}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          Retailer_Id: e.value,
                          RetailerGet: e.label,
                        })
                      }
                      options={[
                        { value: "", label: "ALL" },
                        ...retailers.map((obj) => ({
                          value: obj?.Retailer_Id,
                          label: obj?.Retailer_Name,
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
                      value={{
                        value: filters?.Sales_Person_Id,
                        label: filters?.SalsePersonGet,
                      }}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          Sales_Person_Id: e.value,
                          SalsePersonGet: e.label,
                        })
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
                      value={{
                        value: filters?.Created_by,
                        label: filters?.CreatedByGet,
                      }}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          Created_by: e.value,
                          CreatedByGet: e.label,
                        })
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
                  <td style={{ verticalAlign: "middle" }}>Canceled Order</td>
                  <td>
                    <select
                      type="date"
                      value={filters.Cancel_status}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          Cancel_status: Number(e.target.value),
                        })
                      }
                      className="cus-inpt"
                    >
                      <option value={1}>Active</option>
                      <option value={0}>Cancel</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td style={{ verticalAlign: "middle" }}>Routes</td>
                  <td>
                    <Select
                      value={{
                        value: filters?.Route_Id,
                        label: filters?.RoutesGet,
                      }}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          Route_Id: e.value,
                          RoutesGet: e.label,
                        })
                      }
                      options={[
                        { value: "", label: "ALL" },
                        ...routes.map((obj) => ({
                          value: obj?.Route_Id,
                          label: obj?.Route_Name,
                        })),
                      ]}
                      styles={customSelectStyles}
                      isSearchable={true}
                      placeholder={"Route Name"}
                    />
                  </td>
                </tr>

                <tr>
                  <td style={{ verticalAlign: "middle" }}>Area</td>
                  <td>
                    <Select
                      value={{
                        value: filters?.Area_Id,
                        label: filters?.AreaGet,
                      }}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          Area_Id: e.value,
                          AreaGet: e.label,
                        })
                      }
                      options={[
                        { value: "", label: "ALL" },
                        ...area.map((obj) => ({
                          value: obj?.Area_Id,
                          label: obj?.Area_Name,
                        })),
                      ]}
                      styles={customSelectStyles}
                      isSearchable={true}
                      placeholder={"Area Name"}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SalesDeliveryConvert;
