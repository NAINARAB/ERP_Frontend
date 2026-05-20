import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { isEqualNumber, LocalDate, NumberFormat } from './functions';
import { useEffect, useState } from 'react';

const formatString = (val, dataType) => {
    switch (dataType) {
        case 'number':
            return NumberFormat(val)
        case 'date':
            return LocalDate(val);
        case 'string':
            return val;
        default:
            return ''
    }
}

const getFun = (key, dataType, dataArray) => {
    switch (dataType) {
        case 'number':
            return {
                filterVariant: 'range',
                filterFn: 'between',
            }
        case 'date':
            return {
                filterVariant: 'text',
            };
        case 'string':
            // const distinctValues = [];
            // dataArray?.forEach(item => (item[key] && (distinctValues.findIndex(o => o?.value === item[key]?.toLocaleLowerCase()) === -1))
            //     ? distinctValues.push({ label: String(item[key]), value: String(item[key]).toLocaleLowerCase() })
            //     : null
            // )
            return {
                filterVariant: 'text',
            }

        default:
            return {}
    }
}

const aggregations = (Fied_Data, Field_Name) => {
    if (Fied_Data === 'number') {
        return {
            aggregationFn: Field_Name?.includes('mount') ? 'sum' : 'mean',
            AggregatedCell: ({ cell }) => (
                <div className='blue-text text-center float-end w-100'>
                    {NumberFormat(cell.getValue())}
                </div>
            )
        }
    }
}

const MaterialTableComponent = ({ dataArray, columns, columnVisiblity }) => {
    const [dispColmn, setDispColmn] = useState([]);

    useEffect(() => {
        const displayColumns = [...columns].filter(column => (isEqualNumber(column?.Defult_Display, 1) || isEqualNumber(column?.isVisible, 1)));

        const muiColumns = displayColumns.map((column, index) => ({
            header: column?.Field_Name?.replace(/_/g, ' '),
            accessorKey: column?.Field_Name,
            sortable: true,
            size: 150,
            // aggregationFn: column?.Field_Name?.includes('mount') ? 'sum' : column?.Fied_Data === 'number' ? 'mean' : 'uniqueCount',
            // AggregatedCell: ({ cell }) => <div className='blue-text text-center float-end w-100'>{NumberFormat(cell.getValue())}</div>,
            ...aggregations(column?.Fied_Data ,column?.Field_Name),
            Cell: ({ cell }) => (
                <p className={`m-0 text-center fa-14 w-100`}>
                    {formatString(cell.getValue(), column?.Fied_Data)}
                </p>
            ),
            ...getFun(column?.Field_Name, column?.Fied_Data, dataArray),
        }))

        setDispColmn(muiColumns)
    }, [columns])

    const table = useMaterialReactTable({
        columns: dispColmn,
        data: dataArray || [],
        enableColumnResizing: true,
        enableGrouping: true,
        enableStickyHeader: true,
        enableStickyFooter: true,
        enableColumnOrdering: true,
        enableRowNumbers: false,
        initialState: {
            density: 'compact',
            pagination: { pageIndex: 0, pageSize: 100 },
            columnVisibility: columnVisiblity
        },
        muiToolbarAlertBannerChipProps: { color: 'primary' },
        muiTableContainerProps: { sx: { maxHeight: '62vh', minHeight: '46vh' } },
    })
    return (
        <MaterialReactTable table={table} />
    )
}


export default MaterialTableComponent;