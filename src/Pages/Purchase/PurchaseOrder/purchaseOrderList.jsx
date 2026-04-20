import { useEffect, useMemo, useState } from "react";
import FilterableTable from "../../../Components/filterableTable2";
import { fetchLink } from "../../../Components/fetchComponent";
import { checkIsNumber, isEqualNumber, ISOString, isValidDate, reactSelectFilterLogic, toArray, getSessionFiltersByPageId, setSessionFilters, stringCompare } from "../../../Components/functions";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { useNavigate, useLocation } from 'react-router-dom';
import { FilterAlt, Search } from '@mui/icons-material';
import DownloadIcon from "@mui/icons-material/Download";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { purchaseOrderDataSet, displayColumns } from "./filters";
import { toast } from 'react-toastify';
import PurchaseOrderPreviewTemplate from "../../DataEntry/purchaseOrderPreviewTemplate";
import Select from 'react-select';
import { customSelectStyles } from "../../../Components/tablecolumn";
import ParameterAssignDialog from "./parameterAssignDialog";
import AlterHistoryTable from "../../../Components/alterHistoryTable";

const defaultFilters = {
    Fromdate: ISOString(),
    Todate: ISOString(),
    OrderStatus: "ITEMS PENDING",
    vendorId: '',
    vendor: '',
};

