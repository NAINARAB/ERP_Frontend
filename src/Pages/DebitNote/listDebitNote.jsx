import { useState, useEffect, useMemo } from "react";
import { Button, Dialog, Tooltip, IconButton, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import Select from "react-select";
import { customSelectStyles } from "../../Components/tablecolumn";
import { Addition, getSessionFiltersByPageId, getSessionUser, isEqualNumber, ISOString, LocalDateWithTime, NumberFormat, reactSelectFilterLogic, setSessionFilters, toArray, toNumber } from "../../Components/functions";
import { Add, Edit, FilterAlt, Search, Visibility } from "@mui/icons-material";
import { dbStatus } from "../Sales/convertedStatus";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable, { createCol, ButtonActions } from "../../Components/filterableTable2";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { Close } from "@mui/icons-material";
// NOTE: Print components could be added here if needed for Credit/Debit Notes in the future

const defaultFilters = {
    Fromdate: ISOString(),
    Todate: ISOString(),
    Retailer: { value: '', label: 'ALL' },
    CreatedBy: { value: '', label: 'ALL' },
    VoucherType: { value: '', label: 'ALL' },
    Cancel_status: ''
};

const DebitNoteList = ({ loadingOn, loadingOff, AddRights, EditRights, pageID }) => {
    const sessionValue = sessionStorage.getItem('filterValues');
    const storage = getSessionUser().user;
    const navigate = useNavigate();
    const location = useLocation();
    const [debitNoteData, setDebitNoteData] = useState([]);
    const [filtersDropDown, setFiltersDropDown] = useState({
        voucherType: [],
        retailers: [],
        createdBy: []
    });
    const [reload, setReload] = useState(false);

    const [filters, setFilters] = useState({
        ...defaultFilters,
        reload: false
    });

    const [dialog, setDialog] = useState({
        filters: false
    });
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    useEffect(() => {
        fetchLink({
            address: `debitNote/filterValues`
        }).then(data => {
            if (data.success) {
                setFiltersDropDown({
                    voucherType: toArray(data?.others?.voucherType),
                    retailers: toArray(data?.others?.retailers),
                    createdBy: toArray(data?.others?.createdBy)
                });
            }
        }).catch(e => console.error(e));
    }, []);

    useEffect(() => {
        const otherSessionFiler = getSessionFiltersByPageId(pageID);
        const {
            Fromdate, Todate,
            Retailer = defaultFilters.Retailer,
            VoucherType = defaultFilters.VoucherType,
            CreatedBy = defaultFilters.CreatedBy,
            Cancel_status = defaultFilters.Cancel_status,
        } = otherSessionFiler;

        setFilters(pre => ({
            ...pre,
            Fromdate: Fromdate || defaultFilters.Fromdate,
            Todate: Todate || defaultFilters.Todate,
            Retailer, VoucherType, CreatedBy, Cancel_status
        }));
    }, [sessionValue, pageID]);

    useEffect(() => {
        const otherSessionFiler = getSessionFiltersByPageId(pageID);
        const {
            Fromdate = defaultFilters.Fromdate,
            Todate = defaultFilters.Todate,
            Retailer = defaultFilters.Retailer,
            VoucherType = defaultFilters.VoucherType,
            CreatedBy = defaultFilters.CreatedBy,
            Cancel_status = defaultFilters.Cancel_status
        } = otherSessionFiler;

        fetchLink({
            address: `debitNote?Fromdate=${Fromdate}&Todate=${Todate}&Retailer_Id=${Retailer?.value || ''}&Created_by=${CreatedBy?.value || ''}&VoucherType=${VoucherType?.value || ''}&Cancel_status=${Cancel_status}`,
            loadingOn,
            loadingOff
        }).then(data => {
            if (data.success) {
                setDebitNoteData(data?.data || []);
            } else {
                setDebitNoteData([]);
                toast.error(data.message || 'Failed to load credit notes');
            }
        }).catch(e => {
            console.error(e);
            toast.error('Error fetching credit notes');
            setDebitNoteData([]);
        });

    }, [sessionValue, pageID, reload, location]);

    const ExpendableComponent = ({ row }) => {
        return (
            <>
                <table className="table">
                    <tbody>
                        <tr>
                            <td className="border p-2 bg-light">Branch</td>
                            <td className="border p-2">{row.Branch_Name}</td>
                            <td className="border p-2 bg-light">Created By</td>
                            <td className="border p-2">{row.Created_BY_Name}</td>
                            <td className="border p-2 bg-light">Round off</td>
                            <td className="border p-2">{row.Round_off}</td>
                        </tr>
                        <tr>
                            <td className="border p-2 bg-light">Invoice Type</td>
                            <td className="border p-2">
                                {isEqualNumber(row.GST_Inclusive, 1) && 'Inclusive'}
                                {isEqualNumber(row.GST_Inclusive, 0) && 'Exclusive'}
                                {isEqualNumber(row.GST_Inclusive, 2) && 'Not-Taxable'}
                            </td>
                            <td className="border p-2 bg-light">Tax Type</td>
                            <td className="border p-2">
                                {isEqualNumber(row.IS_IGST, 1) && 'IGST'}
                                {isEqualNumber(row.IS_IGST, 0) && 'GST'}
                            </td>
                            <td className="border p-2 bg-light">Ref Invoice</td>
                            <td className="border p-2">{row.Ref_Inv_Number}</td>
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
            filters: false
        });
    }

    const totalValues = useMemo(() => {
        return debitNoteData.filter(inv => !isEqualNumber(inv.Cancel_status, 0)).reduce((acc, item) => {
            const invoiceValue = Addition(acc.totalInvoiceValue, item.Total_Invoice_value);
            const totals = toArray(item.Products_List).reduce((tot, pro) => {
                return {
                    tonnageValue: Addition(tot.tonnageValue, pro?.Total_Qty),
                    bagsValue: Addition(tot.bagsValue, pro?.Alt_Bill_Qty)
                }
            }, { tonnageValue: 0, bagsValue: 0 });
            return {
                totalTonnage: Addition(acc.totalTonnage, totals.tonnageValue),
                totalBags: Addition(acc.totalBags, totals.bagsValue),
                totalInvoiceValue: invoiceValue
            }
        }, { totalTonnage: 0, totalBags: 0, totalInvoiceValue: 0 });
    }, [debitNoteData]);

    return (
        <>
            <FilterableTable
                title="Debit Note"
                dataArray={debitNoteData}
                EnableSerialNumber
                columns={[
                    createCol('DB_Date', 'date', 'Date'),
                    createCol('DB_Inv_No', 'string', 'ID'),
                    createCol('Retailer_Name', 'string', 'Customer'),
                    createCol('VoucherTypeGet', 'string', 'Voucher'),
                    createCol('Total_Invoice_value', 'number', 'Invoice Value'),
                    createCol('Created_BY_Name', 'string', 'Created By'),
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
                                            name: 'Edit',
                                            onclick: () => {
                                                navigate('create', {
                                                    state: {
                                                        ...row,
                                                        Product_Array: toArray(row?.Products_List).sort((a, b) => a.S_No - b.S_No),
                                                        isEdit: true,
                                                    },
                                                });
                                            },
                                            icon: <Edit fontSize="small" color="primary" />,
                                            disabled: !EditRights,
                                        }
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
                        <Tooltip title='Filters'>
                            <IconButton
                                size="small"
                                onClick={() => setDialog({ ...dialog, filters: true })}
                            >
                                <FilterAlt />
                            </IconButton>
                        </Tooltip>

                        {debitNoteData.length > 0 && (
                            <>
                                <span> Qty: {NumberFormat(totalValues.totalTonnage)} </span>
                                <span> Bag: {NumberFormat(totalValues.totalBags)} &nbsp; </span>
                                <span> Worth: {NumberFormat(totalValues.totalInvoiceValue)} &nbsp; </span>
                            </>
                        )}
                    </>
                }
                isExpendable={true}
                tableMaxHeight={550}
                expandableComp={ExpendableComponent}
            />

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
                                            placeholder={"Created By Name"}
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
        </>
    )
}

export default DebitNoteList;
