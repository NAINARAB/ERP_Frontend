import { Addition, NumberFormat, toArray, toNumber } from "../../../Components/functions";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";


const CreditNoteTaxDetails = ({ invoiceProducts = [] }) => {

    const productTaxArray = Object.values(
        toArray(invoiceProducts).reduce((acc, product) => {
            const taxRate = toNumber(product?.Tax_Rate);
            if (!acc[taxRate]) {
                acc[taxRate] = { taxRate, taxableAmount: 0, taxAmount: 0 };
            }
            acc[taxRate].taxableAmount = Addition(acc[taxRate].taxableAmount, product?.Taxable_Amount);
            acc[taxRate].taxAmount = Addition(acc[taxRate].taxAmount, Addition(product?.Cgst_Amo, Addition(product?.Sgst_Amo, product?.Igst_Amo)));
            return acc;
        }, {})
    ).sort((a, b) => a.taxRate - b.taxRate);

    const totalTaxableAmount = productTaxArray.reduce((acc, item) => Addition(acc, item.taxableAmount), 0);
    const totalTaxAmount = productTaxArray.reduce((acc, item) => Addition(acc, item.taxAmount), 0);

    return (

        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>Tax Rate (%)</TableCell>
                    <TableCell className="text-end">Taxable Amount</TableCell>
                    <TableCell className="text-end">Tax Amount</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {productTaxArray.map((item, index) => (
                    <TableRow key={index}>
                        <TableCell>{item.taxRate} %</TableCell>
                        <TableCell className="text-end">{NumberFormat(item.taxableAmount)}</TableCell>
                        <TableCell className="text-end">{NumberFormat(item.taxAmount)}</TableCell>
                    </TableRow>
                ))}
                <TableRow>
                    <TableCell><b>Total</b></TableCell>
                    <TableCell className="text-end"><b>{NumberFormat(totalTaxableAmount)}</b></TableCell>
                    <TableCell className="text-end"><b>{NumberFormat(totalTaxAmount)}</b></TableCell>
                </TableRow>
            </TableBody>
        </Table>

    )
}

export default CreditNoteTaxDetails;
