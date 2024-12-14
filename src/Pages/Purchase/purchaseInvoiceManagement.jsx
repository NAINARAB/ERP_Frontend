import { useState } from "react";
import { fetchLink } from "../../Components/fetchComponent";
import { Button, Card, CardActions, CardContent, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import Select from 'react-select';
import { customSelectStyles } from "../../Components/tablecolumn";
import { Search } from "@mui/icons-material";
import { checkIsNumber, isEqualNumber, ISOString } from "../../Components/functions";
import FilterableTable, { createCol } from "../../Components/filterableTable2";
import RequiredStar from "../../Components/requiredStar";

const initialInvoiceValue = {
    PIN_Id: '',
    Ref_Po_Inv_No: '',
    Branch_Id: '',
    Po_Inv_No: '',
    Po_Inv_Date: ISOString(),
    Retailer_Id: '',
    GST_Inclusive: 2,
    IS_IGST: 0,
    Narration: '',
    isConverted: '',
    Cancel_status: '',
    Created_by: '',
    Altered_by: '',
    Created_on: '',
    Alterd_on: '',
    Trans_Type: '',
    Alter_Id: '',
    Approved_By: '',
    Approve_Status: '',
}

const PurchaseInvoiceManagement = ({ loadingOn, loadingOff }) => {
    const [vendorList, setVendorList] = useState([]);
    const [branches, setBranches] = useState([]);
    const [baseDetails, setBaseDetails] = useState({
        vendor: 'search',
        vendorId: '',
    });
    const [deliveryDetails, setDeliveryDetails] = useState([]);
    const [invoiceDetails, setInvoiceDetails] = useState(initialInvoiceValue);
    const [selectedItems, setSelectedItems] = useState([]);
    const [dialogs, setDialogs] = useState({
        nextStep: false,
    });
    const tdStyle = 'border fa-14 vctr';
    const inputStyle = 'cus-inpt p-2';

    useState(() => {
        fetchLink({
            address: `masters/retailers`
        }).then(data => {
            if (data.success) {
                setVendorList(data.data);
            }
        }).catch(e => console.error(e));

        fetchLink({
            address: `masters/branch/dropDown`
        }).then(data => {
            if (data.success) setBranches(data.data);
        }).catch(e => console.error(e));

    }, [])

    const getVendorInfo = (vendor) => {
        if (loadingOn) loadingOn();
        setSelectedItems([]);
        fetchLink({
            // address: `dataEntry/purchaseOrderEntry/delivery/partyBased?VendorId=${baseDetails?.vendorId}`
            address: `dataEntry/purchaseOrderEntry/delivery/partyBased?VendorId=${vendor}`
        }).then(data => {
            if (data.success) setDeliveryDetails(data.data)
        }).catch(e => console.error(e)).finally(() => {
            if (loadingOff) loadingOff()
        })
    }

    const changeItems = (itemDetail, deleteId) => {
        if (deleteId) {
            setSelectedItems((prev) => {
                const preItems = prev.filter(o => !isEqualNumber(o?.Id, deleteId));
                return preItems;
            });
        } else {
            const currentOrders = deliveryDetails.filter(item =>
                isEqualNumber(item.OrderPK, itemDetail.OrderId)
            );

            setSelectedItems((prev) => {
                const preItems = prev.filter(o => !isEqualNumber(o?.OrderPK, itemDetail.OrderId));
                return preItems.concat(currentOrders);
            });
        }
    };

    const closeDialogs = () => {
        setDialogs({
            nextStep: false,
        })
    }


    return (
        <>
            <Card>
                <div className="d-flex flex-wrap align-items-center border-bottom p-2">
                    <h5 className='flex-grow-1 m-0 ps-2'>Purchase Invoice Creation</h5>
                    {/* <Button variant='outlined'>back</Button> */}
                </div>
                <CardContent style={{ minHeight: 500 }}>
                    <label className="pe-2">Select Vendor For Invoice: </label>
                    <div className="d-flex align-self-stretch flex-wrap mb-2">
                        <span className="flex-grow-1" style={{ maxWidth: '50%' }}>
                            <Select
                                value={{ value: baseDetails.vendorId, label: baseDetails.vendor }}
                                onChange={e => setBaseDetails(pre => ({
                                    ...pre,
                                    vendorId: e.value,
                                    vendor: e.label
                                }))}
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
                            />
                        </span>
                        <Button
                            variant="outlined"
                            className="mx-2"
                            // disabled={!checkIsNumber(baseDetails.vendorId)}
                            onClick={() => getVendorInfo(0)}
                        // onClick={() => getVendorInfo(baseDetails.vendorId)}
                        ><Search /></Button>
                    </div>

                    <FilterableTable
                        dataArray={deliveryDetails}
                        columns={[
                            {
                                isVisible: 1,
                                ColumnHeader: '#',
                                isCustomCell: true,
                                Cell: ({ row }) => {

                                    return (
                                        <div>
                                            <input
                                                className="form-check-input shadow-none pointer"
                                                style={{ padding: '0.7em' }}
                                                type="checkbox"
                                                checked={selectedItems.findIndex(o => isEqualNumber(o?.Id, row?.Id)) !== -1}
                                                onChange={() => {
                                                    if (selectedItems.findIndex(o => isEqualNumber(o?.Id, row?.Id)) !== -1) changeItems(row, row?.Id)
                                                    else changeItems(row)
                                                }}
                                            />
                                        </div>
                                    )
                                }
                            },
                            createCol('ArrivalDate', 'date'),
                            createCol('ItemName', 'string'),
                            createCol('BilledRate', 'string'),
                            createCol('Quantity', 'number'),
                            {
                                isVisible: 1,
                                ColumnHeader: 'Weight',
                                isCustomCell: true,
                                Cell: ({ row }) => (
                                    row?.Weight ?? 0
                                ) + ' ' + row?.Units
                            },
                            createCol('PO_ID', 'string'),
                            createCol('Location', 'string'),
                        ]}
                        EnableSerialNumber
                        disablePagination
                        title={`Arrival Details of ${baseDetails.vendor}`}
                        maxHeightOption
                    />
                </CardContent>
                <CardActions className="d-flex justify-content-end flex-wrap">
                    <Button onClick={() => setSelectedItems([])}>clear all</Button>
                    <Button
                        variant="contained"
                        onClick={() => setDialogs(pre => ({ ...pre, nextStep: true }))}
                        disabled={selectedItems.length === 0}
                    >next</Button>
                </CardActions>
            </Card>

            <Dialog
                open={dialogs.nextStep}
                onClose={closeDialogs}
                fullScreen
            >
                <DialogTitle>Create Invoice</DialogTitle>
                <form onSubmit={e => {
                    e.preventDefault();

                }}>
                    <DialogContent className="table-responsive">
                        <div className="row">
                            <div className="col-lg-4 col-md-6 p-2">
                                <label>Vendor</label>
                                <input disabled={true} value={invoiceDetails?.Retailer_Id} className={inputStyle} />

                                <label>Branch <RequiredStar /></label>
                                <select
                                    className={inputStyle}
                                    value={invoiceDetails?.Branch_Id}
                                    required
                                    onChange={e => setInvoiceDetails(pre => ({ ...pre, Branch_Id: e.target.value }))}
                                >
                                    <option value="">select</option>
                                    {branches.map((o, i) => (
                                        <option value={o?.BranchId} key={i}>{o?.BranchName}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-lg-4 col-md-6 p-2">
                                <label>Date <RequiredStar /></label>
                                <input
                                    value={invoiceDetails?.Po_Inv_Date}
                                    type="date"
                                    required
                                    className={inputStyle}
                                    onChange={e => setInvoiceDetails(pre => ({ ...pre, Po_Inv_Date: e.target.value }))}
                                />
                                <label>Ref Number</label>
                                <input
                                    value={invoiceDetails?.Ref_Po_Inv_No}
                                    className={inputStyle}
                                    onChange={e => setInvoiceDetails(pre => ({ ...pre, Ref_Po_Inv_No: e.target.value }))}
                                />
                            </div>
                            <div className="col-lg-4 col-md-6 p-2">
                                <label>GST Type <RequiredStar /></label>
                                <select
                                    className={inputStyle}
                                    onChange={e => setInvoiceDetails(pre => ({ ...pre, GST_Inclusive: Number(e.target.value) }))}
                                    value={invoiceDetails.GST_Inclusive}
                                    required
                                >
                                    <option value={1}>Inclusive Tax</option>
                                    <option value={0}>Exclusive Tax</option>
                                    <option value={2}>Not Taxable</option>
                                </select>
                                <label>Tax Type</label>
                                <select
                                    className={inputStyle}
                                    onChange={e => setInvoiceDetails(pre => ({...pre, IS_IGST: Number(e.target.value)}))}
                                    value={invoiceDetails.IS_IGST}
                                >
                                    <option value='0'>GST</option>
                                    <option value='1'>IGST</option>
                                </select>
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={closeDialogs} type="button">back</Button>
                        <Button type='submit' variant="contained">submit</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    )
}

export default PurchaseInvoiceManagement;