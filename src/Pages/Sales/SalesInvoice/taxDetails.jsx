import { useMemo } from "react";
import { Addition, isEqualNumber, NumberFormat, numberToWords, RoundNumber } from "../../../Components/functions";
import { calculateGSTDetails } from "../../../Components/taxCalculator";



const findProductDetails = (arr = [], productid) => arr.find(obj => isEqualNumber(obj.Product_Id, productid)) ?? {};

const SalesInvoiceTaxDetails = ({
    invoiceProducts = [],
    invoiceExpences = [],
    isNotTaxableBill,
    isInclusive,
    IS_IGST,
    products = []
}) => {

    const Total_Invoice_value = useMemo(() => {
        const invValue = invoiceProducts.reduce((acc, item) => {
            const Amount = RoundNumber(item?.Amount);

            if (isNotTaxableBill) return Addition(acc, Amount);

            const product = findProductDetails(products, item.Item_Id);
            const gstPercentage = IS_IGST ? product.Igst_P : product.Gst_P;

            if (isInclusive) {
                return Addition(acc, calculateGSTDetails(Amount, gstPercentage, 'remove').with_tax);
            } else {
                return Addition(acc, calculateGSTDetails(Amount, gstPercentage, 'add').with_tax);
            }
        }, 0);

        const invExpences = invoiceExpences.reduce((acc, exp) => Addition(acc, exp?.Expence_Value), 0);

        return Addition(invValue, invExpences);
    }, [invoiceProducts, isNotTaxableBill, products, IS_IGST, isInclusive])

    const totalValueBeforeTax = useMemo(() => {
        return invoiceProducts.reduce((acc, item) => {
            const Amount = RoundNumber(item?.Amount);

            if (isNotTaxableBill) return {
                TotalValue: Addition(acc.TotalValue, Amount),
                TotalTax: 0
            }

            const product = findProductDetails(products, item.Item_Id);
            const gstPercentage = IS_IGST ? product.Igst_P : product.Gst_P;

            const taxInfo = calculateGSTDetails(Amount, gstPercentage, isInclusive ? 'remove' : 'add');
            const TotalValue = Addition(acc.TotalValue, taxInfo.without_tax);
            const TotalTax = Addition(acc.TotalTax, taxInfo.tax_amount);

            return {
                TotalValue, TotalTax
            };
        }, {
            TotalValue: 0,
            TotalTax: 0
        });
    }, [invoiceProducts, isNotTaxableBill, products, IS_IGST, isInclusive])

    return (
        <>
            <table className="table">
                <tbody>
                    <tr>
                        <td className="border p-2" rowSpan={IS_IGST ? 4 : 5}>
                            Total in words: {numberToWords(parseInt(Total_Invoice_value))}
                        </td>
                        <td className="border p-2">Total Taxable Amount</td>
                        <td className="border p-2">
                            {NumberFormat(totalValueBeforeTax.TotalValue)}
                        </td>
                    </tr>
                    {!IS_IGST ? (
                        <>
                            <tr>
                                <td className="border p-2">CGST</td>
                                <td className="border p-2">
                                    {NumberFormat(RoundNumber(totalValueBeforeTax.TotalTax / 2))}
                                </td>
                            </tr>
                            <tr>
                                <td className="border p-2">SGST</td>
                                <td className="border p-2">
                                    {NumberFormat(RoundNumber(totalValueBeforeTax.TotalTax / 2))}
                                </td>
                            </tr>
                        </>
                    ) : (
                        <tr>
                            <td className="border p-2">IGST</td>
                            <td className="border p-2">
                                {NumberFormat(RoundNumber(totalValueBeforeTax.TotalTax))}
                            </td>
                        </tr>
                    )}
                    <tr>
                        <td className="border p-2">Round Off</td>
                        <td className="border p-2">
                            {RoundNumber(Math.round(Total_Invoice_value) - Total_Invoice_value)}
                        </td>
                    </tr>
                    <tr>
                        <td className="border p-2">Total</td>
                        <td className="border p-2">
                            {NumberFormat(Math.round(Total_Invoice_value))}
                        </td>
                    </tr>

                </tbody>
            </table>
        </>
    )
}

export default SalesInvoiceTaxDetails;