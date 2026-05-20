import { NumberFormat, Addition, reactSelectFilterLogic, isValidNumber, LocalDate } from '../../../Components/functions';
import FilterableTable, { createCol } from '../../../Components/filterableTable2';
import { useState, useEffect, useMemo } from "react";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { toArray } from '../../../Components/functions';
import { fetchLink } from "../../../Components/fetchComponent";

const LedgerBasedClosingStock = ({ loadingOn, loadingOff, Fromdate, Todate, retailerId }) => {
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
        const customerID = retailerId ? retailerId : filters?.customer.value;
        if (customerID) {
            fetchLink({
                address: `reports/customerClosingStock/retailerBased/detailedInfo?
                Retailer_Id=${customerID}&
                Fromdate=${Fromdate}&
                Todate=${Todate}`,
                loadingOn, loadingOff
            }).then(data => {
                if (data.success) {
                    setProductClosingStock(toArray(data?.data));
                }
            }).catch(e => console.error(e))
        }
    }, [filters?.customer.value, Fromdate, Todate, retailerId]);

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

    const totalStockValue = useMemo(() => {
        return NumberFormat(
            productClosingStock.reduce(
                (sum, product) => Addition(sum, product.stockValueOfItem),
                0
            )
        )
    }, [productClosingStock])

    const titleText = useMemo(() => {
        let text = ' Stock value: ₹' + totalStockValue;

        if (isValidNumber(retailerId)) {
            text += ' \t From ' + LocalDate(Fromdate) + ' \t To ' + LocalDate(Todate);
        }

        return text;
    }, [retailerId, totalStockValue])

    return (
        <>

            <FilterableTable
                title={titleText}
                headerFontSizePx={12}
                bodyFontSizePx={12}
                ButtonArea={
                    <>
                        {!isValidNumber(retailerId) && (
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
                                    filterOption={reactSelectFilterLogic}
                                />
                            </div>
                        )}
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