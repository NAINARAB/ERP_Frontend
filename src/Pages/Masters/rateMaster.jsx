import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { fetchLink } from "../../Components/fetchComponent";
import {
    IconButton, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Tooltip, Switch, FormControlLabel,
    Popover, Box, Typography, Accordion, AccordionSummary, AccordionDetails, Grid, Paper
} from "@mui/material";
import { Search, Edit, Delete, Sync, ExpandMore, History } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "react-bootstrap";
import { ISOString, isValidDate } from "../../Components/functions";
import moment from "moment/moment";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {memo} from 'react'


const useQuery = () => new URLSearchParams(useLocation().search);
const defaultFilters = {
    Fromdate: ISOString(),
    NewDate: "",
    NewTime: moment().format("HH:mm")
};

const formatDateToYMD = date => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

function RateMaster({ loadingOn, loadingOff }) {
    const [filters, setFilters] = useState({
        Fromdate: defaultFilters.Fromdate,
        fetchFrom: defaultFilters.Fromdate,
        NewDate: defaultFilters.NewDate,
        NewTime: defaultFilters.NewTime,
        fetchNew: defaultFilters.NewDate,
    });
    const [addDialog, setAddDialog] = useState(false);
    const [inputValue, setInputValue] = useState({
        Id: "",
        Rate_Date: new Date().toISOString().split("T")[0],
        Pos_Brand_Id: "",
        Item_Id: "",
        Rate: "",
        Is_Active_Decative: "",
        POS_Brand_Name: "",
        Product_Name: "",
        MaxRate: "",
        Brand_Level: "",
        Item_Level: ""
    });
    const [open, setOpen] = useState(false);
    const [posBrand, setPosBrand] = useState([]);
    const [product, setProduct] = useState([]);
    const [posData, setPosData] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const query = useQuery();
    const [selectedPosBrand, setSelectedPosBrand] = useState("");
    const [bulkData, setBulkData] = useState([]);
    const [reload, setReload] = useState(false);
    const [exportDialog, setExportDialog] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showActiveOnly, setShowActiveOnly] = useState(true);
    

    const editedRatesRef = useRef({});
    const editedMaxRatesRef = useRef({});
    const [, forceUpdate] = useState({});
    
    const [rateGenInfo, setRateGenInfo] = useState(null);
    const [selectedTime, setSelectedTime] = useState(moment().format("HH:mm:ss"));
    const [isUpdating, setIsUpdating] = useState(false);

    
    const [orderPopoverAnchor, setOrderPopoverAnchor] = useState(null);
    const [orderData, setOrderData] = useState({});
    const [brandLevels, setBrandLevels] = useState({});
    const [brandProducts, setBrandProducts] = useState({});
    const [expandedBrands, setExpandedBrands] = useState([]);
    const [loadingBrandProducts, setLoadingBrandProducts] = useState(false);

    useEffect(() => {
        const queryFilters = {
            Fromdate:
                query.get("Fromdate") && isValidDate(query.get("Fromdate"))
                    ? query.get("Fromdate")
                    : defaultFilters.Fromdate,
            NewDate:
                query.get("NewDate") && isValidDate(query.get("NewDate"))
                    ? query.get("NewDate")
                    : defaultFilters.NewDate,
        };
        setFilters(prev => ({
            ...prev,
            fetchFrom: queryFilters.Fromdate,
            fetchNew: queryFilters.NewDate,
        }));
    }, [location.search]);

    useEffect(() => {
        // Fetch rate master data
        fetchLink({
            address: `masters/posRateMaster?FromDate=${filters?.Fromdate}`,
        })
            .then(response => {
                if (response && response.success) {
                    setBulkData(response);
                    let records = [];
                    if (Array.isArray(response.data)) {
                        records = response.data;
                    } else if (response.data && Array.isArray(response.data.data)) {
                        records = response.data.data;
                    } else if (response.data && typeof response.data === 'object') {
                        const arrayProp = Object.values(response.data).find(val => Array.isArray(val));
                        records = arrayProp || [];
                    }
                    setPosData(records);
                    // Reset edited values when data changes
                    editedRatesRef.current = {};
                    editedMaxRatesRef.current = {};
                    forceUpdate({});
                } else {
                    setPosData([]);
                }
            })
            .catch(e => {
                console.error("Error fetching rate master:", e);
                setPosData([]);
            });

      
        if (filters?.Fromdate) {
            fetchRateGenInfo(filters.Fromdate);
        }

        fetchLink({ address: `masters/posbranch/dropdown` })
            .then(data => {
                if (data.success) setPosBrand(data.data);
            })
            .catch(e => console.error(e));
    }, [filters.Fromdate, reload]);

    const fetchRateGenInfo = async (date) => {
        try {
            const response = await fetchLink({
                address: `masters/rateGen?Rate_Date=${date}`,
                method: "GET",
            });
            if (response && response.success && response.data) {
                setRateGenInfo(response.data);
                if (response.data.Rate_time) {
                    setSelectedTime(response.data.Rate_time);
                }
            } else {
                setRateGenInfo(null);
            }
        } catch (error) {
            console.error("Error fetching rate gen info:", error);
            setRateGenInfo(null);
        }
    };


    const handleRateChange = useCallback((rowId, value) => {
        editedRatesRef.current[rowId] = value;
    }, []);

    const handleMaxRateChange = useCallback((rowId, value) => {
        editedMaxRatesRef.current[rowId] = value;
    }, []);