const PurchaseOrderDataEntry = ({ loadingOn, loadingOff, AddRights, EditRights, DeleteRights, pageID }) => {
    const sessionValue = sessionStorage.getItem('filterValues');
    const [purchaseOrderData, setPurchaseOrderData] = useState([]);
    const [orderPreview, setOrderPreview] = useState({
        OrderDetails: {},
        OrderItemsArray: [],
        DeliveryArray: [],
        TranspoterArray: [],
        StaffArray: [],
        display: false,
    });
    const [vendorList, setVendorList] = useState([]);
    const [products, setProducts] = useState([]);
    const [moduleParameters, setModuleParameters] = useState([]);

    const navigate = useNavigate();
    const location = useLocation();

    const [filters, setFilters] = useState({
        ...defaultFilters,
        FilterDialog: false,
        deleteOrderDialog: false,
        deleteOrderId: '',
        refresh: false,
        view: 'PURCHASE ORDERS',
        parameterDialogOpen: false,
        parameterDialogItem: null
    });

    useEffect(() => {
        fetchLink({
            address: `masters/retailers/dropDown`
        }).then(data => {
            if (data.success) {
                const retailerData = toArray(data?.data).sort(
                    (a, b) => String(a?.Retailer_Name).localeCompare(b?.Retailer_Name)
                );
                setVendorList(retailerData);
            }
        }).catch(e => console.error(e));

        fetchLink({
            address: `masters/products`
        }).then(data => {
            if (data.success) {
                setProducts(data.data);
            } else {
                setProducts([]);
            }
        }).catch(e => console.error(e));

        fetchLink({
            address: `masters/moduleParameters?moduleName=PURCHASE_ORDER`
        }).then(data => {
            if (data.success) {
                setModuleParameters(data.data);
            }
        }).catch(e => console.error(e));
    }, []);

    useEffect(() => {
        const { Fromdate = defaultFilters.Fromdate, Todate = defaultFilters.Todate } = getSessionFiltersByPageId(pageID);
        if (loadingOn) loadingOn();
        fetchLink({
            address: `dataEntry/purchaseOrderEntry?Fromdate=${Fromdate}&Todate=${Todate}`,
        }).then(data => {
            if (data.success) {
                setPurchaseOrderData(data.data);
            }
        }).catch(e => console.error(e)).finally(() => {
            if (loadingOff) loadingOff();
        });
    }, [filters.refresh, location, sessionValue]);

    useEffect(() => {
        const sessionFilters = getSessionFiltersByPageId(pageID);
        const {
            Fromdate = defaultFilters.Fromdate,
            Todate = defaultFilters.Todate,
            OrderStatus = defaultFilters.OrderStatus,
            vendorId = defaultFilters.vendorId,
            vendor = defaultFilters.vendor,
        } = sessionFilters;
        setFilters(prev => ({ ...prev, Fromdate, Todate, OrderStatus, vendorId, vendor }));
    }, [sessionValue, pageID, location]);

    const handleFilterChange = (valObj) => {
        setFilters(prev => ({ ...prev, ...valObj }));
    };

    const deleteOrder = (OrderId) => {
        if (!checkIsNumber(OrderId)) return;

        fetchLink({
            address: 'dataEntry/purchaseOrderEntry',
            method: 'DELETE',
            bodyData: { OrderId }
        }).then(data => {
            if (data.success) {
                setFilters(prev => ({ ...prev, deleteOrderDialog: false, deleteOrderId: '', refresh: !prev.refresh }));
                toast.success(data.message);
            } else {
                setFilters(prev => ({ ...prev, deleteOrderDialog: false, deleteOrderId: '' }));
                toast.error(data.message);
            }
        }).catch(e => console.error(e));
    };

    const onCloseDialog = () => {
        setOrderPreview({
            OrderDetails: {},
            OrderItemsArray: [],
            DeliveryArray: [],
            TranspoterArray: [],
            display: false,
        });
    };

    const navigateToPageWithState = ({ page = '', stateToTransfer = {} }) => {
        navigate(page, { state: stateToTransfer });
    };

    const dataToPass = useMemo(() => {
        return checkIsNumber(filters.vendorId)
            ? purchaseOrderData.filter(obj => isEqualNumber(obj.PartyId, filters.vendorId))
            : purchaseOrderData
    }, [purchaseOrderData, filters.vendorId]);

    const getStaff = (staffs, category) =>
        (staffs || [])
            .filter(s => s.Cost_Category === category)
            .map(s => s.Emp_Name)
            .join(", ");

    const downloadExcel = async (rows) => {
        if (!rows || rows.length === 0) {
            toast.warn("No data to export");
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Purchase Order Export");

        const header = [
            "Entry Date",
            "Party Name",
            "ItemName",
            "weight",
            "arrived_quantity",
            "pending_quantity",
            "Rate",
            "Discount",
            "loading_date",
            "Lorry Frieght",
            "owners",
            "brokers"
        ];

        worksheet.addRow(header);

        worksheet.getRow(1).eachCell(cell => {
            cell.font = { bold: true };
            cell.alignment = { horizontal: "center", vertical: "middle" };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                right: { style: "thin" },
                bottom: { style: "thin" }
            };
        });

        const formatDate = (dateString) => {
            if(!dateString) return '';
            const d = new Date(dateString);
            if(isNaN(d)) return '';
            return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        };

        rows.forEach((po) => {
            const partyName = po.PartyName || "";
            const entryDate = formatDate(po.TradeConfirmDate);
            const loadingDate = formatDate(po.LoadingDate);
            const owners = getStaff(po.StaffDetails, "Owners");
            const brokers = getStaff(po.StaffDetails, "Broker");

            const items = po.ItemDetails || [];
            
            items.forEach((item) => {
                const itemName = item.ItemName || item.Stock_Item || "";
                const weight = Number(item.Weight) || 0;
                const rate = item.Rate || "";
                const discount = item?.OrderDetails?.Discount || "";
                const freight = item.freightCharges || "";

                const deliveries = (po.DeliveryDetails || []).filter(d => d.ItemId === item.ItemId);
                
                let arrivedQuantity = 0;
                deliveries.forEach(d => {
                    arrivedQuantity += Number(d.Weight || 0);
                });

                const pendingQuantity = weight - arrivedQuantity;

                const row = worksheet.addRow([
                    entryDate,
                    partyName,
                    itemName,
                    weight,
                    arrivedQuantity,
                    pendingQuantity,
                    rate,
                    discount,
                    loadingDate,
                    freight,
                    owners,
                    brokers
                ]);

                row.eachCell((cell, colNumber) => {
                    cell.border = {
                        top: { style: "thin" },
                        left: { style: "thin" },
                        right: { style: "thin" },
                        bottom: { style: "thin" }
                    };
                    cell.alignment = {
                        vertical: "middle",
                        horizontal: [1, 2, 10, 11].includes(colNumber) ? "left" : "center"
                    };
                });
            });
        });

        worksheet.columns = [
            { width: 30 },
            { width: 30 },
            { width: 30 },
            { width: 12 },
            { width: 15 },
            { width: 15 },
            { width: 10 },
            { width: 10 },
            { width: 15 },
            { width: 15 },
            { width: 20 },
            { width: 20 }
        ];

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), "Purchase_Order_Export.xlsx");
    };

    return (
        <>
            <FilterableTable
                dataArray={purchaseOrderDataSet({
                    data: dataToPass,
                    status: filters.OrderStatus
                })}
                columns={displayColumns({
                    OrderStatus: filters.OrderStatus,
                    dialogs: setFilters,
                    setOrderPreview,
                    navigation: navigateToPageWithState,
                    products: products,
                    EditRights,
                    DeleteRights,
                    AddRights
                })}
                tableMaxHeight={650}
                EnableSerialNumber
                title={'Purchase Order - ' + filters.OrderStatus}
                maxHeightOption
                ExcelPrintOption
                PDFPrintOption
                ButtonArea={
                    <>
                        {AddRights && (
                            <Button
                                variant="outlined"
                                onClick={() => navigate('create')}
                            >Add</Button>
                        )}
                        <IconButton
                            size="small"
                            className="me-2"
                            onClick={() => setFilters(prev => ({ ...prev, FilterDialog: true }))}
                        ><FilterAlt /></IconButton>
                        <IconButton
                            size="small"
                            color="success"
                            onClick={() => {
                                const tableData = purchaseOrderDataSet({
                                    data: dataToPass,
                                    status: filters.OrderStatus
                                });

                                let formattedData = tableData;
                                if (['ITEMS', 'ITEMS PENDING', 'ITEMS ARRIVED'].includes(filters.OrderStatus)) {
                                    const poMap = new Map();
                                    tableData.forEach(itemRow => {
                                        const poId = itemRow.OrderDetails.Id;
                                        if (!poMap.has(poId)) {
                                            const po = { ...itemRow.OrderDetails, ItemDetails: [] };
                                            poMap.set(poId, po);
                                        }
                                        poMap.get(poId).ItemDetails.push(itemRow);
                                    });
                                    formattedData = Array.from(poMap.values());
                                }

                                const notCanceledOnly = formattedData.filter(fil => !stringCompare(fil.OrderStatus, 'Canceled'));
                                downloadExcel(notCanceledOnly);
                            }}
                            title="Download Excel"
                        >
                            <DownloadIcon />
                        </IconButton>
                    </>
                }
                isExpendable={true}
                expandableComp={({ row }) => <AlterHistoryTable alterationHistory={row.alterHistoryDetails} />}
            />

            <ParameterAssignDialog
                open={filters.parameterDialogOpen}
                onClose={() => setFilters(prev => ({ ...prev, parameterDialogOpen: false, parameterDialogItem: null }))}
                itemData={filters.parameterDialogItem}
                moduleParameters={moduleParameters}
                onSave={() => setFilters(prev => ({ ...prev, refresh: !prev.refresh }))}
            />

            {orderPreview.display && (
                <PurchaseOrderPreviewTemplate
                    OrderDetails={orderPreview.OrderDetails}
                    OrderItemsArray={orderPreview.OrderItemsArray}
                    DeliveryArray={orderPreview.DeliveryArray}
                    TranspoterArray={orderPreview.TranspoterArray}
                    StaffArray={orderPreview.StaffArray}
                    display={orderPreview.display}
                    onCloseDialog={onCloseDialog}
                />
            )}

            <Dialog
                open={filters.FilterDialog}
                onClose={() => setFilters(prev => ({ ...prev, FilterDialog: false }))}
                maxWidth='sm'
                fullWidth
            >
                <DialogTitle>Filters</DialogTitle>
                <DialogContent>
                    <table className="table m-0 border-0">
                        <tbody>
                            <tr>
                                <td className="border-0 vctr">Vendor</td>
                                <td className="border-0 vctr">
                                    <Select
                                        value={{ value: filters.vendorId, label: filters.vendor }}
                                        onChange={e => handleFilterChange({
                                            vendorId: e.value,
                                            vendor: e.label
                                        })}
                                        options={[
                                            { value: '', label: 'Search', isDisabled: true },
                                            ...vendorList.map(obj => ({
                                                value: obj?.Retailer_Id,
                                                label: obj?.Retailer_Name
                                            }))
                                        ]}
                                        styles={customSelectStyles}
                                        isSearchable={true}
                                        placeholder={"Select Vendor"}
                                        maxMenuHeight={300}
                                        filterOption={reactSelectFilterLogic}
                                        menuPortalTarget={document.body}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border-0 vctr">Fromdate</td>
                                <td className="border-0 vctr">
                                    <input
                                        type="date"
                                        onChange={e => handleFilterChange({ Fromdate: e.target.value })}
                                        value={filters.Fromdate}
                                        className="cus-inpt p-2"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border-0 vctr">Todate</td>
                                <td className="border-0 vctr">
                                    <input
                                        type="date"
                                        onChange={e => handleFilterChange({ Todate: e.target.value })}
                                        value={filters.Todate}
                                        className="cus-inpt p-2"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border-0 vctr">Order Status</td>
                                <td className="border-0 vctr">
                                    <select
                                        className="cus-inpt p-2"
                                        value={filters.OrderStatus}
                                        onChange={e => handleFilterChange({ OrderStatus: e.target.value })}
                                    >
                                        <optgroup label="ITEM BASED">
                                            <option value={'ITEMS'}>ITEMS</option>
                                            <option value={'ITEMS PENDING'}>ITEMS - PENDING</option>
                                            <option value={'ITEMS ARRIVED'}>ITEMS - ARRIVED</option>
                                        </optgroup>
                                        <optgroup label="ORDER BASED">
                                            <option value={'ORDERS'}>ORDERS</option>
                                            <option value={'COMPLETED ORDERS'}>COMPLETED ORDERS</option>
                                            <option value={'IN-COMPLETED ORDERS'}>IN-COMPLETED ORDERS</option>
                                        </optgroup>
                                    </select>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setFilters(prev => ({ ...prev, FilterDialog: false }))}
                        variant="outlined"
                    >Close</Button>
                    <Button
                        onClick={() => {
                            setFilters(prev => ({ ...prev, FilterDialog: false, refresh: !prev.refresh }));
                            setSessionFilters({
                                pageID,
                                Fromdate: filters.Fromdate,
                                Todate: filters.Todate,
                                OrderStatus: filters.OrderStatus,
                                vendorId: filters.vendorId,
                                vendor: filters.vendor,
                            });
                        }}
                        variant="outlined"
                        startIcon={<Search />}
                    >Search</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={filters.deleteOrderDialog}
                onClose={() => setFilters(prev => ({ ...prev, deleteOrderDialog: false, deleteOrderId: '' }))}
                maxWidth='sm'
            >
                <DialogTitle>Confirmation</DialogTitle>
                <DialogContent>
                    <h6>Do you want to delete the order permanently?</h6>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setFilters(prev => ({ ...prev, deleteOrderDialog: false, deleteOrderId: '' }))}
                    >Cancel</Button>
                    <Button color='error' variant='outlined' onClick={() => deleteOrder(filters.deleteOrderId)}>Delete</Button>
                </DialogActions>
            </Dialog>

        </>
    );
};

export default PurchaseOrderDataEntry;