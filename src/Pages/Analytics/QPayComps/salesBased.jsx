import { useEffect, useState } from "react";
import { BarChart } from '@mui/x-charts/BarChart';
import { NumberFormat } from "../../../Components/functions";
import { Collapse } from "@mui/material";


const QPaySalesBasedComp = ({ dataArray }) => {
    const [salesRange, setSalesRange] = useState([]);

    useEffect(() => {

        const range = [
            {
                min: 0,
                max: 5000,
                data: []
            },
            {
                min: 5000,
                max: 10000,
                data: []
            },
            {
                min: 10000,
                max: 20000,
                data: []
            },
            {
                min: 20000,
                max: 50000,
                data: []
            },
            {
                min: 50000,
                max: 100000,
                data: []
            },
            {
                min: 100000,
                max: 200000,
                data: []
            },
            {
                min: 200000,
                max: 500000,
                data: []
            },
            {
                min: 500000,
                max: 1000000,
                data: []
            },
            {
                min: 1000000,
                max: 1500000,
                data: []
            },
            {
                min: 1500000,
                max: 2000000,
                data: []
            },
            {
                min: 2000000,
                max: 1e15,
                data: []
            },
        ];

        dataArray.forEach(o => {
            const salesAmount = Number(o.Sales_Amount);
            const rangeIndex = range.findIndex(obj => (salesAmount > obj.min) && (salesAmount <= obj.max));
            if (rangeIndex !== -1) {
                range[rangeIndex].data.push(o);
            } else {
                // console.log(salesAmount)
            }
        });
        setSalesRange(range);

    }, [dataArray])

    const RowComp = ({ o, i }) => {
        const [open, setOpen] = useState(false);

        return (
            <>
                <tr onClick={() => setOpen(pre => !pre)} className="hov">
                    <td className="fa-13 border text-center hov-bg">{i + 1}</td>
                    <td className="fa-13 border text-center hov-bg">
                        {
                            salesRange[i + 1]
                                ? (NumberFormat(o?.min) + ' - ' + NumberFormat(o?.max))
                                : '< ' + o?.min.toString()
                        }
                    </td>
                    <td className="fa-13 border text-center hov-bg blue-text">{o?.data?.length}</td>
                    <td className="fa-13 border text-center hov-bg">{NumberFormat((o?.data?.length / dataArray?.length) * 100)}%</td>
                    <td className="fa-13 border text-center hov-bg">
                        {(o.data.length === 0) ? 0 : ((o?.data?.reduce((sum, item) => sum + item.Sales_Count || 0, 0)) / o.data.length).toFixed(2)}
                    </td>
                    <td className="fa-13 border text-center hov-bg">
                        {(o.data.length === 0) ? 0 : ((o?.data?.reduce((sum, item) => sum + item.Freq_Days || 0, 0)) / o.data.length).toFixed(2)}
                    </td>
                </tr>
                <Collapse in={open} unmountOnExit>
                    <tr>
                        <td colSpan={6}>

                        </td>
                    </tr>
                </Collapse>
            </>
        )
    }

    return (
        <>
            <div className="px-3 d-flex align-items-center justify-content-center flex-column py-2">
                <BarChart
                    xAxis={[{
                        scaleType: 'band',
                        data:
                            salesRange?.map((o, i) => (
                                salesRange[i + 1]
                                    ? '> ' + NumberFormat(o?.max)
                                    : '< ' + (o?.min)
                            ))
                    }]}
                    series={[
                        // { data: salesRange?.map(o => ((o?.data?.length / dataArray?.length) * 100).toFixed(2)), label: 'Parties', color: 'skyblue' },
                        { data: salesRange?.map(o => o?.data?.length), label: 'Parties', color: 'skyblue' },
                        // { 
                        //     data: salesRange?.map(o => (o.data.length === 0) ? 0 : ((o?.data?.reduce((sum, item) => sum + item.Sales_Count || 0, 0)) / o.data.length).toFixed(2)), 
                        //     label: 'Sales Count' 
                        // },
                        // { 
                        //     data: salesRange?.map(o => (o.data.length === 0) ? 0 : ((o?.data?.reduce((sum, item) => sum + item.Freq_Days || 0, 0)) / o.data.length).toFixed(2)), 
                        //     label: 'Frequency Days' 
                        // },
                    ]}
                    height={400}
                    barLabel="value"
                    borderRadius={6}
                />

                <div className="table-responsive w-100">
                    <table className="table">
                        <thead>
                            <tr>
                                {['Sno', 'Amount-Range', 'Parties', 'Percentage', 'Sales Count (Avg)', 'Frequency Days (Avg)'].map(o => (
                                    <th className="border fa-14 text-center" style={{ backgroundColor: '#EDF0F7' }} key={o}>{o}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {salesRange.map((o, i) => <RowComp key={i} o={o} i={i} />)}
                            <tr>
                                <td className="border"></td>
                                <td className="border"></td>
                                <td className="fa-13 border text-center">
                                    {NumberFormat(salesRange?.reduce((sum, o) => {
                                        return sum += o?.data?.length
                                    }, 0))}
                                </td>
                                <td className="fa-13 border text-center">
                                    {NumberFormat(salesRange?.reduce((sum, o) => {
                                        return sum += ((o?.data?.length / dataArray?.length) * 100)
                                    }, 0))}%
                                </td>
                                <td className="fa-13 border text-center">
                                    {NumberFormat((dataArray?.length / (dataArray?.reduce((sum, o) => {
                                        return sum += Number(o?.Sales_Count) || 0
                                    }, 0))) * 100)}
                                </td>
                                <td className="fa-13 border text-center">
                                    {NumberFormat((dataArray?.length / (dataArray?.reduce((sum, o) => {
                                        return sum += Number(o?.Freq_Days) || 0
                                    }, 0))) * 100)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </div>
        </>
    )
}

export default QPaySalesBasedComp;