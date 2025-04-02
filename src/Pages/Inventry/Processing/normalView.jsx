import FilterableTable, { createCol, formatString } from "../../../Components/filterableTable2"
import { Addition, checkIsNumber, NumberFormat } from "../../../Components/functions";


const ProcessingView = ({ dataArray, ButtonArea }) => {

    const calculateDifference = (sourceQty, destQty) => {
        if (sourceQty === 0) return 0;

        return ((sourceQty - destQty) / sourceQty) * 100;
    };

    return (
        <FilterableTable
            headerFontSizePx={11}
            bodyFontSizePx={11}
            dataArray={dataArray}
            ButtonArea={ButtonArea ? ButtonArea : <></>}
            title="PRODUCTIONS"
            maxHeightOption
            EnableSerialNumber
            columns={
                [...[
                    { col: 'Process_date', type: 'date', title: 'Date' },
                    { col: 'PR_Inv_Id', type: 'string', title: 'Vch.No' },
                    { col: 'VoucherTypeGet', type: 'string', title: 'Voucher' },
                    { col: 'StartDateTime', type: 'time', title: 'Start' },
                    { col: 'EndDateTime', type: 'time', title: 'End' },
                    { col: 'BranchName', type: 'string', title: 'Branch' },
                    { col: 'GodownNameGet', type: 'string', title: 'Location' },
                ].map(col => createCol(col.col, col.type, col.title)),
                {
                    isVisible: 1,
                    ColumnHeader: 'Difference (%)',
                    isCustomCell: true,
                    Cell: ({ row }) => {
                        const sourceQtySum = row?.SourceDetails?.reduce((acc, source) => Addition(acc, source.Sour_Qty), 0);
                        const destinationQtySum = row?.DestinationDetails?.reduce((acc, destination) => Addition(acc, destination.Dest_Qty), 0);
                        return NumberFormat(calculateDifference(sourceQtySum, destinationQtySum));
                    }
                },
                ]
            }
            isExpendable={true}
            expandableComp={({ row }) => (
                <div className="row">
                    <div className="col-md-6 p-1">
                        <FilterableTable
                            title="Source"
                            headerFontSizePx={11}
                            bodyFontSizePx={11}
                            EnableSerialNumber
                            dataArray={row?.SourceDetails}
                            columns={[
                                createCol('Product_Name', 'string', 'Item'),
                                createCol('Godown_Name', 'string', 'Godown'),
                                createCol('Sour_Qty', 'number', 'QTY'),
                                // createCol('Sour_Unit', 'string', 'Unit'),
                                // createCol('Sour_Rate', 'number', 'Rate'),
                                // createCol('Sour_Amt', 'number', 'Amount'),
                            ]}
                            disablePagination
                        />
                    </div>
                    <div className="col-md-6 p-1">
                        <FilterableTable
                            title="Destination"
                            headerFontSizePx={11}
                            bodyFontSizePx={11}
                            EnableSerialNumber
                            dataArray={row?.DestinationDetails}
                            columns={[
                                createCol('Product_Name', 'string', 'Item'),
                                createCol('Godown_Name', 'string', 'Godown'),
                                createCol('Dest_Qty', 'number', 'QTY'),
                                // createCol('Dest_Unit', 'string', 'Unit'),
                                // createCol('Dest_Rate', 'number', 'Rate'),
                                // createCol('Dest_Amt', 'number', 'Amount'),
                            ]}
                            disablePagination
                        />
                    </div>
                </div>
            )}
        />
    )
}

export default ProcessingView;