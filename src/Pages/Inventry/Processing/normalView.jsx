import FilterableTable, { createCol } from "../../../Components/filterableTable2"
import { Addition, NumberFormat, RoundNumber } from "../../../Components/functions";


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
            columns={[
                createCol('Process_date', 'date', 'Date'),
                createCol('PR_Inv_Id', 'string', 'Vch.No'),
                {
                    isVisible: 1,
                    ColumnHeader: 'Consumption',
                    isCustomCell: true,
                    Cell: ({ row }) => {

                        const sourceMaxQty = row?.SourceDetails?.reduce((acc, source) => {
                            if (acc?.Sour_Qty >= source?.Sour_Qty) return acc;
                            return source;
                        }, {});

                        return sourceMaxQty?.Product_Name && (
                            <>
                                <span>{sourceMaxQty?.Product_Name}</span>
                                <span className="px-2">-</span>
                                <span className="px-2 py-1 bg-light border fw-bold rounded-3">{sourceMaxQty?.Sour_Qty}</span>
                            </>
                        );
                    }
                },
                {
                    isVisible: 1,
                    ColumnHeader: 'Production',
                    isCustomCell: true,
                    Cell: ({ row }) => {

                        const destinationMaxQty = row?.DestinationDetails?.reduce((acc, destination) => {
                            if (acc?.Dest_Qty >= destination?.Dest_Qty) return acc;
                            return destination;
                        }, {});

                        return destinationMaxQty?.Product_Name && (
                            <>
                                <span>{destinationMaxQty?.Product_Name}</span>
                                <span className="px-2">-</span>
                                <span className="px-2 py-1 bg-light border fw-bold rounded-3">{destinationMaxQty?.Dest_Qty}</span>
                            </>
                        );
                    }
                },
                {
                    isVisible: 1,
                    ColumnHeader: 'Difference (%)',
                    isCustomCell: true,
                    Cell: ({ row }) => {
                        const sourceQtySum = row?.SourceDetails?.reduce((acc, source) => Addition(acc, source.Sour_Qty), 0);
                        const destinationQtySum = row?.DestinationDetails?.reduce((acc, destination) => Addition(acc, destination.Dest_Qty), 0);
                        const diffPercentage = sourceQtySum !== 0
                            ? ((destinationQtySum - sourceQtySum) / sourceQtySum) * 100
                            : 0;
                        return RoundNumber(diffPercentage);
                        // return NumberFormat(calculateDifference(sourceQtySum, destinationQtySum));
                    }
                },
                createCol('VoucherTypeGet', 'string', 'Voucher'),
                createCol('GodownNameGet', 'string', 'Location')
            ]}
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