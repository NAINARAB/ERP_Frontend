import React, { useEffect, useState, useMemo } from "react";
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { Card, CardContent } from "@mui/material";
import { NumberFormat } from "../../../Components/functions";
import { fetchLink } from "../../../Components/fetchComponent";


const StockReport = () => {
    const storage = JSON.parse(localStorage.getItem("user"));
    const [StockData, setStockData] = useState([])
    const [search, setSearch] = useState({
        zero: false,
        inm: '',
        date: new Date().toISOString().split('T')[0],
    })
    const [laks, setLaks] = useState(true)

    useEffect(() => {
        if (storage?.Company_id) {
            setStockData([]);
            fetchLink({
                address: `reports/stockReport?ReportDate=${search.date}`,
                headers: {
                    "Db": storage?.Company_id
                }
            }).then(data => {
                if (data.success) {
                    setStockData(data.data);
                } else {
                    setStockData([])
                }
            }).catch(e => console.error(e));
        }
    }, [search.date])

    const filteredStockData = useMemo(() => {
        if (StockData !== null) {
            return StockData.map((o) => {
                const filteredProductDetails = o.product_details.filter(
                    (obj) =>
                        (search.zero || Number(obj.Bal_Qty) !== 0) &&
                        (!search.inm || ((obj.Group_Name).toLowerCase()).includes((search.inm).toLowerCase()))
                );
                return { ...o, product_details: filteredProductDetails };
            });
        } else {
            return [];
        }
    }, [StockData, search.zero, search.inm]);

    const TableRows = ({ rows }) => {
        const [open, setOpen] = useState(false);
        const [laks, setLaks] = useState(true);

        const calcBalQty = (colmn) => {
            let count = 0;
            rows?.product_details?.forEach(obj => {
                count += Number(obj[colmn]);
            })
            return Number(count)
        }

        function calculateMean() {
            let total = 0;
            rows?.product_details?.forEach(ob => {
                if (ob.CL_Rate) {
                    total += Number(ob.CL_Rate)
                }
            })
            let mean = total / rows?.product_details.length
            return mean
        }

        return (
            <>
                <tr>
                    <td className="border fa-13 text-center">
                        <button onClick={() => setOpen(!open)} className="icon-btn">
                            {open ? <KeyboardArrowUp sx={{ fontSize: 'inherit' }} /> : <KeyboardArrowDown sx={{ fontSize: 'inherit' }} />}
                        </button>
                    </td>
                    <td className="fa-13 text-center bg-light">
                        {rows.Stock_Group}
                        <span className="text-danger"> ({rows.product_details.length})</span>
                    </td>
                    <td className="fa-13 text-end text-primary">
                        {NumberFormat((calcBalQty('Bal_Qty') / 1000))}
                    </td>
                    <td className="fa-13 text-end text-primary bg-light">
                        {calculateMean() ? NumberFormat(calculateMean()) : 0}
                    </td>
                    <td className="fa-13 text-end text-primary" onClick={() => setLaks(!laks)}>
                        {laks
                            ? NumberFormat((calcBalQty('Stock_Value') / 100000))
                            : NumberFormat(calcBalQty('Stock_Value'))
                        }
                    </td>
                    <td className="fa-13 text-end text-primary bg-light">
                        {NumberFormat(calcBalQty('Bal_Qty'))}
                    </td>
                </tr>

                {open && (
                    <tr>
                        <td colSpan={6} className="px-0 py-2">
                            <table className="table mb-0">
                                <thead>
                                    <tr>
                                        {['SNo', 'INM', 'Quantity', 'Rate', 'Value (₹)'].map((o, i) => (
                                            <th className="fa-13 border text-center" key={i}>{o}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows?.product_details?.map((obj, i) => (
                                        <tr key={i}>
                                            <td className="fa-13 bg-light">{i + 1}</td>
                                            <td className="fa-13">{obj.Group_Name}</td>
                                            <td className="fa-13 text-end bg-light">{NumberFormat(obj.Bal_Qty)}</td>
                                            <td className="fa-13 text-end">{NumberFormat(obj.CL_Rate)}</td>
                                            <td className="fa-13 text-end fw-bold bg-light">{NumberFormat(obj.Stock_Value)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </td>
                    </tr>
                )}
            </>
        )
    }

    const memoComp = useMemo(() => {
        return filteredStockData.map((o, i) => {
            return <TableRows key={i} rows={o} />;
        });
    }, [filteredStockData, search.zero]);


    const overAllTotal = () => {
        let total = 0;
        filteredStockData.forEach(o => {
            o.product_details.forEach(ob => {
                total += Number(ob.Stock_Value)
            })
        })
        return total;
    }

    return (
        <>
            <Card>

                <div className="px-3 py-2 d-flex justify-content-between align-items-center fw-bold text-dark" style={{ backgroundColor: '#eae0cc' }}>
                    <span>
                        {storage?.Company_Name}
                    </span>
                    <span>
                        <input
                            type={'search'}
                            className='cus-inpt ps-3 w-100 rounded-5 border-0'
                            value={search.inm}
                            placeholder="Search"
                            onChange={(e) => {
                                setSearch({ ...search, inm: e.target.value });
                            }}
                        />
                    </span>
                </div>

                <div className="d-flex justify-content-between align-items-center px-3 py-2" style={{ boxShadow: 'none' }}>
                    <input
                        type={'date'}
                        className='cus-inpt w-auto ps-3 border rounded-5'
                        value={search.date}
                        onChange={(e) => {
                            setSearch({ ...search, date: e.target.value });
                        }}
                    />
                    <h6>
                        {/* Value : */}
                        <span className="text-primary fw-bold" onClick={() => setLaks(!laks)}>
                            ₹{laks
                                ? NumberFormat((overAllTotal() / 100000)) + ' (L)'
                                : NumberFormat(overAllTotal())
                            }
                        </span>
                    </h6>
                </div>
                <CardContent className="overflow-scroll pt-0" style={{ maxHeight: '75vh' }}>
                    <table className="table">
                        <thead>
                            <tr>
                                {['-', 'Group Name', 'Tonnage', 'Rate', 'Value (L)', 'Quantity'].map((o, i) => (
                                    <th className="tble-hed-stick text-center fa-14 border" key={i}>{o}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {memoComp}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

        </>
    )
}


export default StockReport;