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
const SaleOrderList = ({ loadingOn, loadingOff, AddRights, EditRights, pageID }) => {
    const sessionValue = sessionStorage.getItem('filterValues');
    const defaultFilters = {
        Fromdate: ISOString(),
        Todate: ISOString(),
        Retailer: { value: '', label: 'ALL' },
        CreatedBy: { value: '', label: 'ALL' },
        SalesPerson: { value: '', label: 'ALL' },
        VoucherType: { value: '', label: 'ALL' },
        Cancel_status: 0
    };

    const storage = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();
    const [saleOrders, setSaleOrders] = useState([]);
    const [retailers, setRetailers] = useState([]);
    const [salesPerson, setSalePerson] = useState([]);
    const [users, setUsers] = useState([]);
    const [voucher, setVoucher] = useState([]);
    const [viewOrder, setViewOrder] = useState({});
  const [receiptOrder, setReceiptOrder] = useState(false);
const [receiptData, setReceiptData] = useState([]);
const [loading, setLoading] = useState(false);


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
            Cancel_status = defaultFilters.Cancel_status
        } = otherSessionFiler;

        setFilters(pre => ({
            ...pre,
            Fromdate, Todate,
            Retailer, CreatedBy, SalesPerson,
            VoucherType, Cancel_status
        }));

    }, [sessionValue, pageID]);

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
            Cancel_status=${Cancel_status}`,
            loadingOn, loadingOff
        }).then(data => {
            if (data.success) {
                setSaleOrders(data?.data)
            }
        }).catch(e => console.error(e));

    }, [sessionValue, pageID]);

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
            </>
        )
    }


const InvoicePendingData = async (row) => {
  setLoading(true);
  try {
    const res = await fetchLink({
      address: `/sales/salesInvoice/Details?So_Id=${row?.So_Id}`
    });

    if (res?.success) {
      setReceiptData(res.data); // store API response data
    } else {
      console.error("Failed to fetch invoice details:", res?.message);
    }
  } catch (err) {
    console.error("Error fetching receipts:", err);
  } finally {
    setLoading(false);
  }
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
<Tooltip title="View Receipts">
  <IconButton
    onClick={() => {
      setReceiptOrder(true);   // open dialog
      setLoading(true);        // show loader
      InvoicePendingData(row); // fetch data once
    }}
  >
    <NoteIcon />
  </IconButton>
</Tooltip>
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
                expandableComp={ExpendableComponent}
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
                                Cancel_status: filters.Cancel_status
                            });
                        }}
                        startIcon={<Search />}
                        variant="outlined"
                    >Search</Button>
                </DialogActions>
            </Dialog>



<Dialog
  open={receiptOrder}
  onClose={() => setReceiptOrder(false)}
  maxWidth="lg"
  fullWidth
>
  <DialogTitle>Order Details</DialogTitle>
  <DialogContent dividers>
    {loading ? (
      <p>Loading...</p>
    ) : receiptData ? (
      <>
        {/* Receipts Section */}
        {receiptData?.Receipts?.length > 0 && (
          <>
            <h3 className="font-bold mb-2">Receipts</h3>
            <table className="table-auto w-full border mb-4">
              <thead>
                <tr>
                  <th className="border px-2 py-1">Receipt No</th>
                  <th className="border px-2 py-1">Amount</th>
                  <th className="border px-2 py-1">Date</th>
                </tr>
              </thead>
              <tbody>
                {receiptData.Receipts.map((r, i) => (
                  <tr key={i}>
                    <td className="border px-2 py-1">{r.Receipt_No}</td>
                    <td className="border px-2 py-1">{r.Amount}</td>
                    <td className="border px-2 py-1">{r.Receipt_Date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Products Section */}
        {receiptData?.Products_List?.length > 0 && (
          <>
            <h3 className="font-bold mb-2">Products</h3>
            <table className="table-auto w-full border">
              <thead>
                <tr>
                  <th className="border px-2 py-1">Product</th>
                  <th className="border px-2 py-1">Bill Qty</th>
                  <th className="border px-2 py-1">Actual Qty</th>
                  <th className="border px-2 py-1">Status</th>
                </tr>
              </thead>
              <tbody>
                {receiptData.Products_List.map((p, i) => {
                  const status =
                    Number(p.Bill_Qty) === Number(p.Act_Qty)
                      ? "Completed"
                      : "Pending";
                  return (
                    <tr key={i}>
                      <td className="border px-2 py-1">{p.Product_Name}</td>
                      <td className="border px-2 py-1">{p.Bill_Qty}</td>
                      <td className="border px-2 py-1">{p.Act_Qty ?? "-"}</td>
                      <td
                        className={`border px-2 py-1 font-bold ${
                          status === "Completed"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {status}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}
      </>
    ) : (
      <p>No details found.</p>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setReceiptOrder(false)}>Close</Button>
  </DialogActions>
</Dialog>


        </>
    )
}

export default SaleOrderList;