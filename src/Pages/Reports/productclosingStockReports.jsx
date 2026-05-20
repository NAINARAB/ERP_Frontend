import React, { useEffect, useState } from "react";
import {

  ISOString
} from "../../Components/functions";

import { Card } from "@mui/material";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable, { createCol }  from "../../Components/filterableTable2";

function ProductclosingStockReports({ loadingOn, loadingOff }) {

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
      .catch((e) => console.error(e))
      .finally(() => {
        if (loadingOff) {
          loadingOff();
        }
      });
  }, [reload, filter.fromDate, filter.ToDate, filter?.godown_Id]);

  useEffect(() => {
    fetchLink({
      address: `dataEntry/godownLocationMaster`,
    }).then((data) => {
      if (data.success) {
        setLocation(data.data);
        setReload(true)
      }
    });
  }, []);


  const ExpendableComponent = ({ row }) => {
    return (
      <table className="table w-full">
        <tbody>
        
           
         
              <table className="table table-sm w-full">
                <thead>
                  <tr className="bg-secondary text-white">
                    <th className="border p-1">Product Name</th>
                    <th className="border p-1">Opening Stock</th>
                    <th className="border p-1">Total Arrival</th>
                    <th className="border p-1">Total Delivery</th>
                    <th className="border p-1">Closing Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {row?.Products?.map((data, i) => (
                    <tr key={data.Product_Id}>
                      <td className="border p-1">{data.Product_Name}</td>
                      <td className="border p-1 text-center">{data.OpeningStock}</td>
                      <td className="border p-1 text-center">{data.Total_Arrival}</td>
                      <td className="border p-1 text-center">{data.Total_Delivery}</td>
                      <td className="border p-1 text-center">{data.ClosingStock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
          
         
  
        
        </tbody>
      </table>
    );
  };
  
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

        <FilterableTable
                title="Opening Stock"
                dataArray={activityData}
                EnableSerialNumber
                columns={[
                    createCol('Pro_Group', 'string', 'Product_Group')
                ]}
             
                // EnableSerialNumber={true}
                isExpendable={true}
                tableMaxHeight={550}
                expandableComp={ExpendableComponent}
            />
       
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
