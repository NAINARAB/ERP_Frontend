import { useEffect, useState, useContext } from "react";
import { Card, CardHeader, CardContent, Paper } from '@mui/material';
import Select from 'react-select';
import { customSelectStyles } from "../../Components/tablecolumn";
import { MyContext } from "../../Components/context/contextProvider";
import { fetchLink } from '../../Components/fetchComponent';
import FilterableTable from "../../Components/filterableTable2";
import { checkIsNumber } from "../../Components/functions";

const TripReports = () => {
    const localData = localStorage.getItem("user");
    const parseData = JSON.parse(localData);
    const [tallyDetails, setTallyDetails] = useState([]);
    const [filters, setFilters] = useState({
        Emp_Id: parseData?.UserId,
        EmpGet: parseData?.Name,
        From: new Date().toISOString().split('T')[0],

    });
    const [users, setUsers] = useState([]);
    const { contextObj } = useContext(MyContext);

    useEffect(() => {
        fetchLink({
            address: `reports/tripReports?UserId=${filters?.Emp_Id}&Fromdate=${filters?.From}`
        }).then(data => {
            setTallyDetails(data.success ? data.data : []);
        }).catch(e => console.error(e));
    }, [filters?.Emp_Id, filters?.From, filters?.To]);

    useEffect(() => {
        fetchLink({
            address: `masters/users/employee/dropDown?Company_id=${parseData?.Company_id}`
        }).then(data => {
            setUsers(data.success ? data.data : []);
        }).catch(e => console.error(e));
    }, [parseData?.Company_id]);

    return (
        <Card component={Paper}>
            <CardHeader title="User Work" sx={{ pb: 0 }} />
            <CardContent>
                <div className="row">
                    {Number(contextObj?.Print_Rights) === 1 && (
                        <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-4 p-2">
                            <label>Employee Name</label>
                            <Select
                                value={{ value: filters?.Emp_Id, label: filters?.EmpGet }}
                                onChange={(e) => setFilters({ ...filters, Emp_Id: e.value, EmpGet: e.label })}
                                options={users.map(obj => ({ value: obj.UserId, label: obj.Name }))}
                                styles={customSelectStyles}
                                isSearchable={true}
                                placeholder="Employee Name"
                            />
                        </div>
                    )}
                    <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-4 p-2">
                        <label>From Date</label>
                        <input
                            type="date"
                            onChange={e => setFilters({ ...filters, From: e.target.value })}
                            value={filters?.From}
                            className="cus-inpt"
                        />
                    </div>

                </div>

                <FilterableTable
                    columns={[
                        { Field_Name: "Trip_Id", ColumnHeader: "Trip_Id", Fied_Data: "string", isVisible: 1 },

                        { Field_Name: "Trip_Date", ColumnHeader: "Trip_Date", Fied_Data: "date", isVisible: 1 },
                        { Field_Name: "Name", ColumnHeader: "Name", Fied_Data: "string", isVisible: 1 },
                        { Field_Name: "Cost_Center_Type", ColumnHeader: "Cost_Center_Type", Fied_Data: "string", isVisible: 1 },
                        { Field_Name: "Trip_Details_QTY", ColumnHeader: "Trip_Details_QTY", Fied_Data: "string", isVisible: 1 },

                    ]}
                    dataArray={Array.isArray(tallyDetails) ? tallyDetails : []}
                    EnableSerialNumber={true}
                    isExpendable={true}
                    expandableComp={({ row }) => (
                        <FilterableTable
                            dataArray={Array.isArray(row.Trip_Details) ? row.Trip_Details : []}
                            EnableSerialNumber={true}
                            columns={[
                                { Field_Name: "Trip_Id", ColumnHeader: "Trip_Id", Fied_Data: "string", isVisible: 1 },
                                { Field_Name: "Retailer_Name", ColumnHeader: "Retailer_Name", Fied_Data: "string", isVisible: 1 },

                                { Field_Name: "Total_Invoice_value", ColumnHeader: "Total_Invoice_value", Fied_Data: "number", isVisible: 1 },
                                { Field_Name: "Delivery_Location", ColumnHeader: "Delivery_Location", Fied_Data: "string", isVisible: 1 },
                                { Field_Name: "Delivery_Latitude", ColumnHeader: "Delivery_Latitude", Fied_Data: "string", isVisible: 1 },
                                { Field_Name: "Delivery_Longitude", ColumnHeader: "Delivery_Longitude", Fied_Data: "string", isVisible: 1 },
                                { Field_Name: "Collected_By", ColumnHeader: "Collected_By", Fied_Data: "string", isVisible: 1 },
                                { Field_Name: "Collected_Status", ColumnHeader: "Collected_Status", Fied_Data: "string", isVisible: 1 },
                                { Field_Name: "Payment_Mode", ColumnHeader: "Payment_Mode", Fied_Data: "string", isVisible: 1 },
                                { Field_Name: "Payment_Ref_No", ColumnHeader: "Payment_Ref_No", Fied_Data: "string", isVisible: 1 },
                                { Field_Name: "Payment_Status", ColumnHeader: "Payment_Status", Fied_Data: "string", isVisible: 1 },
                                {
                                    Field_Name: "Parameters",
                                    ColumnHeader: "Parameters",
                                    isVisible: 1,
                                    isCustomCell: true,
                                    Cell: ({ row }) => (
                                        <div className="d-flex align-items-center flex-wrap p-2 pb-0">
                                            {Array.isArray(row.Parameter_Details) && row.Parameter_Details.map((oo, oi) => (
                                                <div key={oi} className="d-flex align-items-center me-2">
                                                    <p className="me-2">{oo?.Paramet_Name}:</p>
                                                    <p className="fw-bold px-3 py-1 border rounded-3">
                                                        {(!checkIsNumber(oo?.Current_Value) || oo?.Paramet_Data_Type !== 'number')
                                                            ? oo?.Current_Value
                                                            : Number(oo?.Current_Value).toLocaleString('en-IN')}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )
                                }
                            ]}
                        />
                    )}
                />
            </CardContent>
        </Card>
    );
};

export default TripReports;