const handleUpdateTimeAndRates = async () => {
    const hasChanges = Object.keys(editedRatesRef.current).length > 0 || Object.keys(editedMaxRatesRef.current).length > 0;
    
    if (!hasChanges) {
        toast.warning("No changes to update. Please edit some rates first.");
        return;
    }

    setIsUpdating(true);
    if (loadingOn) loadingOn();

    try {
        const updates = [];
        const allRowIds = new Set([...Object.keys(editedRatesRef.current), ...Object.keys(editedMaxRatesRef.current)]);
        
        for (const rowId of allRowIds) {
            const originalRow = posData.find(r => r.Id.toString() === rowId);
            if (originalRow) {
                const newRate = editedRatesRef.current[rowId] !== undefined ? parseFloat(editedRatesRef.current[rowId]) : originalRow.Rate;
                const newMaxRate = editedMaxRatesRef.current[rowId] !== undefined ? parseFloat(editedMaxRatesRef.current[rowId]) : originalRow.Max_Rate;
                
              
                if (newRate !== originalRow.Rate || newMaxRate !== originalRow.Max_Rate) {
                    updates.push({
                        Id: originalRow.Id,
                        Item_Id: originalRow.Item_Id,
                        Rate: newRate,
                        Max_Rate: newMaxRate,
                        Old_Rate: originalRow.Rate,
                        Old_Max_Rate: originalRow.Max_Rate,
                        Rate_Date: filters.Fromdate,
                        Rate_time: selectedTime,
                        Updated_By: localStorage.getItem("username")
                    });
                }
            }
        }
        
       
        if (updates.length === 0) {
            toast.warning("No changes detected. The values are the same as before.");
            setIsUpdating(false);
            if (loadingOff) loadingOff();
            return;
        }

        const response = await fetchLink({
            address: `masters/posRateMaster/bulkUpdate`,
            method: "PUT",
            bodyData: {
                updates: updates,
                Rate_Date: filters.Fromdate,
                Rate_time: selectedTime
            }
        });

        if (response && response.success) {
            toast.success(`Successfully updated ${updates.length} rate(s) and time`);
            editedRatesRef.current = {};
            editedMaxRatesRef.current = {};
            setReload(!reload);
            fetchRateGenInfo(filters.Fromdate);
        } else {
            toast.error(response?.message || "Failed to update rates");
        }
    } catch (error) {
        console.error("Error updating rates:", error);
        toast.error("Failed to update rates");
    } finally {
        setIsUpdating(false);
        if (loadingOff) loadingOff();
    }
};

    // const updateTimeOnly = async () => {
    //     setIsUpdating(true);
    //     try {
    //         const response = await fetchLink({
    //             address: `masters/rateGen/updateTime`,
    //             method: "PUT",
    //             bodyData: {
    //                 Rate_Date: filters.Fromdate,
    //                 Rate_time: selectedTime
    //             }
    //         });
    //         if (response && response.success) {
    //             toast.success("Rate generation time updated successfully");
    //             fetchRateGenInfo(filters.Fromdate);
    //         } else {
    //             toast.error(response?.message);
    //         }
    //     } catch (error) {
    //         console.error("Error updating time:", error);
    //         toast.error("Failed to update time");
    //     } finally {
    //         setIsUpdating(false);
    //     }
    // };

    const fetchProducts = async posBrandId => {
        fetchLink({
            address: `masters/posbrand/productList?Pos_Brand_Id=${posBrandId}`,
        })
            .then(data => {
                if (data.success) setProduct(data.data);
            })
            .catch(e => console.error(e));
    };

    useEffect(() => {
        if (selectedPosBrand) fetchProducts(selectedPosBrand);
    }, [selectedPosBrand]);

    const handleRateMasterAdd = () => {
        fetchLink({
            address: `masters/posRateMaster`,
            method: "POST",
            bodyData: {
                ...inputValue,
                Pos_Brand_Id: selectedPosBrand,
                Item_Id: inputValue.Item_Id,
                Rate_Date: formatDateToYMD(inputValue.Rate_Date),
                Rate_time: selectedTime
            },
        })
            .then(data => {
                if (data.success) {
                    setAddDialog(false);
                    toast.success(data.message);
                    setInputValue({
                        Id: "",
                        Rate_Date: new Date().toISOString().split("T")[0],
                        Pos_Brand_Id: "", Item_Id: "", Rate: "",
                        Is_Active_Decative: "-", POS_Brand_Name: "",
                        Product_Name: "", MaxRate: "", Brand_Level: "", Item_Level: ""
                    });
                    setSelectedPosBrand("");
                    setReload(!reload);
                } else {
                    toast.error(data.message);
                }
            })
            .catch(e => console.error(e));
    };

    const handleUpdate = () => {
        fetchLink({
            address: `masters/posRateMaster`,
            method: "PUT",
            bodyData: { ...inputValue, Rate_Date: formatDateToYMD(inputValue.Rate_Date) },
        })
            .then(data => {
                if (data.success) {
                    toast.success("Rate Master updated successfully!");
                    setAddDialog(false);
                    setReload(!reload);
                    setInputValue({
                        Id: "",
                        Rate_Date: new Date().toISOString().split("T")[0],
                        Pos_Brand_Id: "", Item_Id: "", Rate: "",
                        Is_Active_Decative: "", POS_Brand_Name: "",
                        Product_Name: "", MaxRate: "", Brand_Level: "", Item_Level: ""
                    });
                    setSelectedPosBrand("");
                } else {
                    toast.error("Failed to update Rate Master:", data.message);
                }
            })
            .catch(e => { throw e; });
    };

    const updateQueryString = newFilters => {
        const params = new URLSearchParams(newFilters);
        navigate(`?${params.toString()}`, { replace: true });
    };

    const editRow = data => {
        setAddDialog(true);
        setInputValue({
            Id: data?.Id,
            Rate_Date: formatDateToYMD(data.Rate_Date),
            Pos_Brand_Id: data.Pos_Brand_Id,
            Item_Id: data.Item_Id,
            Rate: data.Rate,
            MaxRate: data.Max_Rate,
            Is_Active_Decative: data.Is_Active_Decative,
            POS_Brand_Name: data.POS_Brand_Name,
            Product_Name: data.Product_Name,
            Brand_Level: data.Brand_Level || "",
            Item_Level: data.Item_Level || ""
        });
        setSelectedPosBrand(data.Pos_Brand_Id);
    };

    const handleDelete = () => {
        fetchLink({
            address: `masters/posRateMaster`,
            method: "DELETE",
            bodyData: { Id: inputValue.Id },
        })
            .then(data => {
                if (data.success) {
                    setReload(!reload);
                    setOpen(false);
                    setAddDialog(false);
                    setInputValue({
                        Id: "",
                        Rate_Date: new Date().toISOString().split("T")[0],
                        Pos_Brand_Id: "", Item_Id: "", Rate: "",
                        Is_Active_Decative: "", POS_Brand_Name: "",
                        Product_Name: "", MaxRate: "", Brand_Level: "", Item_Level: ""
                    });
                    setSelectedPosBrand("");
                    toast.success("Rate Master deleted successfully!");
                } else {
                    toast.error("Failed to delete area:", data.message);
                }
            })
            .catch(e => console.error(e));
    };

    const handleExportData = async () => {
        if (loadingOn) loadingOn();
        if (!filters?.Fromdate || !filters?.NewDate) {
            toast.error("Both 'From Date' and 'New Date' are required.");
            if (loadingOff) loadingOff();
            return;
        }
        
        if (!filters?.NewTime) {
            toast.error("Time is required.");
            if (loadingOff) loadingOff();
            return;
        }
        
        const dateTime = `${filters.NewDate} ${filters.NewTime}:00`;
        
        const exportPayload = {
            bulkData,
            brandLevels: brandLevels,
            productLevels: orderData,
            newDateTime: dateTime
        };
        
        fetchLink({
            address: `masters/exportRateMaster?FromDate=${filters?.Fromdate}&NewDate=${filters.NewDate}&NewTime=${filters.NewTime}`,
            method: "POST",
            bodyData: exportPayload,
        })
            .then(data => {
                if (data.success) {
                    toast.success(data.message);
                    setExportDialog(false);
                    setFilters({ ...filters, NewDate: "", NewTime: moment().format("HH:mm") });
                } else {
                    toast.error(data.message);
                }
            })
            .catch(e => console.error(e))
            .finally(() => { if (loadingOff) loadingOff(); });
    };

    const handleDownload = async () => {
        const dataToDownload = Array.isArray(posData) 
            ? (showActiveOnly 
                ? posData.filter(item => item.Is_Active_Decative === 1)
                : posData.filter(item => item.Is_Active_Decative === 0))
            : [];
            
        if (dataToDownload.length === 0) {
            toast.error(showActiveOnly 
                ? "No active data available for download."
                : "No inactive data available for download.");
            return;
        }
        
        const sortedData = [...dataToDownload].sort((a, b) => {
            const brandLevelA = a.Brand_Level ? parseInt(a.Brand_Level) : Number.MAX_SAFE_INTEGER;
            const brandLevelB = b.Brand_Level ? parseInt(b.Brand_Level) : Number.MAX_SAFE_INTEGER;
            
            if (brandLevelA !== brandLevelB) {
                return brandLevelA - brandLevelB;
            }
            
            const brandNameA = (a.POS_Brand_Name || '').toLowerCase();
            const brandNameB = (b.POS_Brand_Name || '').toLowerCase();
            
            if (brandNameA !== brandNameB) {
                return brandNameA.localeCompare(brandNameB);
            }
            
            const itemLevelA = a.Item_Level ? parseInt(a.Item_Level) : Number.MAX_SAFE_INTEGER;
            const itemLevelB = b.Item_Level ? parseInt(b.Item_Level) : Number.MAX_SAFE_INTEGER;
            
            if (itemLevelA !== itemLevelB) {
                return itemLevelA - itemLevelB;
            }
            
            const productNameA = (a.Short_Name || a.Product_Name || '').toLowerCase();
            const productNameB = (b.Short_Name || b.Product_Name || '').toLowerCase();
            return productNameA.localeCompare(productNameB);
        });
        
        const groupedData = {};
        const brandOrder = [];
        
        sortedData.forEach(item => {
            const brandId = item.Pos_Brand_Id;
            if (!groupedData[brandId]) {
                groupedData[brandId] = [];
                brandOrder.push(brandId);
            }
            groupedData[brandId].push(item);
        });
        
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`${showActiveOnly ? "Active" : "Inactive"}_PriceList_Data`);
        
        const uniqueDate = sortedData.length > 0
            ? sortedData[0].Rate_Date.split("T")[0].split("-").reverse().join("-")
            : "";
        
        worksheet.addRow([uniqueDate, `${showActiveOnly ? "Active" : "Inactive"} PriceList`]).font = { bold: true, size: 14 };
        
        brandOrder.forEach(brandId => {
            const products = groupedData[brandId];
            const brandRow = worksheet.addRow([products[0].POS_Brand_Name]);
            const brandCell = brandRow.getCell(1);
            brandCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFF00" } };
            brandCell.font = { bold: true, size: 12 };
            
            products.forEach(item => { 
                worksheet.addRow([item.Short_Name, item.Max_Rate]); 
            });
        });
        
        worksheet.columns = [{ width: 40 }, { width: 15 }];
        
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(blob, `${showActiveOnly ? "Active" : "Inactive"}_PriceList_Data.xlsx`);
        toast.success(`Products Successfully downloaded`);
    };

    const syncLOS = () => {
        fetchLink({ address: `masters/posproductSync` })
            .then(data => { if (data) toast.success(data?.message); })
            .catch(e => console.error(e));
    };

    const filteredPosData = useMemo(() => {
        if (!Array.isArray(posData)) {
            return [];
        }
        
        let data = [...posData];
        
        data = data.filter(item => 
            showActiveOnly ? item.Is_Active_Decative === 1 : item.Is_Active_Decative === 0
        );
        
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            data = data.filter(item => {
                return (
                    (item.POS_Brand_Name || '').toLowerCase().includes(term) ||
                    (item.Short_Name || '').toLowerCase().includes(term) ||
                    (item.Product_Name || '').toLowerCase().includes(term) ||
                    String(item.Rate || '').includes(term) ||
                    String(item.Max_Rate || '').includes(term)
                );
            });
        }
        
        return data;
    }, [posData, searchTerm, showActiveOnly]);

    const handlePrintActiveProducts = async () => {
        const dataToPrint = filteredPosData;
            
        if (dataToPrint.length === 0) {
            toast.error(showActiveOnly 
                ? "No active products available for print."
                : "No inactive products available for print.");
            return;
        }
        
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet(`${showActiveOnly ? "Active" : "Inactive"}_Products_List`);
            
            const groupedByDate = dataToPrint.reduce((groups, item) => {
                const dateKey = item.Rate_Date ? new Date(item.Rate_Date).toLocaleDateString('en-GB') : "";
                if (!groups[dateKey]) {
                    groups[dateKey] = [];
                }
                groups[dateKey].push(item);
                return groups;
            }, {});
            
            Object.entries(groupedByDate).forEach(([date, items]) => {
                const dateRow = worksheet.addRow(["Date", date]);
                dateRow.font = { bold: true, size: 12 };
                dateRow.eachCell((cell) => {
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "FFE0E0E0" }
                    };
                    cell.border = {
                        top: { style: "thin" },
                        left: { style: "thin" },
                        bottom: { style: "thin" },
                        right: { style: "thin" }
                    };
                    cell.alignment = { horizontal: "left", vertical: "middle" };
                });
                
                const headers = ["S.No", "Brand", "Product", "Rate", "Max Rate","Status"];
                const headerRow = worksheet.addRow(headers);
                headerRow.font = { bold: true, size: 12 };
                headerRow.eachCell((cell) => {
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "FFE0E0E0" }
                    };
                    cell.border = {
                        top: { style: "thin" },
                        left: { style: "thin" },
                        bottom: { style: "thin" },
                        right: { style: "thin" }
                    };
                    cell.alignment = { horizontal: "center", vertical: "middle" };
                });
                
                items.forEach((item, idx) => {
                    const dataRow = worksheet.addRow([
                        idx + 1,
                        item.POS_Brand_Name || "",
                        item.Short_Name || item.Product_Name || "",
                        item.Rate || "",
                        item.Max_Rate || "",
                        showActiveOnly ? "Active" : "Inactive"
                    ]);
                    
                    dataRow.eachCell((cell) => {
                        cell.border = {
                            top: { style: "thin" },
                            left: { style: "thin" },
                            bottom: { style: "thin" },
                            right: { style: "thin" }
                        };
                        cell.alignment = { horizontal: "center", vertical: "middle" };
                    });
                });
                
                worksheet.addRow([]);
            });
            
            worksheet.columns = [
                { width: 8 },
                { width: 25 },
                { width: 35 },
                { width: 12 },
                { width: 12 },
                { width: 10 },
            ];
            
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            
            let fileName = `${showActiveOnly ? "Active" : "Inactive"}_Products_${moment().format("YYYY-MM-DD")}`;
            if (searchTerm.trim()) {
                fileName += `_${searchTerm}`;
            }
            fileName += ".xlsx";
            
            saveAs(blob, fileName);
            toast.success(`Successfully exported ${dataToPrint.length} ${showActiveOnly ? "active" : "inactive"} products!`);
        } catch (error) {
            console.error("Error exporting products:", error);
            toast.error("Failed to export products. Please try again.");
        }
    };

    const prepareOrderData = async () => {
        setLoadingBrandProducts(true);
        try {
            if (!Array.isArray(posData)) {
                throw new Error("posData is not an array");
            }
            
            const activeProducts = posData.filter(item => item.Is_Active_Decative === 1);
            const groupedByBrand = {};
            
            activeProducts.forEach(product => {
                if (!groupedByBrand[product.Pos_Brand_Id]) {
                    groupedByBrand[product.Pos_Brand_Id] = {
                        brandId: product.Pos_Brand_Id,
                        brandName: product.POS_Brand_Name,
                        brandLevel: product.Brand_Level || '',
                        products: []
                    };
                }
                groupedByBrand[product.Pos_Brand_Id].products.push({
                    id: product.Item_Id,
                    name: product.Short_Name || product.Product_Name,
                    rate: product.Rate,
                    maxRate: product.Max_Rate,
                    level: product.Item_Level || ''
                });
            });

            const initialOrderData = {};
            const initialBrandLevels = {};
            
            Object.values(groupedByBrand).forEach(brand => {
                initialBrandLevels[brand.brandId] = brand.brandLevel || '';
                
                brand.products.forEach(product => {
                    initialOrderData[`${brand.brandId}_${product.id}`] = product.level;
                });
            });
            
            setOrderData(initialOrderData);
            setBrandLevels(initialBrandLevels);
            setBrandProducts(groupedByBrand);
        } catch (error) {
            console.error("Error preparing order data:", error);
            toast.error("Failed to load order data");
        } finally {
            setLoadingBrandProducts(false);
        }
    };
    
    const handleOpenOrderPopover = async (event) => {
        setOrderPopoverAnchor(event.currentTarget);
        await prepareOrderData();
    };

    const handleCloseOrderPopover = () => {
        setOrderPopoverAnchor(null);
        setExpandedBrands([]);
    };

    const handleBrandLevelChange = (brandId, value) => {
        setBrandLevels(prev => ({
            ...prev,
            [brandId]: value
        }));
    };

    const handleProductLevelChange = (brandId, productId, value) => {
        setOrderData(prev => ({
            ...prev,
            [`${brandId}_${productId}`]: value
        }));
    };

    const handleAccordionChange = (brandId) => (event, isExpanded) => {
        setExpandedBrands(prev => 
            isExpanded 
                ? [...prev, brandId]
                : prev.filter(id => id !== brandId)
        );
    };

    const handleSaveOrderLevels = async () => {
        try {
            if (loadingOn) loadingOn();
            
            const filteredBrandLevels = {};
            const filteredProductLevels = {};
            
            Object.keys(brandLevels).forEach(brandId => {
                if (brandLevels[brandId] && brandLevels[brandId].trim() !== '') {
                    filteredBrandLevels[brandId] = brandLevels[brandId];
                }
            });
            
            Object.keys(orderData).forEach(key => {
                if (orderData[key] && orderData[key].trim() !== '') {
                    filteredProductLevels[key] = orderData[key];
                }
            });
            
            if (Object.keys(filteredBrandLevels).length === 0 && Object.keys(filteredProductLevels).length === 0) {
                toast.warning("No level values entered to save");
                if (loadingOff) loadingOff();
                return;
            }
            
            const response = await fetchLink({
                address: `masters/saveOrderLevels`,
                method: "POST",
                bodyData: { 
                    brandLevels: filteredBrandLevels,
                    productLevels: filteredProductLevels
                }
            });
            
            if (response.success) {
                toast.success("Order levels saved successfully!");
                handleCloseOrderPopover();
                setReload(!reload);
            } else {
                toast.error(response.message || "Failed to save order levels");
            }
        } catch (error) {
            console.error("Error saving order levels:", error);
            toast.error("Failed to save order levels");
        } finally {
            if (loadingOff) loadingOff();
        }
    };

    const orderPopoverOpen = Boolean(orderPopoverAnchor);
    const orderPopoverId = orderPopoverOpen ? 'order-popover' : undefined;

    const editedRowsCount = Object.keys(editedRatesRef.current).length + Object.keys(editedMaxRatesRef.current).length;

    // Render table directly without FilterableTable for editable columns
    const renderTable = () => {
        return (
            <div className="table-responsive">
                <table className="table table-sm table-bordered">
                    <thead className="table-light">
                        <tr>
                            <th>#</th>
                            <th>Rate Date</th>
                            <th>Brand</th>
                            <th>Product</th>
                            <th>Rate (₹)</th>
                            <th>Max Rate (₹)</th>
                            <th>Brand Level</th>
                            <th>Item Level</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPosData.length === 0 ? (
                            <tr>
                                <td colSpan="10" className="text-center">No data available</td>
                            </tr>
                        ) : (
                            filteredPosData.map((row, idx) => (
                                <TableRow 
                                    key={row.Id}
                                    row={row}
                                    index={idx}
                                    editedRatesRef={editedRatesRef}
                                    editedMaxRatesRef={editedMaxRatesRef}
                                    onRateChange={handleRateChange}
                                    onMaxRateChange={handleMaxRateChange}
                                    onEdit={editRow}
                                    onDelete={() => { setOpen(true); setInputValue({ ...inputValue, Id: row.Id }); }}
                                    showActions={filters?.Fromdate === moment().format("YYYY-MM-DD")}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div>
            {/* Rate Generation Time Header with Update Button */}
            <div className="card mb-3" style={{ backgroundColor: '#f8f9fa' }}>
                <div className="card-body py-2">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div className="d-flex align-items-center gap-3">
                            <div className="d-flex align-items-center gap-2">
                                <History style={{ color: '#4a2c1a' }} />
                                <span className="fw-bold">Rate Generation Time:</span>
                                <input
                                    type="time"
                                    value={selectedTime}
                                    onChange={(e) => setSelectedTime(e.target.value)}
                                    className="form-control form-control-sm"
                                    style={{ width: '130px' }}
                                />
                                <Button
                                    variant="contained"
                                    size="sm"
                                    onClick={handleUpdateTimeAndRates}
                                    disabled={isUpdating}
                                    style={{ 
                                        backgroundColor: editedRowsCount > 0 ? '#28a745' : '#007bff',
                                        color: 'white',
                                        padding: '5px 15px',
                                        borderRadius: '4px',
                                        border: 'none'
                                    }}
                                >
                                    {isUpdating ? "Updating..." : editedRowsCount > 0 ? `Update Time & ${editedRowsCount} Rate(s)` : "Update Time"}
                                </Button>
                                {editedRowsCount > 0 && (
                                    <span className="text-warning small">
                                        ({editedRowsCount} pending rate change(s))
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        <div className="text-muted small">
                            Selected Date: {moment(filters.Fromdate).format('DD-MM-YYYY')}
                        </div>
                    </div>
                </div>
            </div>

            <div className="date-inputs">
                <div className="p-2 d-flex align-items-center flex-wrap border-bottom gap-2">
                    <h5 className="m-0 my-1 flex-grow-1 d-flex align-items-center flex-wrap gap-2">
                        <span className="mx-2">Rate Master</span>
                        <Button onClick={() => setExportDialog(true)}>Export To</Button>
                        <Button
                            className="mx-2 btn btn-dark"
                            style={{ outline: "none", boxShadow: "none" }}
                            onClick={handleDownload}>
                            Download Excel
                        </Button>
                        <Button
                            className="mx-2 btn btn-success"
                            style={{ outline: "none", boxShadow: "none" }}
                            onClick={handlePrintActiveProducts}>
                            {showActiveOnly ? "Print Active" : "Print Inactive"}
                        </Button>
                        <Button
                            className="mx-2 btn btn-primary"
                            style={{ outline: "none", boxShadow: "none" }}
                            onClick={handleOpenOrderPopover}>
                            Order
                        </Button>
                    </h5>

                    <div className="d-flex align-items-center gap-2">
                        <div
                            className="d-flex align-items-center rounded px-2"
                            style={{ height: 36, backgroundColor: '#ffffff', border: '1.5px solid #000000' }}
                        >
                            <Search style={{ fontSize: 18, color: '#6b7280', marginRight: 4 }} />
                            <input
                                type="text"
                                placeholder={`Search ${showActiveOnly ? "active" : "inactive"} products...`}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    fontSize: 13,
                                    width: 220,
                                    background: 'transparent',
                                }}
                            />
                            {searchTerm && (
                                <span
                                    onClick={() => setSearchTerm("")}
                                    style={{ cursor: 'pointer', fontSize: 13, color: '#9ca3af', marginLeft: 4 }}>
                                    ✕
                                </span>
                            )}
                        </div>
                        
                        <div className="d-flex align-items-center">
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={showActiveOnly}
                                        onChange={(e) => {
                                            setShowActiveOnly(e.target.checked);
                                            setSearchTerm(""); 
                                        }}
                                        color="primary"
                                    />
                                }
                                label={
                                    <span style={{ fontSize: '13px', fontWeight: '500' }}>
                                        {showActiveOnly ? "Active" : "Inactive"}
                                    </span>
                                }
                                labelPlacement="start"
                                style={{ marginRight: 0 }}
                            />
                        </div>
                    </div>

                    <Tooltip title="Sync Data">
                        <IconButton onClick={syncLOS}>
                            <Sync />
                        </IconButton>
                    </Tooltip>

                    <div>
                        <input
                            type="date"
                            value={filters.Fromdate}
                            onChange={e => {
                                const newFromDate = e.target.value;
                                setFilters({ ...filters, Fromdate: newFromDate, fetchFrom: newFromDate });
                                setSearchTerm("");
                                editedRatesRef.current = {};
                                editedMaxRatesRef.current = {};
                                fetchRateGenInfo(newFromDate);
                            }}
                            className="cus-inpt w-auto p-1"
                        />
                    </div>

                    <IconButton
                        onClick={() => updateQueryString({ Fromdate: filters?.Fromdate })}
                        variant="outlined"
                        size="small">
                        <Search />
                    </IconButton>

                    {filters?.Fromdate === moment().format("YYYY-MM-DD") ? (
                        <Button onClick={() => setAddDialog(true)}>Add</Button>
                    ) : null}
                </div>
            </div>

            {/* Order Popover */}
            <Popover
                id={orderPopoverId}
                open={orderPopoverOpen}
                anchorEl={orderPopoverAnchor}
                onClose={handleCloseOrderPopover}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                PaperProps={{
                    style: {
                        maxHeight: '80vh',
                        width: '730px',
                        maxWidth: '90vw',
                    },
                }}
            >
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Set Order Levels
                    </Typography>
                    
                    {loadingBrandProducts ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <Typography>Loading brand products...</Typography>
                        </Box>
                    ) : Object.keys(brandProducts).length === 0 ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <Typography>No active products found</Typography>
                        </Box>
                    ) : (
                        <>
                            <Box sx={{ maxHeight: '60vh', overflow: 'auto', mb: 2 }}>
                                <Grid container spacing={2} sx={{ mb: 1, px: 2 }}>
                                    <Grid item xs={5}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                            Brand / Product
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={7}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                            Brand Level / Product Level
                                        </Typography>
                                    </Grid>
                                </Grid>

                                {Object.values(brandProducts).map((brand) => (
                                    <Accordion
                                        key={brand.brandId}
                                        expanded={expandedBrands.includes(brand.brandId)}
                                        onChange={handleAccordionChange(brand.brandId)}
                                        sx={{ mb: 1 }}
                                    >
                                        <AccordionSummary
                                            expandIcon={<ExpandMore />}
                                            aria-controls={`panel-${brand.brandId}-content`}
                                            id={`panel-${brand.brandId}-header`}
                                            sx={{
                                                backgroundColor: '#f5f5f5',
                                                '& .MuiAccordionSummary-content': {
                                                    alignItems: 'center',
                                                },
                                            }}
                                        >
                                            <Grid container spacing={2} alignItems="center">
                                                <Grid item xs={5}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography sx={{ fontWeight: 'bold' }}>
                                                            {brand.brandName}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            ({brand.products.length} products)
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={7}>
                                                    <TextField
                                                        size="small"
                                                        type="number"
                                                        placeholder="Enter brand level"
                                                        value={brandLevels[brand.brandId] || ''}
                                                        onChange={(e) => handleBrandLevelChange(brand.brandId, e.target.value)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        fullWidth
                                                        inputProps={{
                                                            min: 0,
                                                            step: 1,
                                                            style: { textAlign: 'center' }
                                                        }}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Grid container spacing={2} sx={{ mb: 1 }}>
                                                <Grid item xs={5}>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                                                        Product Name
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={7}>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                                                        Product Level
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                            
                                            {brand.products.map((product) => (
                                                <Paper
                                                    key={product.id}
                                                    elevation={0}
                                                    sx={{
                                                        p: 1.5,
                                                        mb: 1,
                                                        backgroundColor: '#fafafa',
                                                        border: '1px solid #e0e0e0',
                                                        '&:hover': {
                                                            backgroundColor: '#f0f0f0',
                                                        },
                                                    }}
                                                >
                                                    <Grid container spacing={2} alignItems="center">
                                                        <Grid item xs={5}>
                                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                {product.name}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary" display="block">
                                                                Rate: ₹{product.rate} | Max: ₹{product.maxRate}
                                                            </Typography>
                                                        </Grid>
                                                        <Grid item xs={7}>
                                                            <TextField
                                                                size="small"
                                                                type="number"
                                                                placeholder="Enter product level"
                                                                value={orderData[`${brand.brandId}_${product.id}`] || ''}
                                                                onChange={(e) => handleProductLevelChange(
                                                                    brand.brandId,
                                                                    product.id,
                                                                    e.target.value
                                                                )}
                                                                fullWidth
                                                                inputProps={{
                                                                    min: 0,
                                                                    step: 1,
                                                                    style: { textAlign: 'center' }
                                                                }}
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                </Paper>
                                            ))}
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                            </Box>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2, borderTop: '1px solid #e0e0e0', pt: 2 }}>
                                <Button onClick={handleCloseOrderPopover} variant="outlined">
                                    Cancel
                                </Button>
                                <Button onClick={handleSaveOrderLevels} variant="contained" color="primary">
                                    Save Levels
                                </Button>
                            </Box>
                        </>
                    )}
                </Box>
            </Popover>

      
            {renderTable()}

          
            <Dialog open={addDialog} onClose={() => setAddDialog(false)} fullWidth maxWidth="sm">
                <DialogTitle>{inputValue.Id ? "UPDATE" : "CREATE"} RATE MASTER</DialogTitle>
                <form onSubmit={e => { e.preventDefault(); inputValue.Id ? handleUpdate() : handleRateMasterAdd(); }}>
                    <DialogContent>
                        <label>Rate Date</label>
                        <input
                            type="date"
                            value={inputValue.Rate_Date}
                            onChange={e => setInputValue({ ...inputValue, Rate_Date: e.target.value })}
                            className="cus-inpt"
                            required
                        />

                        <label>POS Brand</label>
                        <select
                            value={selectedPosBrand}
                            onChange={e => {
                                setSelectedPosBrand(e.target.value);
                                setInputValue({ ...inputValue, Pos_Brand_Id: e.target.value });
                            }}
                            className="cus-inpt"
                            required>
                            <option value="" disabled>Select POS Brand</option>
                            {posBrand.map((o, i) => (
                                <option key={i} value={o.value}>{o.label}</option>
                            ))}
                        </select>

                        <label>Product</label>
                        <select
                            className="cus-inpt"
                            disabled={!selectedPosBrand}
                            value={inputValue.Item_Id}
                            onChange={e => setInputValue({ ...inputValue, Item_Id: e.target.value })}
                            required>
                            <option value="" disabled>Select Product</option>
                            {product.length > 0
                                ? product.map((p, i) => <option key={i} value={p.value}>{p.label}</option>)
                                : <option value="" disabled>No products available</option>}
                        </select>

                        <label>Rate</label>
                        <TextField
                            value={inputValue.Rate ?? ""}
                            onChange={e => setInputValue({ ...inputValue, Rate: e.target.value })}
                            fullWidth 
                            margin="dense" 
                            variant="outlined"
                            type="number"
                        />

                        <label>Max Rate</label>
                        <TextField
                            value={inputValue.MaxRate ?? ""}
                            onChange={e => setInputValue({ ...inputValue, MaxRate: e.target.value })}
                            fullWidth 
                            margin="dense" 
                            variant="outlined"
                            type="number"
                        />

                        <label>Brand Level</label>
                        <TextField
                            value={inputValue.Brand_Level ?? ""}
                            onChange={e => setInputValue({ ...inputValue, Brand_Level: e.target.value })}
                            fullWidth 
                            margin="dense" 
                            variant="outlined"
                            type="number"
                        />

                        <label>Item Level</label>
                        <TextField
                            value={inputValue.Item_Level ?? ""}
                            onChange={e => setInputValue({ ...inputValue, Item_Level: e.target.value })}
                            fullWidth 
                            margin="dense" 
                            variant="outlined"
                            type="number"
                        />

                        <label>Status</label>
                        <select
                            className="cus-inpt"
                            value={inputValue.Is_Active_Decative}
                            onChange={e => setInputValue({ ...inputValue, Is_Active_Decative: e.target.value })}
                            required>
                            <option value="" disabled>Select</option>
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                        </select>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {
                            setInputValue({
                                Id: "",
                                Rate_Date: new Date().toISOString().split("T")[0],
                                Pos_Brand_Id: "", Item_Id: "", Rate: "",
                                Is_Active_Decative: "", POS_Brand_Name: "",
                                Product_Name: "", MaxRate: "", Brand_Level: "", Item_Level: ""
                            });
                            setSelectedPosBrand("");
                            setAddDialog(false);
                        }}>Cancel</Button>
                        <Button type="submit" variant="contained">Save</Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Confirmation</DialogTitle>
                <DialogContent><b>Do you want to delete the RateMaster?</b></DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={() => handleDelete(inputValue.Id)} autoFocus color="error">Delete</Button>
                </DialogActions>
            </Dialog>

            {/* Export Dialog */}
            <Dialog open={exportDialog} onClose={() => setExportDialog(false)} fullWidth maxWidth="sm">
                <DialogTitle>Export Data</DialogTitle>
                <DialogContent>
                    <b>
                        Do you want to export data from:
                        <div style={{ marginTop: "10px" }}>
                            <label>From Date</label>
                            <input
                                type="date" 
                                disabled 
                                value={filters.Fromdate}
                                className="cus-inpt w-auto p-1"
                                style={{ marginLeft: "10px" }}
                            />
                        </div>
                        <br />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ flex: 1 }}>
                                <label>New Date</label>
                                <input
                                    type="date" 
                                    value={filters.NewDate}
                                    onChange={e => setFilters({ ...filters, NewDate: e.target.value })}
                                    className="cus-inpt w-100 p-1"
                                    style={{ marginLeft: "10px" }}
                                    required
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label>Time</label>
                                <input
                                    type="time" 
                                    value={filters.NewTime}
                                    onChange={e => setFilters({ ...filters, NewTime: e.target.value })}
                                    className="cus-inpt w-100 p-1"
                                    style={{ marginLeft: "10px" }}
                                    required
                                />
                            </div>
                        </div>
                        <br />
                        <small style={{ color: '#666' }}>
                            Selected: {filters.NewDate} {filters.NewTime}
                        </small>
                    </b>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setExportDialog(false)}>Cancel</Button>
                    <Button onClick={() => handleExportData()} autoFocus color="primary">Export</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

