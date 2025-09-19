import { useState, useEffect, useMemo } from "react";
import { Button, Dialog, Tooltip, IconButton, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { Addition, getSessionFiltersByPageId, isEqualNumber, ISOString, NumberFormat, setSessionFilters, toNumber } from "../../../Components/functions";
import InvoiceBillTemplate from "../SalesReportComponent/newInvoiceTemplate";
import { Add, Edit, FilterAlt, Search, Visibility } from "@mui/icons-material";
import { convertedStatus } from "../convertedStatus";
import { fetchLink } from "../../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import { useNavigate } from "react-router-dom";
import NoteIcon from '@mui/icons-material/Note';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import DirectSaleInvoiceFromPos from "../SalesInvoice/directSaleInvoiceFromPos";
import { isGraterNumber } from "../../../Components/functions";

const SaleOrderList = ({ loadingOn, loadingOff, AddRights, EditRights, pageID }) => {
    const sessionValue = sessionStorage.getItem('filterValues');
    const defaultFilters = {
        Fromdate: ISOString(),
        Todate: ISOString(),
        Retailer: { value: '', label: 'ALL' },
        CreatedBy: { value: '', label: 'ALL' },
        SalesPerson: { value: '', label: 'ALL' },
        VoucherType: { value: '', label: 'ALL' },
        Cancel_status: 0,
         OrderStatus: { value: '', label: 'ALL' }
    };

    const storage = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();
    const [saleOrders, setSaleOrders] = useState([]);
    const [retailers, setRetailers] = useState([]);
    const [salesPerson, setSalePerson] = useState([]);
    const [users, setUsers] = useState([]);
    const [voucher, setVoucher] = useState([]);
    const [viewOrder, setViewOrder] = useState({});
//   const [receiptOrder, setReceiptOrder] = useState(false);
// const [receiptData, setReceiptData] = useState([]);
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
            Fromdate, Todate,
            Retailer = defaultFilters.Retailer,
            CreatedBy = defaultFilters.CreatedBy,
            SalesPerson = defaultFilters.SalesPerson,
            VoucherType = defaultFilters.VoucherType,
            Cancel_status = defaultFilters.Cancel_status,
              OrderStatus = defaultFilters.OrderStatus // NEW
        } = otherSessionFiler;

        setFilters(pre => ({
            ...pre,
            Fromdate, Todate,
            Retailer, CreatedBy, SalesPerson,
            VoucherType, Cancel_status,
            OrderStatus
        }));

    }, [sessionValue, pageID]);

const handleOpenModal = (row) => {
  // Build payload in Pre-Sale style format
  const payload = buildSaleOrderPayload(row);

  // Normalize staff array (always ensure it exists)
  const normalizedPayload = {
    ...payload,
    Staffs_Array: payload?.Staffs_Array || [],
  };

  setSelectedOrder({
    row,
    payload: normalizedPayload,
  });

  setModalOpen(true);
};

const handleCloseModal = () => {
  setModalOpen(false);
  setSelectedOrder(null);
};

