import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { customTableStyles } from "../../../Components/tablecolumn";
import {
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Card,
    CardContent,
    CardMedia,
    Tooltip,
    Button,
} from "@mui/material";
import {
    Person,
    Call,
    LocationOn,
    ArrowBack,
    Edit,
    Verified,
    Add,
    Delete,
    Sync,
    FilterAlt,
    Search,
} from "@mui/icons-material";
import Select from "react-select";
import { toast } from "react-toastify";
import ImagePreviewDialog from "../../../Components/imagePreview";
import { useLocation } from "react-router-dom";
import { fetchLink } from "../../../Components/fetchComponent";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import * as XLSX from "xlsx";

const RetailersMaster = ({ loadingOn, loadingOff }) => {
    const storage = JSON.parse(localStorage.getItem("user"));
    const [retailers, setRetailers] = useState([]);
    const [area, setArea] = useState([]);
    const [outlet, setOutlet] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [states, setStates] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [selectedRetailer, setSelectedRetailer] = useState({});

    const [reload, setReload] = useState(false);
    const [dialog, setDialog] = useState(false);
    const [multipleLocationDialogs, setMultipleLocationDialogs] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [retailersMap, setRetailersMap] = useState([]);
    const [retailersDialog, setRetailersDialog] = useState(false);
    const [retailersXlsheet, setRetailersXlsheet] = useState(false);
    // const [filters, setFilters] = useState({
    //     cust: '',
    //     custGet: 'All Retailer',
    //     area: '',
    //     areaGet: 'All Area',
    // });



    const initialFilterValues = {
        Retailer_Id: "",
        Retailer_Name: "ALL",
        ContactPerson_Name: "",
        PhoneNumber: "",
        Route_Id: "",
        Route: "ALL",
        Area_Id: "",
        Area: "ALL",
        City: "",
    };

    const [filters, setFilters] = useState(initialFilterValues);
    const center = {
        lat: 9.9252,
        lng: 78.1198,
    };

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_API,
    });

    const isFilterActive = Object.entries(filters).some(
        ([key, value]) => value && value !== "" && !["ALL"].includes(value)
    );
    useEffect(() => {
        const fetchData = async () => {
            try {
                const resoponse = await fetchLink({
                    address: `userModule/employeeActivity/maplatitude`,
                });
                setRetailersMap(resoponse.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [retailersDialog]);

    const initialRetailerInput = {
        Company_Id: storage?.Company_id,
        Retailer_Id: "",
        Retailer_Name: "",
        Contact_Person: "",
        Mobile_No: "",
        Retailer_Channel_Id: "",
        Retailer_Class: "",
        Route_Id: "",
        Area_Id: "",
        Reatailer_Address: "",
        Reatailer_City: "",
        PinCode: "",
        State_Id: "",
        Branch_Id: storage?.BranchId,
        Gstno: "",
        Created_By: storage?.UserId,
        Updated_By: storage?.UserId,
        Latitude: null,
        Longitude: null,
        fileName: null,
        fileType: null,
        fileSize: null,
        isVisitedPlace: false,
        visitLogID: null,
    };

    const [retailerInput, setRetailerInput] = useState(initialRetailerInput);

    const location = useLocation();
    const retailerFromVisitLog = location.state?.retailer;

    const [dialogFilter, setDialogFilter] = useState({
        filters: false,
        orderDetails: false,
    });

    useEffect(() => {
        if (retailerFromVisitLog) {
            const {
                Reatailer_Name,
                Contact_Person,
                Contact_Mobile,
                Location_Address,
                Latitude,
                Longitude,
                ImageName,
                ImageType,
                ImageSize,
                Id,
            } = retailerFromVisitLog;
            setRetailerInput((pre) => ({
                ...pre,
                Retailer_Name: Reatailer_Name,
                Contact_Person: Contact_Person,
                Mobile_No: Contact_Mobile,
                Reatailer_Address: Location_Address,
                Latitude: Latitude,
                Longitude: Longitude,
                fileName: ImageName,
                fileSize: ImageSize,
                fileType: ImageType,
                visitLogID: Id,
                isVisitedPlace: true,
            }));
            setDialog(true);
        }
    }, [retailerFromVisitLog]);

    const getRetailers = () => {
        const queryParams = new URLSearchParams({
            Company_Id: storage?.Company_id,
            isRetailer: 1,
            isVendor: 0,
            ...(filters.Retailer_Id && { Retailer_Id: filters.Retailer_Id }),
            ...(filters.PhoneNumber && { PhoneNumber: filters.PhoneNumber }),
            ...(filters.ContactPerson_Name && { ContactPerson_Name: filters.ContactPerson_Name }),
            ...(filters.Route_Id && { Route_Id: filters.Route_Id }),
            ...(filters.Area_Id && { Area_Id: filters.Area_Id }),
            ...(filters.City && { City: filters.City }),
        });

        fetchLink({
            address: `masters/retailers?${queryParams.toString()}`
        })
            .then((data) => {
                if (data.success) {
                    setRetailers(data.data);


                }
            })
            .catch((e) => console.error(e));
    };

    useEffect(() => {
        getRetailers();
    }, [reload, storage?.Company_id]);


    useEffect(() => {
        fetchLink({
            address: `masters/areas`,
        })
            .then((data) => {
                if (data.success) {
                    setArea(data.data);
                }
            })
            .catch((e) => console.error(e));

        fetchLink({
            address: `masters/outlets`,
        })
            .then((data) => {
                if (data.success) {
                    setOutlet(data.data);
                }
            })
            .catch((e) => console.error(e));

        fetchLink({
            address: `masters/routes`,
        })
            .then((data) => {
                if (data.success) {
                    setRoutes(data.data);
                }
            })
            .catch((e) => console.error(e));

        fetchLink({
            address: `masters/state`,
        })
            .then((data) => {
                if (data.success) {
                    setStates(data.data);
                }
            })
            .catch((e) => console.error(e));
    }, []);

    //   useEffect(() => {
    //     const tempFilteredData = retailers.filter((o) => {
    //       if (filters.Area) {
    //         return Number(o?.Area_Id) === Number(filters.Area_Id);
    //       }
    //       if (filters.Retailer_Id) {
    //         return Number(o?.Retailer_Id) === Number(filters.Retailer_Id);
    //       }

    //       return true;
    //     });

    //     setFilteredData(tempFilteredData);
    //   }, [filters.Area_Id, filters.Retailer_Id, retailers]);

    const retailerColumn = [
        {
            name: "Ledger",
            selector: (row) => row?.Retailer_Name,
            sortable: true,
        },
        {
            name: "Incharge",
            selector: (row) => row?.Contact_Person,
            sortable: true,
        },
        {
            name: "Mobile",
            selector: (row) => row.Mobile_No,
            sortable: true,
        },
        {
            name: "Area",
            selector: (row) => row.AreaGet,
            sortable: true,
        },
        {
            name: "Modified By",
            selector: (row) => row.lastModifiedBy,
            sortable: true,
        },
        {
            name: "Action",
            cell: (row) => (
                <>
                    <Tooltip title="Edit Retailer">
                        <span>
                            <IconButton
                                size="small"
                                onClick={() => {
                                    setDialog(true);
                                    setIsEdit(true);
                                    const {
                                        Company_Id,
                                        Retailer_Id,
                                        Retailer_Name,
                                        Contact_Person,
                                        Mobile_No,
                                        Retailer_Channel_Id,
                                        Retailer_Class,
                                        Route_Id,
                                        Area_Id,
                                        Reatailer_Address,
                                        Reatailer_City,
                                        PinCode,
                                        State_Id,
                                        Gstno,
                                    } = row;
                                    setRetailerInput((pre) => ({
                                        ...pre,
                                        Company_Id,
                                        Retailer_Id,
                                        Retailer_Name,
                                        Contact_Person,
                                        Mobile_No,
                                        Retailer_Channel_Id,
                                        Retailer_Class,
                                        Route_Id,
                                        Area_Id,
                                        Reatailer_Address,
                                        Reatailer_City,
                                        PinCode,
                                        State_Id,
                                        Gstno,
                                    }));
                                }}
                            >
                                <Edit />
                            </IconButton>
                        </span>
                    </Tooltip>

                    <Tooltip title="Verify Location">
                        <span>
                            <IconButton
                                size="small"
                                onClick={() => {
                                    setMultipleLocationDialogs(true);
                                    setSelectedRetailer(row);
                                }}
                                disabled={row?.AllLocations?.length === 0}
                            >
                                <Verified
                                    color={
                                        row?.AllLocations?.length === 0 ? "disabled" : "success"
                                    }
                                />
                            </IconButton>
                        </span>
                    </Tooltip>

                    {row?.VERIFIED_LOCATION?.latitude &&
                        row?.VERIFIED_LOCATION?.longitude ? (
                        <Tooltip title="Open in Google Map">
                            <span>
                                <IconButton
                                    size="small"
                                    onClick={() =>
                                        window.open(
                                            `https://www.google.com/maps/search/?api=1&query=${row?.VERIFIED_LOCATION?.latitude},${row?.VERIFIED_LOCATION?.longitude}`,
                                            "_blank"
                                        )
                                    }
                                    className="btn btn-info fa-14"
                                    color="primary"
                                >
                                    <LocationOn />
                                </IconButton>
                            </span>
                        </Tooltip>
                    ) : (
                        row?.Latitude &&
                        row.Longitude && (
                            <Tooltip title="Open in Google Map">
                                <span>
                                    <IconButton
                                        size="small"
                                        onClick={() =>
                                            window.open(
                                                `https://www.google.com/maps/search/?api=1&query=${row?.Latitude},${row?.Longitude}`,
                                                "_blank"
                                            )
                                        }
                                        className="btn btn-info fa-14"
                                        color="primary"
                                    >
                                        <LocationOn />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        )
                    )}
                </>
            ),
        },
    ];

    const RetailerDetails = ({ data }) => {
        return (
            <div className="p-3">
                <Card sx={{ display: "flex", mb: 1 }}>
                    <ImagePreviewDialog url={data?.imageUrl}>
                        <CardMedia
                            component="img"
                            sx={{ width: 350 }}
                            image={data?.imageUrl}
                            alt="retailer_picture"
                        />
                    </ImagePreviewDialog>

                    <CardContent
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            width: "100%",
                        }}
                    >
                        <h6 className="mb-2 fa-16 fw-bold text-primary">
                            {data?.Reatailer_Address}
                        </h6>
                        <p className="fw-bold fa-14 text-muted">Route: {data?.RouteGet}</p>
                        <p className="fw-bold fa-14 text-muted">
                            Class: {data?.Retailer_Class}
                        </p>
                        <p className="fw-bold fa-14 text-muted">
                            Created:{" "}
                            {data?.Created_Date
                                ? new Date(data?.Created_Date).toLocaleDateString("en-IN")
                                : "--:--:--"}
                            &nbsp; - &nbsp;
                            {data?.createdBy}
                        </p>
                        <p>
                            <Person className="fa-13 text-primary" /> {data?.Contact_Person}
                        </p>
                        <p>
                            <Call className="fa-13 text-primary" /> {data?.Mobile_No}
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    };

    const closeDialog = () => {
        setDialog(false);
        setRetailerInput(initialRetailerInput);

        setFilteredData();
        setIsEdit(false);
    };

    const closeDialogBox = () => {
        setDialogFilter({
            ...filters,
            filters: false,
            orderDetails: false,
        });

        // setDataFilters({})
    };

    const closeMultipleLocationDialog = () => {
        setMultipleLocationDialogs(false);
        setSelectedRetailer({});
    };

    function onlynum(e) {
        e.target.value = e.target.value.replace(/[^0-9]/g, "");
    }

    const setValue = (key, value) => {
        setRetailerInput({ ...retailerInput, [key]: value });
    };

    const input = [
        {
            label: "Retailer Name",
            elem: "input",
            placeholder: "",
            event: (e) => setValue("Retailer_Name", e.target.value),
            required: true,
            value: retailerInput.Retailer_Name,
        },
        {
            label: "Contact Person Name",
            elem: "input",
            placeholder: "",
            event: (e) => setValue("Contact_Person", e.target.value),
            required: true,
            value: retailerInput.Contact_Person,
        },
        {
            label: "Mobile Number",
            elem: "input",
            placeholder: "",
            oninput: (e) => onlynum(e),
            event: (e) => setValue("Mobile_No", e.target.value),
            required: true,
            value: retailerInput.Mobile_No,
            // minLength: 10,
            maxLength: 10,
        },
        {
            label: "Gstno",
            elem: "input",
            placeholder: "",
            event: (e) => setValue("Gstno", e.target.value),
            value: retailerInput.Gstno,
            maxLength: 15,
        },
        {
            label: "Outlet",
            elem: "select",
            options: [
                { value: "", label: "SELECT", disabled: true, selected: true },
                ...outlet?.map((o) => ({
                    value: o?.Out_Let_Id,
                    label: o?.Outlet_Type,
                })),
            ],
            event: (e) => setValue("Retailer_Channel_Id", e.target.value),
            required: true,
            value: retailerInput.Retailer_Channel_Id,
        },
        {
            label: "Retailer Class",
            elem: "select",
            options: [
                { value: "", label: "SELECT", disabled: true, selected: true },
                { value: "A", label: "A" },
                { value: "B", label: "B" },
                { value: "C", label: "C" },
            ],
            event: (e) => setValue("Retailer_Class", e.target.value),
            required: true,
            value: retailerInput.Retailer_Class,
        },
        {
            label: "Route",
            elem: "select",
            options: [
                { value: "", label: "SELECT", disabled: true, selected: true },
                ...routes?.map((o) => ({ value: o?.Route_Id, label: o?.Route_Name })),
            ],
            event: (e) => setValue("Route_Id", e.target.value),
            value: retailerInput.Route_Id,
            required: true,
        },
        {
            label: "Area",
            elem: "select",
            options: [
                { value: "", label: "SELECT", disabled: true, selected: true },
                ...area?.map((o) => ({ value: o?.Area_Id, label: o?.Area_Name })),
            ],
            event: (e) => setValue("Area_Id", e.target.value),
            required: true,
            value: retailerInput.Area_Id,
        },
        {
            label: "City",
            elem: "input",
            event: (e) => setValue("Reatailer_City", e.target.value),
            value: retailerInput.Reatailer_City,
        },
        {
            label: "Pincode",
            elem: "input",
            placeholder: "",
            oninput: (e) => onlynum(e),
            event: (e) => setValue("PinCode", e.target.value),
            value: retailerInput.PinCode,
            maxLength: 6,
        },
        {
            label: "State",
            elem: "select",
            options: [
                { value: "", label: "SELECT", disabled: true, selected: true },
                ...states?.map((o) => ({ value: o?.State_Id, label: o?.State_Name })),
            ],
            event: (e) => setValue("State_Id", e.target.value),
            required: true,
            value: retailerInput.State_Id,
        },
        {
            label: "Address",
            elem: "textarea",
            event: (e) => setValue("Reatailer_Address", e.target.value),
            required: true,
            value: retailerInput.Reatailer_Address,
        },
    ];

    const postAndPutRetailers = () => {
        fetchLink({
            address: `${retailerInput.isVisitedPlace === false
                ? "masters/retailers"
                : "masters/retailer/convertAsRetailer"
                }`,
            method: isEdit ? "PUT" : "POST",
            bodyData: retailerInput,
        })
            .then((data) => {
                if (data.success) {
                    toast.success(data?.message);
                    closeDialog();
                    setReload(!reload);
                } else {
                    toast.error(data?.message);
                }
            })
            .catch((e) => console.error(e));
    };

    const verifyRetailerLocation = (id) => {
        fetchLink({
            address: `masters/retailers/location`,
            method: "PUT",
            bodyData: { Id: id },
        })
            .then((data) => {
                if (data.success) {
                    toast.success(data?.message);
                } else {
                    toast.error(data?.message);
                }
            })
            .catch((e) => console.error(e));
    };

    const syncLOL = () => {
        if (loadingOn) loadingOn();
        fetchLink({
            address: `masters/retailers/lolSync`,
            method: "POST",
        })
            .then((data) => {
                if (data.success) toast.success(data.message);
                else toast.error(data.message);
            })
            .catch((e) => console.error(e))
            .finally(() => {
                if (loadingOff) loadingOff();
            });
    };

    const DownloadRetailers = () => {
        if (!retailers || retailers.length === 0) {
            alert("No data available to download.");
            return;
        }

        const worksheet = XLSX.utils.json_to_sheet(retailers);

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Retailers Data");

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "binary",
        });

        function download(s) {
            const buf = new ArrayBuffer(s.length);
            const view = new Uint8Array(buf);
            for (let i = 0; i < s.length; i++) {
                view[i] = s.charCodeAt(i) & 0xff;
            }
            return buf;
        }

        const blob = new Blob([download(excelBuffer)], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "Retailers_Data.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const retailersSync = () => {
        fetchLink({
            address: `masters/posRetailersSync`,
        })
            .then((data) => {
                if (data) {
                    toast.success(data?.message);
                }
            })
            .catch((e) => console.error(e));
    };
    return (
        <>
            <Dialog
                open={retailersXlsheet}
                onClose={() => setRetailersXlsheet(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle id="alert-dialog-title">Confirmation</DialogTitle>
                <DialogContent>
                    <b className="text-muted">
                        Do you want to Delete the user <span className="blue-text">{ }</span>
                        ?
                    </b>
                </DialogContent>
                <DialogActions>
                    <Button
                        className=" btn-light"
                        onClick={() => {
                            setDialog(false);
                        }}
                    >
                        Cancel
                    </Button>
                    {/* <Button onClick={handleDeleteConfirm}>Delete</Button> */}
                </DialogActions>
            </Dialog>

            <Card sx={{ mb: 1 }}>
                <div className="p-3 pb-0 d-flex align-items-center ">
                    <h6 className="fa-18 flex-grow-1 ">Retailers</h6>
                    <div className="d-flex gap-2">
                        <Tooltip title="Filters">
                            <IconButton
                                size="small"
                                onClick={() =>
                                    setDialogFilter({ ...dialogFilter, filters: true })
                                }
                            >
                                <FilterAlt />
                            </IconButton>
                        </Tooltip>
                        <Button
                            variant="outlined"
                            onClick={() => retailersSync()}
                            style={{ justifyContent: "space-between" }}
                        >
                            POS Retailer Sync
                        </Button>
                        <br />
                        <Button
                            variant="outlined"
                            onClick={() => setRetailersDialog(true)}
                            style={{ justifyContent: "space-between" }}
                        >
                            Retailers Map
                        </Button>
                        <br />
                        <Button variant="outlined" onClick={DownloadRetailers}>
                            DOWNLOAD
                        </Button>
                        <br />
                        <Button
                            variant="outlined"
                            startIcon={<Add />}
                            onClick={() => setDialog(true)}
                        >
                            Add Retailers
                        </Button>

                        <Tooltip title="Sync Tally LOL">
                            <IconButton onClick={syncLOL}>
                                <Sync />
                            </IconButton>
                        </Tooltip>
                    </div>
                </div>

                <CardContent>
                    {/* 
                    <div className="row mb-3">

                        <div className="col-xl-3 col-md-4 col-sm-6">
                            <label>Area</label>
                            <Select
                                value={{ value: filters?.area, label: filters?.areaGet }}
                                onChange={(e) => setFilters({ ...filters, area: e.value, areaGet: e.label })}
                                options={[
                                    { value: '', label: 'All Area' },
                                    ...area.map(obj => ({ value: obj?.Area_Id, label: obj?.Area_Name }))
                                ]}
                                styles={customSelectStyles}
                                isSearchable={true}
                                placeholder={"Area Name"}
                            />
                        </div>

                        <div className="col-xl-3 col-md-4 col-sm-6">
                            <label>Retailer</label>
                            <Select
                                value={{ value: filters?.cust, label: filters?.custGet }}
                                onChange={(e) => setFilters({ ...filters, cust: e.value, custGet: e.label })}
                                options={[
                                    { value: '', label: 'All Retailer' },
                                    ...retailers.map(obj => ({ value: obj?.Retailer_Id, label: obj?.Retailer_Name }))
                                ]}
                                styles={customSelectStyles}
                                isSearchable={true}
                                placeholder={"Retailer Name"}
                                isDisabled={filters.area}
                            />
                        </div>

                    </div> */}

                    <div className="rounded-4 overflow-hidden">
                        <DataTable
                            columns={retailerColumn}
                            data={
                                filteredData && Object.keys(filteredData).length > 0
                                    ? filteredData
                                    : retailers
                            }

                            pagination
                            highlightOnHover
                            fixedHeader
                            fixedHeaderScrollHeight={"60vh"}
                            customStyles={customTableStyles}
                            expandableRows
                            expandableRowsComponent={RetailerDetails}
                        />

                    </div>
                </CardContent>
            </Card>

            <Dialog open={dialog} onClose={closeDialog} fullScreen>
                <DialogTitle>
                    <IconButton size="small" onClick={closeDialog} className="me-2">
                        <ArrowBack />
                    </IconButton>
                    {isEdit
                        ? "Modify Retailer " + retailerInput?.Retailer_Name
                        : "Create Retailer"}
                </DialogTitle>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        postAndPutRetailers();
                    }}
                >
                    <DialogContent>
                        <div className="row">
                            {input.map((field, index) => (
                                <div
                                    key={index}
                                    className={`p-2 px-3 ${field.elem !== "textarea" ? "col-lg-4 col-md-6" : "col-12"
                                        }`}
                                >
                                    <label>
                                        {field.label}
                                        {field.required && (
                                            <p
                                                style={{
                                                    color: "red",
                                                    display: "inline",
                                                    fontWeight: "bold",
                                                    fontSize: "1em",
                                                }}
                                            >
                                                {" "}
                                                *
                                            </p>
                                        )}
                                    </label>
                                    {field.elem === "input" ? (
                                        <input
                                            type={field.type || "text"}
                                            className="cus-inpt b-0"
                                            onChange={field.event}
                                            onInput={field.oninput}
                                            required={field.required || false}
                                            disabled={field.disabled}
                                            minLength={field.minLength}
                                            value={field.value}
                                            maxLength={field.maxLength}
                                        />
                                    ) : field.elem === "select" ? (
                                        <select
                                            className={"cus-inpt b-0"}
                                            onChange={field.event}
                                            value={field.value}
                                            required={field.required || false}
                                        >
                                            {field.options.map((option, optionIndex) => (
                                                <option
                                                    key={optionIndex}
                                                    value={option.value}
                                                    disabled={option.disabled}
                                                    defaultValue={option.selected}
                                                >
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    ) : field.elem === "textarea" ? (
                                        <textarea
                                            className="cus-inpt b-0"
                                            onChange={field.event}
                                            required={field.required || false}
                                            rows={4}
                                            value={field.value}
                                        />
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button type="button" onClick={closeDialog}>
                            cancel
                        </Button>
                        <Button type="submit" variant="contained" color="success">
                            confirm
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={retailersDialog} fullScreen scroll="paper">
                <DialogTitle>
                    <IconButton
                        size="small"
                        onClick={closeDialog}
                        className="me-2"
                    ></IconButton>
                    <span>Retailers Map</span>
                </DialogTitle>
                <GoogleMap
                    mapContainerStyle={{ width: "100%", height: "100%" }}
                    center={center}
                    zoom={13}
                    onError={() => console.error("Failed to load Google Map")}
                >
                    {isLoaded && retailers.length > 0 ? (
                        retailersMap.map((retailer, index) =>
                            retailer.latitude && retailer.longitude ? (
                                <Marker
                                    key={index}
                                    position={{
                                        lat: parseFloat(retailer.latitude),
                                        lng: parseFloat(retailer.longitude),
                                    }}
                                    title={retailer.Retailer_Name || "Retailer"}
                                    icon={{
                                        url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                                        scaledSize: new window.google.maps.Size(25, 25),
                                    }}
                                />
                            ) : null
                        )
                    ) : (
                        <div
                            style={{ textAlign: "center", padding: "20px", color: "gray" }}
                        >
                            No retailers available to display on the map.
                        </div>
                    )}
                </GoogleMap>
            </Dialog>

            <Dialog
                open={multipleLocationDialogs}
                onClose={closeMultipleLocationDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Verify Location For{" "}
                    <span className="text-primary">
                        {selectedRetailer?.Retailer_Name}
                    </span>
                </DialogTitle>

                <DialogContent className="pb-0">
                    <div className="table-responsive mb-0">
                        <table className="table mb-0">
                            <thead>
                                <tr>
                                    <th className="text-center fa-14 border-0">Active</th>
                                    <th className="text-center fa-14 border-0">Created By</th>
                                    <th className="text-center fa-14 border-0">Date</th>
                                    <th className="text-center fa-14 border-0">Latitude</th>
                                    <th className="text-center fa-14 border-0">Longitude</th>
                                    <th className="text-center fa-14 border-0">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedRetailer?.AllLocations?.map((o, i) => (
                                    <tr key={i}>
                                        <td className="text-center fa-13 p-3 border-0">
                                            <input
                                                type="radio"
                                                name="location_list"
                                                defaultChecked={Number(o?.isActiveLocation) === 1}
                                                style={{ width: "20px", height: "20px" }}
                                                onChange={(e) => verifyRetailerLocation(o?.Id)}
                                            />
                                        </td>
                                        <td className="text-center fa-14 fw-bold p-3 border-0">
                                            {o?.EntryByGet}
                                        </td>
                                        <td className="text-center fa-13 p-3 border-0">
                                            {o?.EntryAt
                                                ? new Date(o?.EntryAt).toLocaleDateString("en-IN", {
                                                    day: "2-digit",
                                                    month: "2-digit",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })
                                                : " -"}
                                        </td>
                                        <td className="text-center fa-13 p-3 border-0">
                                            {o?.latitude}
                                        </td>
                                        <td className="text-center fa-13 p-3 border-0">
                                            {o?.longitude}
                                        </td>
                                        <td className="text-center fa-13 p-3 border-0">
                                            <IconButton className="me-2" size="small">
                                                <Delete className="fa-20" color="error" />
                                            </IconButton>

                                            {o?.latitude && o.longitude && (
                                                <Tooltip title="Open in Google Map">
                                                    <span>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() =>
                                                                window.open(
                                                                    `https://www.google.com/maps/search/?api=1&query=${o?.latitude},${o?.longitude}`,
                                                                    "_blank"
                                                                )
                                                            }
                                                            className="btn btn-info fa-14"
                                                            color="primary"
                                                        >
                                                            <LocationOn />
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </DialogContent>

                <DialogActions>
                    <Button variant="outlined" onClick={closeMultipleLocationDialog}>
                        cancel
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={dialogFilter.filters}
                onClose={closeDialogBox}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Filters</DialogTitle>
                <DialogContent>
                    <div className="table-responsive pb-5">
                        <table className="table">
                            <tbody>
                                <tr>
                                    {/* <td style={{ verticalAlign: "middle" }}>Retailers</td>
                  <td>
                    <Select
                      value={{
                        value: filters?.Retailer_Id,
                        label: filters?.Retailer_Name,
                      }}
                      // value={filters?.Products}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          Retailer_Id: e.value,
                          Retailer_Name: e.label,
                        })
                      }
                      options={[
                        { value: "", label: "ALL" },
                        ...retailersData.map((obj) => ({
                          value: obj?.Retailer_Id,
                          label: obj?.Retailer_Name,
                        })),
                      ]}
                      placeholder={"Retailers Name"}
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                      }}
                      isSearchable={true}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      menuPlacement="auto"
                    />
                  </td> */}

                                    <td style={{ verticalAlign: "middle" }}>Retailers</td>
                                    <td>
                                        <Select
                                            value={{ value: filters?.Retailer_Id, label: filters?.Retailer_Name }}
                                            // value={filters?.Products}
                                            onChange={(e) =>
                                                setFilters({
                                                    ...filters,
                                                    Retailer_Id: e.value,
                                                    Retailer_Name: e.label,
                                                })
                                            }
                                            options={[
                                                { value: "", label: "ALL" },
                                                ...retailers.map((obj) => ({
                                                    value: obj?.Retailer_Id,
                                                    label: obj?.Retailer_Name,
                                                })),
                                            ]}
                                            placeholder={"Retailer_Name"}
                                            styles={{
                                                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                            }}
                                            isSearchable={true}
                                            menuPortalTarget={document.body}
                                            menuPosition="fixed"
                                            menuPlacement="auto"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ verticalAlign: "middle" }}>Mobile Number</td>
                                    <td>
                                        <input
                                            type="text"
                                            className="cus-inpt"
                                            onChange={(e) =>
                                                setFilters({ ...filters, PhoneNumber: e.target.value })
                                            }
                                            value={filters?.PhoneNumber}
                                            placeholder="PhoneNumber"
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: "middle" }}>Contact Person</td>
                                    <td>
                                        <input
                                            type="text"
                                            className="cus-inpt"
                                            onChange={(e) =>
                                                setFilters({
                                                    ...filters,
                                                    ContactPerson_Name: e.target.value,
                                                })
                                            }
                                            value={filters?.ContactPerson_Name}
                                            placeholder="Contact Person"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ verticalAlign: "middle" }}>Route</td>
                                    <td>
                                        <Select
                                            value={{
                                                value: filters?.Route_Id,
                                                label: filters?.Route,
                                            }}
                                            // value={filters?.Products}
                                            onChange={(e) =>
                                                setFilters({
                                                    ...filters,
                                                    Route_Id: e.value,
                                                    Route: e.label,
                                                })
                                            }
                                            options={[
                                                { value: "", label: "ALL" },
                                                ...routes.map((obj) => ({
                                                    value: obj?.Route_Id,
                                                    label: obj?.Route_Name,
                                                })),
                                            ]}
                                            placeholder={"Route Name"}
                                            styles={{
                                                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                            }}
                                            isSearchable={true}
                                            menuPortalTarget={document.body}
                                            menuPosition="fixed"
                                            menuPlacement="auto"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ verticalAlign: "middle" }}>Area</td>
                                    <td>
                                        <Select
                                            value={{ value: filters?.Area_Id, label: filters?.Area }}
                                            // value={filters?.Products}
                                            onChange={(e) =>
                                                setFilters({
                                                    ...filters,
                                                    Area_Id: e.value,
                                                    Area: e.label,
                                                })
                                            }
                                            options={[
                                                { value: "", label: "ALL" },
                                                ...area.map((obj) => ({
                                                    value: obj?.Area_Id,
                                                    label: obj?.Area_Name,
                                                })),
                                            ]}
                                            placeholder={"Area Name"}
                                            styles={{
                                                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                            }}
                                            isSearchable={true}
                                            menuPortalTarget={document.body}
                                            menuPosition="fixed"
                                            menuPlacement="auto"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ verticalAlign: "middle" }}>City</td>
                                    <td>
                                        <input
                                            type="text"
                                            className="cus-inpt"
                                            onChange={(e) =>
                                                setFilters({ ...filters, City: e.target.value })
                                            }
                                            value={filters?.City}
                                            placeholder="City"
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </DialogContent>
                <DialogActions>
                    {!isFilterActive && <Button onClick={closeDialogBox}>Close</Button>}
                    <Button
                        onClick={() => {
                            closeDialogBox();

                            getRetailers();
                        }}
                        startIcon={<Search />}
                        variant="outlined"
                    >
                        Search
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default RetailersMaster;
