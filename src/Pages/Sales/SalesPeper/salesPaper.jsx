import { useEffect, useMemo, useState } from "react";
import { fetchLink } from "../../../Components/fetchComponent";
import { Addition, ISOString, toNumber } from "../../../Components/functions";
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import { IconButton } from "@mui/material";
import { Search } from "@mui/icons-material";

const getStaff = (staffs, type) =>
    staffs
        .filter(s => s.empType === type)
        .map(s => s.empName)
        .join(", ");

const transformSalesVoucherData = (data) => {
    let transformedData = [];

    data.forEach((entry, entryIndex) => {

        const totalBilledQty = entry.productDetails.reduce(
            (sum, item) => Addition(sum, item.billedQuantity),
            0
        );

        const totalUnitQty = entry.productDetails.reduce(
            (sum, item) => Addition(sum, item.unitQuantity),
            0
        );

        // ---------- HEADER ROW (Voucher + Retailer) ----------
        transformedData.push({
            SNo: entryIndex + 1,
            quantityDifference: entry.voucheGet,
            particular: entry.retailerGet,
            voucherNoOrRate: entry.voucherNumber,
            unitQuantity: totalUnitQty,
            billedQuantity: totalBilledQty,
            broker: getStaff(entry.staffDetails || [], "Broker"),
            transporter: getStaff(entry.staffDetails || [], "Transport"),
            loadMan: getStaff(entry.staffDetails || [], "Load Man"),
            rowType: "HEADER"
        });

        // ---------- ITEM ROWS ----------
        entry.productDetails.forEach((item) => {
            transformedData.push({
                SNo: "",
                quantityDifference: item.quantityDifference || "",
                particular: item.itemNameGet,
                voucherNoOrRate: item.billedRate || "",
                unitQuantity: toNumber(item.actUnitQuantity) || "",
                billedQuantity: toNumber(item.billedQuantity) || "",
                broker: "",
                transporter: "",
                loadMan: "",
                rowType: "ITEM"
            });
        });
    });

    return transformedData;
};


const SalesInvoicePaper = ({ loadingOn, loadingOff }) => {
    const [reortData, setReportData] = useState([]);
    const [filter, setFilter] = useState({
        reqDate: ISOString(),
        fetchTrigger: 0,
        // reqDate: '2025-12-29',
    })

    useEffect(() => {
        fetchLink({
            address: `sales/salesInvoice/salesInvoicePaper?reqDate=${filter.reqDate}`,
            loadingOn,
            loadingOff,
        }).then((data) => {
            setReportData(data.data)
        }).catch(console.error);
    }, [filter.fetchTrigger]);

    const displayData = useMemo(() => transformSalesVoucherData(reortData), [reortData]);

    const fetchSalesInvoices = () => setFilter((pre) => ({ ...pre, fetchTrigger: pre.fetchTrigger + 1 }));

    return (
        <div>
            <FilterableTable
                headerFontSizePx={11}
                bodyFontSizePx={11}
                title="Sales Invoice Paper"
                dataArray={displayData}
                maxHeightOption
                ExcelPrintOption
                PDFPrintOption
                columns={[
                    createCol('SNo', 'number', 'S.No'),
                    {
                        isVisible: 1,
                        ColumnHeader: 'Diff',
                        isCustomCell: true,
                        Cell: ({ row }) => (
                            <span className={row.rowType === 'HEADER' ? ' text-primary fw-bold ' : ''}>{row.quantityDifference}</span>
                        )
                    },
                    {
                        isVisible: 1,
                        ColumnHeader: 'Particulars',
                        isCustomCell: true,
                        Cell: ({ row }) => (
                            <span className={row.rowType === 'HEADER' ? ' text-primary fw-bold ' : ''}>{row.particular}</span>
                        )
                    },
                    {
                        isVisible: 1,
                        ColumnHeader: 'Vou.No / Rate',
                        isCustomCell: true,
                        Cell: ({ row }) => (
                            <span className={row.rowType === 'HEADER' ? ' text-primary fw-bold ' : ''}>{row.voucherNoOrRate}</span>
                        )
                    },
                    {
                        isVisible: 1,
                        ColumnHeader: 'Act Qty',
                        isCustomCell: true,
                        Cell: ({ row }) => (
                            <span className={row.rowType === 'HEADER' ? ' text-primary fw-bold ' : ''}>{row.unitQuantity}</span>
                        )
                    },
                    {
                        isVisible: 1,
                        ColumnHeader: 'Bill Qty',
                        isCustomCell: true,
                        Cell: ({ row }) => (
                            <span className={row.rowType === 'HEADER' ? ' text-primary fw-bold ' : ''}>{row.billedQuantity}</span>
                        )
                    },
                    createCol('broker', 'string', 'Broker Name'),
                    createCol('transporter', 'string', 'Transporter'),
                    createCol('loadMan', 'string', 'Load Man'),
                ]}
                ButtonArea={
                    <>
                        <IconButton size="small" onClick={fetchSalesInvoices}>
                            <Search />
                        </IconButton>
                        <input
                            className="cus-inpt w-auto"
                            type="date"
                            value={filter.reqDate}
                            onChange={(e) => setFilter({ ...filter, reqDate: e.target.value })}
                        />
                    </>
                }
            />
        </div>
    );
};

export default SalesInvoicePaper;