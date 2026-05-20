import { useState } from "react";
import InwardActivity from "./inwardActivity";
import MachineOuternActivity from "./machineOutern";
import { Card } from "@mui/material";

const ActivityImagesUpload = () => {
    const [open, setOpen] = useState('INWARD');
    const pages = ['INWARD', 'MACHINE OUTERN']

    const displayContent = (page) => {
        switch (page) {
            case 'INWARD':
                return <InwardActivity />;
            case 'MACHINE OUTERN':
                return <MachineOuternActivity />;
            default:
                return <></>;
        }
    };

    return (
        <>
            <Card>
                <div className="p-2 fa-16 fw-bold d-flex justify-content-between align-items-center">
                    <span className="text-primary text-uppercase ps-3">file Uploads</span>
                    <select 
                        className="cus-inpt w-auto"
                        value={open}
                        onChange={e => setOpen(e.target.value)}
                    >
                        {pages.map((o, i) => <option value={o} key={i}>{o}</option>)}
                    </select>
                </div>

                <hr className="mt-0" />

                {displayContent(open)}
            </Card>
        </>
    )
}

export default ActivityImagesUpload;