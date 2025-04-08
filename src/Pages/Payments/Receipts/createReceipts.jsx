import { Button, Card, CardContent } from "@mui/material";
import { checkIsNumber, getSessionUser, ISOString } from "../../../Components/functions";
import { fetchLink } from "../../../Components/fetchComponent";
import Select from "react-select";
import { useEffect, useState } from "react";
import { Search } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";

const useQuery = () => new URLSearchParams(useLocation().search);
const CreateReceipts = ({ loadingOn, loadingOff }) => {
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

    useEffect(() => {
        fetchLink({ address: "delivery/getRetailersWhoHasBills" })
            .then(data => {
                if (data.success) setRetailers(data.data);
                else setRetailers([]);
            })
            .catch(e => console.error(e));
    }, []);

    const getPendingBills = retailer => {
        if (loadingOn) loadingOn();
        fetchLink({ address: `delivery/retailerPendingBills?retailer_id=${retailer}` })
            .then(data => {
                if (data.success) setSalesPayments(data.data);
                else setSalesPayments([]);
            })
            .catch(e => console.error(e))
            .finally(() => {
                if (loadingOff) loadingOff();
            });
    };

    return (
        <>
            <Card>
                <CardContent>
                    <div className="d-flex">
                        <div className="col-sm-4">
                            <Select
                                menuPortalTarget={document.body}
                                options={[
                                    {
                                        value: "",
                                        label: "select",
                                        isDisabled: true,
                                    },
                                    ...retailers.map(obj => ({
                                        value: obj?.Retailer_Id,
                                        label: obj?.Retailer_Name,
                                    })),
                                ]}
                                value={filters.Retailer}
                                menu
                                onChange={value =>
                                    setFilters(pre => ({
                                        ...pre,
                                        Retailer: value,
                                    }))
                                }
                                placeholder="Search by Retailer"
                            />
                        </div>
                        <Button
                            variant="outlined"
                            className="ms-2"
                            startIcon={<Search />}
                            disabled={!checkIsNumber(filters.Retailer.value)}
                            onClick={() =>
                                getPendingBills(filters.Retailer.value)
                            }>
                            Search
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </>
    );
};

export default CreateReceipts;
