import { useState, useEffect, useMemo } from "react";
import {
  Button, Dialog, IconButton, DialogTitle,
  DialogContent, DialogActions, Tooltip
} from "@mui/material";
import Select from "react-select";
import { customSelectStyles } from "../../Components/tablecolumn";
import {
  getSessionFiltersByPageId,
  ISOString,
  reactSelectFilterLogic,
  setSessionFilters,
  toArray,
} from "../../Components/functions";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable, { createCol, ButtonActions } from "../../Components/filterableTable2";
import { FilterAlt, Search, Sync, Upload, Visibility } from "@mui/icons-material";
import { Close } from "@mui/icons-material";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import api from "../../API";
import ImagePreviewDialog from "../../Components/imagePreview";



const defaultFilters = {
  Fromdate: ISOString(),
  Todate: ISOString(),
  Party: { value: "", label: "ALL" },
  Godown: { value: "", label: "ALL" },
  Driver: { value: "", label: "ALL" },
  UploadStatus: { value: "", label: "ALL" },
};

const initialUploadForm = {
  Do_Id: "",
  invoiceNo: "",
  partyName: "",
  uploadStatus: "pending",
  uploadFile: null,
  existingFile: "",
};

const UPLOAD_STATUS_OPTIONS = [
  { value: "", label: "ALL" },
  { value: "yes", label: "Uploaded" },
  { value: "no", label: "Not Uploaded" },
  { value: "pending", label: "Pending" },
];

const uploadStatusBadge = {
  yes: { label: "Uploaded", cls: "bg-success text-white" },
  no: { label: "Not Uploaded", cls: "bg-danger  text-white" },
  pending: { label: "Pending", cls: "bg-warning text-dark" },
};


