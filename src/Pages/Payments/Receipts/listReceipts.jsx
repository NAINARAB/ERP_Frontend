import { Button, Card, CardContent } from "@mui/material";
import {
    checkIsNumber,
    getSessionUser,
    ISOString,
} from "../../../Components/functions";
import { fetchLink } from "../../../Components/fetchComponent";
import FilterableTable from "../../../Components/filterableTable2";
import Select from "react-select";
import { useEffect, useState } from "react";
import { Search } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";

const useQuery = () => new URLSearchParams(useLocation().search);
const ReceiptsListing = ({ loadingOn, loadingOff }) => {
    const storage = getSessionUser().user;
    const navigate = useNavigate();
    const location = useLocation();
    const stateDetails = location.state;
    const query = useQuery();

    const [salesPayments, setSalesPayments] = useState([]);
    const [retailers, setRetailers] = useState([]);
    const [filters, setFilters] = useState({
        Fromdate: ISOString(),
        Todate: ISOString(),
        Retailer: { value: "", label: "Search by Retailer..." },
    });

    return (
        <>
            <FilterableTable
                title="Receipts"
                ButtonArea={
                    <>
                        <Button
                            variant="outlined"
                            className="ms-2"
                            onClick={() => navigate('create')}>
                            Create Receipt
                        </Button>
                    </>
                }
            />
        </>
    );
};

export default ReceiptsListing;
