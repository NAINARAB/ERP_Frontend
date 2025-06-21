import { useEffect, useState } from "react";
import { fetchLink } from "../../Components/fetchComponent";
import { getSessionUser } from "../../Components/functions";
import { Card, IconButton } from "@mui/material";
import { Dialog, DialogActions, DialogContent, DialogTitle, Switch, Paper, Button } from "@mui/material";
import { Settings } from "@mui/icons-material";


const Lom = ({ loadingOn, loadingOff }) => {

    const [erpDetails, setErpDetails] = useState([]);
    const [tallyData, setTallyData] = useState([]);
    const [dialog, setDialog] = useState(false);

    const [columns, setColumns] = useState([]);
    const [propsColumns, setPropsColumns] = useState([]);

    const handleButtonClick = (index, source = "ERP") => {
        const dataSource = source === "ERP" ? erpDetails : tallyData;

        const selectedMaster = dataSource?.[index];

        if (!selectedMaster || !Array.isArray(selectedMaster.columns)) {
            setColumns([]);
            setDialog(true);
            return;
        }

        const mappedColumns = selectedMaster.columns.map((col, i) => ({
            Field_Name: col.COLUMN_NAME,
            isDefault: col.IS_NULLABLE === "NO",
            isVisible: true,
            OrderBy: i + 1,
        }));

        setColumns(mappedColumns);
        setPropsColumns(mappedColumns);
        setDialog(true);
    };

    useEffect(() => {

        const user = getSessionUser().user;

        const fetchData = async () => {
            try {
                if(loadingOn) loadingOn();
                const [
                    erpResonse,
                    tallyResponse,
                ] = await Promise.all([
                    fetchLink({ address: `masters/getDetails` }),
                    fetchLink({ address: `masters/getTallyData`, headers: { Db: user?.Company_id } })
                ]);

                const erpData = erpResonse.success ? erpResonse.data : []
                const tallyData = tallyResponse.success ? tallyResponse.data : []

                setErpDetails(erpData);
                setTallyData(tallyData);

                if(loadingOff) loadingOff();
            } catch (e) {
                console.error("Error fetching data:", e);
            }
        };

        fetchData();
    }, []);

    return (
        <>
            <Card>
                <div className="px-3 py-2 fa-14">
                    <div className="d-flex flex-wrap align-items-center">
                        <h5 className="flex-grow-1">LOM</h5>
                        <IconButton size="small"></IconButton>
                    </div>
                </div>

                <table
                    className="table table-bordered text-center"
                    style={{ borderCollapse: "collapse", width: "100%" }}
                >
                    <thead>
                        <tr>
                            <th colSpan="4" className="bg-light">ERP</th>
                            <th colSpan="3" className="bg-light">TALLY</th>
                        </tr>
                        <tr>
                            <th>#</th>
                            <th>MASTER NAME</th>
                            <th>COUNT</th>
                            <th>FIELDS</th>
                            <th>MASTER NAME</th>
                            <th>COUNT</th>
                            <th>FIELDS</th>
                        </tr>
                    </thead>

                    <tbody>
                        {Array.from({
                            length: Math.max(
                                erpDetails.length || 0,
                                tallyData.length || 0
                            ),
                        }).map((_, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{erpDetails[index]?.master || "-"}</td>
                                <td>{erpDetails[index]?.count || "-"}</td>
                                <td>
                                    {erpDetails[index]?.fields || "-"}{" "}
                                    <Button onClick={() => handleButtonClick(index, "ERP")}>
                                        {" "}
                                        <Settings />
                                    </Button>
                                </td>
                                <td>{tallyData[index]?.master || "-"}</td>
                                <td>{tallyData[index]?.count || "-"}</td>
                                <td>
                                    {tallyData[index]?.fields || "-"}{" "}
                                    <Button onClick={() => handleButtonClick(index, "Tally")}>
                                        <Settings />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            <Dialog
                open={dialog}
                onClose={() => setDialog(false)}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>Column Settings</DialogTitle>
                <DialogContent>
                    <div className="row">
                        {columns?.map((o, i) => (
                            <div className="col-lg-4 col-md-6 p-2" key={i}>
                                <Card
                                    component={Paper}
                                    className={`p-2 d-flex justify-content-between align-items-center flex-wrap ${i % 2 !== 0 ? "bg-light" : ""}`}
                                >
                                    <div className="d-flex align-items-center flex-wrap">
                                        <Switch
                                            checked={Boolean(o?.isDefault) || Boolean(o?.isVisible)}
                                            disabled={Boolean(o?.isDefault)}
                                            onChange={(e) =>
                                                setColumns((prev) =>
                                                    prev.map((col) =>
                                                        col.Field_Name === o.Field_Name
                                                            ? { ...col, isVisible: e.target.checked ? 1 : 0 }
                                                            : col
                                                    )
                                                )
                                            }
                                        />
                                        <span className="fa-13 mb-0 fw-bold ms-2">{o?.Field_Name}</span>
                                    </div>

                                    <input
                                        type="number"
                                        value={o?.OrderBy || ""}
                                        onChange={(e) =>
                                            setColumns((prev) =>
                                                prev.map((col) =>
                                                    col.Field_Name === o.Field_Name
                                                        ? { ...col, OrderBy: Number(e.target.value) }
                                                        : col
                                                )
                                            )
                                        }
                                        className="mt-2 p-1 border-0 cus-inpt"
                                        style={{ width: "80px" }}
                                        placeholder="Order"
                                    />
                                </Card>
                            </div>
                        ))}
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setColumns(propsColumns)} variant="outlined">
                        Reset
                    </Button>
                    <Button onClick={() => setDialog(false)} color="error">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Lom;
