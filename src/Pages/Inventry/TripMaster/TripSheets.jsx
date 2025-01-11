import { Button } from "@mui/material";
import FilterableTable from "../../../Components/filterableTable2";
import { useNavigate } from "react-router-dom";

const TripSheets = ({ loadingOn, loadingOff }) => {

    const nav = useNavigate()

    return(
        <>
            <FilterableTable 
                title="Trip Sheets"
                ButtonArea={
                    <>
                        <Button
                            variant="outlined"
                            onClick={() => nav('/erp/inventory/tripSheet/searchGodown')}
                        >Add</Button>
                    </>
                }
            />
        </>
    )
}


export default TripSheets;