// Separate Table Row Component to isolate re-renders
const TableRow = memo(({ row, index, editedRatesRef, editedMaxRatesRef, onRateChange, onMaxRateChange, onEdit, onDelete, showActions }) => {
    const [localRate, setLocalRate] = useState(editedRatesRef.current[row.Id] !== undefined ? editedRatesRef.current[row.Id] : row.Rate);
    const [localMaxRate, setLocalMaxRate] = useState(editedMaxRatesRef.current[row.Id] !== undefined ? editedMaxRatesRef.current[row.Id] : row.Max_Rate);

    // Update local state when ref changes (after bulk update)
    useEffect(() => {
        if (editedRatesRef.current[row.Id] !== undefined) {
            setLocalRate(editedRatesRef.current[row.Id]);
        } else {
            setLocalRate(row.Rate);
        }
        if (editedMaxRatesRef.current[row.Id] !== undefined) {
            setLocalMaxRate(editedMaxRatesRef.current[row.Id]);
        } else {
            setLocalMaxRate(row.Max_Rate);
        }
    }, [row.Rate, row.Max_Rate, row.Id, editedRatesRef, editedMaxRatesRef]);

    const handleRateInputChange = (e) => {
        const newValue = e.target.value;
        setLocalRate(newValue);
        onRateChange(row.Id, newValue);
    };

    const handleMaxRateInputChange = (e) => {
        const newValue = e.target.value;
        setLocalMaxRate(newValue);
        onMaxRateChange(row.Id, newValue);
    };

    const statusText = row.Is_Active_Decative === 1 ? "Active" : "Inactive";
    const statusColor = row.Is_Active_Decative === 1 ? "green" : "red";

    return (
        <tr>
            <td>{index + 1}</td>
            <td>{row.Rate_Date ? moment(row.Rate_Date).format('DD/MM/YYYY') : '-'}</td>
            <td>{row.POS_Brand_Name || '-'}</td>
            <td>{row.Short_Name || '-'}</td>
            <td style={{ minWidth: '130px' }}>
                <input
                    type="number"
                    className="form-control form-control-sm"
                    style={{ width: '120px' }}
                    value={localRate}
                    onChange={handleRateInputChange}
                    step="0.01"
                    min="0"
                />
            </td>
            <td style={{ minWidth: '130px' }}>
                <input
                    type="number"
                    className="form-control form-control-sm"
                    style={{ width: '120px' }}
                    value={localMaxRate}
                    onChange={handleMaxRateInputChange}
                    step="0.01"
                    min="0"
                />
            </td>
            <td>{row.Brand_Level || '-'}</td>
            <td>{row.Item_Level || '-'}</td>
            <td>
                <span className="badge" style={{ backgroundColor: statusColor, color: 'white', padding: '5px 10px' }}>
                    {statusText}
                </span>
            </td>
            <td style={{ minWidth: '100px' }}>
                <IconButton onClick={() => onEdit(row)} size="small">
                    <Edit fontSize="small" />
                </IconButton>
                {showActions && (
                    <IconButton onClick={onDelete} size="small" color="error">
                        <Delete fontSize="small" />
                    </IconButton>
                )}
            </td>
        </tr>
    );
});

export default RateMaster;