const buildSaleOrderPayload = (data) => {
  // Extract weight from product name (e.g., "2kg Chips" → 2)
  const extractWeightFromName = (name) => {
    const match = name?.match(/(\d+)\s?kg/i);
    return match ? parseInt(match[1]) : 1;
  };

  // Convert Products_List → Product_Array
  const validProducts = Array.isArray(data.ProductList)
    ? data.ProductList
        .filter((p) => isGraterNumber(p?.Bill_Qty, 0))
        .map((p) => {
          const weight = extractWeightFromName(p?.Product_Name);
          return {
            ...p,
            Pre_Id: data?.Pre_Id,
            Bill_Qty: weight * p?.Bill_Qty,
            Total_Qty: p?.Bill_Qty,
          };
        })
    : [];

  // Convert Staff_Involved_List → Staffs_Array
  const transformStaffData = (orderData) => {
    const staffs = [];

    // Broker
    if (orderData.Broker_Id && orderData.Broker_Id !== 0) {
      staffs.push({
        Id: "",
        So_Id: "",
        Emp_Id: orderData.Broker_Id,
        Emp_Type_Id: orderData.Broker_Type || 0,
      });
    }

    // Transporter
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

  // Return normalized Pre-Sale invoice format
  return {
    Pre_Id: data?.Pre_Id ?? data?.So_Id ?? null,
    Pos_Id: data?.So_Branch_Inv_Id ?? null,
    Pre_Date: data?.So_Date ?? data?.Pre_Date ?? null,

    Custome_Id: data?.Retailer_Id ?? null,
    Retailer_Id: data?.Retailer_Id ?? null,
    Retailer_Name: data?.Retailer_Name ?? "",

    Broker_Id: data?.Broker_Id ?? null,
    Broker_Name: data?.Broker_Name ?? "",
    Broker_Type: data?.Broker_Type ?? null,

    Transporter_Id: data?.Transporter_Id ?? null,
    Transporter_Name: data?.Transporter_Name ?? "",
    TrasnportType: data?.TrasnportType ?? null,

    ProductList: data?.ProductList ?? [],
    Product_Array: validProducts,

    Staffs_Array: transformStaffData(data),

    Total_Invoice_value: data?.Total_Invoice_value ?? 0,
    Status: data?.OrderStatus ?? data?.Status ?? "Pending",

    Trans_Type: data?.Trans_Type ?? null,
    Created_by: data?.Created_by ?? "0",
    Created_on: data?.Created_on ?? null,
    isConverted: data?.isConverted ?? 0,
  };
};


    useEffect(() => {

        fetchLink({
            address: `sales/saleOrder/retailers`
        }).then(data => {
            if (data.success) {
                setRetailers(data.data);
            }
        }).catch(e => console.error(e))

        fetchLink({
            address: `masters/users/salesPerson/dropDown?Company_id=${storage?.Company_id}`
        }).then(data => {
            if (data.success) {
                setSalePerson(data.data)
            }
        }).catch(e => console.error(e))

        fetchLink({
            address: `masters/user/dropDown?Company_id=${storage?.Company_id}`
        }).then(data => {
            if (data.success) {
                setUsers(data.data)
            }
        }).catch(e => console.error(e))

        fetchLink({
            address: `masters/voucher`
        }).then(data => {
            if (data.success) {
                setVoucher(data.data);
            }
        }).catch(e => console.error(e))

    }, [])

    useEffect(() => {
        const otherSessionFiler = getSessionFiltersByPageId(pageID);
        const {
            Fromdate, Todate,
            Retailer = defaultFilters.Retailer,
            CreatedBy = defaultFilters.CreatedBy,
            SalesPerson = defaultFilters.SalesPerson,
            VoucherType = defaultFilters.VoucherType,
            Cancel_status = defaultFilters.Cancel_status
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
            OrderStatus=${filters?.OrderStatus?.value || ''}`,
            loadingOn, loadingOff
        }).then(data => {
            if (data.success) {
                setSaleOrders(data?.data)
            }
        }).catch(e => console.error(e));

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
    }

    const Total_Invoice_value = useMemo(() => saleOrders.reduce(
        (acc, orders) => Addition(acc, orders?.Total_Invoice_value), 0
    ), [saleOrders])

    return (
        <>
            <FilterableTable
                title="Sale Orders"
                dataArray={saleOrders}
                EnableSerialNumber
                columns={[
                    createCol('So_Date', 'date', 'Date'),
                    createCol('So_Inv_No', 'string', 'ID'),
                    createCol('Retailer_Name', 'string', 'Customer'),
                    createCol('VoucherTypeGet', 'string', 'Voucher'),
                    createCol('Total_Before_Tax', 'number', 'Before Tax'),
                    createCol('Total_Tax', 'number', 'Tax'),
                    createCol('Total_Invoice_value', 'number', 'Invoice Value'),
                    {
                        ColumnHeader: 'Status',
                        isVisible: 1,
                        align: 'center',
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            const convert = convertedStatus.find(status => status.id === Number(row?.isConverted));
                            return (
                                <span className={'py-0 fw-bold px-2 rounded-4 fa-12 ' + convert?.color ?? 'bg-secondary text-white'}>
                                    {convert?.label ?? 'Undefined'}
                                </span>
                            )
                        },
                    },
                    {
                        Field_Name: 'Action',
                        isVisible: 1,
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            return (
                                <>
                                    <Tooltip title='View Order'>
                                        <IconButton
                                            onClick={() => {
                                                setViewOrder({
                                                    orderDetails: row,
                                                    orderProducts: row?.Products_List ? row?.Products_List : [],
                                                })
                                            }}
                                            color='primary' size="small"
                                        >
                                            <Visibility className="fa-16" />
                                        </IconButton>
                                    </Tooltip>
                                  
                                    {EditRights && (
                                        <Tooltip title='Edit'>
                                            <IconButton
                                                onClick={() => navigate('create', {
                                                    state: {
                                                        ...row,
                                                        isEdit: true
                                                    }
                                                })}
                                                size="small"
                                            >
                                                <Edit className="fa-16" />
                                            </IconButton>
                                        </Tooltip>
                                    )}

                </>
                            )
                        },
                    },
                ]}
                ButtonArea={
                    <>
                        {AddRights && (
                            <Button
                                variant='outlined'
                                startIcon={<Add />}
                                onClick={() => navigate('create')}
                            >
                                {'New'}
                            </Button>
                        )}
                        <Tooltip title='Filters'>
                            <IconButton
                                size="small"
                                onClick={() => setDialog({ ...dialog, filters: true })}
                            >
                                <FilterAlt />
                            </IconButton>
                        </Tooltip>
                        <span className="bg-light text-light fa-11 px-1 shadow-sm py-1 rounded-3 mx-1">
                            {toNumber(Total_Invoice_value) > 0 && <h6 className="m-0 text-end text-muted px-3">Total: {NumberFormat(Total_Invoice_value)}</h6>}
                        </span>
                    </>
                }
                // EnableSerialNumber={true}
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
                    TitleText={'Sale Order'}
                />
            )}

            <Dialog
                open={dialog.filters}
                onClose={closeDialog}
                fullWidth maxWidth='sm'
            >
                <DialogTitle>Filters</DialogTitle>
                <DialogContent>
                    <div className="table-responsive pb-4">
                        <table className="table">
                            <tbody>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>From</td>
                                    <td>
                                        <input
                                            type="date"
                                            value={filters.Fromdate}
                                            onChange={e => setFilters({ ...filters, Fromdate: e.target.value })}
                                            className="cus-inpt"
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>To</td>
                                    <td>
                                        <input
                                            type="date"
                                            value={filters.Todate}
                                            onChange={e => setFilters({ ...filters, Todate: e.target.value })}
                                            className="cus-inpt"
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Retailer</td>
                                    <td>
                                        <Select
                                            value={filters?.Retailer}
                                            onChange={(e) => setFilters({ ...filters, Retailer: e })}
                                            options={[
                                                { value: '', label: 'ALL' },
                                                ...retailers.map(obj => ({
                                                    value: obj?.Retailer_Id,
                                                    label: obj?.Retailer_Name
                                                        + '- ₹'
                                                        + NumberFormat(toNumber(obj?.TotalSales))
                                                        + ` (${toNumber(obj?.OrderCount)})`
                                                }))
                                            ]}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Retailer Name"}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Salse Person</td>
                                    <td>
                                        <Select
                                            value={filters?.SalesPerson}
                                            onChange={(e) => setFilters(pre => ({ ...pre, SalesPerson: e }))}
                                            options={[
                                                { value: '', label: 'ALL' },
                                                ...salesPerson.map(obj => ({ value: obj?.UserId, label: obj?.Name }))
                                            ]}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Sales Person Name"}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Created By</td>
                                    <td>
                                        <Select
                                            value={filters?.CreatedBy}
                                            onChange={(e) => setFilters(pre => ({ ...pre, CreatedBy: e }))}
                                            options={[
                                                { value: '', label: 'ALL' },
                                                ...users.map(obj => ({ value: obj?.UserId, label: obj?.Name }))
                                            ]}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Sales Person Name"}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Voucher </td>
                                    <td>
                                        <Select
                                            value={filters?.VoucherType}
                                            onChange={(e) => setFilters({ ...filters, VoucherType: e })}
                                            options={[
                                                { value: '', label: 'ALL' },
                                                ...voucher.filter(
                                                    obj => obj.Type === 'SALES'
                                                ).map(obj => ({ value: obj?.Vocher_Type_Id, label: obj?.Voucher_Type }))
                                            ]}
                                            styles={customSelectStyles}
                                            menuPortalTarget={document.body}
                                            isSearchable={true}
                                            placeholder={"Voucher Name"}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Canceled Order</td>
                                    <td>
                                        <select
                                            type="date"
                                            value={filters.Cancel_status}
                                            onChange={e => setFilters({ ...filters, Cancel_status: Number(e.target.value) })}
                                            className="cus-inpt"
                                        >
                                            <option value={1}>Show</option>
                                            <option value={0}>Hide</option>
                                        </select>
                                    </td>
                                </tr>

                                <tr>
    <td style={{ verticalAlign: 'middle' }}>Order Status</td>
    <td>
        <Select
            value={filters?.OrderStatus}
            onChange={(e) => setFilters({ ...filters, OrderStatus: e })}
            options={[
                { value: '', label: 'ALL' },
                { value: 'pending', label: 'Pending' },
                { value: 'completed', label: 'Completed' }
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
                                OrderStatus: filters.OrderStatus
                            });
                        }}
                        startIcon={<Search />}
                        variant="outlined"
                    >Search</Button>
                </DialogActions>
            </Dialog>


<DirectSaleInvoiceFromPos
  open={modalOpen}
  onClose={handleCloseModal}
  editValues={selectedOrder?.row}         // original row (unchanged)
  defaultValues={selectedOrder?.row}  // processed payload (with BillQty, ActQty, PendingQty)
  loadingOn={loadingOn}
  loadingOff={loadingOff}
/>





        </>
    )
}

export default SaleOrderList;