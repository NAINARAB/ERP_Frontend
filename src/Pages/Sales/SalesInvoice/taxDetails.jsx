import { useMemo } from "react";
import { Addition, isEqualNumber, NumberFormat, numberToWords, onlynumAndNegative, RoundNumber, toArray } from "../../../Components/functions";
import { calculateGSTDetails } from "../../../Components/taxCalculator";



const findProductDetails = (arr = [], productid) => arr.find(obj => isEqualNumber(obj.Product_Id, productid)) ?? {};

const SalesInvoiceTaxDetails = ({
    invoiceProducts = [],
    invoiceExpences = [],
    isNotTaxableBill,
    isInclusive,
    IS_IGST,
    products = [],
    invoiceInfo = {},
    setInvoiceInfo
}) => {

    const invExpencesTotal = useMemo(() => {
        return toArray(invoiceExpences).reduce((acc, exp) => Addition(acc, exp?.Expence_Value), 0)
    }, [invoiceExpences]);

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

        return Addition(invValue, invExpencesTotal);
    }, [invoiceProducts, isNotTaxableBill, products, IS_IGST, isInclusive, invExpencesTotal])

    const taxSplitUp = useMemo(() => {
        if (!invoiceProducts || invoiceProducts.length === 0) return {};

        let totalTaxable = 0;
        let totalTax = 0;

        invoiceProducts.forEach(item => {
            const Amount = RoundNumber(item?.Amount || 0);

            if (isNotTaxableBill) {
                totalTaxable = Addition(totalTaxable, Amount);
                return;
            }

            const product = findProductDetails(products, item.Item_Id);
            const gstPercentage = isEqualNumber(IS_IGST, 1) ? product.Igst_P : product.Gst_P;

            const taxInfo = calculateGSTDetails(Amount, gstPercentage, isInclusive ? 'remove' : 'add');

            totalTaxable = Addition(totalTaxable, parseFloat(taxInfo.without_tax));
            totalTax = Addition(totalTax, parseFloat(taxInfo.tax_amount));
        });

        const totalWithTax = Addition(totalTaxable, totalTax);
        const roundedTotal = Math.round(totalWithTax);
        const roundOff = RoundNumber(roundedTotal - totalWithTax);

        const cgst = isEqualNumber(IS_IGST, 1) ? 0 : RoundNumber(totalTax / 2);
        const sgst = isEqualNumber(IS_IGST, 1) ? 0 : RoundNumber(totalTax / 2);
        const igst = isEqualNumber(IS_IGST, 1) ? RoundNumber(totalTax) : 0;

        return {
            totalTaxable: RoundNumber(totalTaxable),
            totalTax: RoundNumber(totalTax),
            cgst,
            sgst,
            igst,
            roundOff,
            invoiceTotal: roundedTotal
        };

    }, [invoiceProducts, products, IS_IGST, isNotTaxableBill, isInclusive]);

    return (
        <>
            <table className="table">
                <tbody>
                    <tr>
                        <td className="border p-2" rowSpan={IS_IGST ? 5 : 6}>
                            Total in words: {numberToWords(parseInt(Total_Invoice_value))}
                        </td>
                        <td className="border p-2">Total Taxable Amount</td>
                        <td className="border p-2">
                            {taxSplitUp.totalTaxable}
                        </td>
                    </tr>
                    {!IS_IGST ? (
                        <>
                            <tr>
                                <td className="border p-2">CGST</td>
                                <td className="border p-2">
                                    {taxSplitUp.cgst}
                                </td>
                            </tr>
                            <tr>
                                <td className="border p-2">SGST</td>
                                <td className="border p-2">
                                    {taxSplitUp.sgst}
                                </td>
                            </tr>
                        </>
                    ) : (
                        <tr>
                            <td className="border p-2">IGST</td>
                            <td className="border p-2">
                                {taxSplitUp.igst}
                            </td>
                        </tr>
                    )}
                    <tr>
                        <td className="border p-2">Total Expences</td>
                        <td className="border p-2">
                            {RoundNumber(invExpencesTotal)}
                        </td>
                    </tr>
                    <tr>
                        <td className="border p-2">Round Off</td>
                        <td className="border p-0">
                            <input
                                value={invoiceInfo.Round_off}
                                defaultValue={taxSplitUp.roundOff}
                                className="cus-inpt p-2 m-0 border-0"
                                onInput={onlynumAndNegative}
                                onChange={e => setInvoiceInfo(pre => ({ ...pre, Round_off: e.target.value }))}
                            />
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