import React, { useState, useEffect, useMemo } from "react";
import { Button, Dialog, Tooltip, IconButton, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { Addition, getSessionFiltersByPageId, isEqualNumber, ISOString, isValidDate, NumberFormat, reactSelectFilterLogic, setSessionFilters, toArray, toNumber } from "../../../Components/functions";
import InvoiceBillTemplate from "../SalesReportComponent/newInvoiceTemplate";
import { Add, Edit, FilterAlt, Search, Sync, Visibility } from "@mui/icons-material";
import { dbStatus } from "../convertedStatus";
import { fetchLink } from "../../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from 'react-toastify'
import InvoiceTemplate from "../LRReport/SalesInvPrint/invTemplate";
import { Close,Print } from "@mui/icons-material";
import { ButtonActions } from "../../../Components/filterableTable2";
import DeliverySlipprint from "../LRReport/deliverySlipPrint";
const defaultFilters = {
    Fromdate: ISOString(),
    Todate: ISOString(),
    Retailer: { value: '', label: 'ALL' },
    CreatedBy: { value: '', label: 'ALL' },
    SalesPerson: { value: '', label: 'ALL' },
    VoucherType: { value: '', label: 'ALL' },
    Cancel_status: ''
};

const SaleInvoiceList = ({ loadingOn, loadingOff, AddRights, EditRights, pageID }) => {
    const sessionValue = sessionStorage.getItem('filterValues');
    const navigate = useNavigate();
    const [salesInvoice, setSalesInvoice] = useState([]);
    const [filtersDropDown, setFiltersDropDown] = useState({
        voucherType: [],
        retailers: [],
        createdBy: []
    });
    const [viewOrder, setViewOrder] = useState({});
    const [reload, setReload] = useState(false)

    const [filters, setFilters] = useState(defaultFilters);

    const [dialog, setDialog] = useState({
        filters: false,
        orderDetails: false,
           printInvoice: false, 
           deliverySlip:false
    });
    const [selectedInvoice, setSelectedInvoice] = useState(null); 


  


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
            Fromdate, Todate, Retailer, CreatedBy,
            SalesPerson, VoucherType, Cancel_status
        }));

    }, [sessionValue, pageID]);

    useEffect(() => {
        const otherSessionFiler = getSessionFiltersByPageId(pageID);
        const {
            Fromdate, Todate,
            Retailer = defaultFilters.Retailer.value,
            CreatedBy = defaultFilters.CreatedBy.value,
            VoucherType = defaultFilters.VoucherType.value,
            Cancel_status = defaultFilters.Cancel_status
        } = otherSessionFiler;

        fetchLink({
            address: `sales/salesInvoice?
            Fromdate=${Fromdate}&
            Todate=${Todate}&
            Retailer_Id=${Retailer?.value}&
            Created_by=${CreatedBy?.value}&
            VoucherType=${VoucherType?.value}&
            Cancel_status=${Cancel_status}`,
            loadingOn, loadingOff
        }).then(data => {
            if (data.success) {
                setSalesInvoice(data?.data)
            }
        }).catch(e => console.error(e));

    }, [sessionValue, pageID, reload])

    useEffect(() => {

        fetchLink({
            address: `sales/salesInvoice/filterValues`
        }).then(data => {
            if (data.success) {
                setFiltersDropDown({
                    voucherType: toArray(data?.others?.voucherType),
                    retailers: toArray(data?.others?.retailers),
                    createdBy: toArray(data?.others?.createdBy),
                })
            }
        }).catch(e => console.error(e))

    }, [])

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

    const closeDialog = () => {
        setDialog({
            ...dialog,
            filters: false,
            orderDetails: false,
        });
    }

    const syncTallyData = () => {
        fetchLink({
            address: `sales/salesInvoice/tallySync`,
            loadingOn, loadingOff
        }).then(data => {
            toast.success(data.message);
            setReload(pre => !pre)
        }).catch(e => console.error(e))
    }

    return (
        <>
            <FilterableTable
                title="Sales Invoice"
                dataArray={salesInvoice}
                EnableSerialNumber
                columns={[
                    createCol('Do_Date', 'date', 'Date'),
                    createCol('Do_Inv_No', 'string', 'ID'),
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
                            const convert = dbStatus.find(status => status.id === Number(row?.Cancel_status));
                            return (
                                <span className={'py-0 fw-bold px-2 rounded-4 fa-12 ' + convert?.color ?? 'bg-secondary text-white'}>
                                    {convert?.label ?? ''}
                                </span>
                            )
                        },
                    },
                    // {
                    //     Field_Name: 'Action',
                    //     isVisible: 1,
                    //     isCustomCell: true,
                    //     Cell: ({ row }) => {
                    //         return (
                    //             <>
                    //                 <Tooltip title='View Order'>
                    //                     <IconButton
                    //                         onClick={() => {
                    //                             setViewOrder({
                    //                                 orderDetails: row,
                    //                                 orderProducts: row?.Products_List ? row?.Products_List : [],
                    //                             })
                    //                         }}
                    //                         color='primary' size="small"
                    //                     >
                    //                         <Visibility className="fa-16" />
                    //                     </IconButton>
                    //                 </Tooltip>
                    //                            <Tooltip title='Print Invoice'>
                    //                     <IconButton
                    //                         onClick={() => {
                    //                             setSelectedInvoice(row); 
                    //                             setDialog(pre => ({ ...pre, printInvoice: true })); 
                    //                         }}
                    //                         color='secondary' size="small"
                    //                     >
                    //                         <Print className="fa-16" />
                    //                     </IconButton>
                    //                 </Tooltip>

                    //                 {EditRights && (
                    //                     <Tooltip title='Edit'>
                    //                         <IconButton
                    //                             onClick={() => navigate('create', {
                    //                                 state: {
                    //                                     ...row,
                    //                                     isEdit: true
                    //                                 }
                    //                             })}
                    //                             size="small"
                    //                         >
                    //                             <Edit className="fa-16" />
                    //                         </IconButton>
                    //                     </Tooltip>
                    //                 )}

                    //             </>
                    //         )
                    //     },
                    // },


                    {
    Field_Name: 'Action',
    isVisible: 1,
    isCustomCell: true,
    Cell: ({ row }) => {
        return (
            <ButtonActions
                buttonsData={[
                    {
                        name: 'View Order',
                        onclick: () => {
                            setViewOrder({
                                orderDetails: row,
                                orderProducts: row?.Products_List ? row?.Products_List : [],
                            })
                        },
                        icon: <Visibility fontSize="small" color="primary" />,
                    },
                    {
                        name: 'Print Invoice',
                        onclick: () => {
                            setSelectedInvoice(row);
                            setDialog(pre => ({ ...pre, printInvoice: true }));
                        },
                        icon: <Print fontSize="small" color="primary" />,
                    },
                   {
  name: 'Edit',
  onclick: () => {
  
    navigate('create', {
      state: {
        ...row,
        isEdit: true,
      },
    });
  },
  icon: <Edit fontSize="small" color="primary" />,
  disabled: !EditRights,
},

                       {
                        name: 'Delivery Slip',
                        onclick: () => {
                            setSelectedInvoice(row);
                            setDialog(pre => ({ ...pre, deliverySlip: true }));
                        },
                        icon: <Print fontSize="small" color="primary" />,
                    },
                ]}
            />
        )
    },
}
                ]}
                ButtonArea={
                    <>
                        {AddRights && (
                            <Button
                                variant='outlined'
                                startIcon={<Add />}
                                onClick={() => navigate('create')}
                            >
                                NEW
                            </Button>
                        )}
                        {AddRights && (
                            <Tooltip title='Sync tally data'>
                                <Button
                                    className="mx-1"
                                    variant="outlined"
                                    onClick={syncTallyData}
                                    startIcon={<Sync color="primary" />}
                                >Sync Tally</Button>
                            </Tooltip>
                        )}
                        <Tooltip title='Filters'>
                            <IconButton
                                size="small"
                                onClick={() => setDialog({ ...dialog, filters: true })}
                            >
                                <FilterAlt />
                            </IconButton>
                        </Tooltip>
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
                                                ...filtersDropDown.retailers
                                            ]}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Retailer Name"}
                                            menuPortalTarget={document.body}
                                            filterOption={reactSelectFilterLogic}
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
                                                ...filtersDropDown.voucherType
                                            ]}
                                            styles={customSelectStyles}
                                            menuPortalTarget={document.body}
                                            isSearchable={true}
                                            placeholder={"Voucher Name"}
                                            filterOption={reactSelectFilterLogic}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Canceled Order</td>
                                    <td>
                                        <select
                                            type="date"
                                            value={filters.Cancel_status}
                                            onChange={e => setFilters({ ...filters, Cancel_status: e.target.value })}
                                            className="cus-inpt"
                                        >
                                            <option value={''}>All</option>
                                            {dbStatus.map((sts, ind) => (
                                                <option value={sts.id} key={ind}>{sts.label}</option>
                                            ))}
                                        </select>
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
                                                ...filtersDropDown.createdBy
                                            ]}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Sales Person Name"}
                                            menuPortalTarget={document.body}
                                            filterOption={reactSelectFilterLogic}
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
                                VoucherType: filters.VoucherType,
                                Cancel_status: filters.Cancel_status,
                            });
                        }}
                        startIcon={<Search />}
                        variant="outlined"
                    >Search</Button>
                </DialogActions>
            </Dialog>


  <Dialog
                open={dialog.printInvoice}
                onClose={() => {
                    setDialog(pre => ({ ...pre, printInvoice: false }));
                    setSelectedInvoice(null);
                }}
                maxWidth="lg"
                fullWidth
                scroll="paper"
            >
                <DialogTitle>
                    Print Invoice #{selectedInvoice?.Do_Inv_No}
                    <IconButton
                        onClick={() => {
                            setDialog(pre => ({ ...pre, printInvoice: false }));
                            setSelectedInvoice(null);
                        }}
                        style={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {selectedInvoice?.Do_Id && (
                        <InvoiceTemplate
                            Do_Id={selectedInvoice.Do_Id}
                            loadingOn={loadingOn}
                            loadingOff={loadingOff}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => {
                            setDialog(pre => ({ ...pre, printInvoice: false }));
                            setSelectedInvoice(null);
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>




  <Dialog
                open={dialog.deliverySlip}
                onClose={() => {
                    setDialog(pre => ({ ...pre, deliverySlip: false }));
                    setSelectedInvoice(null);
                }}
                maxWidth="lg"
                fullWidth
                scroll="paper"
            >
                <DialogTitle>
                    Print Delivery Slip #{selectedInvoice?.Do_Inv_No}
                    <IconButton
                        onClick={() => {
                            setDialog(pre => ({ ...pre, deliverySlip: false }));
                            setSelectedInvoice(null);
                        }}
                        style={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {selectedInvoice?.Do_Id && (
                        <DeliverySlipprint
                            Do_Id={selectedInvoice.Do_Id}
                            loadingOn={loadingOn}
                            loadingOff={loadingOff}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => {
                            setDialog(pre => ({ ...pre, deliverySlip: false }));
                            setSelectedInvoice(null);
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>


        </>
    )
}

export default SaleInvoiceList;