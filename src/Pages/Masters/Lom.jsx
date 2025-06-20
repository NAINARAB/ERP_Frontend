import { useEffect, useState } from "react";
import { fetchLink } from "../../Components/fetchComponent";
import { getSessionUser } from "../../Components/functions";
import { Card, IconButton } from "@mui/material";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Switch,
  Paper,
  Button,
} from "@mui/material";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
const Lom = () => {
  const user = getSessionUser().user;
  // const [filters, setFilters] = useState({
  //   refresh: false,
  //   viewNotSynced: false,
  //   searchERPLol: "",
  //   searchTallyLol: "",
  //   searchNotSynced: "",
  // });

  const [erpDetails, setErpDetails] = useState([]);
  const [tallyData, setTallyData] = useState([]);
  const [dialog, setDialog] = useState(false);

  const [columns, setColumns] = useState([]);
  const [propsColumns, setPropsColumns] = useState([]);

  const handleButtonClick = (index, source = "ERP") => {
    const dataSource =
      source === "ERP" ? erpDetails?.data?.ERP : tallyData?.data?.Tally;

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
    const fetchProjects = async () => {
      try {
        const data = await fetchLink({
          address: `masters/getDetails`,
        });
        setErpDetails(data);
      } catch (e) {
        setErpDetails([]);
      }
    };
    const tallyData = async () => {
      try {
        const data = await fetchLink({
          address: `masters/getTallyData`,
          headers: {
            Db: user?.Company_id,
          },
        });
        setTallyData(data);
      } catch (e) {
        setTallyData([]);
      }
    };
    fetchProjects();
    tallyData();
  }, [user?.Company_id]);

  return (
    <>
      <Card>
        <div className="px-3 py-2 fa-14">
          <div className="d-flex flex-wrap align-items-center">
            <h5 className="flex-grow-1">LOM</h5>
            <IconButton size="small"></IconButton>
          </div>
        </div>

        <div className="row">
          <table
            className="table table-bordered text-center"
            style={{ borderCollapse: "collapse", width: "100%" }}
          >
            <thead>
             <tr style={{ backgroundColor: '#d3d3d3' }}> 
      <th style={{ backgroundColor: '#d3d3d3' }}  colSpan="3">ERP</th>
      <th style={{ backgroundColor: '#d3d3d3' }} colSpan="3">TALLY</th>
    </tr>
              <tr>
                <th>MASTER NAME</th>
                <th>COUNT</th>
                <th>FIELDS</th>
                <th>MASTER NAME</th>
                <th>COUNT</th>
                <th>FIELDS</th>
                {/* <th>MASTER NAME</th>
                <th>COUNT</th>
                <th>FIELDS</th> */}
              </tr>
            </thead>

            <tbody>
              {Array.from({
                length: Math.max(
                  erpDetails?.data?.ERP?.length || 0,
                  tallyData?.data?.Tally?.length || 0
                ),
              }).map((_, index) => (
                <tr key={index}>
                  <td>{erpDetails?.data?.ERP?.[index]?.master || "-"}</td>
                  <td>{erpDetails?.data?.ERP?.[index]?.count || "-"}</td>
                  <td>
                    {erpDetails?.data?.ERP?.[index]?.fields || "-"}{" "}
                    <Button onClick={() => handleButtonClick(index, "ERP")}>
                      {" "}
                      <ArrowOutwardIcon />
                    </Button>
                  </td>

                  <td>{tallyData?.data?.Tally?.[index]?.master || "-"}</td>
                  <td>{tallyData?.data?.Tally?.[index]?.count || "-"}</td>
                  <td>
                    {tallyData?.data?.Tally?.[index]?.fields || "-"}{" "}
                    <Button onClick={() => handleButtonClick(index, "Tally")}>
                      <ArrowOutwardIcon />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
                  className={`p-2 d-flex justify-content-between align-items-center flex-wrap ${
                    i % 2 !== 0 ? "bg-light" : ""
                  }`}
                >
                  <div className="d-flex justify-content-between align-items-center flex-wrap w-100">
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
                    <h6 className="fa-13 mb-0 fw-bold ms-2">{o?.Field_Name}</h6>
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
                    classNam
                    e="mt-2 p-1 border-0 cus-inpt"
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
