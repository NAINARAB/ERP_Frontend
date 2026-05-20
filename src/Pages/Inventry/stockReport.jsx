import { useEffect, useState, useMemo } from "react";
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { Card, CardContent } from "@mui/material";
import { Addition, ISOString, NumberFormat, toArray } from "../../Components/functions";
import { fetchLink } from "../../Components/fetchComponent";


const StockReport = () => {
    const [StockData, setStockData] = useState([]);
    const [laks, setLaks] = useState(true);

    const [search, setSearch] = useState({
        zero: false,
        inm: '',
        date: ISOString(),
    })

    useEffect(() => {
        setStockData([]);
        fetchLink({
            address: `reports/itemGroup/stockInfo/grouped?reqDate=${search.date}`,
        }).then(data => {
            if (data.success) {
                setStockData(data.data);
            } else {
                setStockData([])
            }
        }).catch(e => console.error(e));

    }, [search.date])

    const filteredStockData = useMemo(() => {
        if (StockData !== null) {
            return StockData.map((o) => {

                const filteredProductDetails = o.product_details.filter(
                    (obj) => String(obj.Group_Name)
                        .toLowerCase()
                        .includes((search.inm)
                            .toLowerCase()
                        )
                );

                return { ...o, product_details: filteredProductDetails };
            });

        } else {
            return [];
        }
    }, [StockData, search.inm]);

    const TableRows = ({ rows }) => {
        const [open, setOpen] = useState(false);
        const [laks, setLaks] = useState(true);

        const childArray = toArray(rows?.product_details)

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
                        {NumberFormat(rows.Bal_Qty / 1000)}
                    </td>
                    <td className="fa-13 text-end text-primary bg-light">
                        {NumberFormat(rows.CL_Rate)}
                    </td>
                    <td className="fa-13 text-end text-primary" onClick={() => setLaks(!laks)}>
                        {laks
                            ? NumberFormat(rows.Stock_Value / 100000)
                            : NumberFormat(rows.Stock_Value)
                        }
                    </td>
                    <td className="fa-13 text-end text-primary bg-light">
                        {NumberFormat(rows.Bal_Qty)}
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
                                    {childArray?.map((obj, i) => (
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

    const overAllTotal = filteredStockData.reduce(
        (acc, group) => Addition(acc, group?.Stock_Value), 0
    );

    return (
        <>
            <Card>

                <div className="px-3 py-2 d-flex justify-content-between align-items-center fw-bold text-dark" style={{ backgroundColor: '#eae0cc' }}>
                    <span></span>
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
                                ? NumberFormat((overAllTotal / 100000)) + ' (L)'
                                : NumberFormat(overAllTotal)
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