const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) return null;

  let fullImageUrl = imageUrl;


  if (imageUrl.startsWith('uploads/') || imageUrl.startsWith('uploads\\')) {
    const normalizedPath = imageUrl.replace(/\\/g, '/');
    fullImageUrl = `${api}/${normalizedPath}`;
  }

  else if (!imageUrl.includes('/') && !imageUrl.includes('\\') && !imageUrl.startsWith('http')) {
    fullImageUrl = `${api}/uploads/LRReport/${imageUrl}`;
  }

  else if (imageUrl.includes(':\\')) {
    const uploadsIndex = imageUrl.indexOf('uploads');
    if (uploadsIndex !== -1) {
      const relativePath = imageUrl.substring(uploadsIndex).replace(/\\/g, '/');
      fullImageUrl = `${api}/${relativePath}`;
    }
  }

  else if (!imageUrl.startsWith('http')) {
    fullImageUrl = `${api}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  }

  return fullImageUrl;
};



const StockDetailsExpand = ({ row }) => {
  const stocks = toArray(row?.stockDetails);

  if (!stocks.length) {
    return <p className="text-muted fa-12 p-2 m-0">No stock details available.</p>;
  }

  return (
    <div className="p-2">
      <FilterableTable
        title="Stock Details"
        headerFontSizePx={11}
        bodyFontSizePx={11}
        EnableSerialNumber
        dataArray={stocks}
        disablePagination
        columns={[
          createCol("Product_Name", "string", "Product"),
          createCol("Brand_Name", "string", "Brand"),
          createCol("Godown_Name", "string", "Godown"),
          createCol("UOM", "string", "UOM"),
          createCol("Bill_Qty", "number", "Bill Qty"),
          createCol("Act_Qty", "number", "Act Qty"),
          createCol("Alt_Act_Qty", "number", "Alt Qty"),
          createCol("unitValue", "number", "Unit Value"),
          createCol("itemRate", "number", "Item Rate"),
          createCol("billedRate", "number", "Billed Rate"),
          {
            ColumnHeader: "Qty Diff",
            isVisible: 1,
            align: "center",
            isCustomCell: true,
            Cell: ({ row: r }) => {
              const diff = r.quantityDifference ?? 0;
              const cls =
                diff === 0 ? "bg-success text-white" :
                  diff > 0 ? "bg-warning text-dark" :
                    "bg-danger  text-white";
              return (
                <span className={`py-0 fw-bold px-2 rounded-4 fa-12 ${cls}`}>
                  {diff}
                </span>
              );
            },
          },
        ]}
      />
    </div>
  );
};



const ShetSheetUpload = ({ loadingOn, loadingOff, pageID }) => {
  const sessionValue = sessionStorage.getItem("filterValues");
  const location = useLocation();

  const [tableData, setTableData] = useState([]);
  const [reload, setReload] = useState(false);
  const [filters, setFilters] = useState({ ...defaultFilters });
  const [uploadForm, setUploadForm] = useState({ ...initialUploadForm });

  const [dialog, setDialog] = useState({
    filters: false,
    upload: false,
    preview: false,
  });



  const partyOptions = useMemo(() => {
    const unique = [...new Map(
      tableData
        .filter((r) => r.retailerNameGet)
        .map((r) => [r.Retailer_Id, { value: r.Retailer_Id, label: r.retailerNameGet }])
    ).values()];
    return [{ value: "", label: "ALL" }, ...unique];
  }, [tableData]);

  const godownOptions = useMemo(() => {
    const unique = [...new Set(
      tableData.map((r) => r.godown).filter(Boolean)
    )].map((g) => ({ value: g, label: g }));
    return [{ value: "", label: "ALL" }, ...unique];
  }, [tableData]);

  const driverOptions = useMemo(() => {
    const unique = [...new Set(
      tableData.map((r) => r.driver).filter(Boolean)
    )].map((d) => ({ value: d, label: d }));
    return [{ value: "", label: "ALL" }, ...unique];
  }, [tableData]);


  const filteredData = useMemo(() => {
    return tableData.filter((row) => {
      const matchParty = !filters.Party?.value || row.Retailer_Id === filters.Party.value;
      const matchGodown = !filters.Godown?.value || row.godown === filters.Godown.value;
      const matchDriver = !filters.Driver?.value || row.driver === filters.Driver.value;


      let matchUpload = true;
      if (filters.UploadStatus?.value) {
        const hasImage = row.Imageurl && row.Imageurl !== "";
        if (filters.UploadStatus.value === "yes") {
          matchUpload = hasImage;
        } else if (filters.UploadStatus.value === "no") {
          matchUpload = !hasImage;
        } else if (filters.UploadStatus.value === "pending") {
          matchUpload = row.imageStatus === "pending" && !hasImage;
        }
      }

      return matchParty && matchGodown && matchDriver && matchUpload;
    });
  }, [tableData, filters.Party, filters.Godown, filters.Driver, filters.UploadStatus]);


  useEffect(() => {
    const saved = getSessionFiltersByPageId(pageID);
    const {
      Fromdate,
      Todate,
      Party = defaultFilters.Party,
      Godown = defaultFilters.Godown,
      Driver = defaultFilters.Driver,
      UploadStatus = defaultFilters.UploadStatus,
    } = saved;

    setFilters((pre) => ({
      ...pre,
      Fromdate: Fromdate || defaultFilters.Fromdate,
      Todate: Todate || defaultFilters.Todate,
      Party, Godown, Driver, UploadStatus,
    }));
  }, [sessionValue, pageID]);


  useEffect(() => {
    const saved = getSessionFiltersByPageId(pageID);
    const {
      Fromdate = defaultFilters.Fromdate,
      Todate = defaultFilters.Todate,
    } = saved;

    fetchLink({
      address: `sales/lrreportUpload?reqDate=${Fromdate}&Todate=${Todate}`,
      loadingOn,
      loadingOff,
    })
      .then((data) => {
        if (data.success) {
          setTableData(data?.data || []);
        } else {
          setTableData([]);
          toast.error(data.message || "Failed to load LR report data");
        }
      })
      .catch((e) => {
        console.error(e);
        toast.error("Error fetching LR report data");
        setTableData([]);
      });
  }, [sessionValue, pageID, reload, location]);


  const handlePost = (e) => {
    e.preventDefault();

    if (!uploadForm.uploadFile) {
      toast.warning("Please select a file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("Do_Id", uploadForm.Do_Id);
    formData.append("Do_Inv_No", uploadForm.invoiceNo);
    formData.append("Uploaded_By", uploadForm.Uploaded_By || "");
    formData.append("LRReport", uploadForm.uploadFile);

    if (loadingOn) loadingOn();

    fetch(`${api}sales/lrreportUpload`, {
      method: "POST",
      body: formData
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          toast.success(data.message || "Uploaded successfully!");
          closeUploadDialog();
          setReload((pre) => !pre);
        } else {
          toast.error(data.message || "Upload failed");
        }
      })
      .catch((e) => {
        console.error(e);
        toast.error("Upload error");
      })
      .finally(() => {
        if (loadingOff) loadingOff();
      });
  };

  const handlePut = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("Id", uploadForm.Id);
    formData.append("Do_Id", uploadForm.Do_Id);
    formData.append("Do_Inv_No", uploadForm.invoiceNo);
    formData.append("Uploaded_By", uploadForm.Uploaded_By || "");

    if (uploadForm.uploadFile) {
      formData.append("LRReport", uploadForm.uploadFile);
    }

    if (loadingOn) loadingOn();

    fetch(`${api}sales/lrreportUpload`, {
      method: "PUT",
      body: formData
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          toast.success(data.message || "Updated successfully!");
          closeUploadDialog();
          setReload((pre) => !pre);
        } else {
          toast.error(data.message || "Update failed");
        }
      })
      .catch((e) => {
        console.error(e);
        toast.error("Update error");
      })
      .finally(() => {
        if (loadingOff) loadingOff();
      });
  };

  const openUploadDialog = (row) => {
    const hasImage = row.Imageurl && row.Imageurl !== "";
    setUploadForm({
      Id: row?.Id || "",
      Do_Id: row?.Do_Id || "",
      invoiceNo: row?.Do_Inv_No || "",
      partyName: row?.retailerNameGet || "",
      uploadStatus: hasImage ? "uploaded" : "pending",
      uploadFile: null,
      existingFile: row?.Image_Name || "",
      Uploaded_By: localStorage.getItem("userId") || "",
    });
    setDialog((pre) => ({ ...pre, upload: true }));
  };

  const closeUploadDialog = () => {
    setDialog((pre) => ({ ...pre, upload: false }));
    setUploadForm({ ...initialUploadForm });
  };

  const closeFilterDialog = () => {
    setDialog((pre) => ({ ...pre, filters: false }));
  };

  const isUpdate = Boolean(uploadForm.existingFile);


  return (
    <>
      {/* ── Main Table ── */}
      <FilterableTable
        title="Shet Sheet Upload"
        dataArray={filteredData}
        EnableSerialNumber
        tableMaxHeight={550}
        isExpendable={true}
        expandableComp={StockDetailsExpand}
        columns={[
          createCol("Do_Date", "date", "Date"),
          createCol("Do_Inv_No", "string", "Invoice No"),
          createCol("retailerNameGet", "string", "Party Name"),
          {
            ColumnHeader: "Items",
            isVisible: 1,
            align: "center",
            isCustomCell: true,
            Cell: ({ row }) => (
              <span className="fw-bold">
                {toArray(row?.stockDetails).length}
              </span>
            ),
          },
          {
            ColumnHeader: "Preview",
            isVisible: 1,
            align: "center",
            isCustomCell: true,
            Cell: ({ row }) => {

              const imageUrl = row.Imageurl;

              if (!imageUrl || imageUrl === "" || imageUrl === null) {
                return <span className="text-muted fa-12">—-</span>;
              }

              return (
                <div className="d-flex align-items-center flex-column">
                  <ImagePreviewDialog url={imageUrl}>
                    <img
                      src={imageUrl}
                      alt={`Invoice ${row.Do_Inv_No}`}
                      style={{
                        maxWidth: '60px',
                        maxHeight: '60px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        cursor: 'pointer'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <Visibility />
                  </ImagePreviewDialog>
                </div>
              );
            },
          },
          {
            ColumnHeader: "Driver",
            isVisible: 1,
            isCustomCell: true,
            Cell: ({ row }) => {
              const staffs = toArray(row?.involvedStaffs);

              if (!staffs.length) {
                return <span className="text-muted fa-12">—</span>;
              }

              const driverTypes = staffs.filter(staff =>
                staff.Involved_Emp_Type === "Delivery Man" ||
                staff.Involved_Emp_Type === "Load Man"
              );

              if (!driverTypes.length) {
                return <span className="text-muted fa-12">—</span>;
              }

              return (
                <div className="fa-12">
                  {driverTypes.map((staff, index) => (
                    <div key={staff.Id || index} className="mb-1">
                      <span className="text-primary fw-bold">
                        {staff.Emp_Name}
                      </span>
                      <span className="text-muted ms-1">
                        ({staff.Involved_Emp_Type})
                      </span>
                    </div>
                  ))}
                </div>
              );
            },
          },
          {
            ColumnHeader: "File",
            isVisible: 1,
            isCustomCell: true,
            Cell: ({ row }) =>
              row.Image_Name ? (
                <span className="text-primary fa-12">📎 {row.Image_Name}</span>
              ) : (
                <span className="text-muted fa-12">—</span>
              ),
          },
          {
            ColumnHeader: "Upload Status",
            isVisible: 1,
            align: "center",
            isCustomCell: true,
            Cell: ({ row }) => {

              const hasImage = row.Imageurl && row.Imageurl !== "";
              const status = hasImage ? "yes" : (row.imageStatus === "pending" ? "pending" : "no");
              const st = uploadStatusBadge[status] || uploadStatusBadge.pending;

              return (
                <span className={`py-0 fw-bold px-2 rounded-4 fa-12 ${st.cls}`}>
                  {st.label}
                </span>
              );
            },
          },
          {
            Field_Name: "Action",
            isVisible: 1,
            isCustomCell: true,
            Cell: ({ row }) => (
              <ButtonActions
                buttonsData={[
                  // {
                  //     name: "Preview Invoice",
                  //     onclick: () => {
                  //         setUploadForm((pre) => ({
                  //             ...pre,
                  //             invoiceNo: row.Do_Inv_No,
                  //             Do_Id:     row.Do_Id,
                  //         }));
                  //         setDialog((pre) => ({ ...pre, preview: true }));
                  //     },
                  //     icon: <Visibility fontSize="small" color="primary" />,
                  // },
                  {
                    name: row?.Image_Name ? "Update Upload" : "Upload",
                    onclick: () => openUploadDialog(row),
                    icon: <Upload fontSize="small" color="primary" />,
                  },
                ]}
              />
            ),
          },
        ]}
        ButtonArea={
          <>
            <Tooltip title="Refresh">
              <Button
                variant="outlined"
                startIcon={<Sync />}
                onClick={() => setReload((pre) => !pre)}
              >
                Refresh
              </Button>
            </Tooltip>

            <Tooltip title="Filters">
              <IconButton
                size="small"
                onClick={() => setDialog((pre) => ({ ...pre, filters: true }))}
              >
                <FilterAlt />
              </IconButton>
            </Tooltip>
          </>
        }
      />


      <Dialog open={dialog.filters} onClose={closeFilterDialog} fullWidth maxWidth="sm">
        <DialogTitle>Filters</DialogTitle>
        <DialogContent>
          <div className="table-responsive pb-4">
            <table className="table">
              <tbody>
                <tr>
                  <td style={{ verticalAlign: "middle" }}>From</td>
                  <td>
                    <input
                      type="date"
                      value={filters.Fromdate}
                      onChange={(e) =>
                        setFilters((pre) => ({ ...pre, Fromdate: e.target.value }))
                      }
                      className="cus-inpt"
                    />
                  </td>
                </tr>

                <tr>
                  <td style={{ verticalAlign: "middle" }}>To</td>
                  <td>
                    <input
                      type="date"
                      value={filters.Todate}
                      onChange={(e) =>
                        setFilters((pre) => ({ ...pre, Todate: e.target.value }))
                      }
                      className="cus-inpt"
                    />
                  </td>
                </tr>

                <tr>
                  <td style={{ verticalAlign: "middle" }}>Party</td>
                  <td>
                    <Select
                      value={filters.Party}
                      onChange={(e) => setFilters((pre) => ({ ...pre, Party: e }))}
                      options={partyOptions}
                      styles={customSelectStyles}
                      isSearchable
                      placeholder="Party Name"
                      menuPortalTarget={document.body}
                      filterOption={reactSelectFilterLogic}
                    />
                  </td>
                </tr>

                <tr>
                  <td style={{ verticalAlign: "middle" }}>Godown</td>
                  <td>
                    <Select
                      value={filters.Godown}
                      onChange={(e) => setFilters((pre) => ({ ...pre, Godown: e }))}
                      options={godownOptions}
                      styles={customSelectStyles}
                      isSearchable
                      placeholder="Godown"
                      menuPortalTarget={document.body}
                      filterOption={reactSelectFilterLogic}
                    />
                  </td>
                </tr>

                <tr>
                  <td style={{ verticalAlign: "middle" }}>Driver</td>
                  <td>
                    <Select
                      value={filters.Driver}
                      onChange={(e) => setFilters((pre) => ({ ...pre, Driver: e }))}
                      options={driverOptions}
                      styles={customSelectStyles}
                      isSearchable
                      placeholder="Driver Name"
                      menuPortalTarget={document.body}
                      filterOption={reactSelectFilterLogic}
                    />
                  </td>
                </tr>

                <tr>
                  <td style={{ verticalAlign: "middle" }}>Upload Status</td>
                  <td>
                    <Select
                      value={filters.UploadStatus}
                      onChange={(e) =>
                        setFilters((pre) => ({ ...pre, UploadStatus: e }))
                      }
                      options={UPLOAD_STATUS_OPTIONS}
                      styles={customSelectStyles}
                      placeholder="Upload Status"
                      menuPortalTarget={document.body}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeFilterDialog}>Close</Button>
          <Button
            variant="outlined"
            startIcon={<Search />}
            onClick={() => {
              closeFilterDialog();
              setSessionFilters({
                pageID,
                Fromdate: filters.Fromdate,
                Todate: filters.Todate,
                Party: filters.Party,
                Godown: filters.Godown,
                Driver: filters.Driver,
                UploadStatus: filters.UploadStatus,
              });
            }}
          >
            Search
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Upload / Update Dialog ── */}
      <Dialog open={dialog.upload} onClose={closeUploadDialog} fullWidth maxWidth="xs">
        <DialogTitle>
          {isUpdate ? "Update Upload" : "Upload File"} — {uploadForm.invoiceNo}
          <IconButton
            onClick={closeUploadDialog}
            style={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <form onSubmit={isUpdate ? handlePut : handlePost}>
          <DialogContent>
            <div className="table-responsive">
              <table className="table">
                <tbody>
                  <tr>
                    <td style={{ verticalAlign: "middle" }}>Invoice No</td>
                    <td>
                      <input className="cus-inpt" value={uploadForm.invoiceNo} readOnly />
                    </td>
                  </tr>

                  <tr>
                    <td style={{ verticalAlign: "middle" }}>Party Name</td>
                    <td>
                      <input className="cus-inpt" value={uploadForm.partyName} readOnly />
                    </td>
                  </tr>

                  <tr>
                    <td style={{ verticalAlign: "middle" }}>Upload Status</td>
                    <td>
                      <select
                        className="cus-inpt"
                        value={uploadForm.uploadStatus}
                        onChange={(e) =>
                          setUploadForm((pre) => ({
                            ...pre,
                            uploadStatus: e.target.value,
                          }))
                        }
                      >
                        <option value="yes">Uploaded</option>
                        <option value="pending">Pending</option>
                      </select>
                    </td>
                  </tr>

                  <tr>
                    <td style={{ verticalAlign: "middle" }}>
                      {isUpdate ? "Replace File" : "Select File"}
                    </td>
                    <td>
                      <input
                        type="file"
                        className="cus-inpt"
                        accept="image/*,.pdf"
                        required={!isUpdate}
                        onChange={(e) => {
                          const f = e.target.files[0] || null;
                          setUploadForm((pre) => ({ ...pre, uploadFile: f }));
                        }}
                      />
                      {isUpdate && !uploadForm.uploadFile && (
                        <small className="text-muted d-block mt-1">
                          Current: {uploadForm.existingFile}
                        </small>
                      )}
                      {uploadForm.uploadFile &&
                        uploadForm.uploadFile.type?.startsWith("image/") && (
                          <img
                            src={URL.createObjectURL(uploadForm.uploadFile)}
                            alt="Preview"
                            style={{ maxWidth: "100%", maxHeight: 140, marginTop: 8 }}
                          />
                        )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </DialogContent>

          <DialogActions>
            <Button type="button" onClick={closeUploadDialog}>Cancel</Button>
            <Button type="submit" variant="outlined" startIcon={<Upload />}>
              {isUpdate ? "Update" : "Upload"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ── Preview Dialog ── */}
      <Dialog
        open={dialog.preview}
        onClose={() => setDialog((pre) => ({ ...pre, preview: false }))}
        fullWidth maxWidth="lg" scroll="paper"
      >
        <DialogTitle>
          Invoice Preview — {uploadForm.invoiceNo}
          <IconButton
            onClick={() => setDialog((pre) => ({ ...pre, preview: false }))}
            style={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <p className="text-muted text-center py-5">
            Invoice preview for <strong>{uploadForm.invoiceNo}</strong>
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog((pre) => ({ ...pre, preview: false }))}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ShetSheetUpload;