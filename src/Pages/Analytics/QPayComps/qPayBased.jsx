import { useEffect, useState } from "react";
import { PieChart } from '@mui/x-charts/PieChart';
import { getRandomColor, NumberFormat } from "../../../Components/functions";
import { Button } from "@mui/material";
// import { CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";

// const icon = <CheckBoxOutlineBlank fontSize="small" />;
// const checkedIcon = <CheckBox fontSize="small" />;

const QPayBasedComp = ({ dataArray, columns, filters }) => {
    const [qPayRange, setQPayRange] = useState([]);
    const [reload, setReload] = useState(false);
    const [filtered, setFiltered] = useState([])
    const [localState, setLocalState] = useState({
        group: localStorage.getItem('qPayGroup') || '',
    })

    const comStr = (str) => str ? (str.trim()).toLowerCase() : '';

    useEffect(() => {
        const filteredList = Array.isArray(filters[localState.group]) ? filters[localState.group] : []
        setFiltered(filteredList)
    }, [filters, localState.group])


    useEffect(() => {

        const range = [
            {
                min: 0,
                max: 5,
                data: []
            },
            {
                min: 5,
                max: 10,
                data: []
            },
            {
                min: 10,
                max: 15,
                data: []
            },
            {
                min: 15,
                max: 20,
                data: []
            },
            {
                min: 20,
                max: 30,
                data: []
            },
            {
                min: 30,
                max: 40,
                data: []
            },
            {
                min: 40,
                max: 60,
                data: []
            },
            {
                min: 60,
                max: 1e4,
                data: []
            },
        ];

        dataArray.forEach(o => {
            const qpayDays = Number(o.Q_Pay_Days);
            const rangeIndex = range.findIndex(obj => (qpayDays > obj.min) && (qpayDays <= obj.max));
            if (rangeIndex !== -1) {
                range[rangeIndex].data.push(o);
            }
        });

        setQPayRange(range);

    }, [dataArray, reload])

    const onChangeGroup = (val) => {
        setLocalState(pre => ({ ...pre, group: val.target.value }))
        localStorage.setItem('qPayGroup', val.target.value)
    }

    return (
        <>
            <div className="col-xxl-3 col-lg-4 col-md-6 col-sm-8">
                <select
                    className="cus-inpt w-auto border"
                    value={localState.group}
                    onChange={onChangeGroup}
                >
                    <option value="">Select Group By</option>
                    {columns?.map((o, i) => o?.Fied_Data === 'string' && (
                        <option value={o?.Field_Name} key={i}>{o?.Field_Name?.replace(/_/g, ' ')}</option>
                    ))}
                </select>
                {/* <Autocomplete
                    multiple
                    options={[...columns?.filter(col => col?.Fied_Data === 'string')].map(filCol => filCol?.Field_Name)}
                    disableCloseOnSelect
                    getOptionLabel={option => option}
                    value={localState.group || []}
                    onChange={(event, newValue) => onChangeGroup(newValue)}
                    renderOption={(props, option, { selected }) => (
                        <li {...props}>
                            <Checkbox
                                icon={icon}
                                checkedIcon={checkedIcon}
                                style={{ marginRight: 8 }}
                                checked={selected}
                            />
                            {option}
                        </li>
                    )}
                    isOptionEqualToValue={(opt, val) => opt === val}
                    renderInput={(params) => (
                        <TextField {...params} label={'Add Grouping'} placeholder={`Select column for Grouping`} />
                    )}
                /> */}
            </div>

            {(localState?.group === '' || filtered.length === 0) ? (
                <div className="d-flex justify-content-around align-items-center flex-wrap px-3 py-2">

                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    {['Sno', 'Day-Range', 'Parties', 'Percentage'].map(o => (
                                        <th className="border fa-15" style={{ backgroundColor: '#EDF0F7' }} key={o}>{o}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {qPayRange.map((o, i) => (
                                    <tr key={i}>
                                        <td className="fa-15 border text-center">{i + 1}</td>
                                        <td className="fa-15 border text-center">
                                            {
                                                qPayRange[i + 1]
                                                    ? ((o?.min + 1)?.toString() + ' - ' + o?.max?.toString())
                                                    : '< ' + o?.min.toString()
                                            }
                                        </td>
                                        <td className="fa-15 border text-center">{o?.data?.length}</td>
                                        <td className="fa-15 border text-center">{NumberFormat((o?.data?.length / dataArray?.length) * 100)}</td>
                                    </tr>
                                ))}
                                <tr>
                                    <td className="border"></td>
                                    <td className="border"></td>
                                    <td className="fa-13 border text-center">
                                        {NumberFormat(qPayRange?.reduce((sum, o) => {
                                            return sum += o?.data?.length
                                        }, 0))}
                                    </td>
                                    <td className="fa-13 border text-center">
                                        {NumberFormat(qPayRange?.reduce((sum, o) => {
                                            return sum += ((o?.data?.length / dataArray?.length) * 100)
                                        }, 0))}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="d-flex align-items-center flex-column overflow-scroll">
                        <h5>Q-Pay Days</h5>
                        <PieChart
                            series={[
                                {
                                    data: qPayRange?.map((range, rangeInd) => ({
                                        label: qPayRange[rangeInd + 1]
                                            ? (NumberFormat(range?.min) + '-' + NumberFormat(range?.max)) + '(' + range?.data?.length + ')'
                                            : '< ' + NumberFormat(range?.min) + '(' + range?.data?.length + ')',
                                        // value: range?.data?.length,
                                        value: ((range?.data?.length / dataArray?.length) * 100).toFixed(2),
                                        color: getRandomColor()
                                    })),
                                    arcLabel: (item) => `${item.label}`,
                                    arcLabelMinAngle: 35,
                                }
                            ]}
                            width={570}
                            height={400}
                            title="QPay Days"
                        />

                        <Button onClick={() => setReload(pre => !pre)}>Change color</Button>
                    </div>

                </div>
            ) : (
                <>
                    <div className="cus-grid mt-3">
                        {filtered.map((group, groupIndex) => (
                            <div className="table-responsive grid-card bg-white border" key={groupIndex}>
                                <h6 className="fw-bold text-muted d-flex justify-content-between">
                                    {String(group)?.toUpperCase()}
                                    <span>
                                        {NumberFormat(qPayRange?.reduce((overall, o) => {
                                            return overall += o?.data?.reduce((sum, obj) => {
                                                return (comStr(obj[localState.group]) === comStr(group))
                                                    ? sum + 1
                                                    : sum
                                            }, 0)
                                        }, 0))}
                                    </span>
                                </h6>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            {['Sno', 'Day-Range', 'Parties', 'Percentage'].map(o => (
                                                <th className="border fa-14" style={{ backgroundColor: '#EDF0F7' }} key={o}>{o}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {qPayRange.map((o, i) => (
                                            <tr key={i}>
                                                <td className="fa-15 border text-center">{i + 1}</td>
                                                <td className="fa-15 border text-center">
                                                    {
                                                        qPayRange[i + 1]
                                                            ? ((o?.min + 1)?.toString() + ' - ' + o?.max?.toString())
                                                            : '< ' + o?.min.toString()
                                                    }
                                                </td>
                                                <td className="fa-15 border text-center">
                                                    {o?.data?.reduce((sum, obj) => {
                                                        return (comStr(obj[localState.group]) === comStr(group))
                                                            ? sum + 1
                                                            : sum
                                                    }, 0)}
                                                </td>
                                                <td className="fa-15 border text-center">
                                                    {NumberFormat((o?.data?.reduce((sum, obj) => {
                                                        return (comStr(obj[localState.group]) === comStr(group))
                                                            ? sum + 1
                                                            : sum
                                                    }, 0) / qPayRange?.reduce((overall, o) => {
                                                        return overall += o?.data?.reduce((sum, obj) => {
                                                            return (comStr(obj[localState.group]) === comStr(group))
                                                                ? sum + 1
                                                                : sum
                                                        }, 0)
                                                    }, 0)) * 100)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </>
    )
}

export default QPayBasedComp;