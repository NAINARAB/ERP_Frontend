import { Button, Card, CardContent } from "@mui/material";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";

const ContraGeneralInfo = ({
    data = {},
    setData,
    voucherType = [],
    branch = [],
    canSave = false,
    onSave
}) => {
    const change = (k, v) => setData((p) => ({ ...p, [k]: v }));

    return (
        <></>
    );
};

export default ContraGeneralInfo;
