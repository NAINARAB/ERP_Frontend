import { NumberFormat, Addition } from '../../../Components/functions';
import FilterableTable, { createCol } from '../../../Components/filterableTable2';
import { useState, useEffect } from "react";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { toArray } from '../../../Components/functions';
import { fetchLink } from "../../../Components/fetchComponent";

const LedgerBasedClosingStock = ({ loadingOn, loadingOff }) => {
    const [retailers, setRetailers] = useState([]);
    const [productClosingStock, setProductClosingStock] = useState([]);
    const [filters, setFilters] = useState({
        customer: { value: '', label: 'Select Retailer' },
    });

    useEffect(() => {

        fetchLink({
            address: `masters/retailers/whoHasClosingStock`
        }).then(data => {
            if (data.success) {
                setRetailers(data.data);
            }
        }).catch(e => console.error(e))

    }, [])

    useEffect(() => {
        if (filters?.customer.value) {
            fetchLink({
                address: `reports/customerClosingStock/retailerBased/detailedInfo?Retailer_Id=${filters?.customer.value}`,
                loadingOn, loadingOff
            }).then(data => {
                if (data.success) {
                    setProductClosingStock(toArray(data?.data));
                }
            }).catch(e => console.error(e))
        }
    }, [filters?.customer.value]);

    const productBasedColumn = [
        createCol('Product_Name', 'string'),
        createCol('deliveryDisplayDate', 'string', 'Entry Date'),
        createCol('closingDisplayDate', 'string', 'Update Date'),
        createCol('entryDays', 'number', 'Entry Days'),
        createCol('updateDays', 'number', 'Update Days'),
        createCol('stockQuantityOfItem', 'number', ' Quantity'),
        createCol('stockRateOfItem', 'number', 'Rate'),
        createCol('stockValueOfItem', 'number', 'Stock-Value'),
    ];

    const productGroupedColumn = [
        createCol('Brand_Name', 'string', 'Brand'),
        createCol('entryDate', 'string', 'Entry Date'),
        createCol('updateDate', 'string', 'Update Date'),
        createCol('entryDays', 'number', 'Entry Days'),
        createCol('updateDays', 'number', 'Update Days'),
        createCol('totalQty', 'number', ' Quantity'),
        createCol('totalValue', 'number', 'Stock-Value'),
    ]

    return (
        <>

            <FilterableTable
                title={" Stock value: ₹" + NumberFormat(
                    productClosingStock.reduce(
                        (sum, product) => Addition(sum, product.stockValueOfItem),
                        0
                    )
                )}
                headerFontSizePx={12}
                bodyFontSizePx={12}
                ButtonArea={
                    <>
                        <div style={{ minWidth: '360px', marginRight: '10px' }}>
                            <Select
                                value={filters.customer}
                                onChange={(e) => {
                                    setFilters({ ...filters, customer: e });
                                }}
                                options={[
                                    // { value: '', label: 'All Retailer' },
                                    ...retailers.map(obj => ({ value: obj?.Retailer_Id, label: obj?.Retailer_Name }))
                                ]}
                                menuPortalTarget={document.body}
                                styles={customSelectStyles}
                                isSearchable={true}
                                placeholder={"Retailer Name"}
                            />
                        </div>
                    </>
                }
                EnableSerialNumber
                dataArray={productClosingStock}
                columns={productBasedColumn}
            />

        </>
    )
}

export default LedgerBasedClosingStock;