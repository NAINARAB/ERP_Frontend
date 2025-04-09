import React, { useEffect, useState, useContext } from "react";
import {
    customTimeDifference,
    extractHHMM,
    isEqualNumber,
    ISOString,
    NumberFormat,
    Subraction,
    timeToDate,
    UTCTime,
} from "../../Components/functions";

import { Card, CardContent } from "@mui/material";
import { MyContext } from "../../Components/context/contextProvider";
import { fetchLink } from "../../Components/fetchComponent";

function ProductclosingStockReports({ loadingOn, loadingOff, }) {
    const storage = JSON.parse(localStorage.getItem("user"));
    const { contextObj } = useContext(MyContext);
    const initialValue = {
        Id: 0,
        fromDate: ISOString(),
        ToDate: ISOString(),
        godown_Id: "",
        godown_Name: "",
        reqDate: ISOString(),
        reqLocation: "MILL",
        dialog: false,
    };
    const [activityData, setActivityData] = useState([]);

    const [reload, setReload] = useState(false);
    const [filter, setFilter] = useState(initialValue);
    const [location, setLocation] = useState([]);

    useEffect(() => {
        if (loadingOn) loadingOn();
        fetchLink({
            address: `delivery/closingStock?fromDate=${filter?.fromDate}&toDate=${filter?.ToDate}&godownId=${filter.godown_Id}`,
        })
            .then((data) => {
                if (data.success) {
                    setActivityData(data.data);
                }
            })
            .catch((e) => console.error(e)).finally(() => {
                if (loadingOff) {
                    loadingOff();
                }
            })
    }, [reload, filter.fromDate, filter.ToDate, filter?.godown_Id]);


    useEffect(() => {
        fetchLink({
            address: `dataEntry/godownLocationMaster`,
        }).then((data) => {
            if (data.success) {
                setLocation(data.data);
            }
        });
    }, []);
    return (
        <>
            <Card>
                <div className="p-2 border-bottom fa-16 fw-bold d-flex justify-content-between align-items-center">
                    <span className="text-primary text-uppercase ps-3">
                        Stock Reports
                    </span>
                </div>

                <div className="d-flex px-3 gap-4">
                    <div className="d-flex flex-column">
                        <label className="mb-1 w-100">FROM DATE</label>
                        <input
                            type="date"
                            className="cus-inpt w-auto"
                            value={filter.fromDate}
                            onChange={(e) =>
                                setFilter((pre) => ({ ...pre, fromDate: e.target.value }))
                            }
                        />
                    </div>
                    <div className="d-flex flex-column">
                        <label className="mb-1 w-100">TO DATE</label>
                        <input
                            type="date"
                            className="cus-inpt w-auto"
                            value={filter.ToDate}
                            onChange={(e) =>
                                setFilter((pre) => ({ ...pre, ToDate: e.target.value }))
                            }
                        />
                    </div>
                    <div className="d-flex flex-column">
                        <label className="mb-1 w-100">LOCATION</label>
                        <select
                            className="cus-inpt w-auto"
                            onChange={(e) => {
                                const value =
                                    e.target.value === "" ? "" : Number(e.target.value);
                                setFilter({ ...filter, godown_Id: value });
                            }}
                            value={filter?.godown_Id || ""}
                        >
                            <option value="" label="ALL">
                                select Branch
                            </option>
                            {location.map((loc, ind) => (
                                <option value={loc.Godown_Id} key={ind}>
                                    {loc.Godown_Name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <CardContent>
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    {[
                                        "SNo",
                                        "Product_Id",
                                        "Product_Name",
                                        "OpeningStock",
                                        "Total_Arrival",
                                        "Total_Delivery",
                                        "ClosingStock",
                                    ].map((o, i) => (
                                        <th
                                            key={i}
                                            className="border fa-14 text-muted text-uppercase text-center"
                                        >
                                            {o}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {activityData?.length > 0 &&
                                    activityData?.map((o, i) => (
                                        <tr key={i}>
                                            <td className="border text-center fa-13">{i + 1}</td>
                                            <td className="border fa-13 cellHoverColor">
                                                {o?.Product_Id}
                                            </td>
                                            <td className="border text-center fa-13">
                                                {o?.Product_Name ? o?.Product_Name : "-"}
                                            </td>
                                            <td className="border text-center fa-13">
                                                {o?.OpeningStock ? o?.OpeningStock : "-"}
                                            </td>
                                            <td className="border text-center fa-13 text-primary fw-bold">
                                                {o?.Total_Arrival ? o?.Total_Arrival : "0"}
                                            </td>
                                            <td className="border text-center fa-13">
                                                {o?.Total_Delivery ? o?.Total_Delivery : "-"}
                                            </td>
                                            <td className="border text-center fa-13">
                                                {o?.ClosingStock ? NumberFormat(o?.ClosingStock) : "-"}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/*      
            <datalist id='staffList'>
                {staffs.map((o, i) => <option key={i} value={o.WeingtCheckedBy} />)}
            </datalist>

            <datalist id='StockItem'>
                {stockItems.map((o, i) => <option key={i} value={o.StockItem} />)}
            </datalist> */}
        </>
    );
}

export default ProductclosingStockReports;