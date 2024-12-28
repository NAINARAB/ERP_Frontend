import { useState } from "react";
import { ISOString } from '../../Components/functions';
import FilterableTable from '../../Components/filterableTable2';
import { Button, IconButton } from "@mui/material";
import { FilterAlt } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const StockJournal = ({ loadingOn, loadingOff }) => {
    const navigate = useNavigate();
    const [stockJournalData, setStockJournalData] = useState([]);
    const [filters, setFilters] = useState({
        Fromdate: ISOString(),
        Todate: ISOString(),
        filterDialog: false,
    });

    return (
        <>
            <FilterableTable
                dataArray={stockJournalData}
                title="Stock Journal"
                ButtonArea={
                    <>
                        <IconButton
                            size="small"
                            onClick={() => setFilters({ ...filters, filterDialog: true })}
                        ><FilterAlt /></IconButton>

                        <Button
                            variant="outlined"
                            onClick={() => navigate('/erp/inventory/stockJournal/create')}
                        >Add</Button>
                    </>
                }
                columns={[]}
            />
        </>
    )
}

export default StockJournal;