import { useState, useEffect, useMemo } from "react";
import { Button, Dialog, Box,Tooltip, IconButton, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { Addition, getSessionFiltersByPageId, isEqualNumber, ISOString, NumberFormat, reactSelectFilterLogic, setSessionFilters, toArray } from "../../../Components/functions";
import InvoiceBillTemplate from "../SalesReportComponent/newInvoiceTemplate";
import { Add, Edit, FilterAlt, Search, Sync, Visibility } from "@mui/icons-material";
import { dbStatus } from "../convertedStatus";
import { fetchLink } from "../../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from 'react-toastify'
import InvoiceTemplate from "../LRReport/SalesInvPrint/invTemplate";
import { Close, Print } from "@mui/icons-material";
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
    const location = useLocation();
    const sessionValue = sessionStorage.getItem('filterValues');
    const navigate = useNavigate();
    const [salesInvoice, setSalesInvoice] = useState([]);
    const [filtersDropDown, setFiltersDropDown] = useState({
        voucherType: [],
        retailers: [],
        createdBy: []
    });
    const [isInitialLoad,setIsInitialLoad] = useState(true);
    const [filtersLoaded, setFiltersLoaded] = useState(false);
    const [viewOrder, setViewOrder] = useState({});
    const [reload, setReload] = useState(false);
    const [isLoading, setIsLoading] = useState(true); 
    const [isFetchingData, setIsFetchingData] = useState(false); 
    const [filters, setFilters] = useState(defaultFilters);

    const [dialog, setDialog] = useState({
        filters: false,
        orderDetails: false,
        printInvoice: false,
        deliverySlip: false
    });
    const [selectedInvoice, setSelectedInvoice] = useState(null);
  
    const [voucherFromNavigation,setVoucherFromNavigation]=useState(false)

      useEffect(() => {
        let isMounted = true;
        
        const fetchFilters = async () => {
            try {
                setIsLoading(true);
                const data = await fetchLink({
                    address: `sales/salesInvoice/filterValues`,
                    loadingOn,
                    loadingOff
                });
                
                if (isMounted && data.success) {
                    setFiltersDropDown({
                        voucherType: toArray(data?.others?.voucherType) || [],
                        retailers: toArray(data?.others?.retailers) || [],
                        createdBy: toArray(data?.others?.createdBy) || [],
                    });
                    setFiltersLoaded(true);
                }
            } catch (e) {
                console.error(e);
                toast.error('Failed to load filter options');
            }
        };

        fetchFilters();
        
        return () => {
            isMounted = false;
        };
    }, []);


    useEffect(() => {
        fetchLink({
            address: `sales/salesInvoice/filterValues`
        }).then(data => {
            if (data.success) {
                setFiltersDropDown({
                    voucherType: toArray(data?.others?.voucherType),
                    retailers: toArray(data?.others?.retailers),
                    createdBy: toArray(data?.others?.createdBy),
                });
                setFiltersLoaded(true);
            }
        }).catch(e => console.error(e));
    }, []);




 useEffect(() => {
        if (!filtersLoaded) return;

        const navigationState = location.state || {};
        const sessionFilters = getSessionFiltersByPageId(pageID) || {};
         const hasVoucherFromNavigation = navigationState.VoucherType !== undefined;
        setVoucherFromNavigation(hasVoucherFromNavigation);

        const mergedFilters = {
            ...defaultFilters,
            ...sessionFilters,
              ...(hasVoucherFromNavigation ? navigationState : {})
        };
        
        let voucherTypeFilter = mergedFilters.VoucherType;
        
    if (hasVoucherFromNavigation && voucherTypeFilter) {
            if (typeof voucherTypeFilter === 'object' && voucherTypeFilter.value !== undefined) {
                const voucherExists = filtersDropDown.voucherType.find(v => 
                    v.value === voucherTypeFilter.value || 
                    String(v.value) === String(voucherTypeFilter.value)
                );
                
                if (voucherExists) {
                    voucherTypeFilter = voucherExists;
                }
            } else if (typeof voucherTypeFilter === 'number' || typeof voucherTypeFilter === 'string') {
                const id = voucherTypeFilter;
                const found = filtersDropDown.voucherType.find(v => 
                    v.value === id || 
                    String(v.value) === String(id)
                );
                
                voucherTypeFilter = found || { 
                    value: id, 
                    label: `Voucher ${id}` 
                };
            }
        } else {
  
            voucherTypeFilter = defaultFilters.VoucherType;
        }
        
        const newFilters = {
            Fromdate: mergedFilters.Fromdate || defaultFilters.Fromdate,
            Todate: mergedFilters.Todate || defaultFilters.Todate,
            Retailer: mergedFilters.Retailer || defaultFilters.Retailer,
            CreatedBy: mergedFilters.CreatedBy || defaultFilters.CreatedBy,
            SalesPerson: mergedFilters.SalesPerson || defaultFilters.SalesPerson,
            VoucherType: voucherTypeFilter,
            Cancel_status: mergedFilters.Cancel_status || defaultFilters.Cancel_status
        };
        
        setFilters(newFilters);

        
        if (Object.keys(navigationState).length > 0) {
            setSessionFilters({
                ...navigationState,
                pageID
            });
        }
        
    }, [location.state, pageID, filtersLoaded, filtersDropDown.voucherType]);


  
   useEffect(() => {
        if (!filtersLoaded) return;
        
        const fetchSalesInvoice = async () => {
            const {
                Fromdate = defaultFilters.Fromdate,
                Todate = defaultFilters.Todate,
                Retailer = defaultFilters.Retailer,
                CreatedBy = defaultFilters.CreatedBy,
                VoucherType = defaultFilters.VoucherType,
                Cancel_status = defaultFilters.Cancel_status
            } = filters;

             const voucherValue = voucherFromNavigation ? (VoucherType?.value || VoucherType || '') : '';

  try {
                setIsFetchingData(true);
                const data = await fetchLink({
                    address: `sales/salesInvoice?Fromdate=${Fromdate}&Todate=${Todate}&Retailer_Id=${Retailer?.value || ''}&Created_by=${CreatedBy?.value || ''}&VoucherType=${voucherValue}&Cancel_status=${Cancel_status}`,
                    loadingOn,
                    loadingOff
                });
                
                if (data.success) {
                    setSalesInvoice(data?.data || []);
                } else {
                    setSalesInvoice([]);
                    toast.error(data.message || 'Failed to load sales invoices');
                }
            } catch (e) {
                console.error(e);
                toast.error('Error fetching sales invoices');
                setSalesInvoice([]);
            } finally {
                setIsFetchingData(false);
                setIsInitialLoad(false);
            }
        };

        fetchSalesInvoice();
    }, [filters, pageID, reload, filtersLoaded, voucherFromNavigation]);

  
 const getVoucherLabelById = (id) => {
        if (!id) return { value: '', label: 'ALL' };
        
        const found = filtersDropDown.voucherType.find(v => 
            v.value === id || 
            String(v.value) === String(id)
        );
        return found || { value: id, label: `Voucher ${id}` };
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

  const syncTallyData = async () => {
        try {
            loadingOn?.();
            const data = await fetchLink({
                address: `sales/salesInvoice/tallySync`,
                loadingOn,
                loadingOff
            });
            toast.success(data.message);
            setReload(pre => !pre);
        } catch (e) {
            console.error(e);
            toast.error('Sync failed');
        } finally {
            loadingOff?.();
        }
    }


 const totalValues = useMemo(() => {
        return salesInvoice.reduce((acc, item) => {
            const invoiceValue = Addition(acc.totalInvoiceValue, item.Total_Invoice_value)
            const totals = toArray(item.Products_List).reduce((tot, pro) => {
                return {
                    tonnageValue: Addition(tot.tonnageValue, pro?.Total_Qty),
                    bagsValue: Addition(tot.bagsValue, pro.Alt_Bill_Qty)
                }
            }, {
                tonnageValue: 0,
                bagsValue: 0
            })
            return {
                totalTonnage: Addition(acc.totalTonnage, totals.tonnageValue),
                totalBags: Addition(acc.totalBags, totals.bagsValue),
                totalInvoiceValue: invoiceValue
            }
        }, {
            totalTonnage: 0,
            totalBags: 0,
            totalInvoiceValue: 0
        });
    }, [salesInvoice])



  
    if (!filtersLoaded) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                {/* <CircularProgress /> */}
                <span className="ms-3">Loading filters...</span>
            </Box>
        );
    }

    return (
        <>

          {isFetchingData && (
                <Box position="absolute" top={0} left={0} right={0} zIndex={10}>
                    {/* <LinearProgress /> */}
                </Box>
            )}
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

                        {salesInvoice.length > 0 && (
                            <>
                                <span> Qty: {NumberFormat(totalValues.totalTonnage)} </span>
                                <span> Bag: {NumberFormat(totalValues.totalBags)} &nbsp; </span>
                                <span> Worth: {NumberFormat(totalValues.totalInvoiceValue)} &nbsp; </span>
                            </>
                        )}
                        {filters.VoucherType?.value && (
                            <span className="mx-2 text-primary">
                                Voucher: {filters.VoucherType.label}
                            </span>
                        )}
                    </>
                }
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