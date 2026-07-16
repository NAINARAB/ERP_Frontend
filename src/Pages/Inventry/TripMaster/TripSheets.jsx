import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip } from "@mui/material";
import FilterableTable, { ButtonActions, createCol } from "../../../Components/filterableTable2";
import { useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Addition, ISOString, isValidDate, isValidObject, LocalDate, LocalTime, Multiplication, NumberFormat, numberToWords, reactSelectFilterLogic, Subraction, timeDuration, toArray, toNumber } from "../../../Components/functions";
import { Download, Edit, FilterAlt, LocalShipping, Search, Visibility, AddShoppingCart, Receipt } from "@mui/icons-material";
import { fetchLink } from "../../../Components/fetchComponent";
import { useReactToPrint } from 'react-to-print';
import Select from 'react-select';
import { customSelectStyles } from "../../../Components/tablecolumn";
import DeliveryChallan from "./deliveryChallan";
import AlterHistoryTable from "../../../Components/alterHistoryTable";

const useQuery = () => new URLSearchParams(useLocation().search);
const defaultFilters = {
    Fromdate: ISOString(),
    Todate: ISOString(),
};

const TripSheets = ({ loadingOn, loadingOff }) => {

    const nav = useNavigate();
    const location = useLocation();
    const query = useQuery();
    const [tripData, setTripData] = useState([]);
    const [filters, setFilters] = useState({
        Fromdate: defaultFilters.Fromdate,
        Todate: defaultFilters.Todate,
        fetchFrom: defaultFilters.Fromdate,
        fetchTo: defaultFilters.Todate,
        filterDialog: false,
        refresh: false,
        printPreviewDialog: false,
        deliveryChallanDialog: false,
        FromGodown: [],
        ToGodown: [],
        Staffs: [],
        Items: [],
        VoucherType: [],
    });
    const [selectedRow, setSelectedRow] = useState({});
    const printRef = useRef(null);
    const deliveryChallanPrintRef = useRef(null);

    useEffect(() => {
        if (loadingOn) loadingOn();

        fetchLink({
            address: `inventory/tripSheet?Fromdate=${filters?.fetchFrom}&Todate=${filters?.fetchTo}`,
        }).then(data => {
            if (data.success) {
                setTripData(data.data);
            }
        }).finally(() => {
            if (loadingOff) loadingOff();
        }).catch(e => console.error(e))
    }, [filters?.fetchFrom, filters?.fetchTo]);

    useEffect(() => {
        const queryFilters = {
            Fromdate: query.get("Fromdate") && isValidDate(query.get("Fromdate"))
                ? query.get("Fromdate")
                : defaultFilters.Fromdate,
            Todate: query.get("Todate") && isValidDate(query.get("Todate"))
                ? query.get("Todate")
                : defaultFilters.Todate,
        };
        setFilters(pre => ({ ...pre, fetchFrom: queryFilters.Fromdate, fetchTo: queryFilters.Todate }));
    }, [location.search]);

    const updateQueryString = (newFilters) => {
        const params = new URLSearchParams(newFilters);
        nav(`?${params.toString()}`, { replace: true });
    };

    const closeDialog = () => {
        setFilters({
            ...filters,
            filterDialog: false,
        });
    }

    const printProductsList = useMemo(() => {
        const billType = selectedRow?.BillType;

        if (billType === 'CREDIT_NOTE') {
            const noteList = Array.isArray(selectedRow?.Credit_Note_List) ? selectedRow.Credit_Note_List : [];
            // Flatten all product rows, carrying the parent note's retailer & inv no
            const allProducts = noteList.flatMap(note =>
                (Array.isArray(note.Products_List) ? note.Products_List : []).map(p => ({
                    ...p,
                    _Retailer_Name: note.Retailer_Name,
                    _Inv_No: note.CR_Inv_No,
                    _Note_Id: note.CR_Id,
                    // Normalise field names to match MATERIAL INWARD items
                    QTY: toNumber(p.QTY),
                    KGS: toNumber(p.KGS ?? 0),
                    Total_Value: toNumber(p.Total_Value),
                    Taxable_Value: toNumber(p.Taxable_Amount ?? 0),
                    HSN_Code: p.HSN_Code,
                    Product_Name: p.Product_Name,
                    Gst_Rate: toNumber(p.Gst_Rate ?? 0),
                    Cgst_P: toNumber(p.Cgst_P ?? 0),
                    Sgst_P: toNumber(p.Sgst_P ?? 0),
                    Igst_P: toNumber(p.Igst_P ?? 0),
                }))
            );
            // Merge same Item_Id across all notes
            return allProducts.reduce((acc, item) => {
                const existing = acc.find(x => x.Item_Id === item.Item_Id && x._Note_Id === item._Note_Id);
                if (existing) {
                    existing.QTY = Addition(existing.QTY, item.QTY);
                    existing.KGS = Addition(existing.KGS, item.KGS);
                    existing.Total_Value = Addition(existing.Total_Value, item.Total_Value);
                    existing.Taxable_Value = Addition(existing.Taxable_Value, item.Taxable_Value);
                    existing.Cgst_P = Addition(existing.Cgst_P, item.Cgst_P);
                    existing.Sgst_P = Addition(existing.Sgst_P, item.Sgst_P);
                    existing.Igst_P = Addition(existing.Igst_P, item.Igst_P);
                    return acc;
                }
                return [...acc, { ...item }];
            }, []);
        }

        if (billType === 'DEBIT_NOTE') {
            const noteList = Array.isArray(selectedRow?.Debit_Note_List) ? selectedRow.Debit_Note_List : [];
            const allProducts = noteList.flatMap(note =>
                (Array.isArray(note.Products_List) ? note.Products_List : []).map(p => ({
                    ...p,
                    _Retailer_Name: note.Retailer_Name,
                    _Inv_No: note.DB_Inv_No,
                    _Note_Id: note.DB_Id,
                    QTY: toNumber(p.QTY),
                    KGS: toNumber(p.KGS ?? 0),
                    Total_Value: toNumber(p.Total_Value),
                    Taxable_Value: toNumber(p.Taxable_Amount ?? 0),
                    HSN_Code: p.HSN_Code,
                    Product_Name: p.Product_Name,
                    Gst_Rate: toNumber(p.Gst_Rate ?? 0),
                    Cgst_P: toNumber(p.Cgst_P ?? 0),
                    Sgst_P: toNumber(p.Sgst_P ?? 0),
                    Igst_P: toNumber(p.Igst_P ?? 0),
                }))
            );
            return allProducts.reduce((acc, item) => {
                const existing = acc.find(x => x.Item_Id === item.Item_Id && x._Note_Id === item._Note_Id);
                if (existing) {
                    existing.QTY = Addition(existing.QTY, item.QTY);
                    existing.KGS = Addition(existing.KGS, item.KGS);
                    existing.Total_Value = Addition(existing.Total_Value, item.Total_Value);
                    existing.Taxable_Value = Addition(existing.Taxable_Value, item.Taxable_Value);
                    existing.Cgst_P = Addition(existing.Cgst_P, item.Cgst_P);
                    existing.Sgst_P = Addition(existing.Sgst_P, item.Sgst_P);
                    existing.Igst_P = Addition(existing.Igst_P, item.Igst_P);
                    return acc;
                }
                return [...acc, { ...item }];
            }, []);
        }

        // MATERIAL INWARD / OTHER GODOWN — use Products_List directly
        return Array.isArray(selectedRow?.Products_List) ? selectedRow.Products_List : [];
    }, [selectedRow]);

    const TaxData = printProductsList.reduce((data, item) => {
        const HSN_Code = item.HSN_Code;
        const Taxable_Value = toNumber(item.Taxable_Value ?? item.Taxable_Amount ?? 0);
        const Cgst_P = toNumber(item.Cgst_P ?? 0);
        const Sgst_P = toNumber(item.Sgst_P ?? 0);
        const Igst_P = toNumber(item.Igst_P ?? 0);
        const HSNindex = data.findIndex(obj => obj.hsnCode === HSN_Code);

        if (HSNindex !== -1) {
            const prev = data[HSNindex];
            data[HSNindex] = {
                ...prev,
                taxableValue: Addition(prev.taxableValue, Taxable_Value),
                cgst: Addition(prev.cgst, Cgst_P),
                sgst: Addition(prev.sgst, Sgst_P),
                igst: Addition(prev.igst, Igst_P),
                totalTax: Addition(prev.totalTax, Addition(Addition(Cgst_P, Sgst_P), Igst_P)),
            };
            return data;
        }

        return [...data, {
            hsnCode: HSN_Code,
            taxableValue: Taxable_Value,
            cgst: Cgst_P,
            sgst: Sgst_P,
            igst: Igst_P,
            totalTax: Addition(Addition(Cgst_P, Sgst_P), Igst_P),
        }];
    }, []);

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
    });

    const handleDeliveryChallanPrint = useReactToPrint({
        content: () => deliveryChallanPrintRef.current,
    });

    const uniqueFromLocations = useMemo(() => {
        const allLocations = tripData.flatMap((trip) =>
            trip.Products_List.map((product) => product.FromLocation)
        );
        return [...new Set(allLocations)].map((location) => ({
            value: location,
            label: location,
        }));
    }, [tripData]);

    const uniqueToLocations = useMemo(() => {
        const allLocations = tripData.flatMap((trip) =>
            trip.Products_List.map((product) => product.ToLocation)
        );
        return [...new Set(allLocations)].map((location) => ({
            value: location,
            label: location,
        }));
    }, [tripData]);

    const uniqueItems = useMemo(() => {
        const allItems = tripData.flatMap((trip) =>
            trip.Products_List.map((product) => product.Product_Name)
        );
        return [...new Set(allItems)].map(items => ({
            value: items,
            label: items,
        }));
    }, [tripData]);

    const uniqueStaffs = useMemo(() => {
        const allStaffs = tripData.flatMap((trip) =>
            trip.Employees_Involved.map((staff) => staff.Emp_Name)
        );
        return [...new Set(allStaffs)].map((name) => ({
            value: name,
            label: name,
        }));
    }, [tripData]);

    const uniqueVoucher = useMemo(() => {
        const allVoucher = tripData.map(trip => trip?.VoucherTypeGet);
        return [...new Set(allVoucher)].map((name) => ({
            value: name,
            label: name,
        }));
    }, [tripData]);

    const filteredData = useMemo(() => {
        return tripData.filter(trip => {
            const hasFromGodownMatch = filters.FromGodown.length > 0
                ? trip.Products_List.some(product =>
                    filters.FromGodown.some(selected => selected.value === product.FromLocation)
                )
                : false;

            const hasToGodownMatch = filters.ToGodown.length > 0
                ? trip.Products_List.some(product =>
                    filters.ToGodown.some(selected => selected.value === product.ToLocation)
                )
                : false;

            const hasItemMatch = filters.Items.length > 0
                ? trip.Products_List.some(product =>
                    filters.Items.some(selected => selected.value === product.Product_Name)
                )
                : false;

            const hasEmployeeMatch = filters.Staffs.length > 0
                ? trip.Employees_Involved.some(staff =>
                    filters.Staffs.some(selected => selected.value === staff.Emp_Name)
                )
                : false;

            const hasVoucherMatch = filters.VoucherType.length > 0
                ? filters.VoucherType.some(selected => selected.value === trip.VoucherTypeGet)
                : false;

            return hasFromGodownMatch || hasToGodownMatch || hasItemMatch || hasEmployeeMatch || hasVoucherMatch;
        });
    }, [tripData, filters]);


    const transformToDeliveryChallan = (tripData, resolvedProducts) => {
        const billType = tripData?.BillType;
        const isCreditOrDebit = billType === 'CREDIT_NOTE' || billType === 'DEBIT_NOTE';

        // Use the pre-resolved product list (handles CN/DN merging) if provided,
        // otherwise fall back to Products_List (MATERIAL INWARD / OTHER GODOWN)
        const sourceProducts = resolvedProducts ?? (
            Array.isArray(tripData?.Products_List) ? tripData.Products_List : []
        );

        const items = sourceProducts.map((item, index) => ({
            sno: index + 1,
            description: item.Product_Name || "",
            hsn: item.HSN_Code || "",
            rate: isCreditOrDebit
                ? NumberFormat(item.Item_Rate ?? 0)
                : (item.Product_Rate ? NumberFormat(item.Product_Rate) : 0),
            bags: item.Bag || 0,
            qty: item.KGS || item.QTY || 0,
            amount: isCreditOrDebit
                ? toNumber(item.Total_Value ?? 0)
                : (item.Product_Rate * item.QTY || 0),
            // CN/DN extra: party name per item group
            partyName: item._Retailer_Name || '',
            invNo: item._Inv_No || '',
        }));

        const totalBags = items.reduce((sum, item) => sum + (item.bags || 0), 0);
        const totalQty = items.reduce((sum, item) => sum + toNumber(item.qty || 0), 0);
        const totalAmount = items.reduce((sum, item) => sum + toNumber(item.amount || 0), 0);

        const driver = (Array.isArray(tripData?.Employees_Involved) ? tripData.Employees_Involved : [])
            .find(staff => staff?.Cost_Category === 'Driver' || staff?.Cost_Category === 'Load Man');

        // Recipient / company info
        let firstLocation, lastLocation;

        if (isCreditOrDebit) {
            // For CN: recipient = first note's retailer info
            const noteList = billType === 'CREDIT_NOTE'
                ? (Array.isArray(tripData?.Credit_Note_List) ? tripData.Credit_Note_List : [])
                : (Array.isArray(tripData?.Debit_Note_List) ? tripData.Debit_Note_List : []);
            const firstNote = noteList[0];
            firstLocation = firstNote ? {
                toaddress: firstNote.Retailer_Name || '',
                toGst_No: '',
                toPhone_No: '',
            } : null;
            lastLocation = null; // company info comes from CompanyDetails in the component
        } else {
            const receiptDetails = (Array.isArray(tripData?.Products_List) ? tripData.Products_List : []).map(item => ({
                toAddressId: item.ToLocation,
                toaddress: item.ToAddress,
                toPhone_No: item.ToPhone,
                toGst_No: item.ToGst,
            }));
            firstLocation = receiptDetails[0]?.toAddressId === 35 ? tripData?.Narration : receiptDetails[0];

            const companyDetails = (Array.isArray(tripData?.Products_List) ? tripData.Products_List : []).map(item => ({
                fromAddressId: item.FromLocation,
                fromAddress: item.FromAddress,
                fromPhone_No: item.FromPhone,
                fromGst_No: item.FromGst,
            }));
            lastLocation = companyDetails[0]?.fromAddressId === 35 ? tripData?.Narration : companyDetails[0];
        }

        return {
            challanNo: tripData?.Challan_No || tripData?.Trip_No || "",
            date: tripData?.Trip_Date ? LocalDate(tripData.Trip_Date) : "",
            company: { lastLocation },
            recipient: { firstLocation },
            transport: {
                mode: "By Road",
                vehicleNo: tripData?.Vehicle_No || "",
                driverName: driver?.Emp_Name || "",
                date: tripData?.Trip_Date ? LocalDate(tripData.Trip_Date) : "",
                time: tripData?.StartTime ? LocalTime(new Date(tripData.StartTime)) : "",
                place: "SIVAGANGAI",
                stateCode: "33"
            },
            items: items,
            totals: {
                totalBags: totalBags,
                totalQty: NumberFormat(totalQty),
                totalAmount: NumberFormat(totalAmount),
                amountInWords: numberToWords(Math.round(totalAmount)) + " Only"
            },
        };
    };

    const statusColor = {
        NewOrder: ' bg-info fw-bold fa-11 px-2 py-1 rounded-3 ',
        OnProcess: ' bg-warning fw-bold fa-11 px-2 py-1 rounded-3 ',
        Completed: ' bg-success text-light fa-11 px-2 py-1 rounded-3 ',
        Canceled: ' bg-danger text-light fw-bold fa-11 px-2 py-1 rounded-3 '
    }

    const chooseColor = (orderStatus) => {
        switch (orderStatus) {
            case 'New': return statusColor.NewOrder;
            case 'OnProcess': return statusColor.OnProcess;
            case 'Completed': return statusColor.Completed;
            case 'Canceled': return statusColor.Canceled;
            default: return ''
        }
    }

    return (
        <>

            <FilterableTable
                dataArray={(
                    filters.FromGodown.length > 0 ||
                    filters.ToGodown.length > 0 ||
                    filters.Staffs.length > 0 ||
                    filters.Items.length > 0 ||
                    filters.VoucherType.length > 0
                ) ? filteredData : tripData}
                title="Trip Sheets"
                maxHeightOption
                ExcelPrintOption
                ButtonArea={
                    <>
                        <Button
                            variant="outlined"
                            onClick={() => nav('/erp/inventory/tripSheet/searchGodown')}
                        >Add</Button>
                        <Tooltip title='Filters'>
                            <IconButton
                                size="small"
                                onClick={() => setFilters({ ...filters, filterDialog: true })}
                            ><FilterAlt /></IconButton>
                        </Tooltip>
                    </>
                }
                EnableSerialNumber
                initialPageCount={10}
                columns={[
                    createCol('Trip_Date', 'date', 'Date'),
                    createCol('Trip_No', 'string'),
                    createCol('TR_INV_ID', 'string', 'Inovice'),
                    createCol('VoucherTypeGet', 'string', 'Voucher'),
                    createCol('concernGet', 'string', 'Concern'),
                    createCol('Vehicle_No', 'string', 'Vehicle'),
                    createCol('Branch_Name', 'string', 'Branch'),
                    createCol('Created_By_User', 'string', 'Created BY'),
                    createCol('StartTime', 'time', 'Start Time'),
                    createCol('EndTime', 'time', 'End Time'),
                    {
                        isVisible: 1,
                        ColumnHeader: 'Time Taken',
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            const startTime = row?.StartTime ? new Date(row.StartTime) : '';
                            const endTime = row.EndTime ? new Date(row.EndTime) : '';
                            const timeTaken = (startTime && endTime) ? timeDuration(startTime, endTime) : '00:00';
                            return (
                                <span className="cus-badge bg-light">{timeTaken}</span>
                            )
                        }
                    },
                    {
                        isVisible: 1,
                        ColumnHeader: 'Distance',
                        isCustomCell: true,
                        Cell: ({ row }) => NumberFormat(Subraction(row?.Trip_EN_KM, row?.Trip_ST_KM))
                    },
                    {
                        isVisible: 1,
                        ColumnHeader: 'Status',
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            const OrderStatus = row?.TripStatus;
                            return (
                                <span className={chooseColor(OrderStatus)}>
                                    {String(OrderStatus).replace(' ', '')}
                                </span>
                            )
                        }
                    },
                    {
                        isVisible: 1,
                        ColumnHeader: 'Action',
                        isCustomCell: true,
                        Cell: ({ row }) => (
                            <ButtonActions
                                buttonsData={[
                                    {
                                        name: 'Edit',
                                        icon: <Edit className="fa-14" />,
                                        onclick: () => nav('/erp/inventory/tripSheet/searchGodown', {
                                            state: {
                                                ...row,
                                                isEditable: false,
                                            },
                                        }),
                                        disabled: toNumber(row?.ConvertedPurchaseOrders?.length) > 0 ? true : false
                                    },
                                    {
                                        name: 'Preview',
                                        icon: <Visibility className="fa-14" />,
                                        onclick: () => {
                                            setFilters(pre => ({ ...pre, printPreviewDialog: true }));
                                            setSelectedRow(row);
                                        }
                                    },
                                    {
                                        name: 'Delivery Challan',
                                        icon: <LocalShipping className="fa-14" />,
                                        onclick: () => {
                                            setFilters(pre => ({ ...pre, deliveryChallanDialog: true }));
                                            setSelectedRow(row);
                                        }
                                    },
                                    {
                                        name: 'Create PO',
                                        icon: <AddShoppingCart className="fa-14" />,
                                        onclick: () => nav('/erp/purchase/purchaseOrder/create', {
                                            state: {
                                                Retailer_Id: row?.concern,
                                                Retailer_Name: row?.concernGet,
                                                Branch_Id: row?.Branch_Id,
                                                Products_List: toArray(row?.Products_List).map((pro, proInd) => ({
                                                    Serial_No: proInd + 1,
                                                    Item_Id: pro.Product_Id,
                                                    Item_Rate: pro.Gst_Rate,
                                                    Bill_Qty: pro.QTY,
                                                    Amount: Multiplication(pro.QTY, pro.Gst_Rate),
                                                    HSN_Code: pro.HSN_Code,
                                                    Unit_Id: pro.Unit_Id,
                                                    Unit_Name: pro.Units,
                                                    Godown_Id: pro.To_Location,
                                                })),
                                                Staff_Involved_List: row?.Employees_Involved?.map(emp => ({
                                                    Emp_Id: emp.Involved_Emp_Id,
                                                    EmpName: emp.Emp_Name,
                                                    Emp_Type_Id: emp.Cost_Center_Type_Id,
                                                    EmpType: emp.Cost_Category
                                                })),
                                                Trip_Details: [{
                                                    trip_id: row?.Trip_Id
                                                }]
                                            }
                                        }),
                                        disabled: row?.BillType !== 'MATERIAL INWARD'
                                    },
                                    {
                                        name: 'Create Invoice',
                                        icon: <Receipt className="fa-14" />,
                                        onclick: () => nav('/erp/purchase/invoice/create', {
                                            state: {
                                                invoiceInfo: {
                                                    Retailer_Id: row?.concern,
                                                    Retailer_Name: row?.concernGet,
                                                    Branch_Id: row?.Branch_Id,
                                                    isFromPurchaseOrder: false
                                                },
                                                orderInfo: toArray(row?.Products_List).map((pro, proInd) => ({
                                                    S_No: proInd + 1,
                                                    Item_Id: pro.Product_Id,
                                                    Item_Name: pro.Product_Name,
                                                    Product_Name: pro.Product_Name,
                                                    Item_Rate: pro.Gst_Rate,
                                                    Bill_Qty: pro.QTY,
                                                    Act_Qty: pro.QTY,
                                                    Amount: Multiplication(pro.QTY, pro.Gst_Rate),
                                                    HSN_Code: pro.HSN_Code,
                                                    Unit_Id: pro.Unit_Id,
                                                    Unit_Name: pro.Units,
                                                    Location_Id: pro.To_Location,
                                                })),
                                                staffInfo: row?.Employees_Involved?.map(emp => ({
                                                    Involved_Emp_Id: emp.Involved_Emp_Id,
                                                    Involved_Emp_Name: emp.Emp_Name,
                                                    Cost_Center_Type_Id: emp.Cost_Center_Type_Id,
                                                    EmpType: emp.Cost_Category
                                                })),
                                                tripDetails: [{
                                                    tripid: row?.Trip_Id
                                                }]
                                            }
                                        }),
                                        disabled: row?.BillType !== 'MATERIAL INWARD'
                                    }
                                ]}
                            />
                        )
                    }
                ]}
                isExpendable={true}
                expandableComp={({ row }) => (
                    <>
                        {row?.Employees_Involved?.length > 0 && (
                            <table className="fa-14">
                                <tbody>
                                    <tr>
                                        <th className="py-1 px-2 border text-muted" colSpan={3}>Involved Employees</th>
                                    </tr>
                                    <tr>
                                        <th className="py-1 px-2 border text-muted">SNo</th>
                                        <th className="py-1 px-2 border text-muted">Name</th>
                                        <th className="py-1 px-2 border text-muted">Role</th>
                                    </tr>
                                    {row.Employees_Involved.map((o, i) => (
                                        <tr key={i}>
                                            <td className="py-1 px-2 border">{i + 1}</td>
                                            <td className="py-1 px-2 border">{o?.Emp_Name}</td>
                                            <td className="py-1 px-2 border">{o?.Cost_Category}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        <FilterableTable
                            title="Items"
                            EnableSerialNumber
                            dataArray={Array.isArray(row.Products_List) ? row.Products_List : []}
                            columns={[
                                {
                                    isVisible: 1,
                                    ColumnHeader: 'Reason',
                                    isCustomCell: true,
                                    Cell: ({ row }) => row.Stock_Journal_Bill_type ?? 'Not Available',
                                },
                                createCol('Batch_No', 'string'),
                                createCol('Product_Name', 'string', 'Item'),
                                createCol('HSN_Code', 'string'),
                                createCol('QTY', 'number'),
                                createCol('KGS', 'number'),
                                createCol('Gst_Rate', 'number'),
                                createCol('Total_Value', 'number'),
                                createCol('FromLocation', 'string', 'From'),
                                createCol('ToLocation', 'string', 'To'),
                            ]}
                            disablePagination
                            ExcelPrintOption
                        />

                        <br />
                        <AlterHistoryTable alterationHistory={row.Alteration_History} />
                    </>
                )}
            />

            <Dialog
                open={filters.filterDialog}
                onClose={closeDialog}
                fullWidth maxWidth='md'
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
                                    <td style={{ verticalAlign: 'middle' }}>Staffs</td>
                                    <td colSpan={3}>
                                        <Select
                                            value={filters.Staffs}
                                            onChange={(selectedOptions) =>
                                                setFilters((prev) => ({ ...prev, Staffs: selectedOptions }))
                                            }
                                            menuPortalTarget={document.body}
                                            options={uniqueStaffs}
                                            isMulti
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Select Staff"}
                                            maxMenuHeight={300}
                                            filterOption={reactSelectFilterLogic}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Items</td>
                                    <td colSpan={3}>
                                        <Select
                                            value={filters.Items}
                                            onChange={(selectedOptions) =>
                                                setFilters((prev) => ({ ...prev, Items: selectedOptions }))
                                            }
                                            menuPortalTarget={document.body}
                                            options={uniqueItems}
                                            isMulti
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Select Items"}
                                            maxMenuHeight={300}
                                            filterOption={reactSelectFilterLogic}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>From Godown</td>
                                    <td colSpan={3}>
                                        <Select
                                            value={filters.FromGodown}
                                            onChange={(selectedOptions) =>
                                                setFilters((prev) => ({ ...prev, FromGodown: selectedOptions }))
                                            }
                                            menuPortalTarget={document.body}
                                            options={uniqueFromLocations}
                                            isMulti
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Select From Godown"}
                                            maxMenuHeight={300}
                                            filterOption={reactSelectFilterLogic}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>To Godown</td>
                                    <td colSpan={3}>
                                        <Select
                                            value={filters.ToGodown}
                                            onChange={(selectedOptions) =>
                                                setFilters((prev) => ({ ...prev, ToGodown: selectedOptions }))
                                            }
                                            menuPortalTarget={document.body}
                                            options={uniqueToLocations}
                                            isMulti
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Select To Godown"}
                                            maxMenuHeight={300}
                                            filterOption={reactSelectFilterLogic}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Voucher</td>
                                    <td colSpan={3}>
                                        <Select
                                            value={filters.VoucherType}
                                            onChange={(selectedOptions) =>
                                                setFilters((prev) => ({ ...prev, VoucherType: selectedOptions }))
                                            }
                                            menuPortalTarget={document.body}
                                            options={uniqueVoucher}
                                            styles={customSelectStyles}
                                            isMulti
                                            isSearchable={true}
                                            placeholder={"Select Voucher"}
                                            maxMenuHeight={300}
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
                            const updatedFilters = {
                                Fromdate: filters?.Fromdate,
                                Todate: filters?.Todate
                            };
                            updateQueryString(updatedFilters);
                            closeDialog();
                        }}
                        startIcon={<Search />}
                        variant="outlined"
                    >Search</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={filters.printPreviewDialog}
                onClose={() => setFilters(pre => ({ ...pre, printPreviewDialog: false }))}
                maxWidth='xl' fullWidth
            >
                <DialogTitle>Print Preview</DialogTitle>
                <DialogContent ref={printRef}>
                    {isValidObject(selectedRow) && <React.Fragment>

                        <table className="table table-bordered fa-13 m-0">
                            <tbody>
                                <tr>
                                    <td colSpan={3}>DELIVERY CHALLAN</td>
                                    <td colSpan={3}>GSTIN : 33AADFS4987M1ZL</td>
                                    <td colSpan={2}>ORIGINAL / DUPLICATE</td>
                                </tr>
                                <tr>
                                    <td colSpan={3} rowSpan={2}>
                                        <span className="fa-14 fw-bold">S.M TRADERS</span> <br />
                                        H.O: 153, CHITRAKARA STREET, MADURAI - 625001 <br />
                                        G.O: 746-A, PULIYUR, SAYANAPURAM, SIVAGANGAI - 630611
                                    </td>
                                    <td colSpan={3}>FSSAI No : 12418012000818</td>
                                    <td>Challan No</td>
                                    <td>{selectedRow?.Challan_No}</td>
                                </tr>
                                <tr>
                                    <td colSpan={3}>Phone No: 9842131353, 9786131353</td>
                                    <td>Date</td>
                                    <td>{selectedRow.Trip_Date ? LocalDate(selectedRow.Trip_Date) : ''}</td>
                                </tr>
                                <tr>
                                    <td colSpan={8} className="text-center">Reason for Transfer - Branch Transfer / Line Sales / Purchase Return / Job Work</td>
                                </tr>
                                <tr>
                                    <td>Vehicle No</td>
                                    <td>{selectedRow?.Vehicle_No}</td>
                                    <td>Driver Name</td>
                                    <td>
                                        {selectedRow?.Employees_Involved?.filter(staff => (
                                            staff?.Cost_Category === 'Driver'
                                        ))?.map(staff => staff?.Emp_Name).join(', ')}
                                    </td>
                                    <td>Start Time</td>
                                    <td>{selectedRow?.StartTime ? LocalTime(new Date(selectedRow.StartTime)) : ''}</td>
                                    <td>Start KM</td>
                                    <td>{selectedRow?.Trip_ST_KM}</td>
                                </tr>
                                <tr>
                                    <td>Trip No</td>
                                    <td>{selectedRow?.Trip_No}</td>
                                    <td>LoadMan</td>
                                    <td>
                                        {selectedRow?.Employees_Involved?.filter(staff => (
                                            staff?.Cost_Category === 'Load Man'
                                        ))?.map(staff => staff?.Emp_Name).join(', ')}
                                    </td>
                                    <td>End Time</td>
                                    <td>{selectedRow?.EndTime ? LocalTime(new Date(selectedRow.EndTime)) : ''}</td>
                                    <td>End KM</td>
                                    <td>{selectedRow?.Trip_ST_KM}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* items */}
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th className="fa-12 bg-light">#</th>
                                    {(selectedRow?.BillType === 'CREDIT_NOTE' || selectedRow?.BillType === 'DEBIT_NOTE') ? (
                                        <>
                                            <th className="fa-12 bg-light">Invoice No</th>
                                            <th className="fa-12 bg-light">Party</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="fa-12 bg-light">Reason</th>
                                            <th className="fa-12 bg-light">Party</th>
                                            <th className="fa-12 bg-light">Address</th>
                                        </>
                                    )}
                                    <th className="fa-12 bg-light">Item</th>
                                    <th className="fa-12 bg-light">HSN</th>
                                    <th className="fa-12 bg-light">Qty</th>
                                    <th className="fa-12 bg-light">KGS</th>
                                    <th className="fa-12 bg-light">Rate</th>
                                    <th className="fa-12 bg-light">Amount</th>
                                    {(selectedRow?.BillType !== 'CREDIT_NOTE' && selectedRow?.BillType !== 'DEBIT_NOTE') && (
                                        <th className="fa-12 bg-light">Transfer To</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {(selectedRow?.BillType === 'CREDIT_NOTE' || selectedRow?.BillType === 'DEBIT_NOTE') ? (
                                    printProductsList.map((item, index, array) => {
                                        const isFirstOfNote = index === 0 || item._Note_Id !== array[index - 1]?._Note_Id;
                                        const noteRowSpan = array.filter(r => r._Note_Id === item._Note_Id).length;
                                        return (
                                            <tr key={index}>
                                                <td className="fa-10">{index + 1}</td>
                                                {isFirstOfNote && (
                                                    <>
                                                        <td className="fa-10 vctr" rowSpan={noteRowSpan}>
                                                            {item._Inv_No}
                                                        </td>
                                                        <td className="fa-10 vctr" rowSpan={noteRowSpan}>
                                                            {item._Retailer_Name}
                                                        </td>
                                                    </>
                                                )}
                                                <td className="fa-10">{item?.Product_Name}</td>
                                                <td className="fa-10">{item?.HSN_Code}</td>
                                                <td className="fa-10">{NumberFormat(item?.QTY)}</td>
                                                <td className="fa-10">{NumberFormat(item?.KGS)}</td>
                                                <td className="fa-10">{NumberFormat(item?.Gst_Rate)}</td>
                                                <td className="fa-10">{NumberFormat(item?.Total_Value)}</td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    printProductsList.sort(
                                        (a, b) => String(a.Trip_From).localeCompare(b.Trip_From)
                                    ).map((item, index, array) => {
                                        const isFirstOccurrence =
                                            index === 0 || item.Trip_From !== array[index - 1]?.Trip_From;
                                        const rowSpan = array.filter((row) => row.Trip_From === item.Trip_From).length;

                                        return (
                                            <tr key={index}>
                                                <td className="fa-10">{index + 1}</td>
                                                {isFirstOccurrence && (
                                                    <td className="fa-10 vctr" rowSpan={rowSpan}>
                                                        {item.Trip_From === "STOCK JOURNAL" && "T"}
                                                    </td>
                                                )}
                                                <td className="fa-10"></td>
                                                <td className="fa-10"></td>
                                                <td className="fa-10">{item?.Product_Name}</td>
                                                <td className="fa-10">{item?.HSN_Code}</td>
                                                <td className="fa-10">{NumberFormat(item?.QTY)}</td>
                                                <td className="fa-10">{NumberFormat(item?.KGS)}</td>
                                                <td className="fa-10">{NumberFormat(item?.Gst_Rate)}</td>
                                                <td className="fa-10">{NumberFormat(item?.Total_Value)}</td>
                                                <td className="fa-10">{item?.ToLocation}</td>
                                            </tr>
                                        );
                                    })
                                )}

                                <tr>
                                    <td className="fa-10 fw-bold" colSpan={(selectedRow?.BillType === 'CREDIT_NOTE' || selectedRow?.BillType === 'DEBIT_NOTE') ? 5 : 6}>
                                        Total:&emsp;
                                        {numberToWords(printProductsList.reduce(
                                            (acc, item) => Addition(acc, item.Total_Value ?? 0), 0
                                        ))} Only.
                                    </td>
                                    <td className="fa-10 fw-bold">
                                        {NumberFormat(printProductsList.reduce(
                                            (acc, item) => Addition(acc, item.QTY ?? 0), 0
                                        ))}.
                                    </td>
                                    <td className="fa-10 fw-bold">
                                        {NumberFormat(printProductsList.reduce(
                                            (acc, item) => Addition(acc, item.KGS ?? 0), 0
                                        ))}.
                                    </td>
                                    <td className="fa-10"></td>
                                    <td className="fa-10 fw-bold" colSpan={(selectedRow?.BillType === 'CREDIT_NOTE' || selectedRow?.BillType === 'DEBIT_NOTE') ? 1 : 2}>
                                        {NumberFormat(printProductsList.reduce(
                                            (acc, item) => Addition(acc, item.Total_Value ?? 0), 0
                                        ))}.
                                    </td>
                                </tr>

                            </tbody>
                        </table>

                        {/* tax calculation */}

                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <td className="bg-light fa-12 text-center">HSN / SAC</td>
                                    <td className="bg-light fa-12 text-center">Taxable Value</td>
                                    <td className="bg-light fa-12 text-center">IGST</td>
                                    <td className="bg-light fa-12 text-center">CGST</td>
                                    <td className="bg-light fa-12 text-center">SGST</td>
                                    <td className="bg-light fa-12 text-center">Total</td>
                                </tr>
                            </thead>
                            <tbody>
                                {TaxData.map((o, i) => {
                                    return (
                                        <tr key={i}>
                                            <td className="fa-10 text-end">{o?.hsnCode}</td>
                                            <td className="fa-10 text-end">{NumberFormat(o?.taxableValue)}</td>
                                            <td className="fa-10 text-end">{NumberFormat(o?.igst)}</td>
                                            <td className="fa-10 text-end">{NumberFormat(o?.cgst)}</td>
                                            <td className="fa-10 text-end">{NumberFormat(o?.sgst)}</td>
                                            <td className="fa-10 text-end">
                                                {NumberFormat(o?.totalTax)}
                                            </td>
                                        </tr>
                                    )
                                })}
                                <tr>
                                    <td className="border fa-10 text-end">Total</td>
                                    <td className="border fa-10 text-end fw-bold">
                                        {NumberFormat(TaxData.reduce((sum, item) => sum += Number(item.taxableValue), 0))}
                                    </td>
                                    <td className="border fa-10 text-end fw-bold">
                                        {NumberFormat(TaxData.reduce((sum, item) => sum += Number(item.igst), 0))}
                                    </td>
                                    <td className="border fa-10 text-end fw-bold">
                                        {NumberFormat(TaxData.reduce((sum, item) => sum += Number(item.cgst), 0))}
                                    </td>
                                    <td className="border fa-10 text-end fw-bold">
                                        {NumberFormat(TaxData.reduce((sum, item) => sum += Number(item.sgst), 0))}
                                    </td>
                                    <td className="border fa-10 text-end fw-bold">
                                        {NumberFormat(TaxData.reduce((sum, item) => sum += Number(item.totalTax), 0))}
                                    </td>
                                </tr>
                                <tr>
                                    <td
                                        colSpan={6}
                                        className='border fa-13 fw-bold'
                                    >
                                        Tax Amount (in words) : INR &nbsp;
                                        {numberToWords(
                                            parseInt(
                                                TaxData.reduce((sum, item) => sum += Number(item.totalTax), 0)
                                            )
                                        )} only.
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <table className="table table-bordered fa-10">
                            <tbody>
                                <tr>
                                    <td>Prepared By</td>
                                    <td style={{ minWidth: 150 }}></td>
                                    <td>Executed By</td>
                                    <td style={{ minWidth: 150 }}></td>
                                    <td>Verified By</td>
                                    <td style={{ minWidth: 150 }}></td>
                                </tr>
                                <tr>
                                    <td>Other Expenses</td>
                                    <td>0</td>
                                    <td>Round Off</td>
                                    <td>0</td>
                                    <td>Grand Total</td>
                                    <td>
                                        {NumberFormat(printProductsList.reduce(
                                            (acc, item) => Addition(acc, item.Total_Value ?? 0), 0
                                        ))}.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="col-12 text-center">
                            <p>This is a Computer Generated Invoice</p>
                        </div>

                    </React.Fragment>
                    }
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setFilters(pre => ({ ...pre, printPreviewDialog: false }))}
                        variant="outlined"
                    >close</Button>
                    <Button
                        startIcon={<Download />}
                        variant='outlined'
                        onClick={handlePrint}
                    >
                        Download
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={filters.deliveryChallanDialog}
                onClose={() => setFilters(pre => ({ ...pre, deliveryChallanDialog: false }))}
                maxWidth='lg'
                fullWidth
            >
                <DialogTitle>
                    Delivery Challan - {selectedRow?.Challan_No || selectedRow?.Trip_No}
                </DialogTitle>
                <DialogContent ref={deliveryChallanPrintRef}>
                    {isValidObject(selectedRow) && (
                        <DeliveryChallan data={transformToDeliveryChallan(selectedRow, printProductsList)} />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setFilters(pre => ({ ...pre, deliveryChallanDialog: false }))}
                        variant="outlined"
                        color="error"
                    >
                        Close
                    </Button>
                    <Button
                        startIcon={<Download />}
                        variant='contained'
                        color="primary"
                        onClick={handleDeliveryChallanPrint}
                    >
                        Print / Download
                    </Button>
                </DialogActions>
            </Dialog>

        </>
    )
}

export default TripSheets;