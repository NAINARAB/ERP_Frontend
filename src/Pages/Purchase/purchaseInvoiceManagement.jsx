import { useState } from "react";
import { fetchLink } from "../../Components/fetchComponent";
import { Button, Card, CardContent } from "@mui/material";
import Select from 'react-select';
import { customSelectStyles } from "../../Components/tablecolumn";
import { Search } from "@mui/icons-material";
import { checkIsNumber, isEqualNumber } from "../../Components/functions";
import FilterableTable, { createCol } from "../../Components/filterableTable2";

const PurchaseInvoiceManagement = ({ loadingOn, loadingOff }) => {
    const [vendorList, setVendorList] = useState([]);
    const [baseDetails, setBaseDetails] = useState({
        vendor: 'search',
        vendorId: '',
    });
    const [deliveryDetails, setDeliveryDetails] = useState([]);
    const [invoiceDetails, setInvoiceDetails] = useState();
    const [selectedItems, setSelectedItems] = useState([]);

    useState(() => {
        fetchLink({
            address: `masters/retailers`
        }).then(data => {
            if (data.success) {
                setVendorList(data.data);
            }
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

    const changeItems = (itemDetail) => {
        const currentOrders = deliveryDetails.filter(item =>
            isEqualNumber(item.OrderPK, itemDetail.OrderId)
        );
    
        setSelectedItems((prev) => {
            const preItems = prev.filter(o => !isEqualNumber(o?.OrderPK, itemDetail.OrderId));
            return preItems.concat(currentOrders); 
        });
    };
    

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
                                                onChange={() => changeItems(row)}
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
            </Card>
        </>
    )
}

export default PurchaseInvoiceManagement;